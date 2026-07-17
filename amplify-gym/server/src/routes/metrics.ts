import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler, badRequest, requireQuery } from '../lib/http';
import { dots, epley1RM, round2, Sex, wilks } from '../lib/formulas';

const router = Router();

// GET /metrics?userId=
router.get(
  '/metrics',
  asyncHandler(async (req, res) => {
    const userId = requireQuery(req, 'userId');
    const metrics = await prisma.bodyMetric.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    res.json(metrics);
  })
);

// POST /metrics { userId, weightKg, heightCm?, bodyFatPct?, date? }
router.post(
  '/metrics',
  asyncHandler(async (req, res) => {
    const { userId, weightKg, heightCm, bodyFatPct, date } = req.body ?? {};
    if (typeof userId !== 'string' || userId.length === 0) {
      throw badRequest('El campo "userId" es obligatorio');
    }
    if (typeof weightKg !== 'number' || !Number.isFinite(weightKg) || weightKg <= 0) {
      throw badRequest('weightKg debe ser un número positivo');
    }
    const metric = await prisma.bodyMetric.create({
      data: {
        userId,
        weightKg,
        heightCm: heightCm ?? null,
        bodyFatPct: bodyFatPct ?? null,
        ...(date !== undefined ? { date: new Date(date) } : {}),
      },
    });
    res.status(201).json(metric);
  })
);

// DELETE /metrics/:id
router.delete(
  '/metrics/:id',
  asyncHandler(async (req, res) => {
    await prisma.bodyMetric.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

// GET /relative-strength?userId= — Wilks 2020 y DOTS sobre los powerlifts
router.get(
  '/relative-strength',
  asyncHandler(async (req, res) => {
    const userId = requireQuery(req, 'userId');
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const lastMetric = await prisma.bodyMetric.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    const bodyWeightKg = lastMetric?.weightKg ?? null;
    const sex = (user.sex === 'F' ? 'F' : 'M') as Sex;

    // Mejor e1RM por ejercicio isPowerlift (series efectivas del usuario).
    const sets = await prisma.workoutSet.findMany({
      where: {
        isWarmup: false,
        session: { userId },
        exercise: { isPowerlift: true },
      },
      select: {
        reps: true,
        weightKg: true,
        exercise: { select: { id: true, name: true } },
      },
    });

    const bestByExercise = new Map<string, { name: string; bestE1rmKg: number }>();
    for (const s of sets) {
      const e1rm = epley1RM(s.weightKg, s.reps);
      if (e1rm === null) continue;
      const current = bestByExercise.get(s.exercise.id);
      if (!current || e1rm > current.bestE1rmKg) {
        bestByExercise.set(s.exercise.id, { name: s.exercise.name, bestE1rmKg: e1rm });
      }
    }

    const lifts = [...bestByExercise.entries()].map(([exerciseId, info]) => ({
      exerciseId,
      name: info.name,
      bestE1rmKg: round2(info.bestE1rmKg),
      wilks: bodyWeightKg ? round2(wilks(bodyWeightKg, info.bestE1rmKg, sex)) : null,
      dots: bodyWeightKg ? round2(dots(bodyWeightKg, info.bestE1rmKg, sex)) : null,
    }));
    lifts.sort((a, b) => b.bestE1rmKg - a.bestE1rmKg);

    const totalKg = lifts.reduce((acc, l) => acc + l.bestE1rmKg, 0);
    const totalWilks =
      bodyWeightKg && lifts.length > 0 ? round2(wilks(bodyWeightKg, totalKg, sex)) : null;
    const totalDots =
      bodyWeightKg && lifts.length > 0 ? round2(dots(bodyWeightKg, totalKg, sex)) : null;

    res.json({ bodyWeightKg, sex, lifts, totalWilks, totalDots });
  })
);

export default router;
