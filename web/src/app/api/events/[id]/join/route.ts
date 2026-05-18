import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, events, eventParticipants } from "@/lib/db";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!event || event.status !== "live") {
    return NextResponse.json({ error: "Event not available" }, { status: 404 });
  }

  // Upsert participant
  await db
    .insert(eventParticipants)
    .values({
      eventId: id,
      userId: session.user.id,
      checkInSource: "self",
    })
    .onConflictDoNothing();

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db
    .delete(eventParticipants)
    .where(
      and(
        eq(eventParticipants.eventId, id),
        eq(eventParticipants.userId, session.user.id)
      )
    );

  return NextResponse.json({ success: true });
}
