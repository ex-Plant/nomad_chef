/**
 * Audit — order data is correct in the Payload admin. Seeds a test admin, logs
 * into the panel, opens a paid order's detail page, and verifies it renders the
 * right order number + buyer email (so the admin view reflects real data).
 */
import { test, expect } from "@playwright/test";
import { db, uniqueBuyerEmail } from "./fixtures/db";

const ADMIN_EMAIL = "e2e-admin@bayalab.com";
const ADMIN_PASSWORD = "TestAdmin123!";

test("paid order renders correctly on the admin detail page", async ({
  page,
}) => {
  db.seedAdmin({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const buyerEmail = uniqueBuyerEmail("admin");
  const created = db.createOrder({ email: buyerEmail });
  const paid = db.flipPaid(created.id);

  // Log into the Payload admin. Wait for the dashboard URL specifically — not a
  // regex that also matches /admin/login (a failed login would slip through).
  await page.goto("/admin/login");
  await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
  // Locale-proof: the admin login locale isn't pinned (PL or EN depending on
  // the browser), so target the submit button by type, not its label text.
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => url.pathname === "/admin", {
    timeout: 30_000,
  });

  // Open the order detail and verify the data shown. The order number is the
  // page <h1>; the buyer email renders in the customer relation.
  await page.goto(`/admin/collections/orders/${paid.id}`);
  await expect(
    page.getByRole("heading", { name: paid.orderNumber }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(buyerEmail).first()).toBeVisible();
});
