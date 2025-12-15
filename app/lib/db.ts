import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // Opcional: te muestra en la consola qué está buscando en la base de datos
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;