import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function requireSuperAdmin() {
  const session = await auth();
  if (!session) return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "draft";

  const rows = await db.execute(sql`
    SELECT e.*, p.username as host_name
    FROM events e
    LEFT JOIN profiles p ON p.id = e.host_user_id
    WHERE e.status = ${status}
    ORDER BY e.created_at DESC
    LIMIT 100
  `);

  const events = ((rows as any).rows ?? rows).map((e: any) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    format: e.format,
    location: e.location,
    startsAt: e.starts_at,
    endsAt: e.ends_at,
    status: e.status,
    category: e.category,
    capacity: e.capacity,
    rewardPool: e.reward_pool,
    coverEmoji: e.cover_emoji,
    hostName: e.host_name,
  }));

  return NextResponse.json(events);
}

export async function PATCH(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, action } = await req.json();
  if (!id || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  if (action === "approve") {
    await db.execute(sql`UPDATE events SET status = 'live' WHERE id = ${id}`);
  } else if (action === "reject") {
    await db.execute(sql`UPDATE events SET status = 'ended' WHERE id = ${id}`);
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
