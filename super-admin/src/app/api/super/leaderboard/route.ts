import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isSuperAdmin) {
    return NextResponse.json({ error: "Super admin required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") ?? "global";
  const eventId = searchParams.get("eventId");
  const persona = searchParams.get("persona");
  const stage = searchParams.get("stage");
  const search = searchParams.get("search");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "200"), 500);

  if (mode === "event" && eventId) {
    const rows = await db.execute(sql`
      SELECT
        p.id,
        p.username,
        p.emoji,
        p.persona,
        p.xp,
        p.level,
        p.stage,
        p.streak,
        p.wallet_address   AS "walletAddress",
        p.status_tag       AS "statusTag",
        COUNT(ma.id)::int                         AS "missionCount",
        COALESCE(SUM(ma.score), 0)::int           AS "totalScore",
        COALESCE(ROUND(AVG(ma.accuracy)), 0)::int AS "avgAccuracy",
        COALESCE(SUM(ma.time_spent), 0)::int      AS "totalTimeSpent",
        (SELECT email FROM users WHERE id = p.user_id) AS email
      FROM mission_attempts ma
      JOIN profiles p ON p.id = ma.user_id
      WHERE ma.event_id = ${eventId}
        AND ma.status = 'completed'
        ${persona ? sql`AND p.persona = ${persona}` : sql``}
        ${stage   ? sql`AND p.stage   = ${stage}`   : sql``}
        ${search  ? sql`AND LOWER(p.username) LIKE ${"%" + search.toLowerCase() + "%"}` : sql``}
      GROUP BY p.id, p.username, p.emoji, p.persona, p.xp, p.level, p.stage,
               p.streak, p.wallet_address, p.status_tag, p.user_id
      ORDER BY "totalScore" DESC
      LIMIT ${limit}
    `);
    const entries = ((rows as any).rows ?? (rows as any)) as any[];
    return NextResponse.json(entries.map((r, i) => ({ ...r, rank: i + 1 })));
  }

  // Global mode
  const personaClause = persona ? sql`AND p.persona = ${persona}` : sql``;
  const stageClause   = stage   ? sql`AND p.stage   = ${stage}`   : sql``;
  const searchClause  = search  ? sql`AND LOWER(p.username) LIKE ${"%" + search.toLowerCase() + "%"}` : sql``;

  const rows = await db.execute(sql`
    SELECT
      p.id,
      p.username,
      p.emoji,
      p.persona,
      p.xp,
      p.level,
      p.stage,
      p.streak,
      p.wallet_address  AS "walletAddress",
      p.status_tag      AS "statusTag",
      (SELECT email FROM users WHERE id = p.user_id) AS email,
      (SELECT COUNT(*)::int FROM mission_attempts WHERE user_id = p.id AND status = 'completed') AS "missionCount",
      (SELECT COALESCE(SUM(score), 0)::int FROM mission_attempts WHERE user_id = p.id AND status = 'completed') AS "totalScore"
    FROM profiles p
    WHERE 1=1
      ${personaClause}
      ${stageClause}
      ${searchClause}
    ORDER BY p.xp DESC
    LIMIT ${limit}
  `);

  const entries = ((rows as any).rows ?? (rows as any)) as any[];
  return NextResponse.json(entries.map((r, i) => ({ ...r, rank: i + 1 })));
}
