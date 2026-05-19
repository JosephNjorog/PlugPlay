import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, profiles } from "@/lib/db";
import { sql } from "drizzle-orm";

const updateSchema = z.object({
  username: z.string().min(2).max(32).optional(),
  emoji: z.string().optional(),
  walletAddress: z.string().optional(),
  statusTag: z.string().max(30).optional(),
  persona: z.string().optional(),
  onboardingDone: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Raw SQL to join users for email without pulling password_hash
  const rows = await db.execute(sql`
    SELECT p.id, p.user_id, p.username, p.emoji, p.persona,
           p.xp, p.level, p.stage, p.streak,
           p.wallet_address, p.status_tag,
           p.is_admin, p.is_super_admin, p.onboarding_done,
           p.created_at, p.updated_at,
           u.email
    FROM   profiles p
    JOIN   users u ON u.id = p.user_id
    WHERE  p.id = ${session.user.id}
    LIMIT  1
  `);

  const profile = (rows as any).rows?.[0] ?? (rows as any)[0];
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updates = updateSchema.parse(body);

  const [updated] = await db
    .update(profiles)
    .set({
      ...(updates.username !== undefined && { username: updates.username }),
      ...(updates.emoji !== undefined && { emoji: updates.emoji }),
      ...(updates.walletAddress !== undefined && { walletAddress: updates.walletAddress }),
      ...(updates.statusTag !== undefined && { statusTag: updates.statusTag }),
      ...(updates.persona !== undefined && { persona: updates.persona }),
      ...(updates.onboardingDone !== undefined && { onboardingDone: updates.onboardingDone }),
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, session.user.id))
    .returning();

  return NextResponse.json(updated);
}
