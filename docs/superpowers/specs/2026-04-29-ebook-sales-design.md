# Ebook Sales — Inventory & Order Tracking Design

**Date:** 2026-04-29
**Status:** Draft, pending user review
**Phase:** Phase 2 (Functionality) — schema groundwork only

## Goal

Add a Payload-backed system for selling two SKUs (digital cookbook, physical cookbook) and recording every sale with enough fidelity to:

- Auto-fulfill digital purchases (email + protected download).
- Manually fulfill physical purchases (chef ships, enters tracking).
- Snapshot per-order data needed for accountant export and future invoicing.
- Stay payment-processor-agnostic — any future processor (Stripe, Tpay, Lemon Squeezy) is a webhook adapter, not a schema change.

A sales dashboard is **explicitly deferred** to a later, separate brainstorm once the chef has real ops experience.

## Non-goals

- Multi-item carts. Each order is exactly one product.
- Real-time stock management (no scarcity for either SKU).
- Customer accounts / login. Buyers do not register.
- Invoice PDF generation. Accountant exports raw order data.
- Country-of-customer tax detection / EU OSS compliance. Per-order VAT is snapshotted as a flat rate.
- Partial refunds with structured amount/reason. Deferred until a refund happens in practice.
- Bundle pricing, discount codes, gift cards.

## Architecture

Three Payload collections plus the existing `Customers`/`Media` infrastructure:

```
Customers   1 ── ∞   Orders   ∞ ── 1   Products
```

A processor-agnostic webhook endpoint flips `Order.paymentStatus` to `paid` and triggers the appropriate fulfillment flow based on `Product.format`.

### Why one Orders collection (not two)

Digital and physical orders share ~90% of fields (customer, product, amount, payment status, timestamps). The format-specific fields (digital download token vs physical tracking number) live as conditional fields on the same row, hidden in admin UI based on `product.format`. This keeps stats queries unified and avoids duplicate schema drift.

## Collections

### `Customers`

| Field | Type | Notes |
|---|---|---|
| `email` | string, unique, required | dedup key |
| `firstName` | string | |
| `lastName` | string | |
| `addresses` | array<group> | optional; only filled when buyer ordered physical |
| `addresses[].line1`, `line2`, `city`, `postalCode`, `country` | strings | `country` defaults to `PL` |
| `marketingConsent` | boolean | newsletter opt-in, default `false` |
| `notes` | text | chef's internal notes |
| `createdAt`, `updatedAt` | timestamps | Payload built-in |

A `beforeChange` hook on `Orders` upserts a Customer by email if one doesn't exist; addresses are appended (deduped on `line1 + postalCode`).

### `Products`

| Field | Type | Notes |
|---|---|---|
| `slug` | string, unique, required | URL slug |
| `title` | localized string | pl/en |
| `description` | localized rich text | pl/en, lexical |
| `format` | select: `digital` \| `physical` | drives flow |
| `priceGross` | integer (grosze) | no float money, ever |
| `currency` | select: `PLN` (only option for now) | future-proof |
| `vatRate` | decimal | default `0`; chef sets `0.05` once VAT-registered |
| `coverImage` | relation → media | required |
| `file` | relation → media | required iff `format === 'digital'` |
| `weightGrams` | integer | required iff `format === 'physical'`, used for shipping cost |
| `dimensions` | group: `length`/`width`/`height` (mm) | optional, physical only |
| `active` | boolean | default `true`; toggle off without deleting |

Conditional admin UI: `file` shown only when `format === 'digital'`; `weightGrams`/`dimensions` shown only when `format === 'physical'`.

### `Orders`

