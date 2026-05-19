import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(2).max(32),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, username } = registerSchema.parse(body);

    // Check if email already registered
    const existing = await db.execute(
      sql`SELECT id FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`
    );
    if ((existing as any).rows?.length || (existing as any)[0]) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Insert into users table (triggers handle_new_user to auto-create a profile)
    const userRows = await db.execute(
      sql`INSERT INTO users (email, password_hash) VALUES (${email.toLowerCase()}, ${passwordHash}) RETURNING id`
    );
    const newUserId = (userRows as any).rows?.[0]?.id ?? (userRows as any)[0]?.id;
    if (!newUserId) throw new Error("Failed to create user");

    // Update the auto-created profile (or create it if trigger didn't fire)
    await db.execute(sql`
      INSERT INTO profiles (user_id, username, persona, emoji, onboarding_done)
      VALUES (${newUserId}, ${username}, 'crypto_curious', '🎮', false)
      ON CONFLICT (user_id) DO UPDATE
        SET username        = EXCLUDED.username,
            persona         = 'crypto_curious',
            emoji           = '🎮',
            onboarding_done = false,
            updated_at      = NOW()
    `);

    // Return the profile id (main app identifier)
    const profileRows = await db.execute(
      sql`SELECT id FROM profiles WHERE user_id = ${newUserId} LIMIT 1`
    );
    const profileId = (profileRows as any).rows?.[0]?.id ?? (profileRows as any)[0]?.id;

    return NextResponse.json({ success: true, userId: profileId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
