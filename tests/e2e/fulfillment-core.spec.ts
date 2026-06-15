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
