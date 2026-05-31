# Design — Purchase Flow E2E Test Suite

**Date:** 2026-05-31
**Status:** approved (design), pending spec review → implementation plan
**Recon basis:** `docs/purchase-flow-test-findings.md` (environment, blockers,
selectors, P24 sandbox simulator). Read that first for context.

---

## 1. Goal

A re-runnable `@playwright/test` suite (committed spec files, not MCP browser
driving) that verifies the product-buying flow end to end against the **local
dev database**:

- **Happy path** — buy → pay → fulfill → download.
- **Unhappy path** — form validation, unpaid/expired/bad-token download, failed
  payment.
- **Emails** — the download-ready email is sent (asserted via its DB status).
- **Invoice + customer data** — captured, persisted, snapshotted onto the order.
- **Post-order integrity** — order row correct in DB / Payload admin; download
  link and gated file route behave; status lifecycle correct.

Both products are in scope (`cookbook-digital` and `cookbook-physical`, both
0.1 PLN locally).

---

## 2. Why layered (the core constraint)

`/api/p24/webhook` and the shared `reconcileOrderPayment` settlement both call
P24's `verifyTransaction` before flipping an order to `paid`. So payment **cannot
be faked locally** by forging a webhook for a non-existent transaction — verify
rejects it. The real flip is, ultimately, this (from `reconcile-order-payment.ts`):

```ts
await payload.update({
  collection: "orders",
  id: order.id,
  data: { paymentStatus: "paid", paymentRef, paidAt },
});
// → digitalFulfillment afterChange hook → download token + download email
```

That gives us a faithful, deterministic seam: **flip the order to `paid` via the
Payload Local API** to exercise everything downstream of payment, while reserving
the real P24 round-trip for a single manual smoke. Hence three layers.

---

## 3. Architecture

### Layer A — UI up to the P24 redirect (`@manual`, sandbox-dependent)

Origin `http://localhost:3000` (ngrok-free kills hydration in `next dev` — see
findings §3.2). Drive the cart form via Playwright, submit, assert the client
navigates to a `…/trnRequest/{token}` URL. Proves: validation, invoice/customer
capture, order persisted as `pending` with correct price snapshot.

> **Correction (audit):** this is NOT network-free — `createOrder` calls the
> live P24 `transaction/register` to get the paywall URL, and recycled
> count-derived order numbers collide with the sandbox's session-id memory
> (findings F4). So `cart-redirect` is `@manual`, not in the default gate. The
> deterministic value it implied (validation, persistence) is covered by
> `cart-validation` + the Local-API specs instead.

### Layer B — fulfillment / download / email (fast, CI-safe)

Place (or factory-create) an order, then flip it to `paid` via the **Payload
Local API** in the test process (same DB, same pattern as `scripts/test-email.ts`).
The real `digitalFulfillment` hook fires. Assert: token (`^[0-9a-f]{48}$`),
`downloadExpiresAt ≈ now+72h`, `fulfillmentStatus='fulfilled'`,
`downloadEmailStatus='sent'` + `downloadEmailSentAt`. Then exercise the
download page and the gated file route:

| Case                      | Expected                                      |
| ------------------------- | --------------------------------------------- |
| paid + valid token        | `200`, file streams, `lastDownloadAt` stamped |
| unpaid order              | `403`                                         |
| expired token             | `410`                                         |
| malformed / unknown token | `404`                                         |
| `confirm-delivery`        | `fulfillmentStatus='delivered'`               |

### Layer C — real payment smoke (manual, `@manual`, NOT CI-blocking)

Production build (`next build && next start`) behind ngrok, `SITE_URL`=ngrok
(prod build has no HMR socket, so it hydrates and is publicly reachable). Drive
cart → P24 sandbox simulator (pick mBank → **"Wybierz czynność"** → **Zapłać**)
→ assert webhook flips `paid` and the page lands on `/download/{token}`.
Optionally **Błąd płatności** / **Brak wpłaty** for the failed branch (needs a
short `P24_PAYABLE_WINDOW_MINUTES`, below). One true E2E; tagged `@manual` and
excluded from the default run.

### Webhook spec (what's testable without a P24 stub)

`/api/p24/webhook` is driven by crafted POSTs:

- **Bad sign → rejected** (computed with the test `P24_CRC`, then corrupted).
- **Idempotency** — POST against an already-`paid` order returns `200` without
  re-verifying.

Amount-mismatch and the **success flip** require a real registered+paid sandbox
transaction (verify must succeed) → covered by Layer C, _not_ faked here. We do
**not** add a `verifyTransaction` stub to production code (minimise change).

