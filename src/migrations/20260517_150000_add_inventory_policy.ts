import {
  MigrateDownArgs,
  MigrateUpArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_products_inventory_policy" AS ENUM('tracked', 'untracked');
    ALTER TABLE "products"
      ADD COLUMN "inventory_policy" "public"."enum_products_inventory_policy";

    UPDATE "products"
    SET "inventory_policy" = CASE
      WHEN "format" = 'physical'::"public"."enum_products_format" THEN 'tracked'::"public"."enum_products_inventory_policy"
      ELSE 'untracked'::"public"."enum_products_inventory_policy"
    END
    WHERE "inventory_policy" IS NULL;

    ALTER TABLE "products"
      ALTER COLUMN "inventory_policy" SET NOT NULL,
      ALTER COLUMN "inventory_policy" SET DEFAULT 'tracked'::"public"."enum_products_inventory_policy";
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" DROP COLUMN "inventory_policy";
    DROP TYPE "public"."enum_products_inventory_policy";
  `);
}
