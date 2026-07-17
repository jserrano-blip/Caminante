import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler, badRequest, notFound, requireQuery } from '../lib/http';
import { epley1RM, round2 } from '../lib/formulas';

const router = Router();

const sessionInclude = {
  sets: {
    include: { exercise: true },
    orderBy: [{ completedAt: 'asc' as const }, { setNumber: 'asc' as const }],
  },
  gym: true,
  routine: true,
};

// ── Sesiones ─────────────────────────────────────────────────────────────────

// GET /sessions?userId=&limit=
router.get(
  '/sessions',
  asyncHandler(async (req, res) => {
    const userId = requireQuery(req, 'userId');
    const limitRaw = req.query.limit;
    let limit: number | undefined;
    if (typeof limitRaw === 'string' && limitRaw.length > 0) {
      limit = Number.parseInt(limitRaw, 10);
      if (!Number.isFinite(limit) || limit <= 0) {
        throw badRequest('limit debe ser un entero positivo');
      }
    }
    const sessions = await prisma.workoutSession.findMany({
      where: { userId },
      include: sessionInclude,
      orderBy: { startedAt: 'desc' },
      ...(limit ? { take: limit } : {}),
    });
    res.json(sessions);
  })
);

// GET /sessions/:id
router.get(
  '/sessions/:id',
  asyncHandler(async (req, res) => {
    const session = await prisma.workoutSession.findUnique({
      where: { id: req.params.id },
      include: sessionInclude,
    });
    if (!session) throw notFound('Sesión no encontrada');
    res.json(session);
  })
);

// POST /sessions { userId, gymId?, routineId?, name }
router.post(
  '/sessions',
  asyncHandler(async (req, res) => {
    const { userId, gymId, routineId, name } = req.body ?? {};
    if (typeof userId !== 'string' || userId.length === 0) {
      throw badRequest('El campo "userId" es obligatorio');
    }
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw badRequest('El campo "name" es obligatorio');
    }
    const session = await prisma.workoutSession.create({
      data: {
        userId,
        name: name.trim(),
        gymId: gymId ?? null,
        routineId: routineId ?? null,
      },
      include: sessionInclude,
    });
    res.status(201).json(session);
  })
);

// PATCH /sessions/:id { name?, notes?, gymId? }
router.patch(
  '/sessions/:id',
  asyncHandler(async (req, res) => {
    const { name, notes, gymId } = req.body ?? {};
    const session = await prisma.workoutSession.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(gymId !== undefined ? { gymId } : {}),
      },
      include: sessionInclude,
    });
    res.json(session);
  })
);

