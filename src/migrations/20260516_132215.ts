import {
  MigrateUpArgs,
  MigrateDownArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_locales" ADD COLUMN "contact_newsletter_title" varchar;
  ALTER TABLE "site_locales" ADD COLUMN "contact_newsletter_description" varchar;`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_locales" DROP COLUMN "contact_newsletter_title";
  ALTER TABLE "site_locales" DROP COLUMN "contact_newsletter_description";`);
}
