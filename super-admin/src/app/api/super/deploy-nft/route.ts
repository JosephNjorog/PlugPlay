import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { ethers } from "ethers";

// Minimal ERC-721 bytecode + ABI for deployment
// In production, compile with hardhat/foundry and use the full artifact
const ERC721_ABI = [
  "constructor(string name, string symbol, string baseURI)",
  "function mintBadge(address to, uint256 tokenId) external",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

// Minimal ERC-721 bytecode (OpenZeppelin-compatible)
// This is a placeholder — in production, compile from source
const BYTECODE = "0x"; // Replace with compiled bytecode from hardhat artifact

async function requireSuperAdmin() {
  const session = await auth();
  if (!session) return null;
  return session;
}

export async function POST(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, symbol, baseUri } = await req.json();
  if (!name || !symbol || !baseUri) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const privateKey = process.env.FUJI_MINTER_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json({ error: "FUJI_MINTER_PRIVATE_KEY not configured" }, { status: 500 });
  }

  if (BYTECODE === "0x") {
    // Simulation mode for development — return a mock address
    const mockAddress = "0x" + Buffer.from(name + Date.now()).toString("hex").slice(0, 40);
    const mockTx = "0x" + Buffer.from("simulation" + Date.now()).toString("hex").slice(0, 64);

    await db.execute(sql`
      INSERT INTO app_settings (key, value, description)
      VALUES ('nft_contract_address', ${mockAddress}, 'Deployed NFT contract address on Fuji')
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `);

    return NextResponse.json({ address: mockAddress, txHash: mockTx, simulated: true });
  }

  try {
    const provider = new ethers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
    const wallet = new ethers.Wallet(privateKey, provider);

    const factory = new ethers.ContractFactory(ERC721_ABI, BYTECODE, wallet);
    const contract = await factory.deploy(name, symbol, baseUri);
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    const txHash = contract.deploymentTransaction()?.hash || "";

    await db.execute(sql`
      INSERT INTO app_settings (key, value, description)
      VALUES ('nft_contract_address', ${address}, 'Deployed NFT contract address on Fuji')
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `);

    return NextResponse.json({ address, txHash });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Deploy failed" }, { status: 500 });
  }
}
