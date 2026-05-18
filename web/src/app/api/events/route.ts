import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, events, eventParticipants } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const format = searchParams.get("format");
  const session = await auth();

  const conditions: any[] = [];
  if (status) conditions.push(eq(events.status, status));
  else conditions.push(sql`${events.status} != 'draft'`);
  if (format) conditions.push(eq(events.format, format));

  // Non-admins only see live events
  if (!(session?.user as any)?.isAdmin) {
    conditions.push(eq(events.status, "live"));
  }

  const results = await db
    .select({
      event: events,
      participantCount: sql<number>`(SELECT COUNT(*) FROM event_participants WHERE event_id = ${events.id})`,
    })
    .from(events)
    .where(and(...conditions))
    .orderBy(desc(events.startsAt));

  // Add join status for logged-in users
  if (session?.user?.id) {
    const joinedIds = await db
      .select({ eventId: eventParticipants.eventId })
      .from(eventParticipants)
      .where(eq(eventParticipants.userId, session.user.id));
    const joinedSet = new Set(joinedIds.map((r) => r.eventId));

    return NextResponse.json(
      results.map((r) => ({
        ...r.event,
        participantCount: Number(r.participantCount),
        joined: joinedSet.has(r.event.id),
      }))
    );
  }

  return NextResponse.json(
    results.map((r) => ({
      ...r.event,
      participantCount: Number(r.participantCount),
      joined: false,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const isSuperAdmin = (session?.user as any)?.isSuperAdmin;

  const [event] = await db
    .insert(events)
    .values({
      ...body,
      hostUserId: session!.user!.id,
      status: isSuperAdmin ? "live" : "draft",
      requiresApproval: !isSuperAdmin,
    })
    .returning();

  return NextResponse.json(event, { status: 201 });
}
