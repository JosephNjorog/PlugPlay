import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, missionAttempts, profiles, games } from "@/lib/db";
import { verifyOnChainTx } from "@/lib/blockchain";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "pending";

  const results = await db
    .select({
      attempt: missionAttempts,
      playerName: profiles.username,
      playerEmoji: profiles.emoji,
      gameTitle: games.title,
      gameCategory: games.category,
    })
    .from(missionAttempts)
    .leftJoin(profiles, eq(missionAttempts.playerId, profiles.id))
    .leftJoin(games, eq(missionAttempts.gameId, games.id))
    .where(eq(missionAttempts.status, status))
    .orderBy(desc(missionAttempts.createdAt))
    .limit(50);

  return NextResponse.json(results);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const { attemptId, action, txHash } = await req.json();

  if (action === "approve") {
    const [updated] = await db
      .update(missionAttempts)
      .set({ status: "verified", verified: true })
      .where(eq(missionAttempts.id, attemptId))
      .returning();
    return NextResponse.json(updated);
  }

  if (action === "reject") {
    const [updated] = await db
      .update(missionAttempts)
      .set({ status: "failed" })
      .where(eq(missionAttempts.id, attemptId))
      .returning();
    return NextResponse.json(updated);
  }

  if (action === "verify-onchain" && txHash) {
    const result = await verifyOnChainTx({ txHash });
    const [updated] = await db
      .update(missionAttempts)
      .set({
        verified: result.verified,
        status: result.verified ? "verified" : "failed",
        txHash,
      })
      .where(eq(missionAttempts.id, attemptId))
      .returning();
    return NextResponse.json({ attempt: updated, verification: result });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
