# Przelewy24 (P24) Integration

Everything needed to run, test, and go live with P24 payments — including the
gotchas we hit so nobody has to guess again.

> **TL;DR of the pain we already paid for:**
>
> 1. The REST API password is the **`Klucz do raportów`** (reports key) — _not_
>    `Klucz do zamówień`, _not_ the CRC key. P24's naming is misleading.
> 2. A `401 "Incorrect authentication"` is almost always the **IP whitelist**,
>    not a bad key. Set the `adres IP` field to `%` in the panel — **separately
>    for sandbox and production**. Production keeps 401-ing even with correct
>    live keys until `%` is set in the LIVE panel (`panel.przelewy24.pl`); P24
>    may also need to approve it. _(This was the exact prod cutover blocker on
>    2026-06-09 — sandbox was green, production 401'd, and setting `%` in the
>    live panel fixed it instantly.)_
> 3. Sandbox and production are **separate accounts** with separate logins and
>    separate keys. Production keys 401 against the sandbox host and vice versa.

---

## 1. How it works (architecture)

Fulfillment is event-driven off a single order state transition. P24's only job
is to flip an order from `pending` → `paid`; the existing `digitalFulfillment`
afterChange hook does everything downstream (download token + email).

```
cart submit
  → createOrder()                         [server action]
      persistCustomerAndOrder()           order = pending
      registerTransaction()               → P24 token
      redirect(redirectUrl)               303 → …/trnRequest/{token}
  → browser follows the server redirect to the P24 paywall
  → buyer pays on the P24 paywall
  → P24 POSTs to urlStatus  ── server→server, SUCCESS payments only, retried ──┐
        /api/p24/webhook                                                       │
          validate sign → verifyTransaction() → order.paymentStatus = "paid"   │
                                          ↓                                    │
                          digitalFulfillment hook (UNCHANGED)                  │
                          → download token + email                            ◄┘
  → buyer redirected to urlReturn = /checkout/processing
        if order already paid + has token → server redirect to /download/{token}
        else (browser beat the webhook) → poll (router.refresh every 15s),
             redirect to /download/{token} once the webhook lands
```

**Key rule:** never mark an order paid on the notification alone. The money is
not settled to us until `transaction/verify` succeeds.

**The return race:** P24's `urlReturn` (browser) and `urlStatus` (webhook) fire
near-simultaneously and the browser often wins, landing on a still-`pending`
page. `processing-status.tsx` polls (15s interval) for the whole payable window —
poll count derived from `P24_PAYABLE_WINDOW_MINUTES`, not a magic cap — so the
page resolves to the download view (or to a `failed` state, see below) on its own.
The download email is the fallback if the buyer closes the tab first.

**Failure detection (the PULL path):** P24 does **not** call `urlStatus` for a
failed, cancelled, or abandoned payment — and `urlReturn` fires for _every_
outcome with no status in the query string. So a failed payment lands on
`/checkout/processing` looking identical to a slow success. To tell them apart,
after a short grace window the page calls the `checkPaymentOutcome` server
action, which PULLs `transaction/by/sessionId` for the authoritative status
(see §2) and:

- status `2` (paid) → settles it (amount guard → `verify` → flip to paid),
  mirroring the webhook so the in-browser flow no longer depends on webhook
  delivery;
- status `0` (no payment) → **ambiguous, not treated as failure on its own.** A
  declined/cancelled card and a traditional bank transfer ("przelew tradycyjny")
  that simply hasn't landed yet both read `0`, and the status API can't separate
  them. The order is only marked `failed` once the **payable window has elapsed**
  (`P24_PAYABLE_WINDOW_MINUTES`, default **15 min**, measured from
  `order.createdAt`) — the point past which the transaction can no longer be
  paid. Before that it stays `pending`. The processing page polls every 15s for
  the **full window** (poll count derived from `P24_PAYABLE_WINDOW_MINUTES`), so
  if the buyer keeps the tab open a real card failure flips to `failed`
  in-browser right when the window elapses (~15 min); otherwise a later PULL or a
  late success webhook reconciles it afterwards.

