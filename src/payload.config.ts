import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import sharp from "sharp";
import { vercelPostgresAdapter } from "@payloadcms/db-vercel-postgres";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import nodemailer from "nodemailer";
import { pl } from "@payloadcms/translations/languages/pl";
import { en } from "@payloadcms/translations/languages/en";

import { Users } from "@/collections/users";
import { Media } from "@/collections/media";
import { Site } from "@/globals/site";
import { ENV } from "@/config/env";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: "users",
    importMap: { baseDir: path.resolve(dirname) },
  },
  i18n: {
    supportedLanguages: { pl, en },
    fallbackLanguage: "pl",
  },
  localization: {
    locales: ["pl", "en"],
    defaultLocale: "pl",
    fallback: true,
  },
  editor: lexicalEditor(),
  db: vercelPostgresAdapter({
    pool: { connectionString: ENV.DB_POSTGRES_URL },
    push: false,
    migrationDir: path.resolve(dirname, "migrations"),
  }),
  email: nodemailerAdapter({
    defaultFromAddress: ENV.EMAIL_USER,
    defaultFromName: "Chef",
    transport: nodemailer.createTransport({
      host: ENV.EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASS,
      },
    }),
  }),
  collections: [Users, Media],
  globals: [Site],
  plugins: [
    // vercelBlobStorage({
    //   collections: { media: true },
    //   token: ENV.BLOB_READ_WRITE_TOKEN,
    // }),
  ],
  secret: ENV.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
