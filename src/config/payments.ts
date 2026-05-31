/* Payment & checkout tunables — single source of truth for P24 timing, the
   register-time method/expiry knobs, and how the processing page polls. Plain,
   client-safe values (no node imports) so both the server-side P24 client
   (src/lib/payments/p24.ts) and the client processing page read the same numbers. */

// How long we wait for a payment before a P24 `noPayment (0)` status is concluded
// a failure. Instant methods (card, BLIK, pay-by-link transfer) settle within
// minutes; 15 min = P24's own default transaction validity, covering the slowest
// legit completion (a buyer dawdling in their bank login). Recoverable anyway: a
// late success webhook still flips `failed → paid` + fulfils. Safe because
// P24_CHANNEL excludes the deferred methods (traditional transfer, instalments)
// that could land days later — if those are re-enabled, raise this to match.
const P24_PAYABLE_WINDOW_MINUTES = 15;
export const P24_PAYABLE_WINDOW_MS = P24_PAYABLE_WINDOW_MINUTES * 60 * 1000;

// P24's register `timeLimit` (minutes the buyer has to pay) is capped at 0–99.
// Bound to the payable window so P24 expires the transaction exactly when we'd
// conclude failure — deterministic, independent of the account's panel default.
// Clamped to P24's max; if the window is ever raised past 99, stop sending it.
const P24_MAX_TIME_LIMIT_MINUTES = 99;
export const P24_REGISTER_TIME_LIMIT = Math.min(
  P24_PAYABLE_WINDOW_MINUTES,
  P24_MAX_TIME_LIMIT_MINUTES,
);

// Payment-method whitelist — P24's `channel` is a bitmask of the method
// categories to SHOW; anything omitted is hidden. Instant methods only (card +
// ApplePay/GooglePay, online pay-by-link transfer, BLIK), so the payable window
// can't false-fail a slow payment. Excludes traditional transfer (4) and
// instalments (128), which can land days later. Add 256 (wallets) if wanted.
const P24_CHANNEL_CARD = 1;
const P24_CHANNEL_ONLINE_TRANSFER = 2;
const P24_CHANNEL_BLIK = 8192;
export const P24_CHANNEL =
  P24_CHANNEL_CARD | P24_CHANNEL_ONLINE_TRANSFER | P24_CHANNEL_BLIK; // = 8195

// Processing page (/checkout/processing) polling: how often it re-checks a
// pending order, and how many initial polls only wait on the success webhook
// before we start PULLing P24. Total poll time is bounded by the payable window.
export const CHECKOUT_POLL_INTERVAL_MS = 15_000;
export const CHECKOUT_GRACE_POLLS = 2;
