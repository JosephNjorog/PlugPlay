import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { logAdminAction } from "@/lib/admin-logger";

async function requireSuperAdmin() {
  const session = await auth();
  if (!session) return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";

  let query = sql`
    SELECT id, email, username, emoji, persona, xp, is_admin, is_super_admin, created_at
    FROM profiles
    WHERE 1=1
  `;

  if (search) query = sql`${query} AND (username ILIKE ${"%" + search + "%"} OR email ILIKE ${"%" + search + "%"})`;
  if (role === "super_admin") query = sql`${query} AND is_super_admin = true`;
  else if (role === "admin") query = sql`${query} AND is_admin = true`;
  else if (role === "player") query = sql`${query} AND is_admin = false`;

  query = sql`${query} ORDER BY is_super_admin DESC, is_admin DESC, created_at DESC LIMIT 100`;

  const rows = await db.execute(query);
  const users = ((rows as any).rows ?? rows).map((u: any) => ({
    id: u.id,
    email: u.email,
    username: u.username,
    emoji: u.emoji,
    persona: u.persona,
    xp: u.xp,
    isAdmin: u.is_admin,
    isSuperAdmin: u.is_super_admin,
    createdAt: u.created_at,
  }));

  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId, role } = await req.json();
  if (!userId || !role) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const isAdmin = role === "admin" || role === "super_admin";
  const isSuperAdmin = role === "super_admin";

  await db.execute(sql`
    UPDATE profiles
    SET is_admin = ${isAdmin}, is_super_admin = ${isSuperAdmin}
    WHERE id = ${userId}
  `);

  logAdminAction({
    adminId: (session.user as any).id ?? "super-admin",
    adminName: session.user?.name ?? "Super Admin",
    adminEmail: session.user?.email,
    action: role === "player" ? "demote_to_player" : `promote_to_${role}`,
    entityType: "profile",
    entityId: userId,
    details: { newRole: role },
  });

  return NextResponse.json({ success: true });
}
