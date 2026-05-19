import { NextRequest, NextResponse } from "next/server";
import { desc, like, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, profiles } from "@/lib/db";

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
      // email and lastActiveAt come from users table via subquery
      email: sql<string>`(SELECT email FROM users WHERE id = ${profiles.userId})`,
      badgeCount: sql<number>`(SELECT COUNT(*) FROM nft_badges WHERE user_id = ${profiles.id})`,
      missionCount: sql<number>`(SELECT COUNT(*) FROM mission_attempts WHERE user_id = ${profiles.userId} AND status = 'completed')`,
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
