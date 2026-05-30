# Przelewy24 (P24) Integration

Everything needed to run, test, and go live with P24 payments — including the
gotchas we hit so nobody has to guess again.

> **TL;DR of the pain we already paid for:**
> 1. The REST API password is the **`Klucz do raportów`** (reports key) — _not_
>    `Klucz do zamówień`, _not_ the CRC key. P24's naming is misleading.
> 2. A `401 "Incorrect authentication"` is almost always the **IP whitelist**,
>    not a bad key. Set the `adres IP` field to `%` in the panel.
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
      return { redirectUrl }              …/trnRequest/{token}
  → browser: window.location = redirectUrl
  → buyer pays on the P24 paywall
  → P24 POSTs to urlStatus  ── server→server, SUCCESS payments only, retried ──┐
        /api/p24/webhook                                                       │
          validate sign → verifyTransaction() → order.paymentStatus = "paid"   │
                                          ↓                                    │
                          digitalFulfillment hook (UNCHANGED)                  │
                          → download token + email                            ◄┘
  → buyer redirected to urlReturn = /checkout/processing
        if order already paid + has token → server redirect to /download/{token}
        else (browser beat the webhook) → poll (router.refresh every 3s),
             redirect to /download/{token} once the webhook lands
```

**Key rule:** never mark an order paid on the notification alone. The money is
not settled to us until `transaction/verify` succeeds.

**The return race:** P24's `urlReturn` (browser) and `urlStatus` (webhook) fire
near-simultaneously and the browser often wins, landing on a still-`pending`
page. `processing-status.tsx` polls via `router.refresh()` (3s interval, ~2 min
cap) so the page resolves to the download view on its own once the webhook
completes. The download email is the fallback if the poll cap is hit.

### Files

| File | Role |
| --- | --- |
| `src/lib/payments/p24.ts` | REST client: `registerTransaction`, `verifyTransaction`, `isValidNotificationSign`, `plnToGrosze`. Config read + validated lazily (never at boot). |
| `src/lib/orders/create-order.ts` | Registers the transaction, returns `redirectUrl`. |
| `src/components/sections/cart/cart-form.tsx` | `window.location.href = redirectUrl` on success. |
| `src/app/api/p24/webhook/route.ts` | `urlStatus` handler: sign-check → amount guard → idempotency → verify → flip to paid. |
| `src/collections/orders/hooks/digital-fulfillment.ts` | Existing hook. Fires on `pending→paid`, issues token + download email. **Untouched by P24.** |
| `src/app/api/dev/mark-paid/route.ts` | Dev-only simulator (gated by `NODE_ENV`/`VERCEL_ENV`) to flip orders paid without P24. |

---

## 2. The REST contract (verified against the OpenAPI spec)

Source: <https://developers.przelewy24.pl> · spec YAML:
`https://developers.przelewy24.pl/yaml/en_documentation_1.0.yaml`

**Hosts**

| Env | Base URL |
| --- | --- |
| Sandbox | `https://sandbox.przelewy24.pl` |
| Production | `https://secure.przelewy24.pl` |

REST base path is `/api/v1`. Buyer redirect is `{host}/trnRequest/{token}`.

**Auth:** HTTP Basic — `username = POS ID`, `password = API key (Klucz do raportów)`.

**Amounts:** integer **grosze** (1.23 PLN → `123`). Use `plnToGrosze()`.

**Endpoints & signatures** — every `sign` is `SHA-384(JSON.stringify(fields))`.
Node's `JSON.stringify` already emits unescaped slashes/unicode, matching P24's
`JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES` requirement.

| Action | Method / Path | `sign` fields (in order) |
| --- | --- | --- |
| Test credentials | `GET /api/v1/testAccess` | _(none — Basic auth only)_ |
| Register | `POST /api/v1/transaction/register` | `sessionId, merchantId, amount, currency, crc` |
| Verify | `PUT /api/v1/transaction/verify` | `sessionId, orderId, amount, currency, crc` |
| Notification (incoming) | P24 `POST`s to your `urlStatus` | `merchantId, posId, sessionId, amount, originAmount, currency, orderId, methodId, statement, crc` |

`sessionId` = our `orderNumber` (so the webhook can match the notification back
to the order). `register` returns `{ data: { token } }`.

### Webhook behaviour (important)

- P24 sends the notification **only for successful payments**. No notification
  for failed/abandoned ones — those orders just stay `pending`.
