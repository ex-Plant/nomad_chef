import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  ALTER TABLE "site" RENAME COLUMN "hero_image_id" TO "hero_media_id";
  ALTER TABLE "site" DROP CONSTRAINT "site_hero_image_id_media_id_fk";
  
  DROP INDEX "site_hero_image_idx";
  ALTER TABLE "site_camp_food_slides" ADD COLUMN "image_id" integer;
  ALTER TABLE "site_gallery_images" ADD CONSTRAINT "site_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_gallery_images" ADD CONSTRAINT "site_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_gallery_images_order_idx" ON "site_gallery_images" USING btree ("_order");
  CREATE INDEX "site_gallery_images_parent_id_idx" ON "site_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "site_gallery_images_image_idx" ON "site_gallery_images" USING btree ("image_id");
  ALTER TABLE "site_camp_food_slides" ADD CONSTRAINT "site_camp_food_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site" ADD CONSTRAINT "site_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_camp_food_slides_image_idx" ON "site_camp_food_slides" USING btree ("image_id");
  CREATE INDEX "site_hero_media_idx" ON "site" USING btree ("hero_media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_gallery_images" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_gallery_images" CASCADE;
  ALTER TABLE "site_camp_food_slides" DROP CONSTRAINT "site_camp_food_slides_image_id_media_id_fk";
  
  ALTER TABLE "site" DROP CONSTRAINT "site_hero_media_id_media_id_fk";
  
  DROP INDEX "site_camp_food_slides_image_idx";
  DROP INDEX "site_hero_media_idx";
  ALTER TABLE "site" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "site" ADD CONSTRAINT "site_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_hero_image_idx" ON "site" USING btree ("hero_image_id");
  ALTER TABLE "site_camp_food_slides" DROP COLUMN "image_id";
  ALTER TABLE "site" DROP COLUMN "hero_media_id";`)
}
