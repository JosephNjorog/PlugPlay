import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, games, missionAttempts, challenges } from "@/lib/db";
import { and } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const session = await auth();

  // Try games first
  const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
  if (!game) {
    // Try challenges by slug
    const [challenge] = await db.select().from(challenges).where(eq(challenges.slug, gameId)).limit(1);
    if (!challenge) return NextResponse.json({ error: "Game not found" }, { status: 404 });
    return NextResponse.json({ ...challenge, type: "challenge" });
  }

  let completed = false;
  let bestScore = 0;

  if (session?.user?.id) {
    const [attempt] = await db
      .select({ score: missionAttempts.score })
      .from(missionAttempts)
      .where(
        and(
          eq(missionAttempts.userId, session.user.id),
          eq(missionAttempts.gameId, gameId),
          eq(missionAttempts.status, "completed")
        )
      )
      .orderBy(missionAttempts.score)
      .limit(1);

    if (attempt) {
      completed = true;
      bestScore = attempt.score;
    }
  }

  return NextResponse.json({ ...game, type: "game", completed, bestScore });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }
  const body = await req.json();
  const [updated] = await db.update(games).set(body).where(eq(games.id, gameId)).returning();
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }
  await db.delete(games).where(eq(games.id, gameId));
  return NextResponse.json({ success: true });
}
