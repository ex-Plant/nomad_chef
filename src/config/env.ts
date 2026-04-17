// Centralized runtime env vars. Import from here instead of reading
// `process.env` directly so missing vars fail fast at startup.

type EnvKeyT =
  | "DB_POSTGRES_URL"
  | "PAYLOAD_SECRET"
  | "BLOB_READ_WRITE_TOKEN"
  | "EMAIL_HOST"
  | "EMAIL_USER"
  | "EMAIL_PASS"
  | "CONTACT_TO"
  | "SEED_ADMIN_EMAIL"
  | "SEED_ADMIN_PASSWORD";

function required(key: EnvKeyT): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const ENV = {
  // Payload / Postgres
  DB_POSTGRES_URL: required("DB_POSTGRES_URL"),
  PAYLOAD_SECRET: required("PAYLOAD_SECRET"),

  // Media (Vercel Blob)
  BLOB_READ_WRITE_TOKEN: required("BLOB_READ_WRITE_TOKEN"),

  // SMTP (Nodemailer)
  EMAIL_HOST: required("EMAIL_HOST"),

  EMAIL_USER: required("EMAIL_USER"),
  EMAIL_PASS: required("EMAIL_PASS"),
  CONTACT_TO: required("CONTACT_TO"),

  // Admin seeding script
  SEED_ADMIN_EMAIL: required("SEED_ADMIN_EMAIL"),
  SEED_ADMIN_PASSWORD: required("SEED_ADMIN_PASSWORD"),
} as const;
