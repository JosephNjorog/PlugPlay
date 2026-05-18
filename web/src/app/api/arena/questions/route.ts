import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, arenaQuestions } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic");

  const results = topic
    ? await db.select().from(arenaQuestions).where(eq(arenaQuestions.topic, topic))
    : await db.select().from(arenaQuestions);

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const body = await req.json();
  const [q] = await db.insert(arenaQuestions).values(body).returning();
  return NextResponse.json(q, { status: 201 });
}
