/**
 * Layer A — drives the real cart form to the P24 paywall. @manual: this calls
 * the LIVE P24 sandbox `transaction/register`, so it isn't deterministic enough
 * for the default gate. It's also subject to finding F4 — order numbers are
 * count-derived, so teardown-recycled numbers collide with the sandbox's
 * session-id memory ("Id sesji zduplikowane", 400). Run on demand:
 *   E2E_ALL=1 npx playwright test cart-redirect
 * The deterministic value (validation, order persistence) is covered by
 * cart-validation + the Local-API specs; the full real payment is payment-smoke.
 */
import { test, expect } from "@playwright/test";

test("submitting the cart redirects to the P24 paywall @manual", async ({
  page,
}) => {
  await page.goto("/");

  // Retry the open-click until the modal appears: on the dev server the button
  // exists in server HTML before React attaches its handler, so an early click
  // is a no-op (hydration race).
  const buy = page.getByRole("button", { name: "Kup ebook" });
  const dialog = page.getByRole("dialog");
  await expect(async () => {
    await buy.click();
    await expect(dialog).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 30_000 });

  // Scope everything to the dialog (the page also has a contact form with an
  // email field). Digital order needs only email + the two consents.
  await dialog
    .getByRole("textbox", { name: "Twój e-mail" })
    .fill(`konradantonik+e2e-cart-${Date.now()}@gmail.com`);

  await dialog.getByRole("checkbox", { name: /^Akceptuję/ }).check();
  await dialog.getByRole("checkbox", { name: /^Wyrażam zgodę/ }).check();

  await dialog.getByRole("button", { name: "Złóż zamówienie" }).click();

  // The server action registers a P24 transaction and the client sets
  // window.location to the paywall token URL. P24 bounces the registered host
  // (sandbox.przelewy24.pl) to its paywall host (sandbox-go.przelewy24.pl).
  await page.waitForURL(/przelewy24\.pl\/trnRequest\//, { timeout: 30_000 });
  expect(page.url()).toContain("/trnRequest/");
});
