import { NextRequest, NextResponse } from "next/server";
import { eq, desc, sql, and, or } from "drizzle-orm";
import { db, profiles, missionAttempts } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const persona = searchParams.get("persona");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  const conditions: any[] = [sql`${profiles.xp} > 0`];
  if (persona && persona !== "all") conditions.push(eq(profiles.persona, persona));

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
        WHERE player_id = ${profiles.id} AND status = 'completed'
      )`,
    })
    .from(profiles)
    .where(and(...conditions))
    .orderBy(desc(profiles.xp))
    .limit(limit);

  return NextResponse.json(
    results.map((r, i) => ({
      ...r,
      rank: i + 1,
      missionCount: Number(r.missionCount),
    }))
  );
}
