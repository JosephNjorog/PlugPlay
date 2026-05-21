import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS admin_activity_logs (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      admin_id    UUID NOT NULL,
      admin_name  TEXT NOT NULL,
      admin_email TEXT,
      action      TEXT NOT NULL,
      entity_type TEXT,
      entity_id   TEXT,
      details     JSONB,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS admin_activity_logs_admin_id_idx  ON admin_activity_logs (admin_id)`;
  await sql`CREATE INDEX IF NOT EXISTS admin_activity_logs_created_at_idx ON admin_activity_logs (created_at DESC)`;
  tableReady = true;
}

export interface AdminLogEntry {
  adminId: string;
  adminName: string;
  adminEmail?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
}

export function logAdminAction(entry: AdminLogEntry): void {
  ensureTable()
    .then(() =>
      sql`
        INSERT INTO admin_activity_logs
          (admin_id, admin_name, admin_email, action, entity_type, entity_id, details)
        VALUES (
          ${entry.adminId}, ${entry.adminName}, ${entry.adminEmail ?? null},
          ${entry.action}, ${entry.entityType ?? null}, ${entry.entityId ?? null},
          ${entry.details ? JSON.stringify(entry.details) : null}
        )
      `
    )
    .catch(() => {});
}
