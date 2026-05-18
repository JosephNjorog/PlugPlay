import { NextRequest, NextResponse } from "next/server";
import { desc, eq, like, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, profiles, nftBadges, missionAttempts } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  const results = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      email: profiles.email,
      emoji: profiles.emoji,
      persona: profiles.persona,
      xp: profiles.xp,
      level: profiles.level,
      stage: profiles.stage,
      streak: profiles.streak,
      walletAddress: profiles.walletAddress,
      isAdmin: profiles.isAdmin,
      isSuperAdmin: profiles.isSuperAdmin,
      createdAt: profiles.createdAt,
      lastActiveAt: profiles.lastActiveAt,
      badgeCount: sql<number>`(SELECT COUNT(*) FROM nft_badges WHERE user_id = ${profiles.id})`,
      missionCount: sql<number>`(SELECT COUNT(*) FROM mission_attempts WHERE player_id = ${profiles.id} AND status = 'completed')`,
    })
    .from(profiles)
    .where(search ? like(profiles.username, `%${search}%`) : undefined)
    .orderBy(desc(profiles.xp))
    .limit(100);

  return NextResponse.json(results.map((r) => ({
    ...r,
    badgeCount: Number(r.badgeCount),
    missionCount: Number(r.missionCount),
  })));
}
