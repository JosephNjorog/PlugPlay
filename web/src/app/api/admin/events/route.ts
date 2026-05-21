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

  const conditions: any[] = [];
  if (search) conditions.push(like(events.title, `%${search}%`));
  if (status && status !== "all") conditions.push(eq(events.status, status));

  const results = await db
    .select({
      event: events,
      participantCount: sql<number>`(SELECT COUNT(*) FROM event_participants WHERE event_id = ${events.id})`,
    })
    .from(events)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(events.createdAt));

  return NextResponse.json(
    results.map((r) => ({
      ...r.event,
      participantCount: Number(r.participantCount),
    }))
  );
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
