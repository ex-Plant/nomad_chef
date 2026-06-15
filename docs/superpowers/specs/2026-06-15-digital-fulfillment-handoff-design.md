# Digital fulfillment & download handoff — design

**Date:** 2026-06-15
**Status:** approved (pending spec review)

## Problem

A successfully-paid buyer can get stranded on `/checkout/processing`
(`Płatność zaksięgowana`) instead of reaching their download. Root cause: the
processing page only redirects to `/download/{token}` when the order is **both**
`paid` **and** has a `downloadToken`, but the token is not set at the same instant
`paid` is.

The token is stamped by the `digitalFulfillment` afterChange hook, which currently
**awaits the download email first** (`sendDownloadEmail`, SMTP — seconds) and only
then persists the token. So between the `paid` DB write and the token write there is
a multi-second window where the order is `paid` with no token. If a render lands in
that window:

- `page.tsx` falls through (no token) → renders the `paid` screen.
- `processing-status.tsx` stops polling (`if (paymentStatus !== "pending") return`)
  and `check-payment-outcome.ts` returns `"paid"` as soon as the status flips —
  the poll `clearInterval`s and never refreshes again.

Result: the token arrives moments later, but nothing re-renders → permanent
dead-end on the paid screen.

Two partial-failure states must also be handled and retried:

- **A** — order `paid` but **no `downloadToken`** (token step never ran).
- **B** — order has a token but the **download email failed**
  (`downloadEmailStatus = failed`).

## Goals

1. A paid buyer lands on the download page, not the paid screen.
2. Token generation is decoupled from — and happens before — the email send.
3. Both partial states are recoverable: **A (paid, no token) is healed on-demand,
   inline — never by cron**; **B (token present, email failed) is retried by the
   daily cron** for buyers who left. The token-first hook makes A effectively
   unreachable except a hard mid-hook failure (see Concurrency).

## Non-goals (explicitly out of scope)

- The 404 / no-transaction permanent-`pending` gap in `reconcileOrderPayment`
  (an abandoned-paywall order never resolves to `failed`). Noted separately.
- Removing the temporary `[P24-TRACE]` logging.
- The 72h-vs-"24 godziny" copy mismatch (the offending expired body is removed here).

## Approach

Chosen: extract a single idempotent fulfillment core and call it from three sites
(hook, on-demand redirect, cron). Mirrors the existing extraction of
`reconcileOrderPayment` (shared by the poll and the cron).

Rejected:

- **Generate the token inside the webhook/reconcile paid-flip** (atomic, no gap) —
  duplicates token logic across webhook + reconcile + admin manual flips and breaks
  the single-chokepoint hook.
- **Reorder-only** (token before email, redirect on paid, no recovery) — does not
  satisfy goal 3 (handle + retry both partial states).

## Design

### New shared core — `fulfillDigitalOrder({ payload, order })`

Extracted from the `digitalFulfillment` hook into its own module
(`src/lib/orders/fulfill-digital-order.ts`). Idempotent and re-runnable so the
hook, the on-demand path, and the cron can all call it safely on the same order.

Steps:

1. **Guard** — only act on `paymentStatus === "paid"` + digital product. Otherwise
   no-op.
2. **Token first, write-once** — if `downloadToken` is missing, generate
   (`generateDownloadToken`) and persist it with a **set-if-null conditional
   update** (`where: id == order.id AND downloadToken not set`, `data:
{ downloadToken, downloadExpiresAt, paidAt? }`). Then **re-read the order** and
   take `downloadToken` from the DB — the canonical value, which may be ours or a
   concurrent writer's. Decoupled from the email. See "Concurrency" below.
3. **Email** — if `downloadEmailStatus !== "sent"`, send the download email using
   the canonical (read-back) token and record `sent` / `failed`
   (+ `fulfillmentStatus`, `fulfilledAt`, `downloadEmailSentAt`,
   `downloadEmailError`). A failed email never unsets the token.
4. **Return** the canonical token.

Recursion guard (`context.skipFulfillment`) is preserved for the self-update.

### `digitalFulfillment` hook

On the `pending → paid` transition (digital orders), delegates to
`fulfillDigitalOrder`. Same trigger as today; the difference is the token now lands
before the slow email.

### `ensureDownloadToken({ payload, order })`

A cheap, token-only helper (no email) used by the processing-page redirect: returns
the existing `downloadToken`, or generates + persists one (set-if-null + read-back,
see Concurrency) if missing. This **inline** path is what heals state **A** —
never the cron — guaranteeing the redirect always has a canonical token to target
for the buyer currently on the page. (Email for an on-demand-healed order is left to
the hook/cron — the buyer in front of us is redirected straight to the file and does
not need it.)

### Processing page — `src/app/(site)/checkout/processing/page.tsx`

Redirect on `paid` **for digital products**:

```
if (order.paymentStatus === "paid" && product.format === "digital") {
  const token = await ensureDownloadToken({ payload, order });
  redirect(`/download/${token}`);
}
```

`page.tsx` already loads the order at `depth: 1`, so the product format is read via
`asPopulated(order.product)` with no extra query. The `digital` guard is a safety
net only: **the store sells no physical products** — a non-digital paid order can't
occur in practice, so it harmlessly falls through to the `paid`-state screen (the
new redirect-fallback copy below) with no token minted and no redirect. (Without the
guard, `ensureDownloadToken` would wrongly issue a download token for a fileless
order.)

