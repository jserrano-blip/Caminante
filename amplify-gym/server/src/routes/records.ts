import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler, requireQuery } from '../lib/http';

const router = Router();

// GET /records?userId=&exerciseId?= → (PersonalRecord & { exercise })[]
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = requireQuery(req, 'userId');
    const exerciseId =
      typeof req.query.exerciseId === 'string' && req.query.exerciseId.length > 0
        ? req.query.exerciseId
        : undefined;
    const records = await prisma.personalRecord.findMany({
      where: { userId, ...(exerciseId ? { exerciseId } : {}) },
      include: { exercise: true },
      orderBy: { date: 'desc' },
    });
    res.json(records);
  })
);

export default router;
