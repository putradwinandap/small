import { CheckInStatus } from "@prisma/client";
import { currentUserId } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

function todayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function POST(request: Request, context: { params: Promise<{ habitId: string }> }) {
  const userId = await currentUserId();
  if (!userId) return jsonError("You must be logged in.", 401, "UNAUTHENTICATED");
  const { habitId } = await context.params;
  const body = await readJson(request);
  const status = body.status === "missed" ? CheckInStatus.MISSED : CheckInStatus.COMPLETE;
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId, status: "ACTIVE" } });
  if (!habit) return jsonError("Habit not found.", 404, "HABIT_NOT_FOUND");

  try {
    const checkIn = await prisma.$transaction(async (transaction) => {
      const created = await transaction.checkIn.create({
        data: { habitId, date: todayUtc(), status },
      });
      const recent = await transaction.checkIn.findMany({
        where: { habitId },
        orderBy: { date: "desc" },
        take: 3,
        select: { status: true },
      });
      const consecutiveMissedDays = recent.findIndex(
        (item) => item.status !== CheckInStatus.MISSED,
      );
      const missedCount = consecutiveMissedDays === -1 ? recent.length : consecutiveMissedDays;
      const consecutiveRecoveryCompletions = recent.findIndex(
        (item) => item.status !== CheckInStatus.COMPLETE,
      );
      const completionCount =
        consecutiveRecoveryCompletions === -1 ? recent.length : consecutiveRecoveryCompletions;
      const inRecovery = habit.inRecovery ? completionCount < 3 : missedCount >= 2;

      await transaction.habit.update({
        where: { id: habitId },
        data: {
          inRecovery,
          consecutiveMissedDays: missedCount,
          consecutiveRecoveryCompletions: completionCount,
        },
      });
      return created;
    });
    return Response.json({ checkIn }, { status: 201 });
  } catch {
    return jsonError(
      "This habit already has a check-in for today.",
      409,
      "CHECK_IN_ALREADY_EXISTS",
    );
  }
}
