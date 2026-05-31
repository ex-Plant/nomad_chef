import {
  MigrateUpArgs,
  MigrateDownArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

// Renames the order email-tracking fields from confirmation_email_* to
// download_email_*. The status now tracks the customer-facing download-link
// email (the only critical one) instead of the operator notification. Pure
// renames — the enum type keeps its OID so column defaults follow automatically,
// and the index tracks the renamed column — so no data is dropped.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_orders_confirmation_email_status" RENAME TO "enum_orders_download_email_status";
    ALTER INDEX "public"."orders_confirmation_email_status_idx" RENAME TO "orders_download_email_status_idx";
    ALTER TABLE "orders" RENAME COLUMN "confirmation_email_status" TO "download_email_status";
    ALTER TABLE "orders" RENAME COLUMN "confirmation_email_sent_at" TO "download_email_sent_at";
    ALTER TABLE "orders" RENAME COLUMN "confirmation_email_error" TO "download_email_error";
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders" RENAME COLUMN "download_email_error" TO "confirmation_email_error";
    ALTER TABLE "orders" RENAME COLUMN "download_email_sent_at" TO "confirmation_email_sent_at";
    ALTER TABLE "orders" RENAME COLUMN "download_email_status" TO "confirmation_email_status";
    ALTER INDEX "public"."orders_download_email_status_idx" RENAME TO "orders_confirmation_email_status_idx";
    ALTER TYPE "public"."enum_orders_download_email_status" RENAME TO "enum_orders_confirmation_email_status";
  `);
}