| Field | Type | Notes |
|---|---|---|
| `orderNumber` | string, unique, indexed | human-readable, e.g. `NC-2026-0001` |
| `customer` | relation → customers, required | |
| `product` | relation → products, required | |
| `quantity` | integer, default `1` | |
| `unitPriceGross` | integer (grosze) | snapshot at sale time |
| `totalGross` | integer (grosze) | `unitPriceGross * quantity` |
| `priceNet` | integer (grosze) | snapshot, derived from gross + vatRate |
| `vatRate` | decimal | snapshot at sale time |
| `vatAmount` | integer (grosze) | snapshot, derived |
| `currency` | select: `PLN` | |
| `paymentStatus` | select: `pending` \| `paid` \| `failed` \| `refunded` | |
| `paymentProvider` | string | `stripe` \| `tpay` \| `manual` — set by webhook adapter |
| `paymentRef` | string | provider's transaction ID |
| `fulfillmentStatus` | select: see below | format-aware |
| **Digital-only conditional fields** | | shown when `product.format === 'digital'` |
| `downloadToken` | string, indexed | random UUID, generated on `paymentStatus = paid` |
| `downloadCount` | integer, default `0` | incremented on each successful download |
| `downloadLimit` | integer, default `5` | hard cap |
| `downloadExpiresAt` | timestamp | default `paidAt + 30 days` |
| **Physical-only conditional fields** | | shown when `product.format === 'physical'` |
| `shippingAddress` | group: `firstName`, `lastName`, `line1`, `line2`, `city`, `postalCode`, `country` | snapshotted from Customer at sale time |
| `tracking` | string | courier tracking number |
| `courier` | select: `inpost` \| `dpd` \| `dhl` \| `poczta-polska` \| `other` | |
| `shippedAt` | timestamp | |
| **Common** | | |
| `notes` | text | chef's internal notes |
| `createdAt`, `paidAt`, `fulfilledAt` | timestamps | |

`fulfillmentStatus` values:
- For digital: `pending` → `fulfilled`
- For physical: `pending` → `shipped` → `delivered`

Stored as a single `select` field with all values; admin UI conditionally restricts options based on `product.format`.

### Order numbering

Format: `NC-{YYYY}-{####}` (e.g. `NC-2026-0042`).

Implementation: `beforeChange` hook on `Orders.create` queries `count(*)` of orders with the current year, increments. Acceptable because the chef's volume is low (collisions extremely rare) and `orderNumber` has a unique constraint as a safety net. If volume grows, swap for a Postgres sequence.

## Flows

### Digital flow

1. Buyer picks digital cookbook → checkout page.
2. Frontend creates `Order` with `paymentStatus = pending`, redirects to processor (Stripe Checkout / Tpay).
3. Processor fires success webhook → adapter route handler validates signature, finds order by `paymentRef`, sets `paymentStatus = paid` and `paidAt`.
4. `afterChange` hook on `Orders`: if `paymentStatus` flipped to `paid` and `product.format === 'digital'`, generate `downloadToken`, set `downloadExpiresAt = paidAt + 30 days`, `fulfillmentStatus = fulfilled`, `fulfilledAt = now`.
5. Hook sends transactional email containing `https://nomadchef.pl/pl/pobierz/{downloadToken}`.
6. Buyer clicks link → route handler at `/pl/pobierz/[token]/route.ts` (or `/api/download/[token]`):
   - Looks up Order by `downloadToken`.
   - Checks: `paymentStatus === 'paid'`, `now < downloadExpiresAt`, `downloadCount < downloadLimit`.
   - On pass: streams file from Vercel Blob, increments `downloadCount`.
   - On fail: returns a friendly error page with re-issue contact info.

Re-issue: chef can edit an Order in Payload admin and click a "Reissue download" button (custom admin component) that resets `downloadCount = 0`, extends `downloadExpiresAt`, regenerates `downloadToken`, and re-sends the email.

### Physical flow

1. Buyer picks physical cookbook → checkout collects shipping address → redirect to processor.
2. Processor webhook → `paymentStatus = paid`, `paidAt` set. `fulfillmentStatus` stays `pending`.
3. `afterChange` hook sends "thank you, we'll ship soon" email. No download generated.
4. Chef logs into Payload admin → sees pending orders → packs book → enters `tracking`, `courier`, sets `fulfillmentStatus = shipped`.
5. `afterChange` hook on `shipped` transition sends "your book has shipped" email with tracking number.
6. (Optional, manual) Chef sets `fulfillmentStatus = delivered` later. Not auto-detected.

