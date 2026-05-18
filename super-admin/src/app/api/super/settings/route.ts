import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function requireSuperAdmin() {
  const session = await auth();
  if (!session) return null;
  return session;
}

export async function GET() {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.execute(sql`SELECT key, value FROM app_settings`);
  const settings: Record<string, string> = {};
  ((rows as any).rows ?? rows).forEach((r: any) => { settings[r.key] = r.value; });

  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { updates } = await req.json() as { updates: Record<string, string> };
  if (!updates || Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  await Promise.all(
    Object.entries(updates).map(([key, value]) =>
      db.execute(sql`
        INSERT INTO app_settings (key, value)
        VALUES (${key}, ${value})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `)
    )
  );

  return NextResponse.json({ success: true });
}
