import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler, badRequest, requireQuery } from '../lib/http';

const router = Router();

// GET /recovery?userId=
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = requireQuery(req, 'userId');
    const logs = await prisma.recoveryLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    res.json(logs);
  })
);

// POST /recovery { userId, sleepHours, soreness, fatigue, notes?, date? }
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { userId, sleepHours, soreness, fatigue, notes, date } = req.body ?? {};
    if (typeof userId !== 'string' || userId.length === 0) {
      throw badRequest('El campo "userId" es obligatorio');
    }
    if (typeof sleepHours !== 'number' || !Number.isFinite(sleepHours) || sleepHours < 0) {
      throw badRequest('sleepHours debe ser un número ≥ 0');
    }
    if (!Number.isInteger(soreness) || soreness < 1 || soreness > 10) {
      throw badRequest('soreness debe ser un entero entre 1 y 10');
    }
    if (!Number.isInteger(fatigue) || fatigue < 1 || fatigue > 10) {
      throw badRequest('fatigue debe ser un entero entre 1 y 10');
    }
    const log = await prisma.recoveryLog.create({
      data: {
        userId,
        sleepHours,
        soreness,
        fatigue,
        notes: notes ?? null,
        ...(date !== undefined ? { date: new Date(date) } : {}),
      },
    });
    res.status(201).json(log);
  })
);

// DELETE /recovery/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.recoveryLog.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

export default router;
