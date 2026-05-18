import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, profiles } from "@/lib/db";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(2).max(32),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, username } = registerSchema.parse(body);

    // Check if email already exists
    const [existing] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.email, email.toLowerCase()))
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [user] = await db
      .insert(profiles)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        username,
        emoji: "🎮",
        xp: 0,
        level: 1,
        stage: "newcomer",
        streak: 0,
        isAdmin: false,
        isSuperAdmin: false,
        onboardingDone: false,
      })
      .returning({ id: profiles.id, email: profiles.email, username: profiles.username });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
