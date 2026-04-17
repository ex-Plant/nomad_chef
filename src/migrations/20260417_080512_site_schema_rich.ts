import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_about_heading_lines_color" AS ENUM('off-black', 'coral', 'blue', 'white', 'pink', 'yellow');
  CREATE TYPE "public"."enum_site_contact_heading_lines_color" AS ENUM('off-black', 'coral', 'blue', 'white', 'pink', 'yellow');
  CREATE TABLE "site_hero_heading_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "site_hero_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "site_about_heading_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"color" "enum_site_about_heading_lines_color" DEFAULT 'off-black' NOT NULL
  );
  
  CREATE TABLE "site_about_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "site_services_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"tagline" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "site_camp_food_heading_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "site_camp_food_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "site_contact_heading_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"color" "enum_site_contact_heading_lines_color" DEFAULT 'off-black' NOT NULL
  );
  
  ALTER TABLE "site_services_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_services_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_camp_food_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_gallery_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_nav_items_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_services_items" CASCADE;
  DROP TABLE "site_services_items_locales" CASCADE;
  DROP TABLE "site_camp_food_images" CASCADE;
  DROP TABLE "site_gallery_items" CASCADE;
  DROP TABLE "site_gallery_items_locales" CASCADE;
  DROP TABLE "site_nav_items_locales" CASCADE;
  DELETE FROM "site_nav_items";
  ALTER TABLE "site_nav_items" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "site_nav_items" ADD COLUMN "label" varchar;
  ALTER TABLE "site" ADD COLUMN "camp_food_cta_href" varchar;
  ALTER TABLE "site" ADD COLUMN "contact_email_href" varchar;
  ALTER TABLE "site" ADD COLUMN "contact_instagram_href" varchar;
  ALTER TABLE "site" ADD COLUMN "contact_submit_href" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "hero_tagline" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "about_eyebrow" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "about_intro" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "about_quote" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "about_image_alt" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "services_eyebrow" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "services_background_alt" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "camp_food_eyebrow" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "camp_food_kicker" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "camp_food_cta_label" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "gallery_eyebrow" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "gallery_heading" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "gallery_handle" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "contact_eyebrow" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "contact_email_label" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "contact_email_value" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "contact_instagram_label" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "contact_instagram_value" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "contact_form_placeholder" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "contact_submit_label" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "contact_footer" varchar;
  ALTER TABLE "site_hero_heading_lines" ADD CONSTRAINT "site_hero_heading_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_hero_ctas" ADD CONSTRAINT "site_hero_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_about_heading_lines" ADD CONSTRAINT "site_about_heading_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_about_paragraphs" ADD CONSTRAINT "site_about_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_services_slides" ADD CONSTRAINT "site_services_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_camp_food_heading_lines" ADD CONSTRAINT "site_camp_food_heading_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_camp_food_slides" ADD CONSTRAINT "site_camp_food_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_contact_heading_lines" ADD CONSTRAINT "site_contact_heading_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_hero_heading_lines_order_idx" ON "site_hero_heading_lines" USING btree ("_order");
  CREATE INDEX "site_hero_heading_lines_parent_id_idx" ON "site_hero_heading_lines" USING btree ("_parent_id");
  CREATE INDEX "site_hero_heading_lines_locale_idx" ON "site_hero_heading_lines" USING btree ("_locale");
  CREATE INDEX "site_hero_ctas_order_idx" ON "site_hero_ctas" USING btree ("_order");
  CREATE INDEX "site_hero_ctas_parent_id_idx" ON "site_hero_ctas" USING btree ("_parent_id");
  CREATE INDEX "site_hero_ctas_locale_idx" ON "site_hero_ctas" USING btree ("_locale");
  CREATE INDEX "site_about_heading_lines_order_idx" ON "site_about_heading_lines" USING btree ("_order");
  CREATE INDEX "site_about_heading_lines_parent_id_idx" ON "site_about_heading_lines" USING btree ("_parent_id");
  CREATE INDEX "site_about_heading_lines_locale_idx" ON "site_about_heading_lines" USING btree ("_locale");
  CREATE INDEX "site_about_paragraphs_order_idx" ON "site_about_paragraphs" USING btree ("_order");
  CREATE INDEX "site_about_paragraphs_parent_id_idx" ON "site_about_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "site_about_paragraphs_locale_idx" ON "site_about_paragraphs" USING btree ("_locale");
  CREATE INDEX "site_services_slides_order_idx" ON "site_services_slides" USING btree ("_order");
  CREATE INDEX "site_services_slides_parent_id_idx" ON "site_services_slides" USING btree ("_parent_id");
  CREATE INDEX "site_services_slides_locale_idx" ON "site_services_slides" USING btree ("_locale");
  CREATE INDEX "site_camp_food_heading_lines_order_idx" ON "site_camp_food_heading_lines" USING btree ("_order");
  CREATE INDEX "site_camp_food_heading_lines_parent_id_idx" ON "site_camp_food_heading_lines" USING btree ("_parent_id");
  CREATE INDEX "site_camp_food_heading_lines_locale_idx" ON "site_camp_food_heading_lines" USING btree ("_locale");
  CREATE INDEX "site_camp_food_slides_order_idx" ON "site_camp_food_slides" USING btree ("_order");
  CREATE INDEX "site_camp_food_slides_parent_id_idx" ON "site_camp_food_slides" USING btree ("_parent_id");
  CREATE INDEX "site_camp_food_slides_locale_idx" ON "site_camp_food_slides" USING btree ("_locale");
  CREATE INDEX "site_contact_heading_lines_order_idx" ON "site_contact_heading_lines" USING btree ("_order");
  CREATE INDEX "site_contact_heading_lines_parent_id_idx" ON "site_contact_heading_lines" USING btree ("_parent_id");
  CREATE INDEX "site_contact_heading_lines_locale_idx" ON "site_contact_heading_lines" USING btree ("_locale");
  CREATE INDEX "site_nav_items_locale_idx" ON "site_nav_items" USING btree ("_locale");
  ALTER TABLE "site_locales" DROP COLUMN "hero_eyebrow";
  ALTER TABLE "site_locales" DROP COLUMN "hero_title";
  ALTER TABLE "site_locales" DROP COLUMN "about_title";
  ALTER TABLE "site_locales" DROP COLUMN "about_body";
  ALTER TABLE "site_locales" DROP COLUMN "services_title";
  ALTER TABLE "site_locales" DROP COLUMN "camp_food_title";
  ALTER TABLE "site_locales" DROP COLUMN "camp_food_lead";
  ALTER TABLE "site_locales" DROP COLUMN "gallery_title";
  ALTER TABLE "site_locales" DROP COLUMN "contact_title";
  ALTER TABLE "site_locales" DROP COLUMN "contact_email";
  ALTER TABLE "site_locales" DROP COLUMN "contact_phone";
  ALTER TABLE "site_locales" DROP COLUMN "contact_instagram";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_services_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "site_services_items_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_camp_food_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "site_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "site_gallery_items_locales" (
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_nav_items_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "site_hero_heading_lines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_hero_ctas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_about_heading_lines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_about_paragraphs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_services_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_camp_food_heading_lines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_camp_food_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_contact_heading_lines" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_hero_heading_lines" CASCADE;
  DROP TABLE "site_hero_ctas" CASCADE;
  DROP TABLE "site_about_heading_lines" CASCADE;
  DROP TABLE "site_about_paragraphs" CASCADE;
  DROP TABLE "site_services_slides" CASCADE;
  DROP TABLE "site_camp_food_heading_lines" CASCADE;
  DROP TABLE "site_camp_food_slides" CASCADE;
  DROP TABLE "site_contact_heading_lines" CASCADE;
  DROP INDEX "site_nav_items_locale_idx";
  ALTER TABLE "site_locales" ADD COLUMN "hero_eyebrow" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "hero_title" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "about_title" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "about_body" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "services_title" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "camp_food_title" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "camp_food_lead" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "gallery_title" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "contact_title" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "contact_email" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "contact_phone" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "contact_instagram" varchar;
  ALTER TABLE "site_services_items" ADD CONSTRAINT "site_services_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_services_items" ADD CONSTRAINT "site_services_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_services_items_locales" ADD CONSTRAINT "site_services_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_services_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_camp_food_images" ADD CONSTRAINT "site_camp_food_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_camp_food_images" ADD CONSTRAINT "site_camp_food_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_gallery_items" ADD CONSTRAINT "site_gallery_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_gallery_items" ADD CONSTRAINT "site_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_gallery_items_locales" ADD CONSTRAINT "site_gallery_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_gallery_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_nav_items_locales" ADD CONSTRAINT "site_nav_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_services_items_order_idx" ON "site_services_items" USING btree ("_order");
  CREATE INDEX "site_services_items_parent_id_idx" ON "site_services_items" USING btree ("_parent_id");
  CREATE INDEX "site_services_items_image_idx" ON "site_services_items" USING btree ("image_id");
  CREATE UNIQUE INDEX "site_services_items_locales_locale_parent_id_unique" ON "site_services_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_camp_food_images_order_idx" ON "site_camp_food_images" USING btree ("_order");
  CREATE INDEX "site_camp_food_images_parent_id_idx" ON "site_camp_food_images" USING btree ("_parent_id");
  CREATE INDEX "site_camp_food_images_image_idx" ON "site_camp_food_images" USING btree ("image_id");
  CREATE INDEX "site_gallery_items_order_idx" ON "site_gallery_items" USING btree ("_order");
  CREATE INDEX "site_gallery_items_parent_id_idx" ON "site_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "site_gallery_items_image_idx" ON "site_gallery_items" USING btree ("image_id");
  CREATE UNIQUE INDEX "site_gallery_items_locales_locale_parent_id_unique" ON "site_gallery_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "site_nav_items_locales_locale_parent_id_unique" ON "site_nav_items_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "site_nav_items" DROP COLUMN "_locale";
  ALTER TABLE "site_nav_items" DROP COLUMN "label";
  ALTER TABLE "site" DROP COLUMN "camp_food_cta_href";
  ALTER TABLE "site" DROP COLUMN "contact_email_href";
  ALTER TABLE "site" DROP COLUMN "contact_instagram_href";
  ALTER TABLE "site" DROP COLUMN "contact_submit_href";
  ALTER TABLE "site_locales" DROP COLUMN "hero_tagline";
  ALTER TABLE "site_locales" DROP COLUMN "about_eyebrow";
  ALTER TABLE "site_locales" DROP COLUMN "about_intro";
  ALTER TABLE "site_locales" DROP COLUMN "about_quote";
  ALTER TABLE "site_locales" DROP COLUMN "about_image_alt";
  ALTER TABLE "site_locales" DROP COLUMN "services_eyebrow";
  ALTER TABLE "site_locales" DROP COLUMN "services_background_alt";
  ALTER TABLE "site_locales" DROP COLUMN "camp_food_eyebrow";
  ALTER TABLE "site_locales" DROP COLUMN "camp_food_kicker";
  ALTER TABLE "site_locales" DROP COLUMN "camp_food_cta_label";
  ALTER TABLE "site_locales" DROP COLUMN "gallery_eyebrow";
  ALTER TABLE "site_locales" DROP COLUMN "gallery_heading";
  ALTER TABLE "site_locales" DROP COLUMN "gallery_handle";
  ALTER TABLE "site_locales" DROP COLUMN "contact_eyebrow";
  ALTER TABLE "site_locales" DROP COLUMN "contact_email_label";
  ALTER TABLE "site_locales" DROP COLUMN "contact_email_value";
  ALTER TABLE "site_locales" DROP COLUMN "contact_instagram_label";
  ALTER TABLE "site_locales" DROP COLUMN "contact_instagram_value";
  ALTER TABLE "site_locales" DROP COLUMN "contact_form_placeholder";
  ALTER TABLE "site_locales" DROP COLUMN "contact_submit_label";
  ALTER TABLE "site_locales" DROP COLUMN "contact_footer";
  DROP TYPE "public"."enum_site_about_heading_lines_color";
  DROP TYPE "public"."enum_site_contact_heading_lines_color";`)
}
