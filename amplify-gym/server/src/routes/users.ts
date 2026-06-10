import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler, badRequest } from '../lib/http';

const router = Router();

// GET /users → User[]
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    res.json(users);
  })
);

// POST /users { name, avatarColor?, weightUnit?, sex? }
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, avatarColor, weightUnit, sex } = req.body ?? {};
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw badRequest('El campo "name" es obligatorio');
    }
    if (weightUnit !== undefined && !['KG', 'LB'].includes(weightUnit)) {
      throw badRequest('weightUnit debe ser KG o LB');
    }
    if (sex !== undefined && !['M', 'F'].includes(sex)) {
      throw badRequest('sex debe ser M o F');
    }
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        ...(avatarColor !== undefined ? { avatarColor } : {}),
        ...(weightUnit !== undefined ? { weightUnit } : {}),
        ...(sex !== undefined ? { sex } : {}),
      },
    });
    res.status(201).json(user);
  })
);

// PATCH /users/:id
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { name, avatarColor, weightUnit, sex } = req.body ?? {};
    if (weightUnit !== undefined && !['KG', 'LB'].includes(weightUnit)) {
      throw badRequest('weightUnit debe ser KG o LB');
    }
    if (sex !== undefined && !['M', 'F'].includes(sex)) {
      throw badRequest('sex debe ser M o F');
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(avatarColor !== undefined ? { avatarColor } : {}),
        ...(weightUnit !== undefined ? { weightUnit } : {}),
        ...(sex !== undefined ? { sex } : {}),
      },
    });
    res.json(user);
  })
);

// DELETE /users/:id → { ok: true }
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

export default router;
