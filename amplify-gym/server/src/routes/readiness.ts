import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler, requireQuery } from '../lib/http';

const router = Router();

const DAY = 24 * 3600 * 1000;

export type ReadinessLevel = 'OK' | 'CUIDADO' | 'DELOAD';

/**
 * GET /readiness?userId=
 * Cruza la recuperación de los últimos 7 días (sueño, dolor, fatiga) con el
 * RPE promedio de las series de esa semana y sugiere si toca descargar.
 */
router.get(
  '/readiness',
  asyncHandler(async (req, res) => {
    const userId = requireQuery(req, 'userId');
    const since = new Date(Date.now() - 7 * DAY);

    const [logs, sets] = await Promise.all([
      prisma.recoveryLog.findMany({ where: { userId, date: { gte: since } } }),
      prisma.workoutSet.findMany({
        where: {
          isWarmup: false,
          rpe: { not: null },
          session: { userId, startedAt: { gte: since } },
        },
        select: { rpe: true },
      }),
    ]);

    const avg = (xs: number[]) =>
      xs.length === 0 ? null : Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10;

    const sleepAvg = avg(logs.map((l) => l.sleepHours));
    const sorenessAvg = avg(logs.map((l) => l.soreness));
    const fatigueAvg = avg(logs.map((l) => l.fatigue));
    const rpeAvg = avg(sets.map((s) => s.rpe as number));

    // Puntaje 0-100: cada señal en rojo resta. Sin datos = neutro (no resta).
    let score = 100;
    if (sleepAvg !== null && sleepAvg < 7) score -= Math.min(25, Math.round((7 - sleepAvg) * 10));
    if (sorenessAvg !== null && sorenessAvg > 5) score -= Math.min(25, Math.round((sorenessAvg - 5) * 8));
    if (fatigueAvg !== null && fatigueAvg > 5) score -= Math.min(25, Math.round((fatigueAvg - 5) * 8));
    if (rpeAvg !== null && rpeAvg > 8.5) score -= Math.min(25, Math.round((rpeAvg - 8.5) * 15));
    score = Math.max(0, score);

    let level: ReadinessLevel = 'OK';
    let recommendation = 'Recuperación en orden: entrena con normalidad.';
    if (score < 55) {
      level = 'DELOAD';
      recommendation =
        'Varias señales de fatiga acumulada. Te conviene una semana de descarga: baja el peso ~40% o el volumen a la mitad.';
    } else if (score < 75) {
      level = 'CUIDADO';
      recommendation =
        'Fatiga por encima de lo normal. Considera recortar 1-2 series por ejercicio o dormir más antes de subir pesos.';
    }

    const hasData = logs.length > 0 || sets.length > 0;
    res.json({ hasData, score, level, recommendation, sleepAvg, sorenessAvg, fatigueAvg, rpeAvg });
  })
);

export default router;
