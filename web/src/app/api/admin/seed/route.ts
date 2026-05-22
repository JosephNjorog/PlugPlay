import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// ─── Games ────────────────────────────────────────────────────────────────────
const GAMES = [
  // BUILDER
  { id: "avax-basics-quiz",      title: "AVAX Basics Blitz",          persona: "builder",    category: "Smart Contracts", difficulty: "Beginner",     themes: ["avalanche_basics","smart_contracts"],       description: "Race through 10 rapid-fire questions about Avalanche fundamentals.",           learningOutcome: "Understand chain architecture, consensus, and AVAX tokenomics.",       emoji: "⚡", duration: "8 min",  xpReward: 100, rewardType: "badge", eventTypes: ["hackathon","workshop"], gameType: "quiz",       status: "live" },
  { id: "deploy-first-contract", title: "Deploy Your First Contract", persona: "builder",    category: "Smart Contracts", difficulty: "Intermediate", themes: ["smart_contracts","developer_tools"],         description: "Step-by-step quiz on deploying ERC-20 contracts to Fuji testnet.",             learningOutcome: "Master the deploy workflow: compile → deploy → verify.",               emoji: "🔧", duration: "12 min", xpReward: 200, rewardType: "badge", eventTypes: ["hackathon"],             gameType: "quiz",       status: "live" },
  { id: "solidity-speedrun",     title: "Solidity Speedrun",          persona: "builder",    category: "Smart Contracts", difficulty: "Advanced",     themes: ["smart_contracts","security"],               description: "Race against the clock on Solidity security pitfalls and patterns.",          learningOutcome: "Identify re-entrancy, integer overflow, and access control bugs.",     emoji: "🏃", duration: "15 min", xpReward: 350, rewardType: "badge", eventTypes: ["hackathon"],             gameType: "quiz",       status: "live" },
  { id: "block-builder-game",    title: "Block Builder",              persona: "builder",    category: "Smart Contracts", difficulty: "Beginner",     themes: ["avalanche_basics","developer_tools"],        description: "Build correct block headers and subnet configs in this puzzle game.",          learningOutcome: "Learn block structure and Avalanche subnet parameters.",               emoji: "🧱", duration: "10 min", xpReward: 150, rewardType: "badge", eventTypes: ["workshop"],              gameType: "arcade",     status: "live" },
  { id: "gas-rush-game",         title: "Gas Rush",                   persona: "builder",    category: "Smart Contracts", difficulty: "Intermediate", themes: ["smart_contracts","gas_optimization"],        description: "Sort transactions by gas priority before the block closes.",                   learningOutcome: "Understand gas fees, priority, and mempool mechanics.",                emoji: "⛽", duration: "7 min",  xpReward: 180, rewardType: "badge", eventTypes: ["hackathon","workshop"], gameType: "arcade",     status: "live" },
  { id: "abi-decoder",           title: "ABI Decoder Challenge",      persona: "builder",    category: "Smart Contracts", difficulty: "Advanced",     themes: ["smart_contracts","developer_tools"],         description: "Match function selectors to their Solidity signatures.",                       learningOutcome: "Understand ABI encoding, function selectors, and calldata.",           emoji: "🔑", duration: "10 min", xpReward: 300, rewardType: "badge", eventTypes: ["hackathon"],             gameType: "quiz",       status: "live" },
  { id: "subnet-architect",      title: "Subnet Architect",           persona: "builder",    category: "Validators",      difficulty: "Advanced",     themes: ["validators","smart_contracts"],              description: "Design a custom subnet — choose VM, validators, and gas settings.",           learningOutcome: "Understand subnet customization and validator requirements.",          emoji: "🏗️", duration: "15 min", xpReward: 400, rewardType: "badge", eventTypes: ["hackathon"],             gameType: "quiz",       status: "live" },
  { id: "protocol-puzzle-game",  title: "Protocol Puzzle",            persona: "builder",    category: "Smart Contracts", difficulty: "Beginner",     themes: ["avalanche_basics","smart_contracts"],        description: "Arrange protocol concepts into the correct sequence.",                         learningOutcome: "Build intuition for Avalanche's layered architecture.",                emoji: "🧩", duration: "8 min",  xpReward: 120, rewardType: "badge", eventTypes: ["workshop"],              gameType: "arcade",     status: "live" },
  // DEFI_DEGEN
  { id: "defi-fundamentals",     title: "DeFi Fundamentals",          persona: "defi_degen", category: "DeFi",            difficulty: "Beginner",     themes: ["defi","wallets"],                           description: "Core DeFi concepts: AMMs, liquidity pools, yield farming.",                   learningOutcome: "Understand how DEXs, liquidity provision, and yield work.",           emoji: "💱", duration: "10 min", xpReward: 120, rewardType: "badge", eventTypes: ["workshop"],              gameType: "quiz",       status: "live" },
  { id: "trader-joe-master",     title: "Trader Joe Mastery",         persona: "defi_degen", category: "DeFi",            difficulty: "Intermediate", themes: ["defi","avalanche_basics"],                   description: "Deep dive into Trader Joe's liquidity book and veJOE mechanics.",             learningOutcome: "Master concentrated liquidity and ve-tokenomics.",                    emoji: "🤠", duration: "12 min", xpReward: 250, rewardType: "badge", eventTypes: ["hackathon"],             gameType: "quiz",       status: "live" },
  { id: "yield-optimizer",       title: "Yield Optimizer",            persona: "defi_degen", category: "DeFi",            difficulty: "Intermediate", themes: ["defi","security"],                          description: "Calculate optimal yield strategies across Benqi, Aave, and Pangolin.",        learningOutcome: "Compare yield opportunities and understand risk-reward tradeoffs.",    emoji: "📈", duration: "10 min", xpReward: 220, rewardType: "badge", eventTypes: ["hackathon"],             gameType: "quiz",       status: "live" },
  { id: "defi-diner-game",       title: "DeFi Diner",                 persona: "defi_degen", category: "DeFi",            difficulty: "Beginner",     themes: ["defi","wallets"],                           description: "Pick the right ingredients (protocols) for each DeFi recipe.",               learningOutcome: "Learn which Avalanche DeFi protocols serve which functions.",          emoji: "🍽️", duration: "8 min",  xpReward: 130, rewardType: "badge", eventTypes: ["workshop"],              gameType: "arcade",     status: "live" },
  { id: "token-toss-game",       title: "Token Toss",                 persona: "defi_degen", category: "DeFi",            difficulty: "Intermediate", themes: ["defi","bridges"],                           description: "Match DeFi tasks to the correct Avalanche protocols.",                        learningOutcome: "Build a mental map of the Avalanche DeFi ecosystem.",                 emoji: "🎯", duration: "7 min",  xpReward: 160, rewardType: "badge", eventTypes: ["workshop"],              gameType: "arcade",     status: "live" },
  { id: "liquidation-quiz",      title: "Liquidation Logic",          persona: "defi_degen", category: "DeFi",            difficulty: "Advanced",     themes: ["defi","security"],                          description: "Navigate lending positions to avoid liquidation scenarios.",                   learningOutcome: "Master collateral ratios, health factors, and liquidation mechanics.", emoji: "⚠️", duration: "12 min", xpReward: 320, rewardType: "badge", eventTypes: ["hackathon"],             gameType: "quiz",       status: "live" },
  { id: "bridge-navigator",      title: "Bridge Navigator",           persona: "defi_degen", category: "Bridges",         difficulty: "Intermediate", themes: ["bridges","defi"],                           description: "Choose the optimal bridge route and token path across chains.",               learningOutcome: "Understand cross-chain bridges, wrapped assets, and bridge risks.",    emoji: "🌉", duration: "10 min", xpReward: 200, rewardType: "badge", eventTypes: ["hackathon"],             gameType: "quiz",       status: "live" },
  { id: "avax-staking-master",   title: "AVAX Staking Master",        persona: "defi_degen", category: "Validators",      difficulty: "Beginner",     themes: ["validators","defi"],                        description: "Learn liquid staking, delegation, and staking rewards on Avalanche.",         learningOutcome: "Understand staking mechanics, reward rates, and validator selection.", emoji: "🥩", duration: "8 min",  xpReward: 110, rewardType: "badge", eventTypes: ["workshop"],              gameType: "quiz",       status: "live" },
  // NFT_ARTIST
  { id: "nft-minting-101",       title: "NFT Minting 101",            persona: "nft_artist", category: "NFT",             difficulty: "Beginner",     themes: ["nfts","smart_contracts"],                   description: "From artwork to on-chain: the complete NFT creation workflow.",               learningOutcome: "Understand IPFS, metadata standards, and minting mechanics.",         emoji: "🎨", duration: "10 min", xpReward: 130, rewardType: "badge", eventTypes: ["workshop"],              gameType: "quiz",       status: "live" },
  { id: "royalties-master",      title: "Royalties & Rights",         persona: "nft_artist", category: "NFT",             difficulty: "Intermediate", themes: ["nfts","smart_contracts"],                   description: "Navigate ERC-2981 royalties, operator filters, and creator economics.",       learningOutcome: "Master on-chain royalty enforcement and marketplace mechanics.",       emoji: "💸", duration: "10 min", xpReward: 220, rewardType: "badge", eventTypes: ["hackathon"],             gameType: "quiz",       status: "live" },
  { id: "chain-cards-game",      title: "Chain Cards",                persona: "nft_artist", category: "NFT",             difficulty: "Beginner",     themes: ["nfts","avalanche_basics"],                  description: "Memory match game with Avalanche NFT ecosystem terms.",                        learningOutcome: "Build vocabulary around Avalanche NFT protocols and marketplaces.",   emoji: "🃏", duration: "8 min",  xpReward: 110, rewardType: "badge", eventTypes: ["workshop"],              gameType: "arcade",     status: "live" },
  { id: "trait-rarity-calc",     title: "Trait Rarity Calculator",    persona: "nft_artist", category: "NFT",             difficulty: "Intermediate", themes: ["nfts"],                                     description: "Calculate rarity scores for trait combinations in NFT collections.",          learningOutcome: "Understand rarity mechanics, trait distributions, and scoring.",      emoji: "🎲", duration: "8 min",  xpReward: 180, rewardType: "badge", eventTypes: ["workshop"],              gameType: "quiz",       status: "live" },
  { id: "nft-security-101",      title: "NFT Security Audit",         persona: "nft_artist", category: "Security",        difficulty: "Advanced",     themes: ["nfts","security"],                          description: "Spot vulnerabilities in NFT contracts: reentrancy, metadata exploits.",       learningOutcome: "Identify and patch common NFT smart contract vulnerabilities.",        emoji: "🛡️", duration: "12 min", xpReward: 350, rewardType: "badge", eventTypes: ["hackathon"],             gameType: "quiz",       status: "live" },
  { id: "marketplace-mastery",   title: "Marketplace Mastery",        persona: "nft_artist", category: "NFT",             difficulty: "Intermediate", themes: ["nfts","defi"],                              description: "Navigate listing, offers, and royalty flows on Avalanche marketplaces.",      learningOutcome: "Master Campfire, Joepegs, and NFTrade mechanics.",                    emoji: "🛍️", duration: "10 min", xpReward: 200, rewardType: "badge", eventTypes: ["workshop"],              gameType: "quiz",       status: "live" },
  { id: "generative-art-quiz",   title: "Generative Art Basics",      persona: "nft_artist", category: "NFT",             difficulty: "Beginner",     themes: ["nfts"],                                     description: "How generative art algorithms create unique on-chain artwork.",               learningOutcome: "Understand SVG, on-chain storage, and generative systems.",           emoji: "🖼️", duration: "8 min",  xpReward: 120, rewardType: "badge", eventTypes: ["workshop"],              gameType: "quiz",       status: "live" },
  // VALIDATOR
  { id: "validator-bootcamp",    title: "Validator Bootcamp",         persona: "validator",  category: "Validators",      difficulty: "Beginner",     themes: ["validators","avalanche_basics"],             description: "Everything a new validator needs to know to get started.",                    learningOutcome: "Understand validator requirements, stake, and setup process.",        emoji: "🖥️", duration: "12 min", xpReward: 140, rewardType: "badge", eventTypes: ["workshop"],              gameType: "quiz",       status: "live" },
  { id: "snowman-consensus",     title: "Snowman Deep Dive",          persona: "validator",  category: "Validators",      difficulty: "Advanced",     themes: ["validators","avalanche_basics"],             description: "Master the Snowball / Snowflake / Snowman consensus mechanisms.",             learningOutcome: "Understand probabilistic finality and sampling-based consensus.",     emoji: "❄️", duration: "15 min", xpReward: 400, rewardType: "badge", eventTypes: ["hackathon"],             gameType: "quiz",       status: "live" },
  { id: "subnet-validator",      title: "Subnet Validator Setup",     persona: "validator",  category: "Validators",      difficulty: "Intermediate", themes: ["validators","smart_contracts"],              description: "Configure and launch a validator node for a custom Avalanche subnet.",        learningOutcome: "Complete subnet validator onboarding from scratch.",                  emoji: "⚙️", duration: "15 min", xpReward: 280, rewardType: "badge", eventTypes: ["hackathon"],             gameType: "quiz",       status: "live" },
  { id: "staking-economics",     title: "Staking Economics",          persona: "validator",  category: "Validators",      difficulty: "Intermediate", themes: ["validators","defi"],                        description: "Model validator rewards, uptime penalties, and delegation math.",             learningOutcome: "Build intuition for validator economics and profitability.",           emoji: "📊", duration: "10 min", xpReward: 230, rewardType: "badge", eventTypes: ["workshop"],              gameType: "quiz",       status: "live" },
  { id: "node-security-quiz",    title: "Node Security Hardening",    persona: "validator",  category: "Security",        difficulty: "Advanced",     themes: ["validators","security"],                    description: "Best practices for securing your Avalanche validator node.",                  learningOutcome: "Implement firewall rules, key management, and monitoring.",           emoji: "🔒", duration: "12 min", xpReward: 380, rewardType: "badge", eventTypes: ["hackathon"],             gameType: "quiz",       status: "live" },
  { id: "uptime-champion",       title: "Uptime Champion",            persona: "validator",  category: "Validators",      difficulty: "Beginner",     themes: ["validators"],                               description: "Quick quiz on validator uptime requirements and monitoring tools.",           learningOutcome: "Understand uptime SLAs and tools to maintain high availability.",     emoji: "⏱️", duration: "8 min",  xpReward: 120, rewardType: "badge", eventTypes: ["workshop"],              gameType: "quiz",       status: "live" },
  { id: "wallet-wars-game",      title: "Wallet Wars",                persona: "validator",  category: "Security",        difficulty: "Intermediate", themes: ["security","wallets"],                       description: "Security scenario game — choose the safest wallet action.",                  learningOutcome: "Recognize phishing, drainers, and social engineering attacks.",      emoji: "🛡️", duration: "8 min",  xpReward: 170, rewardType: "badge", eventTypes: ["workshop"],              gameType: "arcade",     status: "live" },
  // EXPLORER
  { id: "avax-ecosystem-tour",   title: "Ecosystem Explorer",         persona: "explorer",   category: "DeFi",            difficulty: "Beginner",     themes: ["avalanche_basics","defi"],                  description: "A whirlwind tour of the Avalanche ecosystem — protocols, tools, and DAOs.",   learningOutcome: "Map the Avalanche ecosystem across DeFi, NFTs, and tooling.",        emoji: "🗺️", duration: "8 min",  xpReward: 100, rewardType: "badge", eventTypes: ["community"],             gameType: "quiz",       status: "live" },
  { id: "dao-governance-101",    title: "DAO Governance 101",         persona: "explorer",   category: "DAOs",            difficulty: "Beginner",     themes: ["defi","smart_contracts"],                   description: "How DAOs work: proposals, voting, quorum, and execution.",                    learningOutcome: "Understand on-chain governance mechanics and voting power.",          emoji: "🗳️", duration: "8 min",  xpReward: 120, rewardType: "badge", eventTypes: ["community","workshop"], gameType: "quiz",       status: "live" },
  { id: "cross-chain-basics",    title: "Cross-Chain Basics",         persona: "explorer",   category: "Bridges",         difficulty: "Beginner",     themes: ["bridges","avalanche_basics"],               description: "What are bridges, messaging protocols, and the risks of cross-chain?",        learningOutcome: "Understand bridge mechanics, wrapped assets, and security.",          emoji: "🌐", duration: "10 min", xpReward: 130, rewardType: "badge", eventTypes: ["workshop"],              gameType: "quiz",       status: "live" },
  { id: "crypto-history-speed",  title: "Crypto History Speedrun",    persona: "explorer",   category: "DeFi",            difficulty: "Beginner",     themes: ["avalanche_basics"],                         description: "How well do you know crypto history? From Bitcoin to Avalanche.",            learningOutcome: "Build context around blockchain evolution and key milestones.",       emoji: "📜", duration: "8 min",  xpReward: 90,  rewardType: "badge", eventTypes: ["community"],             gameType: "quiz",       status: "live" },
  { id: "wallet-setup-quiz",     title: "Wallet Setup Quiz",          persona: "explorer",   category: "Wallets",         difficulty: "Beginner",     themes: ["wallets","security"],                       description: "Set up Core Wallet correctly — network config, seed phrase safety, more.",   learningOutcome: "Master safe wallet setup for Avalanche C-Chain.",                    emoji: "👜", duration: "8 min",  xpReward: 100, rewardType: "badge", eventTypes: ["workshop"],              gameType: "quiz",       status: "live" },
  { id: "avalanche-lore",        title: "Avalanche Lore",             persona: "explorer",   category: "Validators",      difficulty: "Beginner",     themes: ["avalanche_basics"],                         description: "Trivia on Avalanche's history, team, and network milestones.",               learningOutcome: "Learn the origin story and key milestones of Avalanche.",            emoji: "🏔️", duration: "8 min",  xpReward: 80,  rewardType: "badge", eventTypes: ["community"],             gameType: "quiz",       status: "live" },
  { id: "security-hygiene",      title: "Security Hygiene Quiz",      persona: "explorer",   category: "Security",        difficulty: "Beginner",     themes: ["security","wallets"],                       description: "Core crypto security practices every user must know.",                        learningOutcome: "Build habits for safe key management and threat awareness.",          emoji: "🧼", duration: "8 min",  xpReward: 100, rewardType: "badge", eventTypes: ["community","workshop"], gameType: "quiz",       status: "live" },
];

