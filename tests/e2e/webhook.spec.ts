/**
 * Layer B — the P24 webhook /api/p24/webhook. Covers every branch reachable
 * WITHOUT a real P24 transaction (the success flip calls transaction/verify
 * against P24, so it lives in the manual Layer C smoke). Signs are computed
 * locally from P24_CRC.
 */
import { test, expect } from "@playwright/test";
import { db, uniqueBuyerEmail } from "./fixtures/db";
import { buildNotification, toGrosze } from "./fixtures/p24";

// A paid order to drive idempotency + amount-mismatch (the amount guard runs
// before the paid short-circuit, so a paid order serves both).
let paidOrderNumber: string;
let paidAmount: number;

test.beforeAll(() => {
  const created = db.createOrder({ email: uniqueBuyerEmail("webhook") });
  const paid = db.flipPaid(created.id);
  paidOrderNumber = paid.orderNumber;
  paidAmount = toGrosze(paid.totalGross);
});

test("invalid payload → 400", async ({ request }) => {
  const res = await request.post("/api/p24/webhook", { data: {} });
  expect(res.status()).toBe(400);
  expect((await res.json()).error).toBe("Invalid payload");
});

test("bad sign → 400 (spoofed payload rejected)", async ({ request }) => {
  const res = await request.post("/api/p24/webhook", {
    data: buildNotification({
      sessionId: paidOrderNumber,
      amount: paidAmount,
      invalidSign: true,
    }),
  });
  expect(res.status()).toBe(400);
  expect((await res.json()).error).toBe("Bad sign");
});

test("valid sign but unknown order → 404", async ({ request }) => {
  const res = await request.post("/api/p24/webhook", {
    data: buildNotification({ sessionId: "NOPE-9999", amount: 10 }),
  });
  expect(res.status()).toBe(404);
  expect((await res.json()).error).toBe("Order not found");
});

test("valid sign, wrong amount → 400 (tampering guard)", async ({
  request,
}) => {
  const res = await request.post("/api/p24/webhook", {
    data: buildNotification({ sessionId: paidOrderNumber, amount: 999999 }),
  });
  expect(res.status()).toBe(400);
  expect((await res.json()).error).toBe("Amount mismatch");
});

test("already-paid order → 200 (idempotent, no re-verify)", async ({
  request,
}) => {
  const res = await request.post("/api/p24/webhook", {
    data: buildNotification({ sessionId: paidOrderNumber, amount: paidAmount }),
  });
  expect(res.status()).toBe(200);
  expect((await res.json()).ok).toBe(true);
});
