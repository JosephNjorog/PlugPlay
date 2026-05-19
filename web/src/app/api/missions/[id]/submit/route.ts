import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, games, missionAttempts, profiles, nftBadges, rewards } from "@/lib/db";
import { predictScore, rarityFor, xpFromScore } from "@/lib/scoring";
import { getLevelFromXP, getStageFromXP } from "@/lib/utils";

const submitSchema = z.object({
  accuracy: z.number().min(0).max(100),
  timeSpent: z.number().positive(),
  timeLimit: z.number().positive(),
  eventId: z.string().uuid().optional(),
  submissionData: z.any().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: gameId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = submitSchema.parse(await req.json());

  // Load game
  const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

  // Get attempt count
  const [{ value: attemptCount }] = await db
    .select({ value: count() })
    .from(missionAttempts)
    .where(
      and(
        eq(missionAttempts.userId, session.user.id),
        eq(missionAttempts.gameId, gameId)
      )
    );

  // Server-side scoring
  const scoreResult = predictScore({
    accuracy: body.accuracy,
    timeSpent: body.timeSpent,
    timeLimit: body.timeLimit,
    difficulty: game.difficulty as any,
    attemptNumber: Number(attemptCount) + 1,
  });

  const xpEarned = Math.round(game.xpReward * (body.accuracy / 100));
  const rarity = rarityFor(game.difficulty);

  // Insert attempt
  const [attempt] = await db
    .insert(missionAttempts)
    .values({
      userId: session.user.id,
      gameId,
      eventId: body.eventId,
      status: "completed",
      score: scoreResult.score,
      accuracy: body.accuracy,
      timeSpent: body.timeSpent,
      submissionData: body.submissionData,
      completedAt: new Date(),
    })
    .returning();

  // Award XP & update profile
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, session.user.id)).limit(1);
  const newXP = (profile.xp || 0) + xpEarned;
  const newLevel = getLevelFromXP(newXP);
  const newStage = getStageFromXP(newXP);

  await db
    .update(profiles)
    .set({ xp: newXP, level: newLevel, stage: newStage, updatedAt: new Date() })
    .where(eq(profiles.id, session.user.id));

  // Award badge if NFT reward
  let badge = null;
  if (game.rewardType === "nft" && body.accuracy >= 70) {
    const [b] = await db
      .insert(nftBadges)
      .values({
        userId: session.user.id,
        title: `${game.title} Badge`,
        rarity,
        emoji: game.emoji,
        gameId,
      })
      .returning();
    badge = b;
  }

  // Award merch/token reward
  let reward = null;
  if ((game.rewardType === "merch" || game.rewardType === "token") && body.accuracy >= 70) {
    const [r] = await db
      .insert(rewards)
      .values({
        userId: session.user.id,
        title: `${game.title} Reward`,
        description: `Earned by completing ${game.title}`,
        kind: game.rewardType as any,
        rarity,
        value: `${game.xpReward} ${game.rewardType === "token" ? "AVAX" : "voucher"}`,
        eventId: body.eventId,
      })
      .returning();
    reward = r;
  }

  return NextResponse.json({
    success: true,
    attempt,
    scoreResult,
    xpEarned,
    newXP,
    newLevel,
    badge,
    reward,
  });
}
