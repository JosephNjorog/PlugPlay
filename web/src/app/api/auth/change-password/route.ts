import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db, profiles } from "@/lib/db";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = schema.parse(await req.json());

  const [profile] = await db
    .select({ passwordHash: profiles.passwordHash })
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1);

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, profile.passwordHash);
  if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

  const newHash = await bcrypt.hash(newPassword, 12);
  await db.update(profiles).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(profiles.id, session.user.id));

  return NextResponse.json({ success: true });
}
