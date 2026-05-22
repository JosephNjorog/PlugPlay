import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, arenaSessions, arenaPlayers } from "@/lib/db";
import { pusherServer, arenaChannel, ARENA_EVENTS } from "@/lib/pusher";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const [session] = await db
    .select()
    .from(arenaSessions)
    .where(eq(arenaSessions.code, code.toUpperCase()))
    .limit(1);

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const players = await db
    .select()
    .from(arenaPlayers)
    .where(eq(arenaPlayers.sessionId, session.id))
    .orderBy(desc(arenaPlayers.score));

  const ranked = players.map((p, i) => ({ ...p, rank: i + 1 }));
  return NextResponse.json({ ...session, players: ranked });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const auth_session = await auth();
  if (!(auth_session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const [session] = await db
    .select()
    .from(arenaSessions)
    .where(eq(arenaSessions.code, code.toUpperCase()))
    .limit(1);

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  await db
    .update(arenaSessions)
    .set({ status: "ended", endedAt: new Date() })
    .where(eq(arenaSessions.id, session.id));

  const players = await db
    .select()
    .from(arenaPlayers)
    .where(eq(arenaPlayers.sessionId, session.id))
    .orderBy(desc(arenaPlayers.score));

  const leaderboard = players.map((p, i) => ({
    id: p.id,
    nickname: p.nickname,
    score: p.score,
    correctAnswers: p.correctAnswers,
    rank: i + 1,
  }));

  await pusherServer.trigger(arenaChannel(code), ARENA_EVENTS.SESSION_ENDED, {
    message: "Session ended by host",
    leaderboard,
  });

  return NextResponse.json({ success: true });
}
