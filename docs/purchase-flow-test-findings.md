# Purchase Flow E2E — Test Recon & Findings

> Reconnaissance for an automated end-to-end test suite covering the
> product-buying flow (cart → P24 sandbox payment → fulfillment → download →
> emails). Captured 2026-05-31 against the local sandbox environment.
> This is a findings/strategy doc, not the implementation plan.

---

## 1. Goal

Stand up a re-runnable test suite (real `@playwright/test` spec files, **not**
Playwright-MCP browser driving) that verifies:

- **Happy path** — buy a product, pay, get fulfilled, download works.
- **Unhappy path** — validation failures, failed/abandoned payment, expired
  download link, unpaid download attempt.
- **Emails** — the correct transactional emails are actually sent.
- **Invoice + customer data** — captured, persisted, snapshotted onto the order.
- **Post-order integrity** — order row in Payload/DB is correct; download link
  and gated file route behave; status lifecycle is right.

Decision already locked: **spec files, committed to the repo** — the MCP browser
is throwaway probing only.

---

## 2. Environment state (as observed)

| Thing             | State                                                                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dev server        | `next dev` (webpack, **not** turbopack), Next 16.2.3, port **3000**                                                                                      |
| Playwright        | `@playwright/test@1.59.1` installed; `playwright.config.ts` present, `baseURL` `http://localhost:3001`, `tests/` dir, 60s timeout. **No E2E specs yet.** |
| Existing `tests/` | `node:test` unit tests (cart, checkout/billing, products) — not Playwright                                                                               |
| DB                | Postgres in Docker `chef-cms`, user `chef`, db `chef`, host port `5434`                                                                                  |
| ngrok             | tunnel → `http://localhost:3000`, public `https://feldspathic-trichotomic-ty.ngrok-free.dev` (free tier)                                                 |
| `SITE_URL`        | the ngrok URL (builds `urlReturn` + `urlStatus`)                                                                                                         |
| `P24_SANDBOX`     | `true`                                                                                                                                                   |
| Package manager   | npm; Node v24.15.0                                                                                                                                       |

**Products (both cheap-testable):**

| id  | slug                | format   | price_gross | vat | active |
| --- | ------------------- | -------- | ----------- | --- | ------ |
| 1   | `cookbook-digital`  | digital  | 0.1 PLN     | 5%  | ✓      |
| 2   | `cookbook-physical` | physical | 0.1 PLN     | 5%  | ✓      |

Admin users exist (2). A prior order `0025-2026` is already `paid`/`shipped`, so
the sandbox round-trip has worked manually before.

---

## 3. Blockers found during live recon

The Playwright-MCP recon walked the cart form but **never reached the P24
paywall**. Two blockers, both environmental — not P24's fault:

### 3.1 `CRON_SECRET` — NOT a checkout blocker (recon was stale)

> **Corrected during the audit.** The original recon hit a 500 with
> `Missing required env var: CRON_SECRET` against an older `env.ts`. The current
> `src/config/env.ts` does **not** list `CRON_SECRET`; the only consumer is
> `src/app/api/cron/reconcile-payments/route.ts`, which reads it at the route and
> merely **logs a warning** if unset (it does not throw). So `createOrder` does
> **not** 500, and the live cart → P24 redirect (Layer A) works without it. No
> `.env` change is needed for the suite.

### 3.2 ngrok-free kills hydration in dev mode

- On the ngrok origin the page renders server HTML but **never hydrates** — zero
  React handlers attached; buttons do nothing.
- Cause: `next dev` opens an HMR WebSocket `wss://…/_next/webpack-hmr`, which
  ngrok-free returns **503** for. The webpack-dev client retries and **force-
  reloads the page every ~26–30s**, wiping React state mid-interaction.
- Implication: **do not drive the UI through the ngrok origin in dev.** Options:
  - **UI tests:** drive `http://localhost:3000` (hydrates fine).
  - **Full round-trip (webhook) tests:** use a **production build**
    (`next build && next start`) behind ngrok — no HMR socket, hydrates fine,
    publicly reachable for the webhook.

### 3.3 The localhost ↔ ngrok origin tension (design constraint)

`SITE_URL` is baked into the P24 transaction's `urlReturn`/`urlStatus` at
register time. So:

- If you drive UI on `localhost:3000`, after paying P24 redirects the browser to
  `SITE_URL` (ngrok) `/checkout/processing` → cross-origin hop into the
  hydration-dead ngrok dev page, and the webhook targets ngrok too.
- A clean full round-trip needs **one consistent origin that both hydrates and
  is publicly reachable** = production build behind ngrok.
- Pure "up to the redirect" UI tests avoid this entirely (they stop before P24).

---

## 4. The P24 flow (from `docs/przelewy24.md` + code) and what it means for tests

