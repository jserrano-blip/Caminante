import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler, badRequest, requireQuery } from '../lib/http';
import { buildCsv, CsvValue, UTF8_BOM } from '../lib/csv';
import { epley1RM, kgToLb, round2 } from '../lib/formulas';

const router = Router();

const DATASETS = ['sets', 'sessions', 'metrics', 'recovery', 'records', 'all'] as const;
type Dataset = (typeof DATASETS)[number];

async function setsCsv(userId: string): Promise<string> {
  const sets = await prisma.workoutSet.findMany({
    where: { session: { userId } },
    include: {
      exercise: { select: { name: true, muscleGroup: true } },
      session: { select: { startedAt: true, name: true, gym: { select: { name: true } } } },
    },
    orderBy: { completedAt: 'asc' },
  });
  const header = [
    'date',
    'session_name',
    'gym',
    'exercise',
    'muscle_group',
    'set_number',
    'is_warmup',
    'reps',
    'weight_kg',
    'weight_lb',
    'rpe',
    'rir',
    'e1rm_kg',
    'volume_kg',
  ];
  const rows: CsvValue[][] = sets.map((s) => {
    const e1rm = epley1RM(s.weightKg, s.reps);
    return [
      s.completedAt.toISOString(),
      s.session.name,
      s.session.gym?.name ?? '',
      s.exercise.name,
      s.exercise.muscleGroup,
      s.setNumber,
      s.isWarmup,
      s.reps,
      s.weightKg,
      round2(kgToLb(s.weightKg)),
      s.rpe,
      s.rir,
      e1rm !== null ? round2(e1rm) : '',
      round2(s.reps * s.weightKg),
    ];
  });
  return buildCsv(header, rows);
}

async function sessionsCsv(userId: string): Promise<string> {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId },
    include: {
      gym: { select: { name: true } },
      routine: { select: { name: true } },
      sets: { select: { reps: true, weightKg: true, isWarmup: true } },
    },
    orderBy: { startedAt: 'asc' },
  });
  const header = [
    'started_at',
    'finished_at',
    'name',
    'gym',
    'routine',
    'duration_min',
    'total_sets',
    'total_volume_kg',
    'notes',
  ];
  const rows: CsvValue[][] = sessions.map((s) => {
    const durationMin = s.finishedAt
      ? Math.max(0, Math.round((s.finishedAt.getTime() - s.startedAt.getTime()) / 60000))
      : '';
    const volume = s.sets
      .filter((set) => !set.isWarmup)
      .reduce((acc, set) => acc + set.reps * set.weightKg, 0);
    return [
      s.startedAt.toISOString(),
      s.finishedAt?.toISOString() ?? '',
      s.name,
      s.gym?.name ?? '',
      s.routine?.name ?? '',
      durationMin,
      s.sets.length,
      round2(volume),
      s.notes,
    ];
  });
  return buildCsv(header, rows);
}

async function metricsCsv(userId: string): Promise<string> {
  const metrics = await prisma.bodyMetric.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
  });
  const header = ['date', 'weight_kg', 'weight_lb', 'height_cm', 'body_fat_pct'];
  const rows: CsvValue[][] = metrics.map((m) => [
    m.date.toISOString(),
    m.weightKg,
    round2(kgToLb(m.weightKg)),
    m.heightCm,
    m.bodyFatPct,
  ]);
  return buildCsv(header, rows);
}

async function recoveryCsv(userId: string): Promise<string> {
  const logs = await prisma.recoveryLog.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
  });
  const header = ['date', 'sleep_hours', 'soreness', 'fatigue', 'notes'];
  const rows: CsvValue[][] = logs.map((r) => [
    r.date.toISOString(),
    r.sleepHours,
    r.soreness,
    r.fatigue,
    r.notes,
  ]);
  return buildCsv(header, rows);
}

async function recordsCsv(userId: string): Promise<string> {
  const records = await prisma.personalRecord.findMany({
    where: { userId },
    include: { exercise: { select: { name: true, muscleGroup: true } } },
    orderBy: { date: 'asc' },
  });
  const header = ['date', 'exercise', 'muscle_group', 'type', 'value', 'reps'];
  const rows: CsvValue[][] = records.map((r) => [
    r.date.toISOString(),
    r.exercise.name,
    r.exercise.muscleGroup,
    r.type,
    r.value,
    r.reps,
  ]);
  return buildCsv(header, rows);
}

// GET /export.csv?userId=&dataset=sets|sessions|metrics|recovery|records|all
router.get(
  '/export.csv',
  asyncHandler(async (req, res) => {
    const userId = requireQuery(req, 'userId');
    const dataset = (
      typeof req.query.dataset === 'string' && req.query.dataset.length > 0
        ? req.query.dataset
        : 'sets'
    ) as Dataset;
    if (!DATASETS.includes(dataset)) {
      throw badRequest(`dataset debe ser uno de: ${DATASETS.join(', ')}`);
    }

    const builders: Record<Exclude<Dataset, 'all'>, (u: string) => Promise<string>> = {
      sets: setsCsv,
      sessions: sessionsCsv,
      metrics: metricsCsv,
      recovery: recoveryCsv,
      records: recordsCsv,
    };

    let body: string;
    if (dataset === 'all') {
      const parts: string[] = [];
      for (const name of ['sets', 'sessions', 'metrics', 'recovery', 'records'] as const) {
        parts.push(`# ${name}`);
        parts.push(await builders[name](userId));
      }
      body = parts.join('\r\n');
    } else {
      body = await builders[dataset](userId);
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="amplify-gym-${dataset}.csv"`
    );
    res.send(UTF8_BOM + body);
  })
);

export default router;
