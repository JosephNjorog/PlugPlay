import { NextRequest, NextResponse } from "next/server";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db, quizQuestions } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-logger";

const questionSchema = z.object({
  theme: z.string().min(1),
  question: z.string().min(5),
  options: z.array(z.string().min(1)).length(4),
  answer: z.number().int().min(0).max(3),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  active: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const theme = searchParams.get("theme");
  const difficulty = searchParams.get("difficulty");

  const conditions = [];
  if (theme) conditions.push(eq(quizQuestions.theme, theme));
  if (difficulty) conditions.push(eq(quizQuestions.difficulty, difficulty));

  const results = await db
    .select()
    .from(quizQuestions)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(quizQuestions.theme), asc(quizQuestions.createdAt));

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const body = questionSchema.parse(await req.json());
  const [question] = await db.insert(quizQuestions).values(body).returning();
  logAdminAction({
    adminId: (session!.user as any).id,
    adminName: session!.user!.name ?? "Admin",
    action: "create_question",
    entityType: "question",
    entityId: question.id,
    details: { theme: body.theme, difficulty: body.difficulty },
  });
  return NextResponse.json(question, { status: 201 });
}
