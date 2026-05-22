import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, arenaSessions, arenaPlayers } from "@/lib/db";
import { pusherServer, arenaChannel, ARENA_EVENTS } from "@/lib/pusher";

const joinSchema = z.object({
  nickname: z.string().min(1).max(32),
  walletAddress: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const session = await auth();
  const body = joinSchema.parse(await req.json());

  const [arenaSession] = await db
    .select()
    .from(arenaSessions)
    .where(eq(arenaSessions.code, code.toUpperCase()))
    .limit(1);

  if (!arenaSession) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (arenaSession.status === "ended") {
    return NextResponse.json({ error: "Session has ended" }, { status: 400 });
  }

  const [player] = await db
    .insert(arenaPlayers)
    .values({
      sessionId: arenaSession.id,
      userId: session?.user?.id,
      nickname: body.nickname,
      walletAddress: body.walletAddress,
      score: 0,
      correctAnswers: 0,
    })
    .onConflictDoNothing()
    .returning();

  if (!player) {
    return NextResponse.json({ error: "Nickname already taken in this session" }, { status: 409 });
  }

  const [{ value: playerCount }] = await db
    .select({ value: count() })
    .from(arenaPlayers)
    .where(eq(arenaPlayers.sessionId, arenaSession.id));

  await pusherServer.trigger(arenaChannel(code), ARENA_EVENTS.PLAYER_JOINED, {
    playerId: player.id,
    nickname: player.nickname,
    playerCount: Number(playerCount),
  });

  return NextResponse.json({ player, session: arenaSession, playerCount: Number(playerCount) });
}