// DELETE /sessions/:id
router.delete(
  '/sessions/:id',
  asyncHandler(async (req, res) => {
    await prisma.workoutSession.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

// ── Series ───────────────────────────────────────────────────────────────────

// POST /sessions/:id/sets { exerciseId, setNumber, reps, weightKg, unit?, rpe?, rir?, isWarmup? }
router.post(
  '/sessions/:id/sets',
  asyncHandler(async (req, res) => {
    const sessionId = req.params.id;
    const session = await prisma.workoutSession.findUnique({ where: { id: sessionId } });
    if (!session) throw notFound('Sesión no encontrada');

    const { exerciseId, setNumber, reps, weightKg, unit, rpe, rir, isWarmup } = req.body ?? {};
    if (typeof exerciseId !== 'string' || exerciseId.length === 0) {
      throw badRequest('El campo "exerciseId" es obligatorio');
    }
    if (!Number.isInteger(setNumber) || setNumber < 1) {
      throw badRequest('setNumber debe ser un entero ≥ 1');
    }
    if (!Number.isInteger(reps) || reps < 0) {
      throw badRequest('reps debe ser un entero ≥ 0');
    }
    if (typeof weightKg !== 'number' || !Number.isFinite(weightKg) || weightKg < 0) {
      throw badRequest('weightKg debe ser un número ≥ 0');
    }
    if (unit !== undefined && !['KG', 'LB'].includes(unit)) {
      throw badRequest('unit debe ser KG o LB');
    }

    const set = await prisma.workoutSet.create({
      data: {
        sessionId,
        exerciseId,
        setNumber,
        reps,
        weightKg,
        ...(unit !== undefined ? { unit } : {}),
        rpe: rpe ?? null,
        rir: rir ?? null,
        isWarmup: Boolean(isWarmup),
      },
      include: { exercise: true },
    });
    res.status(201).json(set);
  })
);

// PATCH /sets/:id
router.patch(
  '/sets/:id',
  asyncHandler(async (req, res) => {
    const { exerciseId, setNumber, reps, weightKg, unit, rpe, rir, isWarmup } = req.body ?? {};
    if (unit !== undefined && !['KG', 'LB'].includes(unit)) {
      throw badRequest('unit debe ser KG o LB');
    }
    const set = await prisma.workoutSet.update({
      where: { id: req.params.id },
      data: {
        ...(exerciseId !== undefined ? { exerciseId } : {}),
        ...(setNumber !== undefined ? { setNumber } : {}),
        ...(reps !== undefined ? { reps } : {}),
        ...(weightKg !== undefined ? { weightKg } : {}),
        ...(unit !== undefined ? { unit } : {}),
        ...(rpe !== undefined ? { rpe } : {}),
        ...(rir !== undefined ? { rir } : {}),
        ...(isWarmup !== undefined ? { isWarmup: Boolean(isWarmup) } : {}),
      },
      include: { exercise: true },
    });
    res.json(set);
  })
);

// DELETE /sets/:id
router.delete(
  '/sets/:id',
  asyncHandler(async (req, res) => {
    await prisma.workoutSet.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

// ── Finalizar sesión + detección de PRs ──────────────────────────────────────

// POST /sessions/:id/finish
router.post(
  '/sessions/:id/finish',
  asyncHandler(async (req, res) => {
    const sessionId = req.params.id;
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
      include: { sets: true },
    });
    if (!session) throw notFound('Sesión no encontrada');
    if (session.finishedAt) throw badRequest('La sesión ya fue finalizada');

    const finishedAt = new Date();

    // Series efectivas (no warmup) de esta sesión, agrupadas por ejercicio.
    const effective = session.sets.filter((s) => !s.isWarmup);
    const byExercise = new Map<string, typeof effective>();
    for (const s of effective) {
      const list = byExercise.get(s.exerciseId) ?? [];
      list.push(s);
      byExercise.set(s.exerciseId, list);
    }

    // Histórico del usuario: series efectivas de TODAS las demás sesiones.
    const historySets = await prisma.workoutSet.findMany({
      where: {
        isWarmup: false,
        exerciseId: { in: [...byExercise.keys()] },
        session: { userId: session.userId },
        sessionId: { not: sessionId },
      },
      select: {
        exerciseId: true,
        sessionId: true,
        reps: true,
        weightKg: true,
      },
    });

    type Hist = { maxWeight: number; maxE1rm: number; volumeBySession: Map<string, number> };
    const history = new Map<string, Hist>();
    for (const s of historySets) {
      let h = history.get(s.exerciseId);
      if (!h) {
        h = { maxWeight: 0, maxE1rm: 0, volumeBySession: new Map() };
        history.set(s.exerciseId, h);
      }
      if (s.weightKg > h.maxWeight) h.maxWeight = s.weightKg;
      const e1rm = epley1RM(s.weightKg, s.reps);
      if (e1rm !== null && e1rm > h.maxE1rm) h.maxE1rm = e1rm;
      h.volumeBySession.set(
        s.sessionId,
        (h.volumeBySession.get(s.sessionId) ?? 0) + s.reps * s.weightKg
      );
    }

    const newRecordsData: {
      userId: string;
      exerciseId: string;
      sessionId: string;
      type: string;
      value: number;
      reps: number | null;
      date: Date;
    }[] = [];

    for (const [exerciseId, sets] of byExercise) {
      const h = history.get(exerciseId);
      const prevMaxWeight = h?.maxWeight ?? 0;
      const prevMaxE1rm = h?.maxE1rm ?? 0;
      const prevMaxVolume = h ? Math.max(0, ...h.volumeBySession.values()) : 0;

      // WEIGHT — peso máximo levantado
      let bestWeightSet: (typeof sets)[number] | null = null;
      for (const s of sets) {
        if (s.weightKg > 0 && (!bestWeightSet || s.weightKg > bestWeightSet.weightKg)) {
          bestWeightSet = s;
        }
      }
      if (bestWeightSet && bestWeightSet.weightKg > prevMaxWeight) {
        newRecordsData.push({
          userId: session.userId,
          exerciseId,
          sessionId,
          type: 'WEIGHT',
          value: round2(bestWeightSet.weightKg),
          reps: bestWeightSet.reps,
          date: finishedAt,
        });
      }

      // E1RM — mejor 1RM estimado (Epley, ignora reps > 12)
      let bestE1rm = 0;
      let bestE1rmSet: (typeof sets)[number] | null = null;
      for (const s of sets) {
        const e1rm = epley1RM(s.weightKg, s.reps);
        if (e1rm !== null && e1rm > bestE1rm) {
          bestE1rm = e1rm;
          bestE1rmSet = s;
        }
      }
      if (bestE1rmSet && bestE1rm > prevMaxE1rm) {
        newRecordsData.push({
          userId: session.userId,
          exerciseId,
          sessionId,
          type: 'E1RM',
          value: round2(bestE1rm),
          reps: bestE1rmSet.reps,
          date: finishedAt,
        });
      }

      // VOLUME — volumen total del ejercicio en esta sesión
      const sessionVolume = sets.reduce((acc, s) => acc + s.reps * s.weightKg, 0);
      if (sessionVolume > 0 && sessionVolume > prevMaxVolume) {
        newRecordsData.push({
          userId: session.userId,
          exerciseId,
          sessionId,
          type: 'VOLUME',
          value: round2(sessionVolume),
          reps: null,
          date: finishedAt,
        });
      }
    }

    const [updatedSession] = await prisma.$transaction([
      prisma.workoutSession.update({
        where: { id: sessionId },
        data: { finishedAt },
        include: sessionInclude,
      }),
      ...newRecordsData.map((data) => prisma.personalRecord.create({ data })),
    ]);

    const newRecords = await prisma.personalRecord.findMany({
      where: { sessionId, date: finishedAt },
      include: { exercise: true },
      orderBy: [{ exerciseId: 'asc' }, { type: 'asc' }],
    });

    const durationMin = Math.max(
      0,
      Math.round((finishedAt.getTime() - session.startedAt.getTime()) / 60000)
    );
    const totalVolumeKg = round2(effective.reduce((acc, s) => acc + s.reps * s.weightKg, 0));

    res.json({
      session: updatedSession,
      summary: {
        durationMin,
        totalVolumeKg,
        totalSets: session.sets.length,
        newRecords,
      },
    });
  })
);

export default router;
