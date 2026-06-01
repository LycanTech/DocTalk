import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

const makePrisma = () =>
  new PrismaClient({
    log: [
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" },
    ],
  });

type PrismaSingleton = ReturnType<typeof makePrisma>;

const globalForPrisma = globalThis as unknown as { prisma: PrismaSingleton | undefined };

export const prisma = globalForPrisma.prisma ?? makePrisma();

prisma.$on("error", (e) => logger.error(e, "Prisma error"));
prisma.$on("warn",  (e) => logger.warn(e,  "Prisma warning"));

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
