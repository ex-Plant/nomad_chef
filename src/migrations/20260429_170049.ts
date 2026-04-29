import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "customers_addresses" ADD COLUMN "company_name" varchar;
  ALTER TABLE "customers_addresses" ADD COLUMN "nip" varchar;
  ALTER TABLE "orders" ADD COLUMN "wants_invoice" boolean DEFAULT false;
  CREATE INDEX "orders_wants_invoice_idx" ON "orders" USING btree ("wants_invoice");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "orders_wants_invoice_idx";
  ALTER TABLE "customers_addresses" DROP COLUMN "company_name";
  ALTER TABLE "customers_addresses" DROP COLUMN "nip";
  ALTER TABLE "orders" DROP COLUMN "wants_invoice";`)
}
