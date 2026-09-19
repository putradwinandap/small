import { describe, expect, it } from "vitest";
import { calendarDayInTimezone, isValidTimezone } from "./dates";

describe("timezone calendar dates", () => {
  it("uses the user's local calendar day", () => {
    const instant = new Date("2026-09-19T23:30:00.000Z");
    expect(calendarDayInTimezone(instant, "Asia/Jakarta").toISOString()).toBe(
      "2026-09-20T00:00:00.000Z",
    );
    expect(calendarDayInTimezone(instant, "America/Los_Angeles").toISOString()).toBe(
      "2026-09-19T00:00:00.000Z",
    );
  });

  it("rejects invalid timezone identifiers", () => {
    expect(isValidTimezone("Asia/Jakarta")).toBe(true);
    expect(isValidTimezone("Not/A_Timezone")).toBe(false);
  });
});
