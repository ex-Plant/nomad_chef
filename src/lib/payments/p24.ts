// Thin Przelewy24 (P24) REST client — register, verify, and notification-sign
// checking. No SDK; we hit the documented v1 contract directly.
//
// Config is read + validated lazily (not at boot) so an unset P24 var only
// fails the payment path, never the whole site. See src/config/env.ts for the
// boot-required vars and the rationale for keeping feature vars out of it.
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

const SANDBOX_HOST = "https://sandbox.przelewy24.pl";
const PRODUCTION_HOST = "https://secure.przelewy24.pl";
const DEFAULT_CURRENCY = "PLN";
const DEFAULT_COUNTRY = "PL";
const DEFAULT_LANGUAGE = "pl";

type P24ConfigT = {
  readonly merchantId: number;
  readonly posId: number;
  readonly crc: string;
  readonly apiKey: string;
  readonly host: string;
};

type RegisterTransactionInputT = {
  sessionId: string;
  amountGrosze: number;
  description: string;
  email: string;
  urlReturn: string;
  urlStatus: string;
  currency?: string;
  country?: string;
  language?: string;
};

type RegisterTransactionResultT = {
  token: string;
  redirectUrl: string;
};

type VerifyTransactionInputT = {
  sessionId: string;
  orderId: number;
  amountGrosze: number;
  currency?: string;
};

// Fields P24 POSTs to the urlStatus webhook for a successful payment.
export type P24NotificationT = {
  merchantId: number;
  posId: number;
  sessionId: string;
  amount: number;
  originAmount: number;
  currency: string;
  orderId: number;
  methodId: number;
  statement: string;
  sign: string;
};

export function plnToGrosze(pln: number): number {
  return Math.round(pln * 100);
}

function getP24Config(): P24ConfigT {
  const merchantId = process.env.P24_MERCHANT_ID;
  const posId = process.env.P24_POS_ID;
  const crc = process.env.P24_CRC;
  const apiKey = process.env.P24_API_KEY;

  const missing = (
    [
      ["P24_MERCHANT_ID", merchantId],
      ["P24_POS_ID", posId],
      ["P24_CRC", crc],
      ["P24_API_KEY", apiKey],
    ] as const
  )
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required P24 env vars: ${missing.join(", ")}`);
  }

  const host =
    process.env.P24_SANDBOX === "true" ? SANDBOX_HOST : PRODUCTION_HOST;

  return {
    merchantId: Number(merchantId),
    posId: Number(posId),
    crc: crc as string,
    apiKey: apiKey as string,
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
  const response = await fetch(`${config.host}/api/v1${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(config),
    },
    body: JSON.stringify(body),
  });
  return response;
}

export async function registerTransaction(
  input: RegisterTransactionInputT,
): Promise<RegisterTransactionResultT> {
  const config = getP24Config();
  const currency = input.currency ?? DEFAULT_CURRENCY;

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
    country: input.country ?? DEFAULT_COUNTRY,
    language: input.language ?? DEFAULT_LANGUAGE,
    urlReturn: input.urlReturn,
    urlStatus: input.urlStatus,
    sign: signature,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`P24 register failed (${response.status}): ${detail}`);
  }

  const json = (await response.json()) as { data?: { token?: string } };
  const token = json.data?.token;
  if (!token) {
    throw new Error("P24 register returned no token");
  }

  return { token, redirectUrl: `${config.host}/trnRequest/${token}` };
}

// Confirms the payment with P24. Returns true only on a 200. The transaction
// is NOT settled to the merchant until this succeeds — never mark an order
// paid on the notification alone.
export async function verifyTransaction(
  input: VerifyTransactionInputT,
): Promise<boolean> {
  const config = getP24Config();
  const currency = input.currency ?? DEFAULT_CURRENCY;

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
