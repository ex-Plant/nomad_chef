// Centralized runtime env vars. Import from here instead of reading
// `process.env` directly so missing vars fail fast at startup.
//
// Only declare vars the app NEEDS to boot. Script-only vars (seeding) are
// read directly where they're used, so production deploys don't crash on
// unused requirements.

type EnvKeyT =
  | "DB_POSTGRES_URL"
  | "PAYLOAD_SECRET"
  | "BLOB_READ_WRITE_TOKEN"
  | "EMAIL_HOST"
  | "EMAIL_USER"
  | "EMAIL_PASS"
  | "EMAIL_TO"
  | "CRON_SECRET"
  | "SITE_URL"
  | "P24_MERCHANT_ID"
  | "P24_POS_ID"
  | "P24_CRC"
  | "P24_API_KEY";

function required(key: EnvKeyT): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const ENV = {
  DB_POSTGRES_URL: required("DB_POSTGRES_URL"),
  PAYLOAD_SECRET: required("PAYLOAD_SECRET"),
  BLOB_READ_WRITE_TOKEN: required("BLOB_READ_WRITE_TOKEN"),

  EMAIL_HOST: required("EMAIL_HOST"),
  EMAIL_USER: required("EMAIL_USER"),
  EMAIL_PASS: required("EMAIL_PASS"),
  EMAIL_TO: required("EMAIL_TO"),
  CRON_SECRET: required("CRON_SECRET"),

  SITE_URL: required("SITE_URL"),

  // Przelewy24 credentials. Required at boot so a misconfigured deploy fails
  // the build (this module is evaluated by `next build` and `payload`) instead
  // of letting checkout break silently in production. P24_SANDBOX is an
  // optional toggle, so it stays a direct read in p24.ts.
  P24_MERCHANT_ID: required("P24_MERCHANT_ID"),
  P24_POS_ID: required("P24_POS_ID"),
  P24_CRC: required("P24_CRC"),
  P24_API_KEY: required("P24_API_KEY"),
} as const;
