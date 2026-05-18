import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, challenges } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }
  const results = await db.select().from(challenges);
  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }
  const body = await req.json();
  const [challenge] = await db.insert(challenges).values(body).returning();
  return NextResponse.json(challenge, { status: 201 });
}
