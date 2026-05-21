import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

const schema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { token, newPassword } = parsed.data;

    // Join to get users.id (for password update) via profile FK
    const rows = await db.execute(sql`
      SELECT t.id, t.expires_at, t.used, u.id AS users_id
      FROM password_reset_tokens t
      JOIN profiles p ON p.id = t.user_id
      JOIN users u ON u.id = p.user_id
      WHERE t.token = ${token}
      LIMIT 1
    `);
    const record = ((rows as any).rows ?? (rows as any))[0];

    if (!record) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }
    if (record.used) {
      return NextResponse.json({ error: "This reset link has already been used." }, { status: 400 });
    }
    if (new Date(record.expires_at) < new Date()) {
      return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await db.execute(sql`UPDATE users SET password_hash = ${newHash}, updated_at = NOW() WHERE id = ${record.users_id}`);
    await db.execute(sql`UPDATE password_reset_tokens SET used = TRUE WHERE id = ${record.id}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("reset-password error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
