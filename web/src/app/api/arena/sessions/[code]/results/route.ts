import { NextRequest, NextResponse } from "next/server";
import { eq, desc, count, sum, avg } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, arenaSessions, arenaPlayers, arenaAnswers } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const [arenaSession] = await db
    .select()
    .from(arenaSessions)
    .where(eq(arenaSessions.code, code.toUpperCase()))
    .limit(1);

  if (!arenaSession) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  // Full player leaderboard with per-player answer count
  const players = await db
    .select({
      id: arenaPlayers.id,
      nickname: arenaPlayers.nickname,
      score: arenaPlayers.score,
      correctAnswers: arenaPlayers.correctAnswers,
      walletAddress: arenaPlayers.walletAddress,
      joinedAt: arenaPlayers.joinedAt,
      answersSubmitted: count(arenaAnswers.id),
    })
    .from(arenaPlayers)
    .leftJoin(arenaAnswers, eq(arenaAnswers.playerId, arenaPlayers.id))
    .where(eq(arenaPlayers.sessionId, arenaSession.id))
    .groupBy(arenaPlayers.id)
    .orderBy(desc(arenaPlayers.score));

  const ranked = players.map((p, i) => ({ ...p, rank: i + 1, answersSubmitted: Number(p.answersSubmitted) }));

  // Aggregate stats
  const totalPlayers = ranked.length;
  const activePlayers = ranked.filter((p) => p.answersSubmitted > 0).length;
  const topScore = ranked[0]?.score ?? 0;
  const avgScore = totalPlayers > 0
    ? Math.round(ranked.reduce((s, p) => s + p.score, 0) / totalPlayers)
    : 0;
  const totalAnswers = ranked.reduce((s, p) => s + p.answersSubmitted, 0);
  const roundsPlayed = arenaSession.roundIndex ?? 0;

  const durationMs = arenaSession.endedAt && arenaSession.createdAt
    ? new Date(arenaSession.endedAt).getTime() - new Date(arenaSession.createdAt).getTime()
    : null;

  return NextResponse.json({
    session: arenaSession,
    stats: { totalPlayers, activePlayers, topScore, avgScore, totalAnswers, roundsPlayed, durationMs },
    leaderboard: ranked,
  });
}
