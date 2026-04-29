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
  | "EMAIL_TO";

function required(key: EnvKeyT): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

function optional(key: EnvKeyT): string | undefined {
  return process.env[key];
}

export const ENV = {
  DB_POSTGRES_URL: required("DB_POSTGRES_URL"),
  PAYLOAD_SECRET: required("PAYLOAD_SECRET"),
  BLOB_READ_WRITE_TOKEN: required("BLOB_READ_WRITE_TOKEN"),

  // TODO: re-enable when nodemailer adapter is uncommented in payload.config.ts
  EMAIL_HOST: optional("EMAIL_HOST"),
  EMAIL_USER: optional("EMAIL_USER"),
  EMAIL_PASS: optional("EMAIL_PASS"),
  EMAIL_TO: optional("EMAIL_TO"),
} as const;
