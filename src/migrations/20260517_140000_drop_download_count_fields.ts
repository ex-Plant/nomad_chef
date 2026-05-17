import {
  MigrateUpArgs,
  MigrateDownArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "download_count";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "download_limit";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "resend_count";
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders" ADD COLUMN "download_count" numeric DEFAULT 0;
    ALTER TABLE "orders" ADD COLUMN "download_limit" numeric DEFAULT 5;
    ALTER TABLE "orders" ADD COLUMN "resend_count" numeric DEFAULT 0;
  `);
}
