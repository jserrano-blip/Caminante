import { PrismaClient } from '@prisma/client';

// Cliente Prisma compartido por toda la aplicación.
export const prisma = new PrismaClient();
