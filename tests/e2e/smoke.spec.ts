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

test("database readiness endpoint is available", async ({ request }) => {
  test.skip(!process.env.DATABASE_URL, "Requires the CI PostgreSQL service");
  const response = await request.get("/api/health/ready");
  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toEqual({ status: "ready", database: "ok" });
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
  await page.getByLabel("Timezone").selectOption("Asia/Jakarta");
  await expect(page.getByLabel("Timezone")).toHaveValue("Asia/Jakarta");
  await expect(page.getByText("Timezone saved.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Timezone")).toHaveValue("Asia/Jakarta");

  const habitsResponse = await page.evaluate(async () => {
    const response = await fetch("/api/habits");
    return { ok: response.ok, body: await response.json() };
  });
  expect(habitsResponse.ok).toBeTruthy();
  const { habits } = habitsResponse.body;
  const habitId = habits[0].id as string;

  const pauseResponse = await page.evaluate(async (id) => {
    const response = await fetch(`/api/habits/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "PAUSED" }),
    });
    return { ok: response.ok };
  }, habitId);
  expect(pauseResponse.ok).toBeTruthy();

  const replacementResponse = await page.evaluate(async () => {
    const response = await fetch("/api/habits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Write", action: "Write one sentence" }),
    });
    return { status: response.status };
  });
  expect(replacementResponse.status).toBe(409);
});
