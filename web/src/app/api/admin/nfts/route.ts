import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, nftMints, nftBadges, profiles } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const mints = await db
    .select({
      mint: nftMints,
      username: profiles.username,
      emoji: profiles.emoji,
    })
    .from(nftMints)
    .leftJoin(profiles, eq(nftMints.userId, profiles.id))
    .orderBy(desc(nftMints.mintedAt))
    .limit(100);

  const badges = await db
    .select({
      badge: nftBadges,
      username: profiles.username,
      emoji: profiles.emoji,
    })
    .from(nftBadges)
    .leftJoin(profiles, eq(nftBadges.userId, profiles.id))
    .orderBy(desc(nftBadges.mintedAt))
    .limit(100);

  return NextResponse.json({ mints, badges });
}
