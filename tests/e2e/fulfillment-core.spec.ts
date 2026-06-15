/**
 * Layer B — the shared fulfillment core. Exercises ensureDownloadToken (write-
 * once) and fulfillDigitalOrder (idempotent, token-first) via the Local-API
 * db-cli, independent of the hook trigger.
 */
import { test, expect } from "@playwright/test";
import { db, uniqueBuyerEmail } from "./fixtures/db";

const TOKEN_REGEX = /^[0-9a-f]{48}$/;

test("ensureToken issues a token for a paid order that has none", () => {
  const created = db.createOrder({ email: uniqueBuyerEmail("core-ensure") });
  db.patchOrder(created.id, { paymentStatus: "paid" });

  const { token, order } = db.ensureToken(created.id);
  expect(token).toMatch(TOKEN_REGEX);
  expect(order.downloadToken).toBe(token);
  expect(order.downloadExpiresAt).toBeTruthy();
});

test("ensureToken is write-once: a second call returns the same token", () => {
  const created = db.createOrder({ email: uniqueBuyerEmail("core-once") });
  db.patchOrder(created.id, { paymentStatus: "paid" });

  const first = db.ensureToken(created.id);
  const second = db.ensureToken(created.id);
  expect(second.token).toBe(first.token);
});

test("fulfillOrder is idempotent and never regenerates an existing token", () => {
  const created = db.createOrder({ email: uniqueBuyerEmail("core-fulfill") });
  const paid = db.flipPaid(created.id);
  expect(paid.downloadToken).toMatch(TOKEN_REGEX);

  const again = db.fulfillOrder(created.id);
  expect(again.token).toBe(paid.downloadToken);
  expect(again.order.downloadToken).toBe(paid.downloadToken);
  expect(again.order.downloadEmailStatus).toBe("sent");
});

test("fulfillOrder no-ops on a pending order", () => {
  const created = db.createOrder({ email: uniqueBuyerEmail("core-pending") });
  const result = db.fulfillOrder(created.id);
  expect(result.token).toBeNull();
  expect(result.order.downloadToken ?? null).toBeNull();
});

test("email-retry sweep retries a paid order whose email is still pending", () => {
  const created = db.createOrder({ email: uniqueBuyerEmail("core-retry") });
  const paid = db.flipPaid(created.id);
  // A first send that failed leaves the order `pending` (one retry due).
  db.patchOrder(paid.id, { downloadEmailStatus: "pending" });

  const sweep = db.emailRetrySweep();
  expect(sweep.resent).toBeGreaterThanOrEqual(1);

  const after = db.getOrder(paid.id);
  expect(after.downloadEmailStatus).toBe("sent");
  expect(after.downloadToken).toBe(paid.downloadToken); // token unchanged
});

test("email-retry sweep does NOT retry a terminal `failed` order (retry once only)", () => {
  const created = db.createOrder({ email: uniqueBuyerEmail("core-failed") });
  const paid = db.flipPaid(created.id);
  // `failed` = the single auto-retry was already spent. Manual resend only.
  db.patchOrder(paid.id, { downloadEmailStatus: "failed" });

  db.emailRetrySweep();

  const after = db.getOrder(paid.id);
  expect(after.downloadEmailStatus).toBe("failed"); // untouched by the sweep
});
