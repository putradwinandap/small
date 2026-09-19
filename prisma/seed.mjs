import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

async function main() {
  const password = hashPassword("small-dev-password");
  const user = await prisma.user.upsert({
    where: { email: "demo@small.local" },
    update: {},
    create: { email: "demo@small.local", password, timezone: "UTC" },
  });

  await prisma.habit.upsert({
    where: { id: "demo-first-habit" },
    update: {},
    create: {
      id: "demo-first-habit",
      userId: user.id,
      name: "Read",
      action: "Read one page",
      schedule: "daily",
    },
  });
}

main()
  .catch((error) => {
    process.stderr.write(`${String(error)}\n`);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
