import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, challenges, missionAttempts } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tier = searchParams.get("tier");

  const conditions: any[] = [];
  if (tier) conditions.push(eq(challenges.tier, tier));

  const results = conditions.length
    ? await db.select().from(challenges).where(and(...conditions))
    : await db.select().from(challenges);

  const session = await auth();
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
    return NextResponse.json(results.map((c) => ({ ...c, completed: completedSet.has(c.id) })));
  }

  return NextResponse.json(results.map((c) => ({ ...c, completed: false })));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const body = await req.json();
  const [challenge] = await db.insert(challenges).values(body).returning();
  return NextResponse.json(challenge, { status: 201 });
}
