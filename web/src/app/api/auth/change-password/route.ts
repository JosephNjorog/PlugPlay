import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = schema.parse(await req.json());

  // Get password_hash from users table via profiles join
  const rows = await db.execute(sql`
    SELECT u.id AS user_id, u.password_hash
    FROM   users u
    JOIN   profiles p ON p.user_id = u.id
    WHERE  p.id = ${session.user.id}
    LIMIT  1
  `);
  const record = (rows as any).rows?.[0] ?? (rows as any)[0];
  if (!record) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, record.password_hash);
  if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

  const newHash = await bcrypt.hash(newPassword, 12);
  await db.execute(sql`UPDATE users SET password_hash = ${newHash}, updated_at = NOW() WHERE id = ${record.user_id}`);

  return NextResponse.json({ success: true });
}
