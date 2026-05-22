import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
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
  if (arenaSession.status !== "active") {
    return NextResponse.json({ error: "Session not active" }, { status: 400 });
  }

  const nextRound = (arenaSession.roundIndex || 0) + 1;

  // Normalize topic: "Avalanche Basics" → "avalanche_basics"
  const topic = (arenaSession.topic || "avalanche_basics")
    .toLowerCase()
    .replace(/[\s&]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  const questions = await db
    .select()
    .from(arenaQuestions)
    .where(eq(arenaQuestions.topic, topic))
    .limit(20);

  if (nextRound >= questions.length) {
    // No more questions — end the session
    await db
      .update(arenaSessions)
      .set({ status: "ended", endedAt: new Date() })
      .where(eq(arenaSessions.id, arenaSession.id));

    await pusherServer.trigger(arenaChannel(code), ARENA_EVENTS.SESSION_ENDED, {
      message: "All questions completed!",
    });

    return NextResponse.json({ done: true, totalQuestions: questions.length });
  }

  await db
    .update(arenaSessions)
    .set({ roundIndex: nextRound })
    .where(eq(arenaSessions.id, arenaSession.id));

  const q = questions[nextRound];
  await pusherServer.trigger(arenaChannel(code), ARENA_EVENTS.QUESTION_PUSHED, {
    questionId: q.id,
    question: q.question,
    options: q.options,
    roundIndex: nextRound,
    timeLimit: 15,
  });

  return NextResponse.json({
    done: false,
    roundIndex: nextRound,
    totalQuestions: questions.length,
  });
}
