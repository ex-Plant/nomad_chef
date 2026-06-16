/**
 * Regression — the WebKit "this page couldn't load" flash on buy → P24.
 *
 * WebKit ONLY. `createOrder` sets the checkout cookie, which makes it a mutating
 * server action; Next then auto-refreshes the current route. When the handoff to
 * the P24 paywall was a client-side `window.location.href`, that refresh RSC
 * fetch raced the cross-origin navigation — WebKit cancelled the in-flight load
 * and flashed its native error page (a `pageerror: "Load failed"` plus a
 * `requestfailed: cancelled` on our origin) before the paywall appeared. Moving
 * the handoff to a server-side `redirect()` (303) supersedes the refresh, so the
 * race — and the flash — are gone. See src/lib/orders/create-order.ts.
 *
 * @manual: drives the LIVE P24 sandbox `transaction/register` (creates a pending
 * order + sends operator/interest emails), so it's kept off the default CI gate,
 * like cart-redirect / payment-smoke. The P24 paywall navigation itself is
 * intercepted with a local stand-in so the assertion is deterministic and never
 * leaves the origin under test. Run against a CURRENT-code dev server:
 *   E2E_BASE_URL=http://localhost:3000 npx playwright test payment-flash
 */
import { test, expect, devices } from "@playwright/test";

// Force WebKit for this file regardless of the default project — the bug does
// not exist on Chromium.
test.use({ ...devices["Desktop Safari"] });

const baseURL = process.env.E2E_BASE_URL || "http://localhost:3000";

test("buy → P24 handoff does not flash WebKit's error page @manual", async ({
  page,
}) => {
  const origin = new URL(baseURL).origin;

  // The flash signature: a same-origin request cancelled mid-handoff, surfaced
  // by WebKit as a "Load failed" page error.
  const pageErrors: string[] = [];
  const cancelledOnOrigin: string[] = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  page.on("requestfailed", (r) => {
    if (r.url().startsWith(origin)) {
      cancelledOnOrigin.push(`${r.url()} :: ${r.failure()?.errorText}`);
    }
  });

  // Keep the navigation deterministic and on-machine: serve a local stand-in for
  // the P24 paywall instead of leaving to przelewy24.pl.
  let paywallHits = 0;
  await page.route(/trnRequest/, (route) => {
    paywallHits++;
    return route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><h1>P24 PAYWALL STANDIN</h1>",
    });
  });

  await page.goto(baseURL, { waitUntil: "domcontentloaded" });

  // Open the cart (retry through the dev-server hydration race — the button is
  // in server HTML before React attaches its handler).
  const buy = page.getByRole("button", { name: "Kup ebook" });
  const dialog = page.getByRole("dialog");
  await expect(async () => {
    await buy.first().click({ timeout: 1500 });
    await expect(dialog.first()).toBeVisible({ timeout: 1500 });
  }).toPass({ timeout: 30_000 });

  const dlg = dialog.first();
  await dlg
    .locator('input[name="email"]')
    .fill(`konradantonik+webkit-flash-${Date.now()}@gmail.com`);
  // Check only the two consents (legal + digital delivery); the 3rd box is
  // "Faktura", which would reveal required invoice fields and block submit.
  const checks = dlg.locator('input[type="checkbox"]');
  await checks.nth(0).check({ force: true });
  await checks.nth(1).check({ force: true });

  await dlg.getByRole("button", { name: "Złóż zamówienie" }).click();

  // Land on the (intercepted) paywall stand-in.
  await expect(page.locator("h1")).toHaveText("P24 PAYWALL STANDIN", {
    timeout: 30_000,
  });
  expect(paywallHits).toBe(1);

  // The actual regression assertions: no native error flash during the handoff.
  expect(
    pageErrors.filter((m) => /load failed/i.test(m)),
    "WebKit flashed a 'Load failed' error page during the P24 handoff",
  ).toEqual([]);
  expect(
    cancelledOnOrigin,
    "a same-origin request was cancelled mid-handoff (the refresh that races the redirect)",
  ).toEqual([]);
});