The 15-min window assumes only **instant** methods are offered (card, BLIK,
pay-by-link transfer — all settle within minutes). We make that deterministic at
register time (see §2): `registerTransaction` sends `timeLimit = min(15, 99)`, so
P24 expires the transaction exactly when we'd conclude failure — no reliance on
the account's panel default. `P24_PAYABLE_WINDOW_MINUTES` **must be ≥ the real P24
transaction validity**; binding `timeLimit` to it keeps the two in lockstep.

**Deferred methods must stay off.** Traditional transfer (`przekaz tradycyjny`)
and instalments (`Raty`) can land hours/days later, so 15 min would false-fail
them. Disable them via the `channel` whitelist at register time (§2) — the P24
sandbox panel's per-method toggle has no effect on this account, so code is the
only reliable way.
If you ever re-enable one, raise `P24_PAYABLE_WINDOW_MINUTES` to match its real
validity (and note `timeLimit` maxes at 99 min, so it can't cover a multi-day
transfer — you'd stop sending `timeLimit` in that case).

Marking `failed` is **recoverable**: a later success notification still finds the
order not-`paid`, verifies, and flips it `failed → paid` (fulfilment runs then).

**Server-side reconciliation (the daily cron).** The PULL above only runs while
the buyer keeps `/checkout/processing` open. If they close the tab on a
failed/abandoned payment, nothing client-side ever fires — and since P24 never
webhooks a non-success, the order would sit `pending` forever.
`GET /api/cron/reconcile-payments` closes that gap: once a day it finds every
`pending` order older than the payable window and runs the **same** settle/fail
logic over each. The poll and the cron share one core — `reconcileOrderPayment`,
extracted from `checkPaymentOutcome` — so the two can never diverge. The cron also
rescues the rare paid-but-stuck order (a genuine success whose webhook never
settled _and_ whose buyer left before the poll could): it reads status `2`,
verifies, and fulfils. Scheduled in `vercel.json` (`0 3 * * *` — the Hobby plan's
once-a-day floor) and guarded by `CRON_SECRET` (read at the route, see §5; cron
jobs run on production deployments only).

### Files

| File                                                  | Role                                                                                                                                                                                                                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/lib/payments/p24.ts`                             | REST client: `registerTransaction`, `verifyTransaction`, `findTransactionBySessionId` (status PULL), `p24NotificationSchema`, `isValidNotificationSign`. P24 creds come from `ENV` (boot-validated); only `P24_SANDBOX` is a direct read.                          |
| `src/lib/payments/amount.ts`                          | `plnToGrosze()` — PLN → integer grosze.                                                                                                                                                                                                                            |
| `src/lib/orders/create-order.ts`                      | Registers the transaction, then `redirect()`s (303) to the P24 paywall; defers operator + interest emails via `after()`. Server-side redirect because a client `window.location` handoff raced the mutating action's auto-refresh and flashed WebKit's error page. |
| `src/lib/orders/check-payment-outcome.ts`             | Server action (processing-page poll): resolves the order from the signed checkout cookie, then delegates to `reconcileOrderPayment`.                                                                                                                               |
| `src/lib/orders/reconcile-order-payment.ts`           | Shared core: PULLs `transaction/by/sessionId` for one `pending` order and settles it (paid → `verify` → flip) or marks it `failed` past the window. Used by the poll **and** the cron.                                                                             |
| `src/app/api/cron/reconcile-payments/route.ts`        | Daily reconciliation cron (`vercel.json`): sweeps `pending` orders past the payable window, runs `reconcileOrderPayment` on each. `CRON_SECRET`-guarded.                                                                                                           |
| `src/components/sections/cart/cart-form.tsx`          | Calls `createOrder`; surfaces only its failure (success redirects server-side).                                                                                                                                                                                    |
| `src/app/api/p24/webhook/route.ts`                    | `urlStatus` handler: sign-check → amount guard → idempotency → verify → flip to paid.                                                                                                                                                                              |
| `src/collections/orders/hooks/digital-fulfillment.ts` | Existing hook. Fires on `pending→paid`, issues token + download email. **Untouched by P24.**                                                                                                                                                                       |

---

## 2. The REST contract (verified against the OpenAPI spec)

Source: <https://developers.przelewy24.pl> · spec YAML:
`https://developers.przelewy24.pl/yaml/en_documentation_1.0.yaml`

**Hosts**

| Env        | Base URL                        |
| ---------- | ------------------------------- |
| Sandbox    | `https://sandbox.przelewy24.pl` |
| Production | `https://secure.przelewy24.pl`  |

REST base path is `/api/v1`. Buyer redirect is `{host}/trnRequest/{token}`.

**Auth:** HTTP Basic — `username = POS ID`, `password = API key (Klucz do raportów)`.

**Amounts:** integer **grosze** (1.23 PLN → `123`). Use `plnToGrosze()`.

**Endpoints & signatures** — every `sign` is `SHA-384(JSON.stringify(fields))`.
Node's `JSON.stringify` already emits unescaped slashes/unicode, matching P24's
`JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES` requirement.

| Action                  | Method / Path                                      | `sign` fields (in order)                                                                          |
| ----------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Test credentials        | `GET /api/v1/testAccess`                           | _(none — Basic auth only)_                                                                        |
| Register                | `POST /api/v1/transaction/register`                | `sessionId, merchantId, amount, currency, crc`                                                    |
| Verify                  | `PUT /api/v1/transaction/verify`                   | `sessionId, orderId, amount, currency, crc`                                                       |
| Status (PULL)           | `GET /api/v1/transaction/by/sessionId/{sessionId}` | _(none — Basic auth only)_                                                                        |
| Notification (incoming) | P24 `POST`s to your `urlStatus`                    | `merchantId, posId, sessionId, amount, originAmount, currency, orderId, methodId, statement, crc` |

**Status (PULL) response** — `data.status` is an integer; this is how we read a
non-success outcome that the webhook never reports:

| `status` | Meaning                                                                        |
| -------- | ------------------------------------------------------------------------------ |
| `0`      | No payment — **ambiguous**: failed/cancelled card _or_ transfer not yet landed |
| `1`      | Advance (partial) payment                                                      |
| `2`      | Paid in full                                                                   |
| `3`      | Refunded                                                                       |

A `404`/non-200 means P24 has no transaction for that `sessionId` yet.

`sessionId` = our `orderNumber` (so the webhook can match the notification back
to the order). `register` returns `{ data: { token } }`.

### Limiting payment methods & the pay-window (`channel`, `timeLimit`, `method`)

These optional `register` params are **not** part of the `sign` (only the five
fields above are signed), so they can be added freely.

**Where this lives in code:** all tunables are exported from
`src/config/payments.ts` — the single source of truth. `registerTransaction` in
`src/lib/payments/p24.ts` (lines ~126–128) imports `P24_REGISTER_TIME_LIMIT` and
`P24_CHANNEL` and passes them on every register call. To change the restriction,
edit `payments.ts`; do **not** hard-code values in `p24.ts`.

- **`timeLimit`** — minutes the buyer has to pay, `0`–`99` (`0` = no limit).
  Exported as `P24_REGISTER_TIME_LIMIT = Math.min(P24_PAYABLE_WINDOW_MINUTES, 99)`
  so P24 expires the transaction exactly when our failure window elapses —
  independent of the panel default. _(Currently wired: 15 min.)_
- **`channel`** — a **bitmask whitelist** of method categories to show: sum the
  ones you want; anything omitted is hidden. It only narrows within what the
  account has enabled. **The P24 sandbox panel's per-method toggle has no effect
  on this account — code via `channel` is the only reliable way to restrict
  methods.** Exported as `P24_CHANNEL = 8195` (`1 + 2 + 8192` = card +
  online transfer + BLIK), excluding traditional transfer and instalments.
  _(Currently wired.)_

  | value | channel                                       | value   | channel                |
  | ----- | --------------------------------------------- | ------- | ---------------------- |
  | `1`   | card + ApplePay/GooglePay                     | `64`    | only pay-by-link       |
  | `2`   | online transfer (pay-by-link banks)           | `128`   | **instalments (Raty)** |
  | `4`   | **traditional transfer (przekaz tradycyjny)** | `256`   | wallets                |
  | `16`  | all methods                                   | `4096`  | card                   |
  | `32`  | pre-payment                                   | `8192`  | BLIK                   |
  |       |                                               | `16384` | all except BLIK        |

  To offer card + online transfer + BLIK and **exclude the deferred methods**
  (traditional transfer `4`, instalments `128`): `channel = 1 + 2 + 8192 = 8195`
  (add `256` for wallets → `8451`). Excluding those is exactly what makes the
  15-min failure window safe (§1). Test the resulting paywall once on sandbox —
  channel grouping can vary by account.

- **`method`** — a single method ID forces one method and skips the chooser.
  `GET /api/v1/payment/methods/{lang}` (Basic auth) lists the available IDs.

### Webhook behaviour (important)

- P24 sends the notification **only for successful payments**. No notification
  for failed/abandoned ones — the processing page PULLs `by/sessionId` to detect
  those (see "Failure detection" in §1).
- P24 **retries** the notification on a backoff until our endpoint acknowledges
  with a `200`. So the handler must:
  - return **non-2xx on any failure** (so P24 retries),
  - be **idempotent** — a repeat hit on an already-paid order returns `200`
    without re-verifying.

---

## 3. Credentials — what each key actually is

P24's panel exposes three keys plus an account ID. The mapping is **not** what
the names suggest — copy this exactly:

| Env var           | Paste this from the panel   | Panel label you actually see     | Used for                                                                            |
| ----------------- | --------------------------- | -------------------------------- | ----------------------------------------------------------------------------------- |
| `P24_MERCHANT_ID` | the account number          | **`Dane konta`** (e.g. `397149`) | Basic-auth **username**.                                                            |
| `P24_POS_ID`      | the **same** account number | **`Dane konta`** (e.g. `397149`) | Same value — single-shop accounts have no separate POS ID.                          |
| `P24_CRC`         | `Klucz do CRC`              | `Klucz do CRC`                   | Computing the `sign` checksum. **Signing only.**                                    |
| `P24_API_KEY`     | `Klucz do raportów`         | `Klucz do raportów`              | Basic-auth **password** for the REST API. ⚠️ Counterintuitive but verified correct. |
| _(unused)_        | —                           | `Klucz do zamówień`              | **Not used** for REST. Legacy transaction API. Ignore it.                           |

> ⚠️ There is **no field labelled "ID sprzedawcy"** on this account — P24 shows
> it as **`Dane konta`**. That number (`397149`) is both the merchant ID and the
> POS ID, and it's the Basic-auth username. Confirmed working via `testAccess`.
>
> ⚠️ The REST password is **`Klucz do raportów`**, _not_ `Klucz do zamówień`
> (despite "orders" sounding right) and _not_ the CRC key.

### Where to find them in the panel

`https://sandbox.przelewy24.pl/panel` → **Moje dane** → (select the account) →
section **"Dane API i konfiguracja"**.

That section also has the **`adres IP`** field — see the next point.

---

## 4. The IP whitelist — cause of nearly every `401`

The REST API rejects any request whose **source IP is not whitelisted** on the
account, returning `401 {"error":"Incorrect authentication"}`. An **empty IP
field rejects everything**, which reads like a bad key but isn't.

**Fix:** in **Moje dane → Dane API i konfiguracja → `adres IP`**, enter `%`
(wildcard = accept any IP), then **Zachowaj** (save). Allow a minute to
propagate.

`%` is the pragmatic choice because our callers (local curl, ngrok, Vercel
functions) don't have a single static IP. Security still holds: the API key
stays secret in env; the whitelist is defense-in-depth, not the only gate.

### `401` debugging order

1. **IP field = `%`?** (most common cause)
2. Using `Klucz do raportów` as the password — not CRC, not `zamówień`?
3. Right host for the account type? (sandbox keys → `sandbox.`; prod keys → `secure.`)
4. Right `ID sprzedawcy` as the username?
5. REST/API service actually enabled on the account?

Confirm with one command (paste the key locally, don't commit it):

```bash
curl -sS -u "397149:YOUR_KLUCZ_DO_RAPORTOW" \
  https://sandbox.przelewy24.pl/api/v1/testAccess -w "\nHTTP %{http_code}\n"
# success → {"data":true,"responseCode":0}  HTTP 200
```

---

## 5. Environment variables

```bash
# .env (local) — and mirror on Vercel
P24_MERCHANT_ID=397149      # panel: "Dane konta" (the account number)
P24_POS_ID=397149           # panel: "Dane konta" again (same value, no separate POS)
P24_CRC=                    # panel: "Klucz do CRC"        → signing only
P24_API_KEY=                # panel: "Klucz do raportów"   → REST Basic-auth password (NOT "zamówień")
P24_SANDBOX=true            # "true" → sandbox host; anything else → production
CRON_SECRET=                # guards the reconciliation cron; optional locally, REQUIRED on Vercel (prod)
```

`SITE_URL` (already a required boot var) builds `urlReturn` and `urlStatus`:

- `urlReturn` = `${SITE_URL}/checkout/processing`
- `urlStatus` = `${SITE_URL}/api/p24/webhook`

The four P24 credentials **are** in `src/config/env.ts` (the `required()` set), so
a missing one fails fast at boot — `next build`, the `payload` CLI, and the
running app all import `ENV`. Only `P24_SANDBOX` stays a direct `process.env` read
in `p24.ts` (an optional toggle, not a required var).

`CRON_SECRET` guards `GET /api/cron/reconcile-payments` (the reconciliation
sweep, §1). Unlike the P24 creds it's deliberately **not** in `env.ts`: it's read
directly at the route and only matters in production (the cron never runs
locally/preview), so a missing value never crashes boot — the route just
fail-closes (`401`) and logs. Set it on Vercel (`openssl rand -hex 32`); Vercel
sends it as `Authorization: Bearer <CRON_SECRET>`.

---

## 6. Local testing with ngrok

P24's webhook is a server→server call, so it **cannot reach `localhost`**. You
need a public tunnel.

```bash
# 1. App
npm run dev

# 2. Tunnel (separate terminal) — copy the https URL
ngrok http 3000

# 3. .env — point SITE_URL at the tunnel + fill the keys
SITE_URL=https://<your-id>.ngrok-free.dev
P24_CRC=<klucz do CRC>
P24_API_KEY=<klucz do raportów>
P24_SANDBOX=true

# 4. RESTART npm run dev   ← mandatory: ENV is read once at boot
```

Then submit a cart order → land on the P24 sandbox paywall → complete a test
payment. Watch the ngrok inspector at **`http://localhost:4040`** — you'll see
P24's `POST /api/p24/webhook` arrive and can **replay** it while debugging sign
validation.

**Gotchas**

- Restart `npm run dev` after _any_ `.env` change.
- Free ngrok URLs change every restart → re-edit `SITE_URL` and restart.
- The download email sends via the real SMTP (`mail.chaoskitchen.pl`) — use your
  own address as the buyer.
- No webhook POST in the inspector? → IP whitelist (`%`) or a panel
  "registered return addresses" restriction.

Without a tunnel you can still test the whole flow on the **sandbox** paywall:
pick a method (e.g. mBank) to reach the **"Wybierz czynność"** simulator, then
choose an outcome — **Zapłać** (success), **Błąd płatności**, **Brak wpłaty**,
**Nieprawidłowa kwota** — to drive the paid/failed branches without real money.
The PULL path (`checkPaymentOutcome`) settles `paid` and detects non-success even
when the webhook can't reach you; only the **Zapłać** outcome makes P24 POST
`urlStatus` (the others leave the order `pending` → reconciled per §1).

---

## 7. Going live (sandbox → production)

This is the cutover checklist. Do it deliberately — it mixes infra and a product
decision.

1. **Get production credentials.** Log in to the **production** panel
   (`przelewy24.pl` / `panel.przelewy24.pl`, _not_ sandbox). Copy the production
   `ID sprzedawcy`, `Klucz do CRC`, and `Klucz do raportów`. They are different
   values from sandbox.
2. **Whitelist the IP** in the production panel's `adres IP` field. This is a
   **separate setting from sandbox** and is the single most likely cause of a
   production `401 "Incorrect authentication"` even when the live keys are
   correct — production stays 401 until it's set. Vercel functions have **no
   static egress IP**, so set it to `%` (key stays secret in env); P24 pops a
   "confirm allow all IPs" dialog — accept it. `%` on production **may also need
   P24 to approve it** before it takes effect, so re-test after saving. Only pin
   specific IPs if you front the calls with a static-egress proxy.
3. **Set Vercel env vars** (Production scope):
   - `P24_MERCHANT_ID`, `P24_POS_ID`, `P24_CRC`, `P24_API_KEY` → production values
   - `P24_SANDBOX=false`
   - `SITE_URL=https://www.chaoskitchen.pl` (canonical — see `CLAUDE.md`)
   - `CRON_SECRET` → strong random value (`openssl rand -hex 32`); without it the
     reconciliation cron fail-closes and stuck `pending` orders won't self-heal
4. **Smoke test** with one real low-value transaction: webhook lands → order
   flips `paid` → download email arrives → file downloads via the token. The E2E
   suite under `tests/e2e/` already tools this — the deterministic specs
   (validation, order persistence, webhook, fulfilment, download gating) run in
   the default gate, and the live-paywall paths are tagged `@manual`:
   - `tests/e2e/payment-smoke.spec.ts` — drives the cart to the real P24 paywall;
     run it against an ngrok prod-build origin so the webhook round-trips:
     `E2E_ALL=1 E2E_BASE_URL=<ngrok> npx playwright test payment-smoke`. It
     automates up to the paywall; completing the payment (mBank → Zapłać) and
     confirming the `paid` flip + `/download/<token>` is the manual step.
   - `tests/e2e/cart-redirect.spec.ts` — `@manual` for the same reason (calls live
     P24 `register`; count-derived order numbers collide with the sandbox's
     session-id memory, see finding F4 in `docs/purchase-flow-test-findings.md`).
   - `tests/e2e/payment-flash.spec.ts` — **WebKit-only** regression for the buy→P24
     "page couldn't load" flash: asserts the handoff fires no WebKit "Load failed"
     error and no same-origin request is cancelled mid-redirect. `@manual` (calls
     live P24 `register`); the paywall navigation is intercepted with a local
     stand-in so the assertion is deterministic:
     `E2E_ALL=1 E2E_BASE_URL=<current-code origin> npx playwright test payment-flash`.

---

## 8. Reference

- Purchase-flow E2E coverage, findings, and the `@manual` run matrix:
  `docs/purchase-flow-test-findings.md`
- P24 REST docs: <https://developers.przelewy24.pl/>
- OpenAPI spec: `https://developers.przelewy24.pl/yaml/en_documentation_1.0.yaml`
- Where to find the API key (sandbox/prod):
  <https://www.przelewy24.pl/centrum-pomocy/wsparcie-techniczne-api/gdzie-znajde-klucz-do-api-dla-srodowiska-produkcyjnego-sandbox>
- "Klucz API nie działa, co zrobić?" (the IP-whitelist fix):
  <https://www.przelewy24.pl/centrum-pomocy/wsparcie-techniczne-api/klucz-api-nie-dziala-co-zrobic>
- How to set up the test environment:
  <https://www.przelewy24.pl/centrum-pomocy/wsparcie-techniczne-api/jak-zalozyc-srodowisko-testowe>
