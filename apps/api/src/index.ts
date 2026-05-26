import "dotenv/config";
import app from "./app";
import { logger } from "./lib/logger";
import { prisma } from "./lib/prisma";

const PORT = Number(process.env.PORT) || 4000;

async function main() {
  await prisma.$connect();
  logger.info("Database connected");

  const server = app.listen(PORT, () => {
    logger.info({ port: PORT, env: process.env.NODE_ENV }, "DocTalk API started");
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down gracefully…");
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));
}

main().catch((err) => {
  logger.error(err, "Fatal startup error");
  process.exit(1);
});
