/**
 * Layer B — physical orders. Verifies the shipping snapshot on creation and
 * that paying a PHYSICAL order does NOT trigger digital fulfillment (no token,
 * no download email) — that path is gated on product.format === "digital".
 * The admin shipment-notification flow (set shipped + tracking → email) needs
 * an authenticated admin and is covered separately / manually.
 */
import { test, expect } from "@playwright/test";
import { db, uniqueBuyerEmail } from "./fixtures/db";

test("physical order is created pending with a shipping snapshot", () => {
  const order = db.createOrder({
    email: uniqueBuyerEmail("physical-create"),
    format: "physical",
  });

  expect(order.orderNumber).toMatch(/^\d{4}-\d{4}$/);
  expect(order.paymentStatus).toBe("pending");
  expect(order.fulfillmentStatus).toBe("pending");
  expect(order.totalGross).toBe(0.1);
});

test("paying a physical order does NOT issue a download token or email", () => {
  const created = db.createOrder({
    email: uniqueBuyerEmail("physical-pay"),
    format: "physical",
  });
  const paid = db.flipPaid(created.id);

  expect(paid.paymentStatus).toBe("paid");
  expect(paid.paidAt).toBeTruthy();

  // digitalFulfillment short-circuits for non-digital products.
  expect(paid.downloadToken ?? null).toBeNull();
  expect(paid.fulfillmentStatus).toBe("pending");
  expect(paid.downloadEmailStatus).toBe("pending");
});
