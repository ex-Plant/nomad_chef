import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-vercel-postgres";

/**
 * Snapshot reconciliation migration — intentionally a no-op.
 *
 * Two earlier migrations were hand-written without generating the companion
 * `.json` schema snapshots Payload uses to compute diffs:
 *   - 20260517_140000_drop_download_count_fields
 *   - 20260517_150000_add_inventory_policy
 *
 * Because of that, every `payload migrate:create` re-emitted the same delta
 * (add inventory_policy enum/column + drop download_count/download_limit/
 * resend_count), which always failed since the schema already had those
 * states. This file exists purely so its accompanying `.json` snapshot
 * captures the real current schema and future diffs are clean. The SQL
 * itself was already applied by the hand-written predecessors — nothing to
 * do here.
 */
export async function up(_args: MigrateUpArgs): Promise<void> {}

export async function down(_args: MigrateDownArgs): Promise<void> {}
