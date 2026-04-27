import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_camp_food_slides_theme" AS ENUM('orange', 'blue');
  CREATE TYPE "public"."enum_site_camp_food_slides_image_orientation" AS ENUM('vertical', 'horizontal');
  ALTER TABLE "site_camp_food_slides" ADD COLUMN "theme" "enum_site_camp_food_slides_theme" DEFAULT 'orange' NOT NULL;
  ALTER TABLE "site_camp_food_slides" ADD COLUMN "image_orientation" "enum_site_camp_food_slides_image_orientation" DEFAULT 'vertical' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_camp_food_slides" DROP COLUMN "theme";
  ALTER TABLE "site_camp_food_slides" DROP COLUMN "image_orientation";
  DROP TYPE "public"."enum_site_camp_food_slides_theme";
  DROP TYPE "public"."enum_site_camp_food_slides_image_orientation";`)
}
