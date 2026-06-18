// Test-only price override. Submitting the matching code in the cart drops the
// order total to a trivial amount so the live Przelewy24 flow can be exercised
// end-to-end with a real (but near-zero) charge. Validated SERVER-SIDE only
// (see createOrder) — the cart UI can never influence what is actually charged.
//
// The code lives in PRICE_OVERRIDE_CODE (env) rather than source so the bypass
// isn't committed. It's optional — read directly here, NOT via ENV.required(),
// because the app must boot fine when it's unset (the P24_SANDBOX precedent).
// When unset, the override is simply disabled.

// PLN. Not a secret, so it stays a const. Keeping it above P24's per-transaction
// floor is the operator's concern.
export const PRICE_OVERRIDE_GROSS = 0.1;

export function isPriceOverrideCode(input: string | undefined): boolean {
  const code = process.env.PRICE_OVERRIDE_CODE;
  return Boolean(code) && input === code;
}
