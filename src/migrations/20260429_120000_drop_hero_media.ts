import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "site" DROP CONSTRAINT IF EXISTS "site_hero_media_desktop_id_media_id_fk";
  ALTER TABLE "site" DROP CONSTRAINT IF EXISTS "site_hero_media_mobile_id_media_id_fk";
  DROP INDEX IF EXISTS "site_hero_media_desktop_idx";
  DROP INDEX IF EXISTS "site_hero_media_mobile_idx";
  ALTER TABLE "site" DROP COLUMN IF EXISTS "hero_media_desktop_id";
  ALTER TABLE "site" DROP COLUMN IF EXISTS "hero_media_mobile_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "hero_media_desktop_id" integer;
  ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "hero_media_mobile_id" integer;
  ALTER TABLE "site" ADD CONSTRAINT "site_hero_media_desktop_id_media_id_fk" FOREIGN KEY ("hero_media_desktop_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site" ADD CONSTRAINT "site_hero_media_mobile_id_media_id_fk" FOREIGN KEY ("hero_media_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX IF NOT EXISTS "site_hero_media_desktop_idx" ON "site" USING btree ("hero_media_desktop_id");
  CREATE INDEX IF NOT EXISTS "site_hero_media_mobile_idx" ON "site" USING btree ("hero_media_mobile_id");`)
}
