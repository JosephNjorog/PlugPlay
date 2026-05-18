import { NextRequest, NextResponse } from "next/server";
import { eq, like, and, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, games } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const persona = searchParams.get("persona");
  const category = searchParams.get("category");

  const conditions: any[] = [];
  if (search) conditions.push(like(games.title, `%${search}%`));
  if (persona) conditions.push(eq(games.persona, persona));
  if (category) conditions.push(eq(games.category, category));

  const results = conditions.length
    ? await db.select().from(games).where(and(...conditions))
    : await db.select().from(games);

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }
  const body = await req.json();
  const [game] = await db.insert(games).values(body).returning();
  return NextResponse.json(game, { status: 201 });
}
