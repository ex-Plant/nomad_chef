/**
 * Layer B — digital fulfillment. Creates a pending digital order, flips it to
 * paid via the Payload Local API (the same payload.update the P24 webhook and
 * the PULL reconcile path run), and asserts the digitalFulfillment hook issued
 * a token + download email. A real download email is sent to the buyer address.
 */
import { test, expect } from "@playwright/test";
import { db, uniqueBuyerEmail } from "./fixtures/db";

const TOKEN_REGEX = /^[0-9a-f]{48}$/;
const DOWNLOAD_TTL_MS = 72 * 60 * 60 * 1000;

test("digital order is created pending with a frozen price snapshot", () => {
  const order = db.createOrder({ email: uniqueBuyerEmail("digital-create") });

  expect(order.orderNumber).toMatch(/^\d{4}-\d{4}$/);
  expect(order.paymentStatus).toBe("pending");
  expect(order.fulfillmentStatus).toBe("pending");
  expect(order.totalGross).toBe(0.1);
  expect(order.quantity).toBe(1);
  expect(order.downloadToken ?? null).toBeNull();
});

test("paying a digital order issues a token and sends the download email", () => {
  const created = db.createOrder({ email: uniqueBuyerEmail("digital-pay") });
  const paid = db.flipPaid(created.id);

  expect(paid.paymentStatus).toBe("paid");
  expect(paid.paymentRef).toBeTruthy();
  expect(paid.paidAt).toBeTruthy();

  // digitalFulfillment side-effects
  expect(paid.downloadToken).toMatch(TOKEN_REGEX);
  expect(paid.fulfillmentStatus).toBe("fulfilled");

  // Email outcome — the only assertable proof the mail was sent (no capture).
  expect(paid.downloadEmailStatus).toBe("sent");
  expect(paid.downloadEmailSentAt).toBeTruthy();
  expect(paid.downloadEmailError ?? null).toBeNull();

  // Expiry ~72h out (allow a generous skew for boot + clock).
  const expiresInMs = new Date(paid.downloadExpiresAt!).getTime() - Date.now();
  expect(expiresInMs).toBeGreaterThan(DOWNLOAD_TTL_MS - 10 * 60 * 1000);
  expect(expiresInMs).toBeLessThanOrEqual(DOWNLOAD_TTL_MS + 60 * 1000);
});
