import { NextRequest, NextResponse } from "next/server";
import { eq, desc, sql, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, profiles, events } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") ?? "global"; // global | event
  const eventId = searchParams.get("eventId");
  const persona = searchParams.get("persona");
  const stage = searchParams.get("stage");
  const search = searchParams.get("search");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100"), 500);

  // ── Event mode: aggregate mission_attempts scores per player for an event ──
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
        COALESCE(SUM(ma.time_spent), 0)::int      AS "totalTimeSpent"
      FROM mission_attempts ma
      JOIN profiles p ON p.id = ma.user_id
      WHERE ma.event_id = ${eventId}
        AND ma.status = 'completed'
        ${persona ? sql`AND p.persona = ${persona}` : sql``}
        ${stage ? sql`AND p.stage = ${stage}` : sql``}
        ${search ? sql`AND LOWER(p.username) LIKE ${"%" + search.toLowerCase() + "%"}` : sql``}
      GROUP BY p.id, p.username, p.emoji, p.persona, p.xp, p.level, p.stage, p.streak, p.wallet_address, p.status_tag
      ORDER BY "totalScore" DESC
      LIMIT ${limit}
    `);

    const entries = ((rows as any).rows ?? (rows as any)) as any[];
    return NextResponse.json(entries.map((r, i) => ({ ...r, rank: i + 1 })));
  }

  // ── Global mode: leaderboard by XP ──────────────────────────────────────
  const conditions: any[] = [];
  if (persona) conditions.push(eq(profiles.persona, persona));
  if (stage) conditions.push(eq(profiles.stage, stage));

  const results = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      emoji: profiles.emoji,
      persona: profiles.persona,
      xp: profiles.xp,
      level: profiles.level,
      stage: profiles.stage,
      streak: profiles.streak,
      walletAddress: profiles.walletAddress,
      statusTag: profiles.statusTag,
      missionCount: sql<number>`(
        SELECT COUNT(*) FROM mission_attempts
        WHERE user_id = ${profiles.id} AND status = 'completed'
      )`,
      totalScore: sql<number>`(
        SELECT COALESCE(SUM(score), 0) FROM mission_attempts
        WHERE user_id = ${profiles.id} AND status = 'completed'
      )`,
      email: sql<string>`(SELECT email FROM users WHERE id = ${profiles.userId})`,
    })
    .from(profiles)
    .where(
      and(
        ...(conditions.length ? conditions : [sql`1=1`]),
        ...(search ? [sql`LOWER(${profiles.username}) LIKE ${"%" + search.toLowerCase() + "%"}`] : [])
      )
    )
    .orderBy(desc(profiles.xp))
    .limit(limit);

  return NextResponse.json(
    results.map((r, i) => ({
      ...r,
      rank: i + 1,
      missionCount: Number(r.missionCount),
      totalScore: Number(r.totalScore),
    }))
  );
}
