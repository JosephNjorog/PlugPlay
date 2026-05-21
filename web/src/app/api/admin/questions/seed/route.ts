import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-logger";

const DEFAULT_QUESTIONS = [
  // ── Avalanche Basics ──────────────────────────────────────────────────────
  { theme: "Avalanche Basics", question: "What is the native currency of Avalanche?", options: ["ETH", "AVAX", "SOL", "BNB"], answer: 1, difficulty: "beginner" },
  { theme: "Avalanche Basics", question: "Avalanche Fuji is a:", options: ["Mainnet", "Sidechain", "Testnet", "Layer 2"], answer: 2, difficulty: "beginner" },
  { theme: "Avalanche Basics", question: "Avalanche uses which consensus mechanism?", options: ["Proof of Work", "Proof of Stake", "Snowman", "Delegated PoS"], answer: 2, difficulty: "beginner" },
  { theme: "Avalanche Basics", question: "The Avalanche C-Chain is compatible with:", options: ["Solana VM", "EVM", "WASM", "CosmWasm"], answer: 1, difficulty: "beginner" },
  { theme: "Avalanche Basics", question: "What is the Avalanche Explorer called?", options: ["Etherscan", "Snowtrace", "Solscan", "BscScan"], answer: 1, difficulty: "beginner" },
  // ── DeFi & Staking ────────────────────────────────────────────────────────
  { theme: "DeFi & Staking", question: "What does DeFi stand for?", options: ["Digital Finance", "Decentralized Finance", "Deferred Finance", "Distributed Finance"], answer: 1, difficulty: "beginner" },
  { theme: "DeFi & Staking", question: "Staking involves:", options: ["Mining blocks", "Locking tokens to secure the network", "Selling NFTs", "Building dApps"], answer: 1, difficulty: "beginner" },
  { theme: "DeFi & Staking", question: "A liquidity pool holds:", options: ["NFTs only", "FIAT currency", "Pairs of tokens for trading", "Validator keys"], answer: 2, difficulty: "intermediate" },
  { theme: "DeFi & Staking", question: "Impermanent loss happens when:", options: ["Gas fees spike", "Prices diverge from when you added liquidity", "A hack occurs", "Staking ends"], answer: 1, difficulty: "intermediate" },
  { theme: "DeFi & Staking", question: "Yield farming is the practice of:", options: ["Growing crypto physically", "Moving liquidity to earn rewards", "Mining AVAX", "Burning tokens"], answer: 1, difficulty: "intermediate" },
  // ── Smart Contracts ───────────────────────────────────────────────────────
  { theme: "Smart Contracts", question: "Smart contracts execute:", options: ["Only on Ethereum", "Only with human approval", "Automatically when conditions are met", "Only on weekdays"], answer: 2, difficulty: "beginner" },
  { theme: "Smart Contracts", question: "Solidity is used to write:", options: ["Frontend apps", "Smart contracts on EVM", "Database queries", "Network protocols"], answer: 1, difficulty: "beginner" },
  { theme: "Smart Contracts", question: "What is gas in EVM blockchains?", options: ["Network fuel", "A cryptocurrency", "A fee for computation", "A consensus vote"], answer: 2, difficulty: "beginner" },
  { theme: "Smart Contracts", question: "ABI stands for:", options: ["Avalanche Block Interface", "Application Binary Interface", "Asset Bridge Index", "Automated Bot Integration"], answer: 1, difficulty: "intermediate" },
  { theme: "Smart Contracts", question: "Token standard on Avalanche C-Chain for fungible tokens:", options: ["ERC-721", "ERC-1155", "ERC-20", "BEP-20"], answer: 2, difficulty: "intermediate" },
  // ── NFTs & Bridges ────────────────────────────────────────────────────────
  { theme: "NFTs & Bridges", question: "NFT stands for:", options: ["New Financial Token", "Non-Fungible Token", "Network File Transfer", "Node Finality Test"], answer: 1, difficulty: "beginner" },
  { theme: "NFTs & Bridges", question: "ERC-721 is the standard for:", options: ["Fungible tokens", "Non-fungible tokens", "Stablecoins", "Governance tokens"], answer: 1, difficulty: "beginner" },
  { theme: "NFTs & Bridges", question: "A bridge in blockchain allows:", options: ["Physical connections", "Cross-chain asset transfers", "Mining hardware connection", "Node syncing"], answer: 1, difficulty: "intermediate" },
  { theme: "NFTs & Bridges", question: "IPFS is used for NFTs to store:", options: ["Private keys", "Smart contracts", "Metadata and images", "Validator data"], answer: 2, difficulty: "intermediate" },
  { theme: "NFTs & Bridges", question: "Core is Avalanche's official:", options: ["Exchange", "Wallet", "Bridge", "DEX"], answer: 1, difficulty: "beginner" },
  // ── Consensus & Validators ────────────────────────────────────────────────
  { theme: "Consensus & Validators", question: "Validators in Proof of Stake:", options: ["Mine blocks using GPUs", "Lock tokens to validate transactions", "Issue tokens to users", "Run the Luma API"], answer: 1, difficulty: "intermediate" },
  { theme: "Consensus & Validators", question: "Snowman consensus is used on:", options: ["Bitcoin", "Ethereum", "Avalanche C-Chain and P-Chain", "Solana"], answer: 2, difficulty: "intermediate" },
  { theme: "Consensus & Validators", question: "What is slashing?", options: ["Reducing transaction fees", "Punishing validators for misbehavior", "Burning NFTs", "Splitting a blockchain"], answer: 1, difficulty: "advanced" },
  { theme: "Consensus & Validators", question: "The minimum stake to validate on Avalanche is:", options: ["10 AVAX", "100 AVAX", "2000 AVAX", "500 AVAX"], answer: 2, difficulty: "intermediate" },
  { theme: "Consensus & Validators", question: "Finality on Avalanche is achieved in approximately:", options: ["10 minutes", "2 seconds", "1 hour", "30 seconds"], answer: 1, difficulty: "beginner" },
] as const;

export async function POST() {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  // Ensure table exists (same pattern as password reset tokens)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      theme       TEXT        NOT NULL,
      question    TEXT        NOT NULL,
      options     JSONB       NOT NULL,
      answer      INTEGER     NOT NULL,
      difficulty  TEXT        NOT NULL DEFAULT 'beginner',
      active      BOOLEAN     NOT NULL DEFAULT TRUE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  let inserted = 0;
  for (const q of DEFAULT_QUESTIONS) {
    // Skip if exact question already exists
    const existing = await db.execute(
      sql`SELECT id FROM quiz_questions WHERE question = ${q.question} LIMIT 1`
    );
    const rows = (existing as any).rows ?? (existing as any);
    if (rows.length > 0) continue;

    await db.execute(sql`
      INSERT INTO quiz_questions (theme, question, options, answer, difficulty)
      VALUES (${q.theme}, ${q.question}, ${JSON.stringify(q.options)}, ${q.answer}, ${q.difficulty})
    `);
    inserted++;
  }

  logAdminAction({
    adminId: (session!.user as any).id,
    adminName: session!.user!.name ?? "Admin",
    action: "seed_questions",
    entityType: "question",
    details: { inserted, total: DEFAULT_QUESTIONS.length },
  });
  return NextResponse.json({ inserted, total: DEFAULT_QUESTIONS.length });
}
