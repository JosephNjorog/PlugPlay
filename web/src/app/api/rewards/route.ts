import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, rewards, nftBadges } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [userRewards, badges] = await Promise.all([
    db
      .select()
      .from(rewards)
      .where(eq(rewards.userId, session.user.id))
      .orderBy(desc(rewards.createdAt)),
    db
      .select()
      .from(nftBadges)
      .where(eq(nftBadges.userId, session.user.id))
      .orderBy(desc(nftBadges.mintedAt)),
  ]);

  return NextResponse.json({ rewards: userRewards, badges });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rewardId } = await req.json();

  const [updated] = await db
    .update(rewards)
    .set({ claimed: true, claimedAt: new Date() })
    .where(and(eq(rewards.id, rewardId), eq(rewards.userId, session.user.id)))
    .returning();

  return NextResponse.json(updated);
}
