import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "site" DROP CONSTRAINT IF EXISTS "site_hero_media_id_media_id_fk";
  DROP INDEX IF EXISTS "site_hero_media_idx";
  ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "hero_media_desktop_id" integer;
  ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "hero_media_mobile_id" integer;
  ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "services_background_id" integer;
  ALTER TABLE "site_locales" ADD COLUMN IF NOT EXISTS "contact_description" varchar;
  ALTER TABLE "site" DROP CONSTRAINT IF EXISTS "site_hero_media_desktop_id_media_id_fk";
  ALTER TABLE "site" ADD CONSTRAINT "site_hero_media_desktop_id_media_id_fk" FOREIGN KEY ("hero_media_desktop_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site" DROP CONSTRAINT IF EXISTS "site_hero_media_mobile_id_media_id_fk";
  ALTER TABLE "site" ADD CONSTRAINT "site_hero_media_mobile_id_media_id_fk" FOREIGN KEY ("hero_media_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site" DROP CONSTRAINT IF EXISTS "site_services_background_id_media_id_fk";
  ALTER TABLE "site" ADD CONSTRAINT "site_services_background_id_media_id_fk" FOREIGN KEY ("services_background_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX IF NOT EXISTS "site_hero_media_desktop_idx" ON "site" USING btree ("hero_media_desktop_id");
  CREATE INDEX IF NOT EXISTS "site_hero_media_mobile_idx" ON "site" USING btree ("hero_media_mobile_id");
  CREATE INDEX IF NOT EXISTS "site_services_background_idx" ON "site" USING btree ("services_background_id");
  ALTER TABLE "site" DROP COLUMN IF EXISTS "hero_media_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "site" DROP CONSTRAINT IF EXISTS "site_hero_media_desktop_id_media_id_fk";
  ALTER TABLE "site" DROP CONSTRAINT IF EXISTS "site_hero_media_mobile_id_media_id_fk";
  ALTER TABLE "site" DROP CONSTRAINT IF EXISTS "site_services_background_id_media_id_fk";
  DROP INDEX IF EXISTS "site_hero_media_desktop_idx";
  DROP INDEX IF EXISTS "site_hero_media_mobile_idx";
  DROP INDEX IF EXISTS "site_services_background_idx";
  ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "hero_media_id" integer;
  ALTER TABLE "site" DROP CONSTRAINT IF EXISTS "site_hero_media_id_media_id_fk";
  ALTER TABLE "site" ADD CONSTRAINT "site_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX IF NOT EXISTS "site_hero_media_idx" ON "site" USING btree ("hero_media_id");
  ALTER TABLE "site" DROP COLUMN IF EXISTS "hero_media_desktop_id";
  ALTER TABLE "site" DROP COLUMN IF EXISTS "hero_media_mobile_id";
  ALTER TABLE "site" DROP COLUMN IF EXISTS "services_background_id";
  ALTER TABLE "site_locales" DROP COLUMN IF EXISTS "contact_description";`)
}
