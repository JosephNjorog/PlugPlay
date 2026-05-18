import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, profiles } from "@/lib/db";

const updateSchema = z.object({
  username: z.string().min(2).max(32).optional(),
  emoji: z.string().optional(),
  walletAddress: z.string().optional(),
  statusTag: z.string().max(30).optional(),
  persona: z.enum(["student", "developer", "builder", "founder", "business"]).optional(),
  onboardingDone: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1);

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { passwordHash, ...safe } = profile;
  return NextResponse.json(safe);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updates = updateSchema.parse(body);

  const [updated] = await db
    .update(profiles)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(profiles.id, session.user.id))
    .returning();

  const { passwordHash, ...safe } = updated;
  return NextResponse.json(safe);
}
