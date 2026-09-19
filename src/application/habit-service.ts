import { HabitStatus, Prisma } from "@prisma/client";
import { activeHabitLimit, assertCanCreateHabit, type HabitProgress } from "@/domain/habit";
import { prisma } from "@/lib/prisma";

export async function userHabitProgress(userId: string): Promise<HabitProgress> {
  const checkIns = await prisma.checkIn.findMany({
    where: { habit: { userId } },
    orderBy: { date: "asc" },
    select: { status: true },
  });

  return {
    scheduledDays: checkIns.length,
    completedDays: checkIns.filter((checkIn) => checkIn.status === "COMPLETE").length,
    consecutiveMissedDays: 0,
    consecutiveRecoveryCompletions: 0,
    inRecovery: false,
  };
}

export async function assertHabitCreationAllowed(userId: string): Promise<void> {
  const [progress, activeHabits] = await Promise.all([
    userHabitProgress(userId),
    prisma.habit.count({ where: { userId, status: HabitStatus.ACTIVE } }),
  ]);
  assertCanCreateHabit(progress, activeHabits);
}

export const habitSummarySelect = {
  id: true,
  name: true,
  action: true,
  status: true,
  inRecovery: true,
  startedAt: true,
  checkIns: { orderBy: { date: "desc" }, take: 30, select: { date: true, status: true } },
} satisfies Prisma.HabitSelect;

export async function listUserHabits(userId: string) {
  return prisma.habit.findMany({
    where: { userId },
    select: habitSummarySelect,
    orderBy: { createdAt: "asc" },
  });
}

export function serializedHabit(habit: Awaited<ReturnType<typeof listUserHabits>>[number]) {
  const completedDays = habit.checkIns.filter((checkIn) => checkIn.status === "COMPLETE").length;
  return { ...habit, completedDays, scheduledDays: habit.checkIns.length };
}

export { activeHabitLimit };
