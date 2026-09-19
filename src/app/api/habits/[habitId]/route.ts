import { HabitStatus } from "@prisma/client";
import { currentUserId } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type HabitContext = { params: Promise<{ habitId: string }> };

export async function PATCH(request: Request, context: HabitContext) {
  const userId = await currentUserId();
  if (!userId) return jsonError("You must be logged in.", 401, "UNAUTHENTICATED");
  const { habitId } = await context.params;
  const body = await readJson(request);
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) return jsonError("Habit not found.", 404, "HABIT_NOT_FOUND");

  const data: { name?: string; action?: string; status?: HabitStatus } = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.action === "string" && body.action.trim()) data.action = body.action.trim();
  if (body.status === "ACTIVE" || body.status === "PAUSED" || body.status === "ARCHIVED") {
    data.status = body.status;
  }

  if (data.status === HabitStatus.ACTIVE && habit.status !== HabitStatus.ACTIVE) {
    const activeCount = await prisma.habit.count({ where: { userId, status: HabitStatus.ACTIVE } });
    if (activeCount >= 1)
      return jsonError(
        "Only one habit can be active at a time.",
        409,
        "ACTIVE_HABIT_LIMIT_REACHED",
      );
  }

  const updated = await prisma.habit.update({ where: { id: habitId }, data });
  return Response.json({ habit: updated });
}
