import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db, quizQuestions } from "@/lib/db";

const patchSchema = z.object({
  theme: z.string().min(1).optional(),
  question: z.string().min(5).optional(),
  options: z.array(z.string().min(1)).length(4).optional(),
  answer: z.number().int().min(0).max(3).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const body = patchSchema.parse(await req.json());
  const [updated] = await db
    .update(quizQuestions)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(quizQuestions.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  await db.delete(quizQuestions).where(eq(quizQuestions.id, id));
  return NextResponse.json({ success: true });
}
