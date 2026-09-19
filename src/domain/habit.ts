export const UNLOCK_SCHEDULED_DAYS = 14;
export const UNLOCK_COMPLETIONS = 10;
export const RECOVERY_MISSED_DAYS = 2;
export const RECOVERY_COMPLETIONS = 3;

export type HabitProgress = {
  scheduledDays: number;
  completedDays: number;
  consecutiveMissedDays: number;
  consecutiveRecoveryCompletions: number;
  inRecovery: boolean;
};

export type CheckInStatus = "complete" | "missed";

export type HabitState = "active" | "recovery" | "paused" | "archived";

export class HabitRuleError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "HabitRuleError";
  }
}

export function canAddAnotherHabit(progress: HabitProgress): boolean {
  return (
    progress.scheduledDays >= UNLOCK_SCHEDULED_DAYS && progress.completedDays >= UNLOCK_COMPLETIONS
  );
}

export function activeHabitLimit(progress: HabitProgress): number {
  return canAddAnotherHabit(progress) ? 2 : 1;
}

export function applyCheckIn(progress: HabitProgress, status: CheckInStatus): HabitProgress {
  if (status === "complete") {
    const recoveryCompletions = progress.inRecovery
      ? progress.consecutiveRecoveryCompletions + 1
      : 0;

    return {
      ...progress,
      scheduledDays: progress.scheduledDays + 1,
      completedDays: progress.completedDays + 1,
      consecutiveMissedDays: 0,
      consecutiveRecoveryCompletions: recoveryCompletions,
      inRecovery: progress.inRecovery && recoveryCompletions < RECOVERY_COMPLETIONS,
    };
  }

  const consecutiveMissedDays = progress.consecutiveMissedDays + 1;
  return {
    ...progress,
    scheduledDays: progress.scheduledDays + 1,
    consecutiveMissedDays,
    consecutiveRecoveryCompletions: 0,
    inRecovery: progress.inRecovery || consecutiveMissedDays >= RECOVERY_MISSED_DAYS,
  };
}

export function assertCanCreateHabit(progress: HabitProgress, currentActiveHabits: number): void {
  if (currentActiveHabits >= activeHabitLimit(progress)) {
    throw new HabitRuleError(
      canAddAnotherHabit(progress) ? "ACTIVE_HABIT_LIMIT_REACHED" : "SECOND_HABIT_LOCKED",
      "A second habit is not available until the stability rule is met.",
    );
  }
}
