import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site" ADD COLUMN "services_background_id" integer;
  ALTER TABLE "site_locales" ADD COLUMN "contact_description" varchar;
  ALTER TABLE "site" ADD CONSTRAINT "site_services_background_id_media_id_fk" FOREIGN KEY ("services_background_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_services_background_idx" ON "site" USING btree ("services_background_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site" DROP CONSTRAINT "site_services_background_id_media_id_fk";
  
  DROP INDEX "site_services_background_idx";
  ALTER TABLE "site" DROP COLUMN "services_background_id";
  ALTER TABLE "site_locales" DROP COLUMN "contact_description";`)
}