### Refund flow (deferred)

Manual: refund is processed in the payment processor's dashboard. Chef flips `paymentStatus = refunded` in Payload admin. No additional fields, no automation. Future work: capture `refundedAmount`, `refundReason`, automate via webhook.

## Email

Three transactional templates needed (Phase 2 work, not in this spec's scope):
- Digital fulfillment: download link + expiry note + reminder of download limit.
- Physical paid: thanks, ship within X days.
- Physical shipped: tracking link.

Email transport: `nodemailer` is half-wired in `payload.config.ts` (commented). To be enabled when SMTP/Resend credentials are set. Provider choice (Resend vs nodemailer + SMTP) is a separate decision — schema is provider-agnostic.

## Stats / dashboard

**Deferred.** Schema supports any reasonable query out of the box:

- Sales by period: `WHERE paymentStatus = 'paid' AND paidAt BETWEEN ...`
- Digital vs physical split: `GROUP BY product.format`
- Revenue: `SUM(totalGross) WHERE paymentStatus = 'paid'`
- Refund rate: `COUNT WHERE paymentStatus = 'refunded' / COUNT WHERE paidAt IS NOT NULL`
- Top customers: `GROUP BY customer ORDER BY SUM(totalGross) DESC`

Until the chef has ~20 real sales and knows what she actually checks, no dashboard UI is built. CSV export via Payload's existing list view is sufficient for the accountant.

## Money handling rule

All money fields are integers in grosze (1 PLN = 100 grosze). No floats anywhere — ever. Display layer formats with `Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' })`.

## Snapshotting rule

`Order.unitPriceGross`, `priceNet`, `vatRate`, `vatAmount`, and `shippingAddress` are **snapshots** at sale time. They are never recomputed from the linked `Product` or `Customer`. If the chef raises the price next week, historical orders still show what was paid. The accountant requires this.

## Payment processor adapter

Out of schema scope but worth noting the shape:

```
src/payment/
  ├── adapter.ts           — interface: createCheckoutSession(order), handleWebhook(req)
  ├── stripe-adapter.ts    — concrete impl (when picked)
  └── tpay-adapter.ts      — concrete impl (when picked)
```

Webhook routes live at `/app/api/payment/webhook/[provider]/route.ts`. Each adapter signature-verifies its provider, finds the Order by `paymentRef`, mutates `paymentStatus`. The Payload `afterChange` hook does the rest (email, token generation, fulfillment).

## Open questions / future work

1. **Payment processor choice** — Stripe vs Tpay/Przelewy24. Decided later; out of this spec.
2. **Email provider** — Resend vs nodemailer SMTP. Decided later.
3. **VAT registration status** — chef confirms with accountant. Default `0` until then.
4. **Shipping cost calculation** — do we ship a flat rate, or weight-based via courier APIs? Out of scope here; affects checkout but not Order schema (just adds a `shippingCostGross` field on Order when ready).
5. **Invoice PDFs** — accountant export only for now. Generation later.
6. **Sales dashboard** — separate brainstorm after first ~20 sales.
7. **Product variants** — if she ever does signed copies, gift wrap, etc., that'd be variants. For now, a third Product row is enough.

## Implementation order (preview, not a plan)

1. `Customers` collection + access control.
2. `Products` collection + admin conditional fields + seed data for the cookbook.
3. `Orders` collection + admin conditional fields + order number hook.
4. Customer upsert hook on Order create.
5. Snapshot hook (price, vat, shipping address).
6. Digital fulfillment hook (token gen, status flip).
7. Download route handler + Vercel Blob signed-URL helper.
8. Physical shipped-status hook.
9. Email templates + transport (Resend or nodemailer).
10. Payment adapter interface + first concrete adapter (chosen later).
11. Webhook route + signature verification.

A detailed implementation plan with milestones is the next deliverable, via the writing-plans skill.