```
cart submit
  → createOrder()            order = pending, registerTransaction() → token
  → window.location = {host}/trnRequest/{token}
  → buyer pays on P24 paywall
  → P24 POST urlStatus (/api/p24/webhook)   ── SUCCESS payments only, retried ──┐
        sign-check → amount guard → transaction/verify → paymentStatus = paid   │
        → digitalFulfillment hook → download token + download email            ◄┘
  → buyer returns to urlReturn (/checkout/processing)
        paid + token  → redirect to /download/{token}
        else          → poll until webhook lands OR PULL settles it
```

**Critical testing implications:**

1. **`verify` is mandatory.** `/api/p24/webhook` calls `transaction/verify`
   against P24 and only flips to `paid` if it succeeds. So **a forged webhook for
   a non-existent transaction will be rejected** — you cannot fully fake payment
   locally without either (a) a real paid sandbox transaction, or (b) stubbing
   `verifyTransaction` behind a test-only env seam.
2. **P24 only webhooks successful payments**, and **retries** on a backoff until
   the handler ACKs 200. Handler is idempotent (repeat on a paid order → 200).
3. **Failure is detected by PULL, not webhook.** Failed/abandoned payments never
   webhook; `checkPaymentOutcome` PULLs `transaction/by/sessionId` and only marks
   `failed` once the payable window (`P24_PAYABLE_WINDOW_MINUTES`, default 15 min)
   elapses. Before that, status `0` stays `pending` → **the unhappy "failed"
   path is slow to assert (up to ~15 min) unless the window is shortened for
   tests.**
4. `sessionId` == our `orderNumber` (e.g. `0025-2026`).

### The sandbox simulator (the deterministic test lever)

Per `docs/przelewy24.md` §6, the P24 **sandbox** exposes a simulator: pick a bank
method (e.g. **mBank**) → **"Wybierz czynność"** page → choose an outcome:

| Button                  | Effect                                                              |
| ----------------------- | ------------------------------------------------------------------- |
| **Zapłać**              | success → P24 marks txn paid, **POSTs `urlStatus`**                 |
| **Błąd płatności**      | payment error → no webhook, order stays `pending` until PULL/window |
| **Brak wpłaty**         | no payment → same                                                   |
| **Nieprawidłowa kwota** | wrong amount → same                                                 |

This means driving the paywall **is** deterministic in sandbox — and the PULL
path settles `paid` even without a reachable webhook. The cost is the
external-domain dependency and ngrok.

---

## 5. Cart form selectors (grounded in the live localhost DOM)

Buy button (homepage Ebook section): role `button`, name **"Kup ebook"**
(`cart-buy-button.tsx`). Modal: Radix `Dialog`, accessible name **"Zamówienie"**.

| Field                    | Selector                                                                                       | Required          |
| ------------------------ | ---------------------------------------------------------------------------------------------- | ----------------- |
| Email                    | `input[name="email"][type="email"]` ("Twój e-mail")                                            | yes (`z.email`)   |
| First name               | `input[name="firstName"]` ("Imię")                                                             | no                |
| Last name                | `input[name="lastName"]` ("Nazwisko")                                                          | no                |
| Notes                    | `textarea[name="notes"]` ("Wiadomość")                                                         | no                |
| Legal consent            | `getByRole('checkbox', { name: 'Akceptuję' })`                                                 | **yes**           |
| Digital-delivery consent | `getByRole('checkbox', { name: /Wyrażam zgodę na dostarczenie/ })`                             | **yes (digital)** |
| Invoice toggle           | `getByRole('checkbox', { name: 'Faktura' })` → reveals `companyName` / `nip` / invoice address | no                |
| Submit                   | `getByRole('button', { name: 'Złóż zamówienie' })`                                             | —                 |

Checkboxes are Radix (no `name`/`id` on the input) — drive by role+name.
Validation rules (`src/lib/cart/cart-schema.ts`): postal code `^\d{2}-\d{3}$`,
NIP `^\d{10}$`; physical requires shipping line1/city/postalCode; invoice
requires companyName/NIP + billing address unless `useShippingAsInvoice`.

Screenshots from recon (repo root): `recon-01-homepage.png`,
`recon-05-cart-form-localhost.png`, `recon-06-form-filled.png`,
`recon-07-submit-500-stuck.png`.

---

## 6. Order data model — what to assert after purchase

