import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./auth";

describe("password authentication", () => {
  it("verifies a password without storing it in plain text", async () => {
    const stored = await hashPassword("correct horse battery staple");

    expect(stored).not.toContain("correct horse battery staple");
    expect(await verifyPassword("correct horse battery staple", stored)).toBe(true);
    expect(await verifyPassword("wrong password", stored)).toBe(false);
  });

  it("uses a different salt for each password hash", async () => {
    const first = await hashPassword("same password");
    const second = await hashPassword("same password");

    expect(first).not.toBe(second);
    expect(await verifyPassword("same password", first)).toBe(true);
    expect(await verifyPassword("same password", second)).toBe(true);
  });
});
