import {
  MigrateUpArgs,
  MigrateDownArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_locales" ALTER COLUMN "description" SET DATA TYPE varchar;`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_locales" ALTER COLUMN "description" SET DATA TYPE jsonb;`);
}
