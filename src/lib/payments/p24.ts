// Thin Przelewy24 (P24) REST client — register, verify, status PULL, and
// notification-sign checking. No SDK; we hit the documented v1 contract directly.
//
// P24 credentials come from ENV (src/config/env.ts), so a missing one fails fast
// at boot, not mid-checkout; only the optional P24_SANDBOX toggle is a direct
// process.env read below. Tunables (payable window, timeLimit, channel) live in
// src/config/payments.ts; contract shapes in ./types.
//
// Contract reference (sandbox): https://developers.przelewy24.pl
//   register: POST /api/v1/transaction/register
//             sign = sha384(JSON {sessionId, merchantId, amount, currency, crc})
//   verify:   PUT  /api/v1/transaction/verify
//             sign = sha384(JSON {sessionId, orderId, amount, currency, crc})
//   notify:   P24 POSTs to urlStatus (successful payments only), then retries
//             sign = sha384(JSON {merchantId, posId, sessionId, amount,
//                                 originAmount, currency, orderId, methodId,
//                                 statement, crc})
// Auth: HTTP Basic, username = posId, password = API key. Amounts: integer grosze.

import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { ENV } from "@/config/env";
import { P24_REGISTER_TIME_LIMIT, P24_CHANNEL } from "@/config/payments";
import type {
  RegisterTransactionInputT,
  RegisterTransactionResultT,
  VerifyTransactionInputT,
  P24TransactionT,
} from "@/types/payments";

const SANDBOX_HOST = "https://sandbox.przelewy24.pl";
const PRODUCTION_HOST = "https://secure.przelewy24.pl";
const DEFAULT_CURRENCY = "PLN";

type P24ConfigT = {
  readonly merchantId: number;
  readonly posId: number;
  readonly crc: string;
  readonly apiKey: string;
  readonly host: string;
};

function getP24Config(): P24ConfigT {
  // Credentials are validated at boot via ENV (src/config/env.ts); a missing
  // one throws there, so by here they are guaranteed present. P24_SANDBOX is an
  // optional toggle — absent means production — so it stays a direct read.
  const host =
    process.env.P24_SANDBOX === "true" ? SANDBOX_HOST : PRODUCTION_HOST;

  return {
    merchantId: Number(ENV.P24_MERCHANT_ID),
    posId: Number(ENV.P24_POS_ID),
    crc: ENV.P24_CRC,
    apiKey: ENV.P24_API_KEY,
    host,
  };
}

// SHA-384 over the JSON of the given fields. Node's JSON.stringify already
// emits unescaped slashes and unicode, matching P24's JSON_UNESCAPED_* rule.
function sign(fields: Record<string, string | number>): string {
  return createHash("sha384").update(JSON.stringify(fields)).digest("hex");
}

function authHeader(config: P24ConfigT): string {
  const credentials = Buffer.from(`${config.posId}:${config.apiKey}`).toString(
    "base64",
  );
  return `Basic ${credentials}`;
}

