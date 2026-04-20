// Centralized runtime env vars. Import from here instead of reading
// `process.env` directly so missing vars fail fast at startup.
//
// Only declare vars the app NEEDS to boot. Script-only vars (seeding) and
// feature-gated vars (SMTP, Blob) are read directly where they're used, so
// production deploys don't crash on unused requirements.

type EnvKeyT = "DB_POSTGRES_URL" | "PAYLOAD_SECRET";

function required(key: EnvKeyT): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const ENV = {
  DB_POSTGRES_URL: required("DB_POSTGRES_URL"),
  PAYLOAD_SECRET: required("PAYLOAD_SECRET"),
} as const;
