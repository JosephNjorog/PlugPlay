import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, events, eventParticipants } from "@/lib/db";

const syncSchema = z.object({
  eventId: z.string().uuid(),
  lumaEventId: z.string().optional(),
  csvData: z.array(z.object({ email: z.string().email(), name: z.string().optional() })).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const body = syncSchema.parse(await req.json());
  const { eventId, lumaEventId, csvData } = body;

  let attendees: { email: string; name?: string }[] = [];
  let source: "luma_api" | "luma_csv" = "luma_csv";

  // Mode A: Luma API
  if (lumaEventId && process.env.LUMA_API_KEY) {
    source = "luma_api";
    try {
      const lumaRes = await fetch(`https://api.lu.ma/public/v1/event/get-guests?event_api_id=${lumaEventId}`, {
        headers: { "x-luma-api-key": process.env.LUMA_API_KEY },
      });
      const lumaData = await lumaRes.json();
      attendees = (lumaData.entries || []).map((e: any) => ({
        email: e.guest?.email,
        name: e.guest?.name,
      })).filter((a: any) => a.email);
    } catch (err) {
      return NextResponse.json({ error: "Luma API error" }, { status: 503 });
    }
  } else if (csvData) {
    attendees = csvData;
  }

  if (attendees.length === 0) {
    return NextResponse.json({ matched: 0, preRegistered: 0, total: 0 });
  }

  const emails = attendees.map((a) => a.email.toLowerCase());

  // Match emails against users table, return profiles.id keyed by email
  const rows = await db.execute(sql`
    SELECT u.email, p.id AS profile_id
    FROM users u
    JOIN profiles p ON p.user_id = u.id
    WHERE u.email = ANY(${emails})
  `);
  const existingProfiles = ((rows as any).rows ?? (rows as any)) as { email: string; profile_id: string }[];

  const profileMap = new Map(existingProfiles.map((p) => [p.email, p.profile_id]));

  let matched = 0;
  let preRegistered = 0;

  for (const attendee of attendees) {
    const email = attendee.email.toLowerCase();
    const userId = profileMap.get(email);

    if (userId) {
      // Matched user — upsert participant
      await db
        .insert(eventParticipants)
        .values({
          eventId,
          userId,
          lumaCheckedIn: true,
          lumaEmail: email,
          checkInSource: source,
        })
        .onConflictDoNothing();
      matched++;
    } else {
      // Pre-registration placeholder (no userId)
      // We store luma_email for auto-activation on sign-up
      await db
        .insert(eventParticipants)
        .values({
          eventId,
          userId: null as any, // will be filled on first sign-in
          lumaCheckedIn: false,
          lumaEmail: email,
          checkInSource: source,
        })
        .onConflictDoNothing();
      preRegistered++;
    }
  }

  // Update event with lumaEventId if provided
  if (lumaEventId) {
    await db.update(events).set({ lumaEventId }).where(eq(events.id, eventId));
  }

  return NextResponse.json({ matched, preRegistered, total: attendees.length });
}