async function p24Request(
  config: P24ConfigT,
  method: "POST" | "PUT",
  path: string,
  body: Record<string, unknown>,
): Promise<Response> {
  // [P24-TRACE] temporary: time every register/verify call to P24 — no fetch
  // timeout is set, so a hang here would strand the buyer on /checkout/processing.
  const traceStart = Date.now();
  console.log(
    `[P24-TRACE] → ${method} ${path} sessionId=${String(body.sessionId)}`,
  );
  const response = await fetch(`${config.host}/api/v1${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(config),
    },
    body: JSON.stringify(body),
  });
  console.log(
    `[P24-TRACE] ← ${method} ${path} sessionId=${String(body.sessionId)} ` +
      `status=${response.status} ${Date.now() - traceStart}ms`,
  );
  return response;
}

// P24's POST /transaction/register returns the token we redirect the buyer
// with. A missing/empty token (or a non-JSON body) means registration didn't
// take — fail loudly so the caller never builds a broken paywall URL.
const p24RegisterResponseSchema = z.object({
  data: z.object({
    token: z.string().min(1),
  }),
});

export async function registerTransaction(
  input: RegisterTransactionInputT,
): Promise<RegisterTransactionResultT> {
  const config = getP24Config();
  const currency = DEFAULT_CURRENCY;

  const signature = sign({
    sessionId: input.sessionId,
    merchantId: config.merchantId,
    amount: input.amountGrosze,
    currency,
    crc: config.crc,
  });

  const response = await p24Request(config, "POST", "/transaction/register", {
    merchantId: config.merchantId,
    posId: config.posId,
    sessionId: input.sessionId,
    amount: input.amountGrosze,
    currency,
    description: input.description,
    email: input.email,
    country: "PL",
    language: "pl",
    urlReturn: input.urlReturn,
    urlStatus: input.urlStatus,
    // Bound to the payable window so P24's expiry matches when we conclude
    // failure (not in the `sign` — only the 5 documented fields are signed).
    timeLimit: P24_REGISTER_TIME_LIMIT,
    // Restrict to instant methods (also not signed). See P24_CHANNEL.
    channel: P24_CHANNEL,
    sign: signature,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`P24 register failed (${response.status}): ${detail}`);
  }

  const parsed = p24RegisterResponseSchema.safeParse(
    await response.json().catch(() => null),
  );
  if (!parsed.success) {
    throw new Error("P24 register returned no token");
  }

  const { token } = parsed.data.data;
  return { token, redirectUrl: `${config.host}/trnRequest/${token}` };
}

// Confirms the payment with P24. Returns true only on a 200. The transaction
// is NOT settled to the merchant until this succeeds — never mark an order
// paid on the notification alone.
export async function verifyTransaction(
  input: VerifyTransactionInputT,
): Promise<boolean> {
  const config = getP24Config();
  const currency = DEFAULT_CURRENCY;

  const signature = sign({
    sessionId: input.sessionId,
    orderId: input.orderId,
    amount: input.amountGrosze,
    currency,
    crc: config.crc,
  });

  const response = await p24Request(config, "PUT", "/transaction/verify", {
    merchantId: config.merchantId,
    posId: config.posId,
    sessionId: input.sessionId,
    amount: input.amountGrosze,
    currency,
    orderId: input.orderId,
    sign: signature,
  });

  return response.ok;
}

// Shape we require from P24's GET /transaction/by/sessionId/{id}. orderId and
// status are mandatory — we can't act without them — so a payload missing
// either (or a non-JSON/empty body) fails safeParse and is treated as "no
// transaction". sessionId/amount are optional and fall back below.
const p24SessionLookupSchema = z.object({
  data: z.object({
    sessionId: z.string().optional(),
    orderId: z.number(),
    amount: z.number().optional(),
    status: z.number(),
  }),
});

// PULLs the authoritative transaction state from P24 by our sessionId
// (= orderNumber). Because P24 never webhooks a failed/cancelled payment, the
// order otherwise sits silently `pending`; this is how we learn the real
// outcome. Returns null when P24 has no transaction for the sessionId yet (404)
// — e.g. the buyer bounced before paying.
export async function findTransactionBySessionId(
  sessionId: string,
): Promise<P24TransactionT | null> {
  const config = getP24Config();

  // [P24-TRACE] temporary: time + outcome of the status PULL (the failure/late-
  // success detector). No fetch timeout here either — a hang strands the poll.
  const traceStart = Date.now();
  console.log(`[P24-TRACE] → GET by/sessionId sessionId=${sessionId}`);
  const response = await fetch(
    `${config.host}/api/v1/transaction/by/sessionId/${encodeURIComponent(sessionId)}`,
    { headers: { Authorization: authHeader(config) } },
  );
  console.log(
    `[P24-TRACE] ← GET by/sessionId sessionId=${sessionId} ` +
      `status=${response.status} ${Date.now() - traceStart}ms`,
  );
  if (!response.ok) return null;

  const parsed = p24SessionLookupSchema.safeParse(
    await response.json().catch(() => null),
  );
  if (!parsed.success) {
    console.log(
      `[P24-TRACE] by/sessionId sessionId=${sessionId} unparseable/missing fields → null`,
    );
    return null;
  }
  const { data } = parsed.data;
  console.log(
    `[P24-TRACE] by/sessionId sessionId=${sessionId} P24 status=${data.status} amount=${data.amount}`,
  );

  return {
    sessionId: data.sessionId ?? sessionId,
    orderId: data.orderId,
    amount: data.amount ?? 0,
    status: data.status,
  };
}

// P24's urlStatus webhook payload (successful payments only). Parsed at the
// route boundary; isValidNotificationSign then recomputes the checksum over it.
export const p24NotificationSchema = z.object({
  merchantId: z.number(),
  posId: z.number(),
  sessionId: z.string(),
  amount: z.number(),
  originAmount: z.number(),
  currency: z.string(),
  orderId: z.number(),
  methodId: z.number(),
  statement: z.string(),
  sign: z.string(),
});

type P24NotificationT = z.infer<typeof p24NotificationSchema>;

// Recomputes the notification checksum and timing-safe compares it to the
// `sign` P24 sent. Guards the public webhook against spoofed payloads.
export function isValidNotificationSign(
  notification: P24NotificationT,
): boolean {
  const config = getP24Config();

  const expected = sign({
    merchantId: notification.merchantId,
    posId: notification.posId,
    sessionId: notification.sessionId,
    amount: notification.amount,
    originAmount: notification.originAmount,
    currency: notification.currency,
    orderId: notification.orderId,
    methodId: notification.methodId,
    statement: notification.statement,
    crc: config.crc,
  });

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(notification.sign);
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}
