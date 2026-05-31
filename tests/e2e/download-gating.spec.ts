/**
 * Layer B — the gated file route /api/download/<token>/file. Verifies every
 * access-control branch against the live server.
 */
import { randomBytes } from "node:crypto";
import { test, expect } from "@playwright/test";
import { db, uniqueBuyerEmail } from "./fixtures/db";

// Unique each call — downloadToken has a UNIQUE index, so a constant collides
// with leftover rows.
function freshToken(): string {
  return randomBytes(24).toString("hex");
}

// Link cookbook-digital to the ebook already in the Blob store so the 200-stream
// path is exercisable locally (no upload). Restored after this file's tests.
let seeded: { assetId: number; previousFileId: number | null; url: string };

test.beforeAll(() => {
  seeded = db.seedDigitalAsset();
});
test.afterAll(() => {
  if (seeded) db.removeDigitalAsset(seeded.assetId);
});

test("unknown token → 404", async ({ request }) => {
  const token = "f".repeat(48);
  const res = await request.get(`/api/download/${token}/file`);
  expect(res.status()).toBe(404);
  expect((await res.json()).error).toBe("Link nieaktywny.");
});

test("malformed token → 404", async ({ request }) => {
  const res = await request.get(`/api/download/not-a-token/file`);
  expect(res.status()).toBe(404);
});

test("unpaid order with a token → 403", async ({ request }) => {
  const order = db.createOrder({ email: uniqueBuyerEmail("gate-403") });
  const token = freshToken();
  db.patchOrder(order.id, { downloadToken: token });

  const res = await request.get(`/api/download/${token}/file`);
  expect(res.status()).toBe(403);
  expect((await res.json()).error).toBe("Zamówienie nieopłacone.");
});

test("paid order with an expired token → 410", async ({ request }) => {
  const created = db.createOrder({ email: uniqueBuyerEmail("gate-410") });
  const paid = db.flipPaid(created.id);
  db.patchOrder(paid.id, { downloadExpiresAt: "2020-01-01T00:00:00.000Z" });

  const res = await request.get(`/api/download/${paid.downloadToken}/file`);
  expect(res.status()).toBe(410);
  expect((await res.json()).error).toContain("Link wygasł");
});

test("paid order with a valid token streams the ebook file (200)", async ({
  request,
}) => {
  const created = db.createOrder({ email: uniqueBuyerEmail("gate-200") });
  const paid = db.flipPaid(created.id);

  const res = await request.get(`/api/download/${paid.downloadToken}/file`);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/pdf");
  expect(res.headers()["content-disposition"]).toContain("inline");
});
