import { NextResponse } from "next/server";
import { sql, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, profiles, games, events, missionAttempts, nftBadges, rewards, arenaSessions, eventParticipants } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const [
    [{ totalPlayers }],
    [{ totalGames }],
    [{ totalEvents }],
    [{ totalAttempts }],
    [{ completedAttempts }],
    [{ totalBadges }],
    [{ totalRewards }],
    [{ activeSessions }],
    [{ totalParticipants }],
  ] = await Promise.all([
    db.select({ totalPlayers: sql<number>`count(*)` }).from(profiles),
    db.select({ totalGames: sql<number>`count(*)` }).from(games),
    db.select({ totalEvents: sql<number>`count(*)` }).from(events),
    db.select({ totalAttempts: sql<number>`count(*)` }).from(missionAttempts),
    db.select({ completedAttempts: sql<number>`count(*)` }).from(missionAttempts).where(eq(missionAttempts.status, "completed")),
    db.select({ totalBadges: sql<number>`count(*)` }).from(nftBadges),
    db.select({ totalRewards: sql<number>`count(*)` }).from(rewards),
    db.select({ activeSessions: sql<number>`count(*)` }).from(arenaSessions).where(eq(arenaSessions.status, "active")),
    db.select({ totalParticipants: sql<number>`count(*)` }).from(eventParticipants),
  ]);

  // Recent activity
  const recentAttempts = await db
    .select({
      id: missionAttempts.id,
      userId: missionAttempts.userId,
      gameId: missionAttempts.gameId,
      score: missionAttempts.score,
      status: missionAttempts.status,
      completedAt: missionAttempts.completedAt,
      playerName: profiles.username,
      playerEmoji: profiles.emoji,
      gameTitle: games.title,
    })
    .from(missionAttempts)
    .leftJoin(profiles, eq(missionAttempts.userId, profiles.userId))
    .leftJoin(games, eq(missionAttempts.gameId, games.id))
    .orderBy(sql`${missionAttempts.completedAt} desc`)
    .limit(10);

  // Newest players
  const newestPlayers = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      emoji: profiles.emoji,
      xp: profiles.xp,
      persona: profiles.persona,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .orderBy(sql`${profiles.createdAt} desc`)
    .limit(5);

  return NextResponse.json({
    stats: {
      totalPlayers: Number(totalPlayers),
      totalGames: Number(totalGames),
      totalEvents: Number(totalEvents),
      totalAttempts: Number(totalAttempts),
      completedAttempts: Number(completedAttempts),
      totalBadges: Number(totalBadges),
      totalRewards: Number(totalRewards),
      activeSessions: Number(activeSessions),
      totalParticipants: Number(totalParticipants),
      completionRate: totalAttempts > 0 ? Math.round((Number(completedAttempts) / Number(totalAttempts)) * 100) : 0,
    },
    recentAttempts,
    newestPlayers,
  });
}