- P24 **retries** the notification at **3, 5, 15, 30, 60, 150, 450 min** until
  our endpoint verifies the transaction. So the handler must:
  - return **non-2xx on any failure** (so P24 retries),
  - be **idempotent** — a repeat hit on an already-paid order returns `200`
    without re-verifying.

---

## 3. Credentials — what each key actually is

P24's panel exposes three keys plus an account ID. The mapping is **not** what
the names suggest — copy this exactly:

| Env var | Paste this from the panel | Panel label you actually see | Used for |
| --- | --- | --- | --- |
| `P24_MERCHANT_ID` | the account number | **`Dane konta`** (e.g. `397149`) | Basic-auth **username**. |
| `P24_POS_ID` | the **same** account number | **`Dane konta`** (e.g. `397149`) | Same value — single-shop accounts have no separate POS ID. |
| `P24_CRC` | `Klucz do CRC` | `Klucz do CRC` | Computing the `sign` checksum. **Signing only.** |
| `P24_API_KEY` | `Klucz do raportów` | `Klucz do raportów` | Basic-auth **password** for the REST API. ⚠️ Counterintuitive but verified correct. |
| _(unused)_ | — | `Klucz do zamówień` | **Not used** for REST. Legacy transaction API. Ignore it. |

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
```

`SITE_URL` (already a required boot var) builds `urlReturn` and `urlStatus`:
- `urlReturn`  = `${SITE_URL}/checkout/processing`
- `urlStatus`  = `${SITE_URL}/api/p24/webhook`

The P24 vars are **not** in `src/config/env.ts` on purpose — they're validated
lazily inside `p24.ts`, so an unset var fails only the payment path, never the
whole site boot.

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

Without a tunnel you can still test the first half (register + redirect to the
paywall). To simulate the paid state locally, use the dev endpoint:

```bash
curl -X POST http://localhost:3000/api/dev/mark-paid \
  -H 'content-type: application/json' \
  -d '{"orderNumber":"0001-2026"}'
```

---

## 7. Going live (sandbox → production)

This is the cutover checklist. Do it deliberately — it mixes infra and a product
decision.

1. **Get production credentials.** Log in to the **production** panel
   (`przelewy24.pl` / `panel.przelewy24.pl`, _not_ sandbox). Copy the production
   `ID sprzedawcy`, `Klucz do CRC`, and `Klucz do raportów`. They are different
   values from sandbox.
2. **Whitelist the IP** in the production panel's `adres IP` field. Vercel
   functions have **no static egress IP**, so `%` is the practical choice (key
   stays secret in env). Only pin specific IPs if you front the calls with a
   static-egress proxy.
3. **Set Vercel env vars** (Production scope):
   - `P24_MERCHANT_ID`, `P24_POS_ID`, `P24_CRC`, `P24_API_KEY` → production values
   - `P24_SANDBOX=false`
   - `SITE_URL=https://www.chaoskitchen.pl` (canonical — see `CLAUDE.md`)
4. **Remove the pre-launch stub.** In `src/lib/orders/create-order.ts`, delete
   the `sendInterestThanks(...)` call (it emails "thanks for your interest" while
   redirecting to a live paywall — contradictory). Decide whether to enable
   `sendOrderConfirmation` (currently commented out). The post-payment download
   email already fires from `digitalFulfillment`.
5. **Confirm the dev endpoint is gated.** `src/app/api/dev/mark-paid/route.ts`
   already 404s on production/preview via `NODE_ENV`/`VERCEL_ENV` — verify it
   stays that way.
6. **Smoke test** with one real low-value transaction: webhook lands → order
   flips `paid` → download email arrives → file downloads via the token.

---

## 8. Reference

- P24 REST docs: <https://developers.przelewy24.pl/>
- OpenAPI spec: `https://developers.przelewy24.pl/yaml/en_documentation_1.0.yaml`
- Where to find the API key (sandbox/prod):
  <https://www.przelewy24.pl/centrum-pomocy/wsparcie-techniczne-api/gdzie-znajde-klucz-do-api-dla-srodowiska-produkcyjnego-sandbox>
- "Klucz API nie działa, co zrobić?" (the IP-whitelist fix):
  <https://www.przelewy24.pl/centrum-pomocy/wsparcie-techniczne-api/klucz-api-nie-dziala-co-zrobic>
- How to set up the test environment:
  <https://www.przelewy24.pl/centrum-pomocy/wsparcie-techniczne-api/jak-zalozyc-srodowisko-testowe>
