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
  const { email } = schema.parse(await req.json());

  await ensureTokensTable();

  // Look up user — always return 200 to avoid email enumeration
  const rows = await db.execute(sql`SELECT id FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`);
  const user = ((rows as any).rows ?? (rows as any))[0];

  if (user) {
    // Invalidate any existing tokens for this user
    await db.execute(sql`DELETE FROM password_reset_tokens WHERE user_id = ${user.id}`);

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.execute(sql`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
    `);

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(email.toLowerCase(), resetUrl);
    } catch (err) {
      console.error("Failed to send reset email:", err);
      // Don't expose email send failure — log and move on
    }
  }

  return NextResponse.json({
    message: "If that email is registered, a reset link has been sent.",
  });
}
