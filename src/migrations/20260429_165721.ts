import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" DROP COLUMN "weight_grams";
  ALTER TABLE "products" DROP COLUMN "dimensions_length";
  ALTER TABLE "products" DROP COLUMN "dimensions_width";
  ALTER TABLE "products" DROP COLUMN "dimensions_height";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ADD COLUMN "weight_grams" numeric;
  ALTER TABLE "products" ADD COLUMN "dimensions_length" numeric;
  ALTER TABLE "products" ADD COLUMN "dimensions_width" numeric;
  ALTER TABLE "products" ADD COLUMN "dimensions_height" numeric;`)
}
