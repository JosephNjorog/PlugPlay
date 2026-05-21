import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isSuperAdmin) {
    return NextResponse.json({ error: "Super admin required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const adminId   = searchParams.get("adminId");
  const action    = searchParams.get("action");
  const entityType = searchParams.get("entityType");
  const from      = searchParams.get("from");   // ISO date string
  const to        = searchParams.get("to");
  const search    = searchParams.get("search");
  const limit     = Math.min(parseInt(searchParams.get("limit") ?? "200"), 500);

  try {
    // Ensure table exists (idempotent)
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

    const rows = await sql`
      SELECT
        id,
        admin_id    AS "adminId",
        admin_name  AS "adminName",
        admin_email AS "adminEmail",
        action,
        entity_type AS "entityType",
        entity_id   AS "entityId",
        details,
        created_at  AS "createdAt"
      FROM admin_activity_logs
      WHERE 1=1
        ${adminId    ? sql`AND admin_id    = ${adminId}`    : sql``}
        ${action     ? sql`AND action      = ${action}`     : sql``}
        ${entityType ? sql`AND entity_type = ${entityType}` : sql``}
        ${from       ? sql`AND created_at >= ${from}`       : sql``}
        ${to         ? sql`AND created_at <= ${to}`         : sql``}
        ${search     ? sql`AND (LOWER(admin_name) LIKE ${"%" + search.toLowerCase() + "%"} OR LOWER(action) LIKE ${"%" + search.toLowerCase() + "%"})` : sql``}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}
