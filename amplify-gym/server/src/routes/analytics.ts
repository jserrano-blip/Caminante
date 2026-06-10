import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler, requireQuery } from '../lib/http';
import { epley1RM, round2 } from '../lib/formulas';

const router = Router();

/** Lunes a las 00:00 (hora local) de la semana de la fecha dada. */
function weekStart(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = domingo
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString();
}

// GET /analytics/dashboard?userId=
router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const userId = requireQuery(req, 'userId');

    const [sessions, recentRecords, metrics, recovery, lastSession] = await Promise.all([
      prisma.workoutSession.findMany({
        where: { userId },
        include: { sets: { where: { isWarmup: false }, select: { reps: true, weightKg: true } } },
        orderBy: { startedAt: 'asc' },
      }),
      prisma.personalRecord.findMany({
        where: { userId },
        include: { exercise: true },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      prisma.bodyMetric.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
        select: { date: true, weightKg: true },
      }),
      prisma.recoveryLog.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
        select: { date: true, sleepHours: true, soreness: true, fatigue: true },
      }),
      prisma.workoutSession.findFirst({
        where: { userId },
        include: { sets: { include: { exercise: true } }, gym: true },
        orderBy: { startedAt: 'desc' },
      }),
    ]);

    // Volumen semanal (semana inicia lunes).
    const weekly = new Map<string, { volumeKg: number; sessions: number }>();
    for (const s of sessions) {
      const key = weekStart(s.startedAt);
      const entry = weekly.get(key) ?? { volumeKg: 0, sessions: 0 };
      entry.sessions += 1;
      entry.volumeKg += s.sets.reduce((acc, set) => acc + set.reps * set.weightKg, 0);
      weekly.set(key, entry);
    }
    const weeklyVolume = [...weekly.entries()]
      .map(([ws, v]) => ({ weekStart: ws, volumeKg: round2(v.volumeKg), sessions: v.sessions }))
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart));

    res.json({
      weeklyVolume,
      recentRecords,
      bodyWeightTrend: metrics.map((m) => ({
        date: m.date.toISOString(),
        weightKg: m.weightKg,
      })),
      recoveryTrend: recovery.map((r) => ({
        date: r.date.toISOString(),
        sleepHours: r.sleepHours,
        soreness: r.soreness,
        fatigue: r.fatigue,
      })),
      lastSession: lastSession ?? null,
    });
  })
);

// GET /analytics/strength?userId=&exerciseId= → { points: [...] } (una entrada por sesión)
router.get(
  '/strength',
  asyncHandler(async (req, res) => {
    const userId = requireQuery(req, 'userId');
    const exerciseId = requireQuery(req, 'exerciseId');

    const sets = await prisma.workoutSet.findMany({
      where: { exerciseId, isWarmup: false, session: { userId } },
      select: {
        reps: true,
        weightKg: true,
        sessionId: true,
        session: { select: { startedAt: true } },
      },
    });

    const bySession = new Map<
      string,
      { date: Date; bestSetKg: number; e1rmKg: number; volumeKg: number }
    >();
    for (const s of sets) {
      let entry = bySession.get(s.sessionId);
      if (!entry) {
        entry = { date: s.session.startedAt, bestSetKg: 0, e1rmKg: 0, volumeKg: 0 };
        bySession.set(s.sessionId, entry);
      }
      if (s.weightKg > entry.bestSetKg) entry.bestSetKg = s.weightKg;
      const e1rm = epley1RM(s.weightKg, s.reps);
      if (e1rm !== null && e1rm > entry.e1rmKg) entry.e1rmKg = e1rm;
      entry.volumeKg += s.reps * s.weightKg;
    }

    const points = [...bySession.values()]
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((p) => ({
        date: p.date.toISOString(),
        bestSetKg: round2(p.bestSetKg),
        e1rmKg: round2(p.e1rmKg),
        volumeKg: round2(p.volumeKg),
      }));

    res.json({ points });
  })
);

export default router;