Table `orders`. Order number e.g. `0025-2026`. Prices are **snapshotted** at
creation (assert the order's frozen values, not the live product).

**Always:** `orderNumber`, `customer`, `product`, `quantity`, `unitPriceGross`,
`totalGross`, `priceNet`, `vatRate`, `vatAmount`, `currency='PLN'`,
`paymentStatus`, `fulfillmentStatus`, `wantsInvoice`, `createdAt`.

**After paid (digital):** `paymentStatus='paid'`, `paymentRef` set, `paidAt` set,
`downloadToken` matches `^[0-9a-f]{48}$`, `downloadExpiresAt` ≈ now+72h,
`fulfillmentStatus='fulfilled'`, `fulfilledAt` set, `downloadEmailStatus='sent'`,
`downloadEmailSentAt` set (or `'failed'` + `downloadEmailError` on send failure).

**Physical:** `shippingAddress.*` snapshot (country default `PL`),
`fulfillmentStatus='pending'` until admin sets `shipped` + `tracking` and fires
`POST /api/orders/:id/send-shipment-notification` (stamps `shippedAt`).

**Status lifecycle:** payment `pending → paid` (or `failed`/`refunded`);
fulfillment digital `pending → fulfilled`; physical `pending → shipped →
delivered`; download-email `pending → sent`/`failed`.

DB read pattern (per repo convention — psql, not tsx):

```bash
docker exec chef-cms psql -U chef -d chef -c \
  "SELECT order_number, payment_status, fulfillment_status, payment_ref, \
   download_token, download_email_status, download_email_sent_at, paid_at \
   FROM orders ORDER BY created_at DESC LIMIT 3;"
```

---

## 7. Email pipeline — verification approach

Transport: nodemailer → **real SMTP** (`mail.chaoskitchen.pl`, port 465).
**No local capture (Mailpit/etc.).** Decision: **send for real** to the real
destinations.

| Email                         | Trigger          | Recipient                                  |
| ----------------------------- | ---------------- | ------------------------------------------ |
| Order confirmation (operator) | order created    | `EMAIL_TO` = `marta@chaoskitchen.pl`       |
| Ebook interest thanks         | order created    | buyer (pre-payment; removed at go-live)    |
| Download ready                | `pending → paid` | buyer — link `{SITE_URL}/download/{token}` |
| Contact form                  | contact submit   | `EMAIL_TO`                                 |
| Shipment notification         | admin manual     | buyer (tracking)                           |

**Verification in tests:** assert the **order side-effects**
(`downloadEmailStatus='sent'`, `downloadEmailSentAt`, `downloadToken`) rather
than reading an inbox. Use a **buyer address you own** (e.g. `ka+e2e@bayalab.com`)
so the real download email lands somewhere checkable.

**Trade-off to accept:** every test order really emails Marta (operator) and the
buyer address. Repeated CI runs = inbox noise. Template HTML can be eyeballed
without sending via the dev route `/email-previews`; `scripts/test-email.ts`
sends a chosen template on demand.

---

## 8. Recommended strategy — layered

Driving the sandbox paywall **is** feasible (the simulator is deterministic), but
it carries ngrok + external-DOM fragility. Split coverage by what each layer can
prove cheaply and reliably:

**Layer A — UI up to the redirect (fast, CI-safe, localhost:3000)**
Drive the cart form (digital + physical; valid + invalid; with/without invoice),
submit, assert client navigates to `sandbox.przelewy24.pl/trnRequest/{token}`.
Covers form validation, invoice/customer capture, order-created-as-pending.
No payment, no external network.

**Layer B — fulfillment / download / email (fast, CI-safe)**
Get an order to `paid` deterministically **without** the paywall — via Payload
Local API setting `paymentStatus='paid'` (fires `digitalFulfillment`), or via the
`regenerate-download` admin endpoint. Then assert token + email side-effects,
hit `/download/{token}`, and test the gated file route:
`/api/download/{token}/file` → 200 paid, 403 unpaid, 410 expired, 404 bad token.
Also test `confirm-delivery` → `fulfillment='delivered'`.

**Layer C — real payment integration (local/manual, not CI-blocking)**
Production build behind ngrok, SITE_URL=ngrok. Drive the cart → P24 sandbox
simulator → **Zapłać** → assert webhook lands, order flips `paid`, page advances
to `/download/{token}`. Optionally **Błąd płatności**/**Brak wpłaty** for the
failed branch (slow — needs a shortened `P24_PAYABLE_WINDOW_MINUTES` for tests).
This is the one "true E2E" smoke; keep it out of the blocking CI gate.

**Admin-data integrity:** assert via DB (§6) and/or one Playwright test that logs
into `/admin`, opens the order, and verifies the rendered fields (needs admin
creds in test env).

---

## 9. Open decisions / next steps

1. **Add `CRON_SECRET` to `.env`** + restart dev — required before any live
   purchase works. (Awaiting OK to edit `.env`.)
2. **Scope confirm:** Layers A + B for both digital & physical; Layer C as a
   single manual smoke. Confirm physical admin flow (tracking + shipment email)
   is in scope.
3. **Test data isolation:** run against the dev DB (and clean up created
   orders/customers), or a dedicated test DB? Orders accumulate + emails fire on
   each run.
4. **Failed-path speed:** to assert `failed` without a 15-min wait, allow
   `P24_PAYABLE_WINDOW_MINUTES` to be overridden low in the test env.
5. **`verify` seam:** decide whether Layer B flips paid via Local API (no P24) or
   whether we want an env-gated `verifyTransaction` stub for a webhook-handler
   unit/integration test.
6. **Recon artifacts:** `recon-*.png` + `.playwright-mcp/` logs are untracked at
   repo root — gitignore or remove.

---

## 10. Audit results — coverage & findings

Suite: `npm run test:e2e` (CI-safe) / `npm run test:e2e:all` (incl. `@manual`).
Last run: **20 passed, 1 skipped** (against the local dev DB; self-cleaning via
the `+e2e-` teardown marker).

### Phase coverage

| Phase                                  | Spec                                          | Status                                                              |
| -------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------- |
| Cart validation (unhappy path)         | `cart-validation`                             | ✅ blocks on missing consents / invalid email                       |
| Cart → P24 redirect (happy path)       | `cart-redirect`                               | ✅ real order → `…/trnRequest/{token}`                              |
| Order creation + price snapshot        | `fulfillment-digital`, `fulfillment-physical` | ✅                                                                  |
| Invoice + customer data capture        | `invoice-customer`                            | ✅ company/NIP/address on customer; `wantsInvoice`                  |
| Customer dedup                         | `invoice-customer`                            | ✅ same email → one customer, no dup address                        |
| Digital fulfillment + download email   | `fulfillment-digital`                         | ✅ token + `downloadEmailStatus=sent`                               |
| Physical (no digital fulfillment)      | `fulfillment-physical`                        | ✅ no token/email on pay                                            |
| Download link gating                   | `download-gating`                             | ✅ 404/403/410 **and 200-stream** (links the ebook already in Blob) |
| Webhook settlement branches            | `webhook`                                     | ✅ invalid/bad-sign/unknown/amount/idempotent                       |
| Admin data integrity                   | `admin-order`                                 | ✅ login → order detail shows correct number + buyer                |
| Real payment round-trip                | `payment-smoke`                               | ⏸ `@manual` (prod build + ngrok + human)                            |
| Failed-payment path                    | —                                             | ⏸ Layer C / not automated (needs short payable window)              |
| Shipment-notification email (physical) | —                                             | ⏸ not automated (needs admin auth + tracking)                       |

### Findings

- **F1 — Digital file present on prod, absent in the local DB (resolved).**
  Prod's `cookbook-digital` is linked to the ebook in Blob; only the local DB row
  was missing, so a _local_ paid download 500'd. The suite now links the local
  product to the **same ebook already in the Blob store** via a DB row
  (`seed-digital-asset` → reference the existing object, **no upload**, reversed
  in `afterAll`), so the 200-stream path is covered locally and matches prod.
  Note: dev + prod share **one** Blob store
  (`vkxkazad3y7jvarg.public.blob.vercel-storage.com`, 47 objects) — the tests
  never write to it (verified: object count unchanged across runs).
- **F2 — Consent checkboxes lack ARIA-associated labels (a11y, WCAG name).**
  The Radix checkboxes' visible text is an unlinked sibling, so they have no
  accessible name (tests target them by index). Associate a `<label htmlFor>` or
  `aria-label`.
- **F3 — VAT rounds to 0 at the 0.1 PLN test price.** Artifact of the tiny test
  price, not a bug; VAT math is unit-tested at realistic prices.
- **F4 — Order numbers are count-derived** (`orders-this-year + 1`). After row
  deletions the sequence can reissue a previously-used value. Harmless in prod
  (orders aren't deleted); only relevant to test cleanup.
- **F5 — Admin locale isn't pinned.** A fresh browser renders the panel in
  English ("Login"/"Password"); another shows Polish ("Zaloguj"). Status labels
  are localized too. No functional impact; tests use locale-proof selectors
  (`button[type="submit"]`, `input[name="email"]`).
- **F6 — `fulfillmentStatus="fulfilled"` shows as PL "Wysłane / dostarczone"**
  ("sent/delivered") — reads as physical-shipping language for a digital order.
  Value is correct; consider a clearer PL label for digital fulfilment.
- **F7 — `CRON_SECRET` is not a checkout blocker** (recon was stale — see §3.1).
- **F8 — P24 redirects `sandbox.przelewy24.pl` → `sandbox-go.przelewy24.pl`** for
  the paywall; assert `/przelewy24\.pl\/trnRequest\//`, not the registered host.

### Confirmed correct (audit passed)

Price/VAT snapshot freezing; order-number format `NNNN-YYYY`; invoice + customer
capture and dedup; client-side validation blocking; the five webhook branches
(sign, amount guard, idempotency, not-found); digital vs physical fulfilment
divergence; download-link gating; admin order detail + relations.
