import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler, badRequest, notFound, requireQuery } from '../lib/http';

const router = Router();

type RoutineExerciseInput = {
  exerciseId: string;
  order: number;
  targetSets?: number;
  targetReps?: string;
  targetRpe?: number | null;
  restSeconds?: number;
};

function validateExercises(exercises: unknown): RoutineExerciseInput[] {
  if (!Array.isArray(exercises)) {
    throw badRequest('El campo "exercises" debe ser un arreglo');
  }
  for (const ex of exercises) {
    if (!ex || typeof ex.exerciseId !== 'string' || ex.exerciseId.length === 0) {
      throw badRequest('Cada ejercicio de rutina requiere "exerciseId"');
    }
    if (typeof ex.order !== 'number') {
      throw badRequest('Cada ejercicio de rutina requiere "order" numérico');
    }
  }
  return exercises as RoutineExerciseInput[];
}

const routineInclude = {
  exercises: {
    include: { exercise: true },
    orderBy: { order: 'asc' as const },
  },
};

// GET /routines?userId=
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = requireQuery(req, 'userId');
    const routines = await prisma.routine.findMany({
      where: { userId },
      include: routineInclude,
      orderBy: { createdAt: 'asc' },
    });
    res.json(routines);
  })
);

// POST /routines { userId, name, description?, exercises: [...] }
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { userId, name, description, exercises } = req.body ?? {};
    if (typeof userId !== 'string' || userId.length === 0) {
      throw badRequest('El campo "userId" es obligatorio');
    }
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw badRequest('El campo "name" es obligatorio');
    }
    const items = validateExercises(exercises ?? []);

    const routine = await prisma.routine.create({
      data: {
        userId,
        name: name.trim(),
        description: description ?? null,
        exercises: {
          create: items.map((ex) => ({
            exerciseId: ex.exerciseId,
            order: ex.order,
            targetSets: ex.targetSets ?? 3,
            targetReps: ex.targetReps ?? '8-12',
            targetRpe: ex.targetRpe ?? null,
            restSeconds: ex.restSeconds ?? 120,
          })),
        },
      },
      include: routineInclude,
    });
    res.status(201).json(routine);
  })
);

// PUT /routines/:id — mismo body, reemplaza ejercicios
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const existing = await prisma.routine.findUnique({ where: { id } });
    if (!existing) throw notFound('Rutina no encontrada');

    const { name, description, exercises } = req.body ?? {};
    const items = exercises !== undefined ? validateExercises(exercises) : null;

    const routine = await prisma.$transaction(async (tx) => {
      await tx.routine.update({
        where: { id },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(description !== undefined ? { description } : {}),
        },
      });
      if (items !== null) {
        await tx.routineExercise.deleteMany({ where: { routineId: id } });
        for (const ex of items) {
          await tx.routineExercise.create({
            data: {
              routineId: id,
              exerciseId: ex.exerciseId,
              order: ex.order,
              targetSets: ex.targetSets ?? 3,
              targetReps: ex.targetReps ?? '8-12',
              targetRpe: ex.targetRpe ?? null,
              restSeconds: ex.restSeconds ?? 120,
            },
          });
        }
      }
      return tx.routine.findUniqueOrThrow({ where: { id }, include: routineInclude });
    });

    res.json(routine);
  })
);

// DELETE /routines/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.routine.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

export default router;
