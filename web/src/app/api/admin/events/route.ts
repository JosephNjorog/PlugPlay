import { NextRequest, NextResponse } from "next/server";
import { desc, like, eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, events, eventParticipants } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-logger";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const status = searchParams.get("status");

  try {
    const conditions: any[] = [];
    if (search) conditions.push(like(events.title, `%${search}%`));
    if (status && status !== "all") conditions.push(eq(events.status, status));

    const query = db
      .select({
        ...events,
        participantCount: sql<number>`(SELECT COUNT(*) FROM event_participants WHERE event_id = ${events.id})`,
      })
      .from(events)
      .orderBy(desc(events.createdAt));

    const results = conditions.length
      ? await query.where(conditions.length === 1 ? conditions[0] : and(...conditions))
      : await query;

    return NextResponse.json(
      results.map((r) => ({ ...r, participantCount: Number(r.participantCount) }))
    );
  } catch (err) {
    console.error("admin/events GET error:", err);
    return NextResponse.json({ error: "Failed to fetch events", detail: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const body = await req.json();
  const isSuperAdmin = (session?.user as any)?.isSuperAdmin;

  const [event] = await db
    .insert(events)
    .values({
      ...body,
      hostUserId: session!.user!.id,
      status: isSuperAdmin ? body.status || "live" : "draft",
      requiresApproval: !isSuperAdmin,
    })
    .returning();

  logAdminAction({
    adminId: (session!.user as any).id,
    adminName: session!.user!.name ?? "Admin",
    action: "create_event",
    entityType: "event",
    entityId: event.id,
    details: { title: event.title, status: event.status },
  });
  return NextResponse.json(event, { status: 201 });
}
