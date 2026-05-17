/**
 * Checkout session — a tiny signed-cookie session for the anonymous buyer.
 *
 * THE PROBLEM
 * When someone submits the cart, they are NOT logged in. Yet on the next
 * page (/checkout/processing) we need to know *which order* belongs to
 * this browser tab. We can't trust a query param or a localStorage value
 * because the client could swap in any number. We need a server-issued
 * proof.
 *
 * THE SOLUTION
 * After creating the order, we set an HttpOnly cookie that contains:
 *   - `orderId`: the row to look up later
 *   - `exp`: a unix timestamp at which this cookie is no longer valid
 *
 * The cookie value is `<base64url(json)>.<hmac-signature>`. Anyone reading
 * the cookie can see the JSON, but they can't *forge* a different one
 * because the HMAC is keyed with `PAYLOAD_SECRET` which never leaves the
 * server. On read we recompute the HMAC and compare with `timingSafeEqual`
 * to avoid timing-based signature guessing attacks.
 *
 * The cookie expires after 1 hour — the order will already be paid (or
 * abandoned) well before then.
 *
 * NOTE
 * This is NOT a general-purpose auth system. It's a one-shot "remember the
 * order id for ~1h" stamp. If you ever need real sessions, swap this for
 * Payload's auth or NextAuth.
 */

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { ENV } from "@/config/env";

const COOKIE_NAME = "chef_checkout";
// 1 hour — long enough for a customer to finish a payment, short enough
// that a stolen cookie can't be replayed days later.
const COOKIE_MAX_AGE_SECONDS = 60 * 60;

// The JSON payload we encode into the cookie. `exp` lets us reject a
// cookie even if the browser ignored our `maxAge` (defense in depth).
type PayloadT = { orderId: number; exp: number };

// HMAC-SHA256 over the encoded JSON. The secret key (`PAYLOAD_SECRET`)
// is only known to the server, so a client cannot produce a valid
// signature for a payload they invented.
function sign(payload: string): string {
  return createHmac("sha256", ENV.PAYLOAD_SECRET)
    .update(payload)
    .digest("base64url");
}

// Constant-time string compare. `===` would short-circuit on the first
// differing byte, leaking the matching-prefix length via timing.
// `timingSafeEqual` always compares all bytes.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  // `timingSafeEqual` throws on length mismatch, so we check that first.
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * Called from `createOrder()` right after the order row is written.
 * Stamps the cookie so the next page can identify this browser.
 */
export async function setCheckoutCookie(orderId: number): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE_SECONDS;
  const payload: PayloadT = { orderId, exp };

  // base64url so the value is URL/cookie-safe (no `+ / =`).
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(encoded);
  // Final shape: "<encoded>.<signature>". A dot is fine because base64url
  // never contains one, so we can split on the LAST dot to recover both parts.
  const value = `${encoded}.${signature}`;

  // Next 15+: `cookies()` is async in Server Actions and Route Handlers.
  const store = await cookies();
  store.set(COOKIE_NAME, value, {
    // httpOnly: JavaScript on the page cannot read this cookie via
    // document.cookie — only the server sees it. Mitigates XSS.
    httpOnly: true,
    // Use HTTPS-only cookies in production. In `next dev` (http://localhost)
    // we set this to false so the cookie is actually stored.
    secure: process.env.NODE_ENV === "production",
    // "lax" sends the cookie on top-level GET navigations (good for the
    // processing page) but not on cross-site POSTs (CSRF defense).
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

/**
 * Called from any server file that needs to know "which order is this
 * anonymous browser working on?" Returns null if no cookie, tampered
 * cookie, or expired cookie.
 */
export async function readCheckoutCookie(): Promise<{ orderId: number } | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  // Split off the signature. Using `lastIndexOf(".")` is safe because
  // base64url never contains a dot, so the only dot is the one we put in.
  const dot = raw.lastIndexOf(".");
  if (dot < 1) return null;
  const encoded = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);

  // If the client tampered with `encoded` the recomputed HMAC won't match.
  // Timing-safe compare to avoid leaking info about partial matches.
  if (!safeEqual(signature, sign(encoded))) return null;

  // JSON might be malformed if someone hand-edited the cookie. Catch
  // and reject rather than 500.
  let parsed: PayloadT;
  try {
    parsed = JSON.parse(Buffer.from(encoded, "base64url").toString());
  } catch {
    return null;
  }

  // Belt-and-suspenders: validate shape AND validate the embedded
  // expiration (don't rely solely on browser maxAge).
  if (typeof parsed.orderId !== "number" || typeof parsed.exp !== "number") {
    return null;
  }
  if (parsed.exp * 1000 < Date.now()) return null;

  return { orderId: parsed.orderId };
}

/**
 * Currently unused but kept for completeness — call this after the order
 * is paid + downloaded if you want to invalidate the checkout session
 * proactively.
 */
export async function clearCheckoutCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
