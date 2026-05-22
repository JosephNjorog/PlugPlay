import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: profileId } = await params;

  // Verify super-admin from DB (session token may not carry isSuperAdmin on all requests)
  const callerRows = await db.execute(sql`
    SELECT is_super_admin FROM profiles WHERE id = ${(session.user as any).id} LIMIT 1
  `);
  const caller = ((callerRows as any).rows ?? callerRows)[0];
  if (!caller?.is_super_admin) {
    return NextResponse.json({ error: "Super admin required" }, { status: 403 });
  }

  // Prevent self-deletion
  if ((session.user as any).id === profileId) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  try {
    // Get the users.id before deleting (needed to delete from users table)
    const rows = await db.execute(sql`
      SELECT user_id FROM profiles WHERE id = ${profileId} LIMIT 1
    `);
    const profile = ((rows as any).rows ?? rows)[0];
    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = profile.user_id;

    // Cascade delete all user data in order (FK dependencies)
    await db.execute(sql`DELETE FROM mission_attempts      WHERE user_id = ${profileId}`);
    await db.execute(sql`DELETE FROM event_participants    WHERE user_id = ${profileId}`);
    await db.execute(sql`DELETE FROM nft_badges            WHERE user_id = ${profileId}`);
    await db.execute(sql`DELETE FROM nft_mints             WHERE user_id = ${profileId}`);
    await db.execute(sql`DELETE FROM password_reset_tokens WHERE user_id = ${profileId}`);
    // admin_activity_logs is self-bootstrapped — may not exist yet
    await db.execute(sql`
      DO $$ BEGIN
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_activity_logs') THEN
          DELETE FROM admin_activity_logs WHERE admin_id = ${profileId};
        END IF;
      END $$
    `).catch(() => {});
    await db.execute(sql`DELETE FROM profiles              WHERE id       = ${profileId}`);
    await db.execute(sql`DELETE FROM users                 WHERE id       = ${userId}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("delete-user error:", err);
    return NextResponse.json({ error: err.message ?? "Delete failed" }, { status: 500 });
  }
}
