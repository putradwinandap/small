import { expect, test } from "@playwright/test";

test("landing page presents a focused first action", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Small/);
  await expect(page.getByRole("heading", { name: /Change one thing/i })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByRole("button", { name: /Create account/i })).toBeVisible();
});

test("health endpoint is available", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  await expect(response).toBeOK();
  expect(await response.json()).toEqual({ status: "ok", service: "small" });
});

test("a new user can create a habit and record a completion", async ({ page }) => {
  test.skip(!process.env.DATABASE_URL, "Requires the CI PostgreSQL service");
  const email = `e2e-${Date.now()}@small.local`;

  await page.goto("/");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("small-e2e-password");
  await page.getByRole("button", { name: /Create account/i }).click();
  await expect(page.getByRole("heading", { name: /Make it smaller/i })).toBeVisible();

  await page.getByLabel("Habit name").fill("Read");
  await page.getByLabel("The small action").fill("Read one page");
  await page.getByRole("button", { name: /Begin this habit/i }).click();
  await expect(page.getByRole("heading", { name: "Read" })).toBeVisible();
  await page.getByRole("button", { name: /I did it today/i }).click();
  await expect(page.getByText("Small step recorded.")).toBeVisible();
});
