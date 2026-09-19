import { HabitStatus, Prisma } from "@prisma/client";
import { activeHabitLimit, assertCanCreateHabit, type HabitProgress } from "@/domain/habit";
import { prisma } from "@/lib/prisma";
import { calendarDayInTimezone } from "@/lib/dates";

function startOfUtcDay(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

export async function reconcileMissedCheckIns(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } });
  if (!user) return;
  const today = calendarDayInTimezone(new Date(), user.timezone);
  const habits = await prisma.habit.findMany({
    where: { userId, status: HabitStatus.ACTIVE },
    select: { id: true, startedAt: true },
  });

  for (const habit of habits) {
    const missingDates: Date[] = [];
    for (
      const cursor = calendarDayInTimezone(habit.startedAt, user.timezone);
      cursor < today;
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    ) {
      missingDates.push(new Date(cursor));
    }
    if (missingDates.length === 0) continue;
    await prisma.checkIn.createMany({
      data: missingDates.map((date) => ({ habitId: habit.id, date, status: "MISSED" as const })),
      skipDuplicates: true,
    });
    await refreshRecoveryState(habit.id);
  }
}

export async function refreshRecoveryState(habitId: string): Promise<void> {
  const recent = await prisma.checkIn.findMany({
    where: { habitId },
    orderBy: { date: "desc" },
    take: 3,
    select: { status: true },
  });
  const missedPrefix = recent.findIndex((item) => item.status !== "MISSED");
  const completePrefix = recent.findIndex((item) => item.status !== "COMPLETE");
  const missedCount = missedPrefix === -1 ? recent.length : missedPrefix;
  const completionCount = completePrefix === -1 ? recent.length : completePrefix;
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    select: { inRecovery: true },
  });
  if (!habit) return;
  await prisma.habit.update({
    where: { id: habitId },
    data: {
      inRecovery: habit.inRecovery ? completionCount < 3 : missedCount >= 2,
      consecutiveMissedDays: missedCount,
      consecutiveRecoveryCompletions: completionCount,
    },
  });
}

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
    prisma.habit.count({ where: { userId, status: { not: HabitStatus.ARCHIVED } } }),
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
