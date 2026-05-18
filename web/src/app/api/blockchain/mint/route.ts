import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, nftBadges, nftMints, appSettings, profiles } from "@/lib/db";
import { mintBadgeOnChain, buildMetadataUri } from "@/lib/blockchain";

const mintSchema = z.object({
  badgeId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { badgeId } = mintSchema.parse(await req.json());

  // Load badge
  const [badge] = await db
    .select()
    .from(nftBadges)
    .where(eq(nftBadges.id, badgeId))
    .limit(1);

  if (!badge || badge.userId !== session.user.id) {
    return NextResponse.json({ error: "Badge not found" }, { status: 404 });
  }

  // Load user wallet
  const [profile] = await db
    .select({ walletAddress: profiles.walletAddress })
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1);

  if (!profile?.walletAddress) {
    return NextResponse.json({ error: "Wallet address required to mint NFT" }, { status: 400 });
  }

  // Load contract address
  const [contractSetting] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, "nft_contract_address"))
    .limit(1);

  if (!contractSetting?.value) {
    return NextResponse.json({ error: "NFT contract not deployed" }, { status: 503 });
  }

  const metadataUri = buildMetadataUri({
    title: badge.title,
    rarity: badge.rarity,
    gameId: badge.gameId || undefined,
    emoji: badge.emoji,
  });

  try {
    const { tokenId, txHash } = await mintBadgeOnChain({
      walletAddress: profile.walletAddress,
      metadataUri,
      contractAddress: contractSetting.value,
    });

    await db.insert(nftMints).values({
      userId: session.user.id,
      gameId: badge.gameId,
      tokenId,
      txHash,
      contractAddress: contractSetting.value,
      metadataUri,
    });

    return NextResponse.json({ success: true, tokenId, txHash });
  } catch (error: any) {
    console.error("Mint error:", error);
    return NextResponse.json({ error: "Minting failed: " + error.message }, { status: 500 });
  }
}
