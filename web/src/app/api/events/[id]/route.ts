import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, events, eventParticipants, profiles } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  // Non-admins can't see draft events
  if (event.status === "draft" && !(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const participants = await db
    .select({
      id: eventParticipants.id,
      userId: eventParticipants.userId,
      username: profiles.username,
      emoji: profiles.emoji,
      xp: profiles.xp,
      joinedAt: eventParticipants.joinedAt,
      lumaCheckedIn: eventParticipants.lumaCheckedIn,
    })
    .from(eventParticipants)
    .leftJoin(profiles, eq(eventParticipants.userId, profiles.id))
    .where(eq(eventParticipants.eventId, id));

  let joined = false;
  if (session?.user?.id) {
    const p = participants.find((p) => p.userId === session!.user!.id);
    joined = !!p;
  }

  return NextResponse.json({ ...event, participants, joined });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const [updated] = await db
    .update(events)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(events.id, id))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  await db.delete(events).where(eq(events.id, id));
  return NextResponse.json({ success: true });
}
