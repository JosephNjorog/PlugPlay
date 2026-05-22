import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

// Bootstrap the tokens table on first use
async function ensureTokensTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID        NOT NULL,
      token       TEXT        NOT NULL UNIQUE,
      expires_at  TIMESTAMPTZ NOT NULL,
      used        BOOLEAN     NOT NULL DEFAULT FALSE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    const { email } = parsed.data;

    await ensureTokensTable();

    // Look up profile_id (FK target) via users JOIN profiles
    const rows = await db.execute(sql`
      SELECT p.id AS profile_id
      FROM users u
      JOIN profiles p ON p.user_id = u.id
      WHERE u.email = ${email.toLowerCase()}
      LIMIT 1
    `);
    const user = ((rows as any).rows ?? (rows as any))[0];

    if (user) {
      await db.execute(sql`DELETE FROM password_reset_tokens WHERE user_id = ${user.profile_id}`);

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await db.execute(sql`
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES (${user.profile_id}, ${token}, ${expiresAt.toISOString()})
      `);

      const baseUrl = process.env.APP_URL ?? "https://plugplayavax.vercel.app";
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      try {
        await sendPasswordResetEmail(email.toLowerCase(), resetUrl);
      } catch (err) {
        console.error("Failed to send reset email:", err);
      }
    }

    return NextResponse.json({
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (err: any) {
    console.error("forgot-password error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
