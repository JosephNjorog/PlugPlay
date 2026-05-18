import { NextRequest, NextResponse } from "next/server";
import { eq, and, like, or, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, games, missionAttempts } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const persona = searchParams.get("persona");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const status = searchParams.get("status") || "live";
  const gameType = searchParams.get("gameType");

  const conditions: any[] = [eq(games.status, status)];
  if (persona && persona !== "all") conditions.push(or(eq(games.persona, persona), eq(games.persona, "all"))!);
  if (category) conditions.push(eq(games.category, category));
  if (gameType) conditions.push(eq(games.gameType, gameType));
  if (search) conditions.push(like(games.title, `%${search}%`));

  const session = await auth();
  const results = await db.select().from(games).where(and(...conditions));

  // If logged in, fetch completion status
  if (session?.user?.id) {
    const completedIds = await db
      .select({ gameId: missionAttempts.gameId })
      .from(missionAttempts)
      .where(
        and(
          eq(missionAttempts.playerId, session.user.id),
          eq(missionAttempts.status, "completed")
        )
      );
    const completedSet = new Set(completedIds.map((r) => r.gameId));
    return NextResponse.json(results.map((g) => ({ ...g, completed: completedSet.has(g.id) })));
  }

  return NextResponse.json(results.map((g) => ({ ...g, completed: false })));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const [game] = await db.insert(games).values(body).returning();
  return NextResponse.json(game, { status: 201 });
}
