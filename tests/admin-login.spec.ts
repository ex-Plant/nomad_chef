import { test, expect } from "@playwright/test";

test("admin login works", async ({ page }) => {
  await page.goto("http://localhost:3001/admin/login");
  await page.locator('input[name="email"]').fill("admin@chef.local");
  await page.locator('input[name="password"]').fill("admin1234");
  await page.getByRole("button", { name: /login/i }).click();
  await expect(page).toHaveURL(/\/admin(\/|$)/, { timeout: 15_000 });
  await expect(page.locator("body")).not.toContainText(/invalid|failed/i);
});
