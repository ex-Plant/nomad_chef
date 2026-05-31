/**
 * Layer A — unhappy path. The cart form validates client-side (Zod via TanStack
 * Form); these assert that invalid input blocks the submission (no redirect to
 * the P24 paywall, modal stays open).
 */
import { test, expect, type Page } from "@playwright/test";

async function openCart(page: Page) {
  await page.goto("/");
  const buy = page.getByRole("button", { name: "Kup ebook" });
  const dialog = page.getByRole("dialog");
  await expect(async () => {
    await buy.click();
    await expect(dialog).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 30_000 });
  return dialog;
}

test("blocks submission when the required consents are unchecked", async ({
  page,
}) => {
  const dialog = await openCart(page);
  await dialog
    .getByRole("textbox", { name: "Twój e-mail" })
    .fill("buyer@example.com");
  // Leave both consent checkboxes unchecked.
  await dialog.getByRole("button", { name: "Złóż zamówienie" }).click();

  await page.waitForTimeout(1_500);
  expect(page.url()).not.toContain("/trnRequest/");
  await expect(dialog).toBeVisible();
});

test("blocks submission on an invalid email", async ({ page }) => {
  const dialog = await openCart(page);
  await dialog
    .getByRole("textbox", { name: "Twój e-mail" })
    .fill("not-an-email");
  await dialog.getByRole("checkbox", { name: /^Akceptuję/ }).check();
  await dialog.getByRole("checkbox", { name: /^Wyrażam zgodę/ }).check();
  await dialog.getByRole("button", { name: "Złóż zamówienie" }).click();

  await page.waitForTimeout(1_500);
  expect(page.url()).not.toContain("/trnRequest/");
  await expect(dialog).toBeVisible();
});
