import { NextRequest, NextResponse } from "next/server";
import { eq, desc, count } from "drizzle-orm";
import { db, arenaSessions, arenaPlayers, arenaAnswers } from "@/lib/db";

// Public endpoint — no auth required, any player can fetch their session leaderboard
export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const [session] = await db
    .select({
      id: arenaSessions.id,
      code: arenaSessions.code,
      topic: arenaSessions.topic,
      status: arenaSessions.status,
      roundIndex: arenaSessions.roundIndex,
      maxPlayers: arenaSessions.maxPlayers,
      createdAt: arenaSessions.createdAt,
      endedAt: arenaSessions.endedAt,
    })
    .from(arenaSessions)
    .where(eq(arenaSessions.code, code.toUpperCase()))
    .limit(1);

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const players = await db
    .select({
      id: arenaPlayers.id,
      nickname: arenaPlayers.nickname,
      score: arenaPlayers.score,
      correctAnswers: arenaPlayers.correctAnswers,
      joinedAt: arenaPlayers.joinedAt,
      answersSubmitted: count(arenaAnswers.id),
    })
    .from(arenaPlayers)
    .leftJoin(arenaAnswers, eq(arenaAnswers.playerId, arenaPlayers.id))
    .where(eq(arenaPlayers.sessionId, session.id))
    .groupBy(arenaPlayers.id)
    .orderBy(desc(arenaPlayers.score));

  const leaderboard = players.map((p, i) => ({
    ...p,
    rank: i + 1,
    answersSubmitted: Number(p.answersSubmitted),
  }));

  const totalPlayers = leaderboard.length;
  const roundsPlayed = session.roundIndex ?? 0;
  const topScore = leaderboard[0]?.score ?? 0;

  return NextResponse.json({ session, leaderboard, stats: { totalPlayers, roundsPlayed, topScore } });
}
