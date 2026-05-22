import { NextRequest, NextResponse } from "next/server";
import { eq, desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, arenaSessions, arenaPlayers, profiles } from "@/lib/db";
import { generateArenaCode } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const sessions = await db
    .select({
      ...arenaSessions,
      hostUsername: profiles.username,
      playerCount: sql<number>`(SELECT COUNT(*) FROM arena_players WHERE session_id = ${arenaSessions.id})`,
    })
    .from(arenaSessions)
    .leftJoin(profiles, eq(arenaSessions.hostId, profiles.id))
    .orderBy(desc(arenaSessions.createdAt))
    .limit(50);

  return NextResponse.json(sessions.map((s) => ({ ...s, playerCount: Number(s.playerCount) })));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const body = await req.json();
  let code = generateArenaCode();

  // Ensure unique code
  let attempts = 0;
  while (attempts < 5) {
    const [existing] = await db
      .select({ id: arenaSessions.id })
      .from(arenaSessions)
      .where(eq(arenaSessions.code, code))
      .limit(1);
    if (!existing) break;
    code = generateArenaCode();
    attempts++;
  }

  const [arenaSession] = await db
    .insert(arenaSessions)
    .values({
      code: code as string,
      hostId: session!.user!.id as string,
      status: "waiting" as string,
      topic: (body.topic || "Avalanche Basics") as string,
      maxPlayers: body.maxPlayers || 50,
    })
    .returning();

  return NextResponse.json(arenaSession, { status: 201 });
}
