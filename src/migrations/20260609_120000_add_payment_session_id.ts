import {
  MigrateUpArgs,
  MigrateDownArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

// Adds orders.payment_session_id — the unique Przelewy24 sessionId, decoupled
// from the reusable order_number. Nullable so the existing rows (which were
// registered under their order_number) stay valid; Postgres treats NULLs as
// distinct, so the UNIQUE index permits the back-filled NULLs. New orders get a
// value from the generatePaymentSessionId hook.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders" ADD COLUMN "payment_session_id" varchar;
    CREATE UNIQUE INDEX "orders_payment_session_id_idx" ON "orders" USING btree ("payment_session_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "orders_payment_session_id_idx";
    ALTER TABLE "orders" DROP COLUMN "payment_session_id";
  `);
}