// ─── Arena Questions ──────────────────────────────────────────────────────────
const ARENA_QUESTIONS = [
  // avalanche_basics
  { topic: "avalanche_basics", question: "What is the Chain ID of Avalanche Fuji testnet?", options: ["43114","43113","1","137"], answer: 1, explanation: "Fuji testnet uses Chain ID 43113. Mainnet is 43114.", difficulty: "easy" },
  { topic: "avalanche_basics", question: "Which consensus protocol does the Avalanche C-Chain use?", options: ["Nakamoto","Tendermint","Snowman","PBFT"], answer: 2, explanation: "Snowman is Avalanche's linear chain consensus protocol.", difficulty: "easy" },
  { topic: "avalanche_basics", question: "What does the P-Chain handle on Avalanche?", options: ["Smart contract execution","DeFi swaps","Staking and subnet management","NFT minting"], answer: 2, explanation: "The Platform Chain manages validators, delegators, and subnets.", difficulty: "easy" },
  { topic: "avalanche_basics", question: "What is the approximate transaction finality time on Avalanche?", options: ["10 minutes","15 seconds","1-2 seconds","1 hour"], answer: 2, explanation: "Avalanche achieves sub-2-second finality.", difficulty: "easy" },
  { topic: "avalanche_basics", question: "How many chains does the Avalanche Primary Network have?", options: ["1","2","3","5"], answer: 2, explanation: "P-Chain, C-Chain, and X-Chain.", difficulty: "easy" },
  { topic: "avalanche_basics", question: "What is the native token of Avalanche?", options: ["ETH","SOL","AVAX","BNB"], answer: 2, explanation: "AVAX is the native token used for fees, staking, and governance.", difficulty: "easy" },
  { topic: "avalanche_basics", question: "Bitcoin Pizza Day is celebrated on which date?", options: ["January 3","October 31","May 22","November 9"], answer: 2, explanation: "May 22, 2010 — the day 10,000 BTC was used to buy two pizzas, the first real-world Bitcoin transaction.", difficulty: "easy" },
  { topic: "avalanche_basics", question: "Who made the first real-world Bitcoin transaction?", options: ["Satoshi Nakamoto","Hal Finney","Laszlo Hanyecz","Vitalik Buterin"], answer: 2, explanation: "Laszlo Hanyecz paid 10,000 BTC for two Papa John's pizzas on May 22, 2010.", difficulty: "easy" },
  { topic: "avalanche_basics", question: "What was Bitcoin's approximate value per coin on Pizza Day 2010?", options: ["$100","$0.004","$1","$50"], answer: 1, explanation: "Each Bitcoin was worth roughly $0.004 — making the two pizzas worth about $41 at the time.", difficulty: "medium" },
  { topic: "avalanche_basics", question: "What is Team1 Kenya's role in the Avalanche ecosystem?", options: ["Running validator nodes only","Growing the Avalanche ecosystem through community events","Mining AVAX","Building DeFi protocols"], answer: 1, explanation: "Team1 is a global network operating in 30+ countries driving Avalanche ecosystem growth.", difficulty: "easy" },
  // defi
  { topic: "defi", question: "What formula do most AMMs use?", options: ["x + y = k","x * y = k","x / y = k","x ^ y = k"], answer: 1, explanation: "The constant product formula x * y = k ensures pool liquidity is always maintained.", difficulty: "medium" },
  { topic: "defi", question: "What is impermanent loss?", options: ["Gas fee for failed transactions","Loss from price divergence vs holding","Smart contract hack loss","Token burn"], answer: 1, explanation: "Occurs when pool token prices diverge from when you deposited liquidity.", difficulty: "medium" },
  { topic: "defi", question: "What must you do before swapping an ERC-20 on a DEX?", options: ["Bridge the token","Approve the token","Stake the token","Burn the token"], answer: 1, explanation: "You must approve the router to spend your tokens.", difficulty: "easy" },
  { topic: "defi", question: "What does TVL stand for?", options: ["Total Value Locked","Token Vault Ledger","Trade Volume Limit","Transaction Layer"], answer: 0, explanation: "TVL measures how much capital is deposited in a DeFi protocol.", difficulty: "easy" },
  { topic: "defi", question: "What is a stablecoin?", options: ["A cryptocurrency pegged to a stable asset like USD","A coin that never changes value","A Bitcoin fork","A governance token"], answer: 0, explanation: "Stablecoins like USDC and USDT are pegged to the US dollar to reduce volatility.", difficulty: "easy" },
  // smart_contracts
  { topic: "smart_contracts", question: "What is a smart contract?", options: ["A legal document on paper","Self-executing code on a blockchain","A type of NFT","A stablecoin protocol"], answer: 1, explanation: "Smart contracts automatically execute when predefined conditions are met.", difficulty: "easy" },
  { topic: "smart_contracts", question: "What language is used to write Ethereum/Avalanche smart contracts?", options: ["Python","Rust","Solidity","JavaScript"], answer: 2, explanation: "Solidity is the primary language for EVM-compatible smart contracts.", difficulty: "easy" },
  { topic: "smart_contracts", question: "What is gas in EVM blockchains?", options: ["Network fuel","A cryptocurrency","A fee for computation","A consensus vote"], answer: 2, explanation: "Gas is the fee paid to execute transactions and smart contract functions.", difficulty: "easy" },
  { topic: "smart_contracts", question: "What does ERC-20 define?", options: ["NFT standard","Fungible token standard","DAO governance","Bridge protocol"], answer: 1, explanation: "ERC-20 is the standard interface for fungible tokens on EVM chains.", difficulty: "easy" },
  { topic: "smart_contracts", question: "Which keyword makes a Solidity function able to receive AVAX?", options: ["public","view","payable","pure"], answer: 2, explanation: "payable allows a function or address to receive native cryptocurrency.", difficulty: "medium" },
  // nfts
  { topic: "nfts", question: "What does NFT stand for?", options: ["New Financial Token","Non-Fungible Token","Network File Transfer","Node Finality Test"], answer: 1, explanation: "Non-Fungible Tokens are unique digital assets on a blockchain.", difficulty: "easy" },
  { topic: "nfts", question: "What ERC standard defines NFTs?", options: ["ERC-20","ERC-721","ERC-1155","ERC-4337"], answer: 1, explanation: "ERC-721 is the standard for non-fungible tokens.", difficulty: "easy" },
  { topic: "nfts", question: "What does IPFS stand for?", options: ["Internet Protocol File System","InterPlanetary File System","Internal Protocol Fast Storage","Integrated Peer File Sharing"], answer: 1, explanation: "IPFS is a distributed storage protocol used for NFT metadata.", difficulty: "easy" },
  { topic: "nfts", question: "What is a floor price?", options: ["Cost to mint","Lowest listed price in a collection","Average sale price","Developer royalty"], answer: 1, explanation: "Floor price is the cheapest NFT currently listed for sale in a collection.", difficulty: "easy" },
  // security
  { topic: "security", question: "What is a seed phrase?", options: ["Your public address","A 12-24 word backup controlling full wallet access","A DEX password","A transaction signature"], answer: 1, explanation: "A seed phrase is the master key to your wallet — guard it with your life.", difficulty: "easy" },
  { topic: "security", question: "What should you NEVER share?", options: ["Your public address","Your seed phrase or private key","Your transaction history","Your username"], answer: 1, explanation: "Sharing your seed phrase or private key gives complete and permanent access to your funds.", difficulty: "easy" },
  { topic: "security", question: "What is a phishing attack in crypto?", options: ["Mining attack","Fake website or message tricking you into revealing private keys","Gas fee manipulation","Smart contract bug"], answer: 1, explanation: "Phishing involves fake sites/messages designed to steal your credentials or seed phrase.", difficulty: "easy" },
];

