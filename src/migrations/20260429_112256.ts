import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_format" AS ENUM('digital', 'physical');
  CREATE TYPE "public"."enum_products_currency" AS ENUM('PLN');
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"format" "enum_products_format" NOT NULL,
  	"price_gross" numeric NOT NULL,
  	"currency" "enum_products_currency" DEFAULT 'PLN' NOT NULL,
  	"vat_rate" numeric DEFAULT 0 NOT NULL,
  	"cover_image_id" integer NOT NULL,
  	"file_id" integer,
  	"weight_grams" numeric,
  	"dimensions_length" numeric,
  	"dimensions_width" numeric,
  	"dimensions_height" numeric,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_locales" (
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "products" ADD CONSTRAINT "products_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_locales" ADD CONSTRAINT "products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_cover_image_idx" ON "products" USING btree ("cover_image_id");
  CREATE INDEX "products_file_idx" ON "products" USING btree ("file_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE UNIQUE INDEX "products_locales_locale_parent_id_unique" ON "products_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_products_fk";
  
  DROP INDEX "payload_locked_documents_rels_products_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "products_id";
  DROP TYPE "public"."enum_products_format";
  DROP TYPE "public"."enum_products_currency";`)
}
