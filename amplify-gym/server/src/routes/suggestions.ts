import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler, requireQuery } from '../lib/http';
import { round2 } from '../lib/formulas';

const router = Router();

// GET /suggestions?userId=&exerciseId= — sobrecarga progresiva inteligente
router.get(
  '/suggestions',
  asyncHandler(async (req, res) => {
    const userId = requireQuery(req, 'userId');
    const exerciseId = requireQuery(req, 'exerciseId');

    const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
    if (!exercise) {
      res.status(404).json({ error: 'Ejercicio no encontrado' });
      return;
    }

    // Última sesión del usuario que incluyó este ejercicio (series efectivas).
    const lastSet = await prisma.workoutSet.findFirst({
      where: {
        exerciseId,
        isWarmup: false,
        session: { userId },
      },
      orderBy: { completedAt: 'desc' },
      select: { sessionId: true, session: { select: { startedAt: true } } },
    });

    if (!lastSet) {
      res.json({ last: null, suggestion: null });
      return;
    }

    const sets = await prisma.workoutSet.findMany({
      where: { sessionId: lastSet.sessionId, exerciseId, isWarmup: false },
      orderBy: { setNumber: 'asc' },
      select: { reps: true, weightKg: true, rpe: true, rir: true },
    });

    const last = {
      date: lastSet.session.startedAt.toISOString(),
      sets: sets.map((s) => ({ reps: s.reps, weightKg: s.weightKg, rpe: s.rpe })),
    };

    const topWeight = Math.max(...sets.map((s) => s.weightKg));
    const topSet = sets.find((s) => s.weightKg === topWeight) ?? sets[0];
    const maxReps = Math.max(...sets.map((s) => s.reps));

    // Una serie cuenta como "fácil" si RPE ≤ 8 o RIR ≥ 2 (con dato registrado).
    const allEasy = sets.every(
      (s) => (s.rpe !== null && s.rpe <= 8) || (s.rir !== null && s.rir >= 2)
    );
    const anyVeryHard = sets.some((s) => s.rpe !== null && s.rpe >= 9.5);

    let suggestion: { weightKg: number; reps: number; rationale: string };

    if (anyVeryHard) {
      suggestion = {
        weightKg: round2(topWeight),
        reps: Math.max(1, topSet.reps - 1),
        rationale: `La última sesión tuvo series con RPE ≥ 9.5: mantén ${round2(
          topWeight
        )} kg y baja una repetición (o repite el mismo esquema) para consolidar antes de subir peso.`,
      };
    } else if (allEasy) {
      const increment = exercise.muscleGroup === 'PIERNA' ? 5 : 2.5;
      suggestion = {
        weightKg: round2(topWeight + increment),
        reps: topSet.reps,
        rationale: `Todas las series de la última sesión salieron con RPE ≤ 8 (o RIR ≥ 2): sube ${increment} kg${
          exercise.muscleGroup === 'PIERNA' ? ' (patrón de pierna)' : ''
        } y apunta a ${topSet.reps} repeticiones con ${round2(topWeight + increment)} kg.`,
      };
    } else {
      suggestion = {
        weightKg: round2(topWeight),
        reps: maxReps + 1,
        rationale: `Aún hay margen con el peso actual: repite ${round2(
          topWeight
        )} kg buscando ${maxReps + 1} repeticiones antes de aumentar la carga.`,
      };
    }

    res.json({ last, suggestion });
  })
);

export default router;
