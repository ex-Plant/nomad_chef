import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_confirmation_email_status" AS ENUM('pending', 'sent', 'failed');
  ALTER TABLE "orders" ALTER COLUMN "order_number" SET NOT NULL;
  ALTER TABLE "orders" ADD COLUMN "confirmation_email_status" "enum_orders_confirmation_email_status" DEFAULT 'pending' NOT NULL;
  ALTER TABLE "orders" ADD COLUMN "confirmation_email_sent_at" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "confirmation_email_error" varchar;
  CREATE INDEX "orders_confirmation_email_status_idx" ON "orders" USING btree ("confirmation_email_status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "orders_confirmation_email_status_idx";
  ALTER TABLE "orders" ALTER COLUMN "order_number" DROP NOT NULL;
  ALTER TABLE "orders" DROP COLUMN "confirmation_email_status";
  ALTER TABLE "orders" DROP COLUMN "confirmation_email_sent_at";
  ALTER TABLE "orders" DROP COLUMN "confirmation_email_error";
  DROP TYPE "public"."enum_orders_confirmation_email_status";`)
}
