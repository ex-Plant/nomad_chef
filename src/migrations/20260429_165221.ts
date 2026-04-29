import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_vat_rate" AS ENUM('0', '5', '8', '23');
  ALTER TABLE "products" ALTER COLUMN "vat_rate" DROP DEFAULT;
  UPDATE "products" SET "vat_rate" = CASE
    WHEN "vat_rate" IN (0, 0.05, 0.08, 0.23) THEN
      CASE "vat_rate"
        WHEN 0 THEN 0
        WHEN 0.05 THEN 5
        WHEN 0.08 THEN 8
        WHEN 0.23 THEN 23
      END
    ELSE 5
  END;
  ALTER TABLE "products" ALTER COLUMN "vat_rate" SET DATA TYPE "public"."enum_products_vat_rate" USING "vat_rate"::text::"public"."enum_products_vat_rate";
  ALTER TABLE "products" ALTER COLUMN "vat_rate" SET DEFAULT '5'::"public"."enum_products_vat_rate";
  ALTER TABLE "products" ALTER COLUMN "cover_image_id" DROP NOT NULL;
  ALTER TABLE "products" ADD COLUMN "price_net" numeric;
  ALTER TABLE "products" ADD COLUMN "stock_qty" numeric DEFAULT 0;
  ALTER TABLE "users" DROP COLUMN "name";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ALTER COLUMN "vat_rate" SET DATA TYPE numeric;
  ALTER TABLE "products" ALTER COLUMN "cover_image_id" SET NOT NULL;
  ALTER TABLE "users" ADD COLUMN "name" varchar;
  ALTER TABLE "products" DROP COLUMN "price_net";
  ALTER TABLE "products" DROP COLUMN "stock_qty";
  DROP TYPE "public"."enum_products_vat_rate";`)
}
