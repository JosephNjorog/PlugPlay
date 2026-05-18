import { ethers } from "ethers";

export const FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";
export const FUJI_CHAIN_ID = 43113;
export const SNOWTRACE_API = "https://api-testnet.snowtrace.io/api";

// Minimal ERC-721 ABI for minting
export const BADGE_ABI = [
  "function mint(address to, string memory tokenURI) external returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

// ERC-721 contract bytecode (placeholder - deploy via Super Admin)
export const BADGE_BYTECODE = `0x60806040...`; // Full bytecode set via deployment

export function getFujiProvider() {
  return new ethers.JsonRpcProvider(FUJI_RPC);
}

export function getMinterWallet(provider: ethers.Provider) {
  const privateKey = process.env.FUJI_MINTER_PRIVATE_KEY;
  if (!privateKey) throw new Error("FUJI_MINTER_PRIVATE_KEY not configured");
  return new ethers.Wallet(privateKey, provider);
}

export async function mintBadgeOnChain(params: {
  walletAddress: string;
  metadataUri: string;
  contractAddress: string;
}): Promise<{ tokenId: number; txHash: string }> {
  const provider = getFujiProvider();
  const minter = getMinterWallet(provider);
  const contract = new ethers.Contract(params.contractAddress, BADGE_ABI, minter);

  const tx = await contract.mint(params.walletAddress, params.metadataUri);
  const receipt = await tx.wait();

  // Parse Transfer event to get tokenId
  const transferEvent = receipt.logs.find((log: any) => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === "Transfer";
    } catch {
      return false;
    }
  });

  let tokenId = 0;
  if (transferEvent) {
    const parsed = contract.interface.parseLog(transferEvent);
    tokenId = Number(parsed?.args[2] || 0);
  }

  return { tokenId, txHash: receipt.hash };
}

export async function verifyOnChainTx(params: {
  txHash: string;
  expectedFrom?: string;
}): Promise<{ verified: boolean; status: string }> {
  const url = `${SNOWTRACE_API}?module=transaction&action=gettxreceiptstatus&txhash=${params.txHash}&apikey=${process.env.SNOWTRACE_API_KEY || ""}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "1") {
      return { verified: false, status: "API error" };
    }

    const txStatus = data.result?.status;
    if (txStatus !== "1") {
      return { verified: false, status: "Transaction failed or not found" };
    }

    return { verified: true, status: "verified" };
  } catch {
    return { verified: false, status: "Network error" };
  }
}

export function buildMetadataUri(params: {
  title: string;
  rarity: string;
  gameId?: string;
  emoji?: string;
}): string {
  // In production, upload to IPFS. For now, return a data URI or configured base URL.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://plugplay.arena";
  const meta = {
    name: params.title,
    description: `Plug n' Play Arena Badge — ${params.rarity} tier`,
    image: `${baseUrl}/api/badge-image/${params.gameId || "default"}`,
    attributes: [
      { trait_type: "Rarity", value: params.rarity },
      { trait_type: "Platform", value: "Plug n' Play Arena" },
    ],
  };
  const encoded = Buffer.from(JSON.stringify(meta)).toString("base64");
  return `data:application/json;base64,${encoded}`;
}
