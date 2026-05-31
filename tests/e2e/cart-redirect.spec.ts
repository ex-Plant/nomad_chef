/**
 * Layer A — drives the real cart form and asserts it hands the buyer to the
 * P24 paywall. Creates a real (sandbox) order + P24 registration and sends the
 * operator + interest-thanks emails; the order is cleaned up by global-teardown.
 */
import { test, expect } from "@playwright/test";

test("submitting the cart redirects to the P24 paywall", async ({ page }) => {
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

  // Radix checkboxes have no ARIA-associated label, so target by order:
  // 0 = legal consent, 1 = digital-delivery consent (2 = Faktura).
  const checkboxes = dialog.getByRole("checkbox");
  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();

  await dialog.getByRole("button", { name: "Złóż zamówienie" }).click();

  // The server action registers a P24 transaction and the client sets
  // window.location to the paywall token URL. P24 bounces the registered host
  // (sandbox.przelewy24.pl) to its paywall host (sandbox-go.przelewy24.pl).
  await page.waitForURL(/przelewy24\.pl\/trnRequest\//, { timeout: 30_000 });
  expect(page.url()).toContain("/trnRequest/");
});
