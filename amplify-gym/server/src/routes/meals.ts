import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler, badRequest, requireQuery } from '../lib/http';

const router = Router();

// GET /meals?userId= → globales (userId null) + propios
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = requireQuery(req, 'userId');
    const meals = await prisma.mealPrep.findMany({
      where: { OR: [{ userId: null }, { userId }] },
      orderBy: { name: 'asc' },
    });
    res.json(meals);
  })
);

// POST /meals
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const {
      userId,
      name,
      servings,
      proteinG,
      carbsG,
      fatG,
      calories,
      cookMinutes,
      applianceNote,
      instructions,
    } = req.body ?? {};
    if (typeof userId !== 'string' || userId.length === 0) {
      throw badRequest('El campo "userId" es obligatorio');
    }
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw badRequest('El campo "name" es obligatorio');
    }
    for (const [field, value] of Object.entries({ proteinG, carbsG, fatG, calories })) {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
        throw badRequest(`${field} debe ser un número ≥ 0`);
      }
    }
    const meal = await prisma.mealPrep.create({
      data: {
        userId,
        name: name.trim(),
        servings: servings ?? 1,
        proteinG,
        carbsG,
        fatG,
        calories,
        cookMinutes: cookMinutes ?? null,
        applianceNote: applianceNote ?? null,
        instructions: instructions ?? null,
      },
    });
    res.status(201).json(meal);
  })
);

// PATCH /meals/:id
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const {
      name,
      servings,
      proteinG,
      carbsG,
      fatG,
      calories,
      cookMinutes,
      applianceNote,
      instructions,
    } = req.body ?? {};
    const meal = await prisma.mealPrep.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(servings !== undefined ? { servings } : {}),
        ...(proteinG !== undefined ? { proteinG } : {}),
        ...(carbsG !== undefined ? { carbsG } : {}),
        ...(fatG !== undefined ? { fatG } : {}),
        ...(calories !== undefined ? { calories } : {}),
        ...(cookMinutes !== undefined ? { cookMinutes } : {}),
        ...(applianceNote !== undefined ? { applianceNote } : {}),
        ...(instructions !== undefined ? { instructions } : {}),
      },
    });
    res.json(meal);
  })
);

// DELETE /meals/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.mealPrep.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

export default router;