---

## 4. Test data & isolation

- **DB:** the local dev Postgres (`chef-cms`). No separate test DB.
- **Products:** `cookbook-digital` + `cookbook-physical` already exist (0.1 PLN);
  global setup asserts their presence rather than creating them.
- **Admin user:** seed a dedicated test admin via Local API in global setup (for
  the one `/admin` order-detail UI assertion). Credentials live in the test env.
- **Buyer addresses:** `ka+e2e-<id>@bayalab.com` (plus-addressing → real inbox),
  which also acts as the cleanup marker.
- **Teardown:** global teardown deletes orders + customers whose email matches
  the `ka+e2e-` marker, via Local API, so the dev DB stays clean across runs.

---

## 5. Email verification policy

Real SMTP, real delivery (no Mailpit, no mocking — user decision).

| Email                         | Recipient               | Verified how                                                                 |
| ----------------------------- | ----------------------- | ---------------------------------------------------------------------------- |
| Download-ready                | buyer                   | **Automated** — order `downloadEmailStatus='sent'` + `downloadEmailSentAt`   |
| Order confirmation (operator) | `marta@chaoskitchen.pl` | **Manual** — user reads the inbox (no DB trace)                              |
| Interest-thanks               | buyer                   | **Manual** — user reads the inbox (no DB trace)                              |
| Shipment notification         | buyer                   | **Automated** — endpoint returns `{ ok, sentTo }`, order `shippedAt` stamped |

Accepted limitation: operator + interest-thanks emails have no persisted status,
so they are not auto-asserted. Template HTML can be eyeballed at `/email-previews`.

---

## 6. Config / environment changes

**Test config only — no production code changes.**

1. `playwright.config.ts`: `baseURL` `3001 → 3000` (the app's real port); add a
   `webServer` block with `reuseExistingServer: true` so the suite attaches to a
   running dev server instead of conflicting.
2. Add an `npm` script: `"test:e2e": "playwright test"` (and a `:manual` variant
   or `--grep` to include the Layer C smoke deliberately).
3. Test env: `P24_PAYABLE_WINDOW_MINUTES` set low (e.g. 1) so the `failed` branch
   resolves quickly in Layer C. Already env-driven — no code change.
4. `.env` `CRON_SECRET` — owned by the user (out of this suite's scope).

---

## 7. File layout & requirement mapping

```
tests/e2e/
  fixtures/
    payload.ts        Local API client (getPayload against local DB)
    orders.ts         order factory + flip-to-paid helper + teardown
    p24-sign.ts       SHA-384 notification sign helper (test CRC)
  cart-validation.spec.ts      A — required fields, postal/NIP regex, invoice + customer capture
  order-creation.spec.ts       A — pending order persisted, price snapshot, redirect URL
  fulfillment-digital.spec.ts  B — flip paid → token + downloadEmailStatus='sent'
  download-gating.spec.ts      B — file route 200/403/410/404, confirm-delivery
  fulfillment-physical.spec.ts B — shippingAddress snapshot, admin shipped+tracking → shipment email
  admin-order.spec.ts          B — /admin order detail shows correct fields (seeded admin)
  webhook.spec.ts              bad sign + idempotency branches
  payment-smoke.spec.ts        C — @manual, real sandbox simulator round-trip
```

| Requirement                         | Covered by                                             |
| ----------------------------------- | ------------------------------------------------------ |
| Happy path                          | A (redirect) + B (fulfillment/download) + C (true E2E) |
| Unhappy path                        | A (validation), B (403/410/404), C (failed payment)    |
| Emails                              | B (download-ready via DB); operator/thanks = manual    |
| Invoice + customer data             | A (cart-validation, order-creation)                    |
| Post-order data / admin correctness | B (admin-order, DB assertions) + download-gating       |

---

## 8. Risks & limitations

- **Webhook success/amount branches** aren't unit-testable without a P24 stub →
  deferred to Layer C. Accepted.
- **Operator/thanks emails** aren't auto-asserted (no capture). Accepted.
- **Layer C is manual** (ngrok + prod build + external DOM). Not in CI gate.
- **Shared dev DB** means orders/emails accumulate per run; mitigated by the
  marker-based teardown, but a crashed run can leave residue.
- **Real mail every run** — operator inbox (Marta) receives a message per order.

---

## 9. Out of scope

- Mailpit / email capture infrastructure.
- CI pipeline wiring (no CI exists yet; Layers A/B are CI-ready when one is added).
- Production payment testing; refund/`refunded` flow.
- Load/perf testing.
