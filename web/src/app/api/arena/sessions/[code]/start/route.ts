import { NextRequest, NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, arenaSessions, arenaQuestions } from "@/lib/db";
import { pusherServer, arenaChannel, ARENA_EVENTS } from "@/lib/pusher";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const [arenaSession] = await db
    .select()
    .from(arenaSessions)
    .where(eq(arenaSessions.code, code.toUpperCase()))
    .limit(1);

  if (!arenaSession) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  // Update session status
  await db
    .update(arenaSessions)
    .set({ status: "active", roundIndex: 0 })
    .where(eq(arenaSessions.id, arenaSession.id));

  // Normalize topic: "Avalanche Basics" → "avalanche_basics"
  const topic = (arenaSession.topic || "avalanche_basics")
    .toLowerCase()
    .replace(/[\s&]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  // Fetch questions for the topic
  const questions = await db
    .select()
    .from(arenaQuestions)
    .where(eq(arenaQuestions.topic, topic))
    .limit(20);

  // Notify all players
  await pusherServer.trigger(arenaChannel(code), ARENA_EVENTS.SESSION_STARTED, {
    totalQuestions: questions.length,
    topic: arenaSession.topic,
  });

  // Push first question
  if (questions.length > 0) {
    const q = questions[0];
    await pusherServer.trigger(arenaChannel(code), ARENA_EVENTS.QUESTION_PUSHED, {
      questionId: q.id,
      question: q.question,
      options: q.options,
      roundIndex: 0,
      timeLimit: 15,
    });
  }

  return NextResponse.json({ success: true, questionCount: questions.length });
}
