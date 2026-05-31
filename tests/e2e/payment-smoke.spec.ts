/**
 * Layer C — real payment smoke. @manual: NOT part of the CI-safe run.
 *
 * Prerequisites (see docs/purchase-flow-test-findings.md §3):
 *   - CRON_SECRET set in .env.
 *   - A production build behind ngrok (next dev does NOT hydrate through
 *     ngrok-free), with SITE_URL = the ngrok URL so the webhook round-trips.
 *   - Run against that origin:  E2E_ALL=1 E2E_BASE_URL=<ngrok> npx playwright test payment-smoke
 *
 * This automates up to the P24 paywall. Completing the payment is manual: on
 * the sandbox page pick mBank → "Wybierz czynność" → Zapłać. The webhook then
 * flips the order to paid and the page advances to /download/<token>.
 */
import { test, expect } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL;

test("drives the cart to the P24 sandbox paywall @manual", async ({ page }) => {
  test.skip(!baseURL, "Set E2E_BASE_URL to the ngrok prod-build origin.");
  await page.goto(baseURL!);

  await page.getByRole("button", { name: "Kup ebook" }).click();
  const dialog = page.getByRole("dialog", { name: "Zamówienie" });
  await dialog.locator('input[name="email"]').fill("konradantonik@gmail.com");
  await dialog.locator('input[name="firstName"]').fill("Smoke");
  await dialog.locator('input[name="lastName"]').fill("Test");
  await dialog.getByRole("checkbox", { name: "Akceptuję" }).check();
  await dialog
    .getByRole("checkbox", { name: /Wyrażam zgodę na dostarczenie/ })
    .check();
  await dialog.getByRole("button", { name: "Złóż zamówienie" }).click();

  await page.waitForURL(/sandbox\.przelewy24\.pl\/trnRequest\//, {
    timeout: 30_000,
  });
  expect(page.url()).toContain("/trnRequest/");

  test.info().annotations.push({
    type: "manual",
    description:
      "Complete payment: pick mBank → Wybierz czynność → Zapłać. Then confirm the order flips to paid and /download/<token> loads.",
  });
});
