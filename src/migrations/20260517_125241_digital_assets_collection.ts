import {
  MigrateUpArgs,
  MigrateDownArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "digital_assets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  ALTER TABLE "products" DROP CONSTRAINT "products_file_id_media_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "digital_assets_id" integer;
  CREATE INDEX "digital_assets_updated_at_idx" ON "digital_assets" USING btree ("updated_at");
  CREATE INDEX "digital_assets_created_at_idx" ON "digital_assets" USING btree ("created_at");
  CREATE UNIQUE INDEX "digital_assets_filename_idx" ON "digital_assets" USING btree ("filename");
  ALTER TABLE "products" ADD CONSTRAINT "products_file_id_digital_assets_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."digital_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_digital_assets_fk" FOREIGN KEY ("digital_assets_id") REFERENCES "public"."digital_assets"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_digital_assets_id_idx" ON "payload_locked_documents_rels" USING btree ("digital_assets_id");`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "digital_assets" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "digital_assets" CASCADE;
  ALTER TABLE "products" DROP CONSTRAINT "products_file_id_digital_assets_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_digital_assets_fk";
  
  DROP INDEX "payload_locked_documents_rels_digital_assets_id_idx";
  ALTER TABLE "products" ADD CONSTRAINT "products_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "digital_assets_id";`);
}
