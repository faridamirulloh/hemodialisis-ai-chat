/* eslint-disable no-unused-vars */
import { PrismaClient } from '@prisma/client/extension';

// Extend NodeJS.Global to include a typed prisma property
declare global {
  // Use 'any' to avoid type errors with extended Prisma client
  var prisma: any;
}

let prisma: any;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Prevent multiple instances in development with hot reloading
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export { prisma };
