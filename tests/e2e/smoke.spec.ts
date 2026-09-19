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
