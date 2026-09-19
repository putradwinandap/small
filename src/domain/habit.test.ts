import { describe, expect, it } from "vitest";
import {
  activeHabitLimit,
  applyCheckIn,
  canAddAnotherHabit,
  assertCanCreateHabit,
  HabitRuleError,
  type HabitProgress,
} from "./habit";

const progress = (overrides: Partial<HabitProgress> = {}): HabitProgress => ({
  scheduledDays: 0,
  completedDays: 0,
  consecutiveMissedDays: 0,
  consecutiveRecoveryCompletions: 0,
  inRecovery: false,
  ...overrides,
});

describe("habit unlock", () => {
  it("keeps the user at one habit before stability", () => {
    const current = progress({ scheduledDays: 14, completedDays: 9 });
    expect(canAddAnotherHabit(current)).toBe(false);
    expect(activeHabitLimit(current)).toBe(1);
  });

  it("unlocks a second habit after the stability rule", () => {
    const current = progress({ scheduledDays: 14, completedDays: 10 });
    expect(canAddAnotherHabit(current)).toBe(true);
    expect(activeHabitLimit(current)).toBe(2);
  });

  it("does not unlock after more than 14 days with only five completions", () => {
    expect(canAddAnotherHabit(progress({ scheduledDays: 20, completedDays: 5 }))).toBe(false);
  });

  it("enters recovery after two missed days without deleting progress", () => {
    const firstMiss = applyCheckIn(progress({ completedDays: 5 }), "missed");
    const secondMiss = applyCheckIn(firstMiss, "missed");

    expect(secondMiss.inRecovery).toBe(true);
    expect(secondMiss.completedDays).toBe(5);
    expect(secondMiss.consecutiveMissedDays).toBe(2);
  });

  it("leaves recovery after three consecutive completions", () => {
    let current = progress({ inRecovery: true });
    current = applyCheckIn(current, "complete");
    current = applyCheckIn(current, "complete");
    current = applyCheckIn(current, "complete");

    expect(current.inRecovery).toBe(false);
    expect(current.completedDays).toBe(3);
  });

  it("rejects a second habit before unlock", () => {
    expect(() => assertCanCreateHabit(progress(), 1)).toThrowError(HabitRuleError);
  });
});
