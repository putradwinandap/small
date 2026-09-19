import { HabitStatus } from "@prisma/client";
import {
  assertHabitCreationAllowed,
  listUserHabits,
  serializedHabit,
  userHabitProgress,
} from "@/application/habit-service";
import { currentUserId } from "@/lib/auth";
import { jsonError, readJson, requiredString } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return jsonError("You must be logged in.", 401, "UNAUTHENTICATED");
  const [habits, progress] = await Promise.all([listUserHabits(userId), userHabitProgress(userId)]);
  return Response.json({ habits: habits.map(serializedHabit), progress });
}

export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return jsonError("You must be logged in.", 401, "UNAUTHENTICATED");

  try {
    await assertHabitCreationAllowed(userId);
    const body = await readJson(request);
    const name = requiredString(body.name, "name");
    const action = requiredString(body.action, "action");
    const habit = await prisma.habit.create({
      data: { userId, name, action, status: HabitStatus.ACTIVE },
    });
    return Response.json({ habit }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String(error.code) : "INVALID_REQUEST";
    return jsonError(
      error instanceof Error ? error.message : "Unable to create habit.",
      code === "SECOND_HABIT_LOCKED" ? 409 : 400,
      code,
    );
  }
}
