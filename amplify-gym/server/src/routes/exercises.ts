import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler, badRequest, requireQuery } from '../lib/http';

const router = Router();

const MUSCLE_GROUPS = ['PECHO', 'ESPALDA', 'PIERNA', 'HOMBRO', 'BRAZO', 'CORE', 'OTRO'];
const CATEGORIES = ['BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'];

// GET /exercises?userId= → globales (userId null) + propios, con variants
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = requireQuery(req, 'userId');
    const exercises = await prisma.exercise.findMany({
      where: { OR: [{ userId: null }, { userId }] },
      include: { variants: true },
      orderBy: { name: 'asc' },
    });
    res.json(exercises);
  })
);

// POST /exercises { userId, name, muscleGroup, category, variantOfId?, notes?, isPowerlift? }
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { userId, name, muscleGroup, category, variantOfId, notes, isPowerlift } =
      req.body ?? {};
    if (typeof userId !== 'string' || userId.length === 0) {
      throw badRequest('El campo "userId" es obligatorio');
    }
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw badRequest('El campo "name" es obligatorio');
    }
    if (!MUSCLE_GROUPS.includes(muscleGroup)) {
      throw badRequest(`muscleGroup debe ser uno de: ${MUSCLE_GROUPS.join(', ')}`);
    }
    if (!CATEGORIES.includes(category)) {
      throw badRequest(`category debe ser uno de: ${CATEGORIES.join(', ')}`);
    }
    const exercise = await prisma.exercise.create({
      data: {
        userId,
        name: name.trim(),
        muscleGroup,
        category,
        variantOfId: variantOfId ?? null,
        notes: notes ?? null,
        isPowerlift: Boolean(isPowerlift),
      },
      include: { variants: true },
    });
    res.status(201).json(exercise);
  })
);

// PATCH /exercises/:id
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { name, muscleGroup, category, variantOfId, notes, isPowerlift } = req.body ?? {};
    if (muscleGroup !== undefined && !MUSCLE_GROUPS.includes(muscleGroup)) {
      throw badRequest(`muscleGroup debe ser uno de: ${MUSCLE_GROUPS.join(', ')}`);
    }
    if (category !== undefined && !CATEGORIES.includes(category)) {
      throw badRequest(`category debe ser uno de: ${CATEGORIES.join(', ')}`);
    }
    const exercise = await prisma.exercise.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(muscleGroup !== undefined ? { muscleGroup } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(variantOfId !== undefined ? { variantOfId } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(isPowerlift !== undefined ? { isPowerlift: Boolean(isPowerlift) } : {}),
      },
      include: { variants: true },
    });
    res.json(exercise);
  })
);

// DELETE /exercises/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.exercise.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

export default router;
