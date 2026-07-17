import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler, badRequest, notFound, requireQuery } from '../lib/http';

const router = Router();

const EQUIPMENT_TYPES = ['BARBELL', 'PLATE', 'DUMBBELL', 'MACHINE'];

// GET /gyms?userId= → (Gym & { equipment })[]
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = requireQuery(req, 'userId');
    const gyms = await prisma.gym.findMany({
      where: { userId },
      include: { equipment: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(gyms);
  })
);

// POST /gyms { userId, name, notes? }
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { userId, name, notes } = req.body ?? {};
    if (typeof userId !== 'string' || userId.length === 0) {
      throw badRequest('El campo "userId" es obligatorio');
    }
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw badRequest('El campo "name" es obligatorio');
    }
    const gym = await prisma.gym.create({
      data: { userId, name: name.trim(), notes: notes ?? null },
    });
    res.status(201).json(gym);
  })
);

// PATCH /gyms/:id
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { name, notes } = req.body ?? {};
    const gym = await prisma.gym.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });
    res.json(gym);
  })
);

// DELETE /gyms/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.gym.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

// PUT /gyms/:id/equipment { equipment: EquipmentItemInput[] } — reemplaza el inventario
router.put(
  '/:id/equipment',
  asyncHandler(async (req, res) => {
    const gymId = req.params.id;
    const gym = await prisma.gym.findUnique({ where: { id: gymId } });
    if (!gym) throw notFound('Gimnasio no encontrado');

    const { equipment } = req.body ?? {};
    if (!Array.isArray(equipment)) {
      throw badRequest('El campo "equipment" debe ser un arreglo');
    }
    for (const item of equipment) {
      if (!item || !EQUIPMENT_TYPES.includes(item.type)) {
        throw badRequest(
          `Cada elemento de equipo requiere type en {${EQUIPMENT_TYPES.join(', ')}}`
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.equipmentItem.deleteMany({ where: { gymId } });
      for (const item of equipment) {
        await tx.equipmentItem.create({
          data: {
            gymId,
            type: item.type,
            name: item.name ?? null,
            weightKg: item.weightKg ?? null,
            count: item.count ?? null,
            stackStepKg: item.stackStepKg ?? null,
            stackMaxKg: item.stackMaxKg ?? null,
          },
        });
      }
      return tx.equipmentItem.findMany({ where: { gymId } });
    });

    res.json(result);
  })
);

export default router;