Because the server redirects on the same render that first sees `paid` (digital),
the paid screen is now only a brief fallback (slow/failed client navigation), and the
client poller stopping on `paid` is no longer a dead-end.

### Cron — `src/app/api/cron/reconcile-payments/route.ts`

Add a second sweep after the existing pending-reconciliation: find **paid digital**
orders with **`downloadEmailStatus !== "sent"`** and run `fulfillDigitalOrder` on
each. This retries **state B** (failed/unsent download email) for buyers who closed
the tab. It does **not** generate tokens — state A is healed inline on the
processing page only. (Should a token somehow be missing on a swept order,
`fulfillDigitalOrder`'s write-once step still issues one before emailing, but the
sweep is not selected on token-absence.) Same `CRON_SECRET` guard and per-run cap;
log the counts.

### Client poller — `processing-status.tsx`

No logic change required (the server redirect on `paid` removes the dead-end). Only
the `paid`-state copy changes (below).

### Download page — `download-card.tsx` / `page.tsx`

No structural change. `findOrderByDownloadToken` + `resolveDownloadState` already
degrade correctly: malformed/unknown token → `not_found`, unpaid → `not_paid`,
paid+past-TTL → `expired`, paid+valid → `ready`. Only the `expired` copy changes.

## Copy changes

### Processing page — `paid` state (fallback screen)

- Heading: unchanged — `Płatność zaksięgowana`.
- Body → `Za chwilę przekierujemy Cię na stronę pobierania. Jeśli to nie nastąpi,
sprawdź swój e-mail lub zgłoś problem poniżej.`
- Button label → `Mam problem z zamówieniem`.

### Download page — `expired` state only

- Remove the heading entirely (no success heading, no `Link wygasł`).
- Body → `Link nie jest już aktywny.`
- No `Pobierz ebook` button.
- Keep the contact block: `Coś nie tak z linkiem lub zamówieniem? Napisz do mnie.`
  - button `Mam problem z zamówieniem`.
- `not_found` and `not_paid` copy unchanged.

This makes the `expired` branch a bespoke layout rather than the generic
`STATUS_COPY` (title + body + button) block.

## Concurrency

P24's return race means the webhook (→ hook → `fulfillDigitalOrder`) and the
buyer's processing-page render (→ `ensureDownloadToken`) can run at the same time on
the same order, both observing `paid` with no token. A naive "generate if missing"
in two places double-writes: the buyer is redirected to the token one path wrote,
which the other path then overwrites → the buyer's URL 404s (`not_found`).

Resolution — **write-once token at the DB**. Every token persist (hook,
`ensureDownloadToken`) is a **set-if-null conditional update**
(`where: id == order.id AND downloadToken not set`), followed by a **re-read** of the
order; the caller returns/redirects to the stored `downloadToken`. Whoever writes
first wins; the loser's conditional update matches zero rows and is a no-op; both
converge on the single canonical token.

What actually serializes the writers is Payload's per-operation transaction: the
paid-flip `payload.update({ paymentStatus: "paid" })` and its `afterChange` hook run
in **one transaction that holds the order row lock** across the whole hook, so a
concurrent page/cron `ensureDownloadToken` blocks on that lock, then finds the token
already set (its `where` no-ops) and converges via the re-read. After any paid-flip
(webhook or PULL) the token is set in that same transaction — so there is no normal
"paid committed + token null" state for two inline heals to race over. The `req`
threading is what shares that transaction on the hook path; it must be kept. (A raw
set-if-null SQL UPDATE was considered and rejected: it would run outside the hook's
transaction and deadlock against the row lock it already holds.)

## Error handling & idempotency

- Email fails → token still persisted, order downloadable now; cron retries email
  (state B).
- Token step fails (hard mid-hook failure, rare) → the next paid render's
  `ensureDownloadToken` heals it inline. Not a cron responsibility.
- All callers (hook, on-demand, cron) are idempotent: the set-if-null token write is
  never a regeneration; a `sent` email is never re-sent.

## Affected files

| File                                                       | Change                                                           |
| ---------------------------------------------------------- | ---------------------------------------------------------------- |
| `src/lib/orders/fulfill-digital-order.ts`                  | **new** — shared fulfillment core + `ensureDownloadToken`        |
| `src/collections/orders/hooks/digital-fulfillment.ts`      | delegate to the core (token-first)                               |
| `src/app/(site)/checkout/processing/page.tsx`              | redirect on `paid`, via `ensureDownloadToken`                    |
| `src/app/(site)/checkout/processing/processing-status.tsx` | `paid`-state copy + button label                                 |
| `src/app/api/cron/reconcile-payments/route.ts`             | second sweep: retry failed/unsent download emails (state B) only |
| `src/app/(site)/download/[token]/download-card.tsx`        | bespoke `expired` copy/layout                                    |

## Testing

- Unit: `fulfillDigitalOrder` — paid+no-token issues token; failed email keeps token
  - records `failed`; second call is a no-op (idempotent); non-paid / non-digital
    no-op.
- Unit: `ensureDownloadToken` — returns existing token; generates when missing.
- Integration: processing page redirects on `paid` (token present and token-absent
  paths both redirect).
- Cron: paid+failed/unsent-email → resent; paid+sent → untouched. (Cron is not
  selected on token-absence.)
- Concurrency: two `fulfillDigitalOrder`/`ensureDownloadToken` calls racing on a
  paid, token-less order converge on one canonical token (set-if-null + read-back);
  the redirect target matches the stored token.
- Copy: `expired` card renders the new layout; `paid` processing state renders the
  new body + button.
