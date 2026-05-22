import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db, arenaSessions, arenaPlayers, arenaQuestions, arenaAnswers } from "@/lib/db";
import { pusherServer, arenaChannel, ARENA_EVENTS } from "@/lib/pusher";

const answerSchema = z.object({
  playerId: z.string().uuid(),
  questionId: z.string().uuid(),
  answer: z.number().min(-1).max(3),
  responseTimeMs: z.number(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  let body: z.infer<typeof answerSchema>;
  try {
    body = answerSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const [session] = await db
    .select()
    .from(arenaSessions)
    .where(eq(arenaSessions.code, code.toUpperCase()))
    .limit(1);

  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Session not active" }, { status: 400 });
  }

  const [question] = await db
    .select()
    .from(arenaQuestions)
    .where(eq(arenaQuestions.id, body.questionId))
    .limit(1);

  if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  const isCorrect = body.answer === question.answer;
  const maxTime = 15000;
  const speedBonus = isCorrect
    ? Math.round(Math.max(0, (maxTime - body.responseTimeMs) / maxTime) * 500)
    : 0;
  const pointsEarned = isCorrect ? 1000 + speedBonus : 0;

  // Record the answer
  await db.insert(arenaAnswers).values({
    sessionId: session.id,
    playerId: body.playerId,
    questionId: body.questionId,
    answer: body.answer,
    isCorrect,
    responseTimeMs: body.responseTimeMs,
    pointsEarned,
  }).onConflictDoNothing();

  // Update player score
  if (isCorrect) {
    const [player] = await db
      .select()
      .from(arenaPlayers)
      .where(eq(arenaPlayers.id, body.playerId))
      .limit(1);

    if (player) {
      await db
        .update(arenaPlayers)
        .set({
          score: (player.score || 0) + pointsEarned,
          correctAnswers: (player.correctAnswers || 0) + 1,
        })
        .where(eq(arenaPlayers.id, body.playerId));
    }
  }

  // Broadcast updated leaderboard
  const leaderboard = await db
    .select()
    .from(arenaPlayers)
    .where(eq(arenaPlayers.sessionId, session.id))
    .orderBy(desc(arenaPlayers.score))
    .limit(20);

  await pusherServer.trigger(arenaChannel(code), ARENA_EVENTS.LEADERBOARD_UPDATE, {
    leaderboard: leaderboard.map((p, i) => ({ ...p, rank: i + 1 })),
  });

  return NextResponse.json({
    isCorrect,
    correctAnswer: question.answer,
    explanation: question.explanation,
    pointsEarned,
  });
}
