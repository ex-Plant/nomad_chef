/**
 * One-shot signed cookie that ties an anonymous checkout to an order id.
 * Value shape: `<base64url(json)>.<hmac-sha256(base64url)>`. The HMAC key is
 * PAYLOAD_SECRET — anyone reading the cookie can decode the payload but
 * cannot forge a different one.
 */

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { ENV } from "@/config/env";

const COOKIE_NAME = "chef_checkout";
const COOKIE_MAX_AGE_SECONDS = 60 * 60;

const checkoutPayloadSchema = z.object({
  orderId: z.number(),
  exp: z.number(),
});

type PayloadT = z.infer<typeof checkoutPayloadSchema>;

function sign(payload: string): string {
  return createHmac("sha256", ENV.PAYLOAD_SECRET)
    .update(payload)
    .digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function setCheckoutCookie(orderId: number): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE_SECONDS;
  const payload: PayloadT = { orderId, exp };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const value = `${encoded}.${sign(encoded)}`;

  const store = await cookies();
  store.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function readCheckoutCookie(): Promise<{
  orderId: number;
} | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  // base64url never contains a dot, so the last dot is always the signature separator.
  const dot = raw.lastIndexOf(".");
  if (dot < 1) return null;
  const encoded = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  if (!safeEqual(signature, sign(encoded))) return null;

  let json: unknown;
  try {
    json = JSON.parse(Buffer.from(encoded, "base64url").toString());
  } catch {
    return null;
  }

  const parsed = checkoutPayloadSchema.safeParse(json);
  if (!parsed.success) return null;
  if (parsed.data.exp * 1000 < Date.now()) return null;

  return { orderId: parsed.data.orderId };
}