export async function POST() {
  const session = await auth();
  const user = session?.user as any;
  if (!user?.isAdmin && !user?.isSuperAdmin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const results: Record<string, number> = { games: 0, arenaQuestions: 0, events: 0 };

  // ── 1. Seed games ────────────────────────────────────────────────────────────
  for (const g of GAMES) {
    await db.execute(sql`
      INSERT INTO games (id, title, persona, category, difficulty, themes, description, learning_outcome, emoji, duration, xp_reward, reward_type, event_types, game_type, status)
      VALUES (
        ${g.id}, ${g.title}, ${g.persona}, ${g.category}, ${g.difficulty},
        ${g.themes}::text[], ${g.description}, ${g.learningOutcome},
        ${g.emoji}, ${g.duration}, ${g.xpReward}, ${g.rewardType},
        ${g.eventTypes}::text[], ${g.gameType}, ${g.status}
      )
      ON CONFLICT (id) DO UPDATE SET
        title          = EXCLUDED.title,
        status         = EXCLUDED.status,
        xp_reward      = EXCLUDED.xp_reward,
        description    = EXCLUDED.description,
        learning_outcome = EXCLUDED.learning_outcome
    `);
    results.games++;
  }

  // ── 2. Seed arena questions ───────────────────────────────────────────────────
  for (const q of ARENA_QUESTIONS) {
    const exists = await db.execute(sql`
      SELECT id FROM arena_questions WHERE question = ${q.question} LIMIT 1
    `);
    const rows = (exists as any).rows ?? (exists as any);
    if (rows.length > 0) continue;
    await db.execute(sql`
      INSERT INTO arena_questions (topic, question, options, answer, explanation, difficulty)
      VALUES (${q.topic}, ${q.question}, ${q.options}::text[], ${q.answer}, ${q.explanation}, ${q.difficulty})
    `);
    results.arenaQuestions++;
  }

  // ── 3. Seed / keep the Global Bitcoin Pizza Party event live ─────────────────
  const existingEvent = await db.execute(sql`
    SELECT id FROM events WHERE title = 'Global Bitcoin Pizza Party | Nairobi Edition' LIMIT 1
  `);
  const existingRows = (existingEvent as any).rows ?? (existingEvent as any);

  if (existingRows.length === 0) {
    await db.execute(sql`
      INSERT INTO events (
        title, description, format, location,
        starts_at, ends_at, status, category, difficulty,
        tracks, missions, capacity, reward_pool,
        cover_emoji, agenda, is_platform_event, requires_approval
      ) VALUES (
        'Global Bitcoin Pizza Party | Nairobi Edition',
        ${'🍕🔺 Global Bitcoin Pizza Party | Nairobi Edition\n\n✨ Come meet the Avalanche, Bitcoin, and broader Web3 community for an evening of networking, gaming, discovery, and conversation.\n\nWhether you\'re building on-chain, exploring blockchain for the first time, or simply looking to connect with like-minded people — this is your night.\n\nExpect:\n🎮 Live multiplayer gaming on Plug n\' Play Arena\n🍕 Pizza, good vibes & networking\n⚡ Live demos & onboarding into Avalanche\n🤝 Conversations with founders and ecosystem partners\n🎁 Trivia, challenges & rewards\n\n🤝 Hosted by Team1 Kenya — a global network in 30+ countries growing the Avalanche ecosystem.'},
        'irl',
        'Nairobi Street Kitchen, 1870 Mpaka Rd, Nairobi, Kenya',
        '2026-05-22 17:00:00+03'::timestamptz,
        '2026-05-23 22:00:00+03'::timestamptz,
        'live',
        'community',
        'Beginner',
        ARRAY['Avalanche Basics','DeFi','NFT','Web3 Onboarding']::text[],
        ARRAY['avax-basics-quiz','avax-ecosystem-tour','defi-fundamentals','wallet-setup-quiz','security-hygiene']::text[],
        100,
        'NFT Badges + XP Rewards',
        '🍕',
        ${'[{"time":"4:00 PM","title":"Doors open & attendee check-in"},{"time":"4:30 PM","title":"Welcome remarks by Team1 Kenya"},{"time":"4:45 PM","title":"Intro to Avalanche, Bitcoin Pizza Day & the local ecosystem"},{"time":"5:00 PM","title":"Plug n Play multiplayer onboarding experience begins"},{"time":"5:30 PM","title":"Ecosystem partner spotlight & community activations"},{"time":"6:00 PM","title":"Trivia, mini challenges & giveaways"},{"time":"6:30 PM","title":"Pizza, networking & founder conversations"},{"time":"8:00 PM","title":"Open networking & community hangout"}]'}::jsonb,
        true,
        false
      )
    `);
  } else {
    // Keep it live with extended end time
    await db.execute(sql`
      UPDATE events
      SET status     = 'live',
          ends_at    = '2026-05-23 22:00:00+03'::timestamptz,
          updated_at = NOW()
      WHERE title = 'Global Bitcoin Pizza Party | Nairobi Edition'
    `);
  }
  results.events++;

  return NextResponse.json({
    success: true,
    seeded: results,
    message: `Seeded ${results.games} games, ${results.arenaQuestions} arena questions, ${results.events} event(s).`,
  });
}
