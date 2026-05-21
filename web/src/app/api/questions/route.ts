import { NextRequest, NextResponse } from "next/server";
import { eq, and, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, quizQuestions } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const themes = searchParams.getAll("theme");

  const conditions = [eq(quizQuestions.active, true)];
  if (themes.length > 0) conditions.push(inArray(quizQuestions.theme, themes));

  const results = await db
    .select()
    .from(quizQuestions)
    .where(and(...conditions));

  return NextResponse.json(results);
}
