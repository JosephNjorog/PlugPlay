-- ============================================================
-- Plug n' Play Arena — Seed Data
-- Run once after schema migration: psql $DATABASE_URL < seed.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- App Settings
-- ─────────────────────────────────────────────────────────────
INSERT INTO app_settings (key, value, description) VALUES
  ('platform_name',          'Plug n'' Play Arena',  'Public name of the platform'),
  ('xp_multiplier',          '1.0',                 'Global XP multiplier (float)'),
  ('maintenance_mode',       'false',               'Set to true to show maintenance screen'),
  ('max_players_per_event',  '500',                 'Hard cap per event'),
  ('nft_contract_address',   '',                    'ERC-721 badge contract on Fuji C-Chain')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- Games (38 total — 5 personas × ~7-8 games each)
-- ─────────────────────────────────────────────────────────────

-- BUILDER persona
INSERT INTO games (id, title, persona, category, difficulty, themes, description, learning_outcome, emoji, duration, xp_reward, reward_type, event_types, game_type, status) VALUES
  ('avax-basics-quiz',       'AVAX Basics Blitz',        'builder',     'Smart Contracts',  'Beginner',     ARRAY['avalanche_basics','smart_contracts'],         'Race through 10 rapid-fire questions about Avalanche fundamentals.',         'Understand chain architecture, consensus, and AVAX tokenomics.',        '⚡', 8,  100, 'badge',  ARRAY['hackathon','workshop'], 'quiz',       'live'),
  ('deploy-first-contract',  'Deploy Your First Contract','builder',     'Smart Contracts',  'Intermediate', ARRAY['smart_contracts','developer_tools'],          'Step-by-step quiz on deploying ERC-20 contracts to Fuji testnet.',          'Master the deploy workflow: compile → deploy → verify.',                '🔧', 12, 200, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('solidity-speedrun',      'Solidity Speedrun',        'builder',     'Smart Contracts',  'Advanced',     ARRAY['smart_contracts','security'],                 'Race against the clock on Solidity security pitfalls and patterns.',        'Identify re-entrancy, integer overflow, and access control bugs.',      '🏃', 15, 350, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('block-builder-game',     'Block Builder',            'builder',     'Smart Contracts',  'Beginner',     ARRAY['avalanche_basics','developer_tools'],          'Build correct block headers and subnet configs in this puzzle game.',      'Learn block structure and Avalanche subnet parameters.',                '🧱', 10, 150, 'badge',  ARRAY['workshop'],             'arcade',     'live'),
  ('gas-rush-game',          'Gas Rush',                 'builder',     'Smart Contracts',  'Intermediate', ARRAY['smart_contracts','gas_optimization'],          'Sort transactions by gas priority before the block closes.',               'Understand gas fees, priority, and mempool mechanics.',                 '⛽', 7,  180, 'badge',  ARRAY['hackathon','workshop'], 'arcade',     'live'),
  ('abi-decoder',            'ABI Decoder Challenge',    'builder',     'Smart Contracts',  'Advanced',     ARRAY['smart_contracts','developer_tools'],           'Match function selectors to their Solidity signatures.',                    'Understand ABI encoding, function selectors, and calldata.',           '🔑', 10, 300, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('subnet-architect',       'Subnet Architect',         'builder',     'Validators',       'Advanced',     ARRAY['validators','smart_contracts'],                'Design a custom subnet — choose VM, validators, and gas settings.',        'Understand subnet customization and validator requirements.',           '🏗️', 15, 400, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('protocol-puzzle-game',   'Protocol Puzzle',          'builder',     'Smart Contracts',  'Beginner',     ARRAY['avalanche_basics','smart_contracts'],          'Arrange protocol concepts into the correct sequence.',                      'Build intuition for Avalanche''s layered architecture.',               '🧩', 8,  120, 'badge',  ARRAY['workshop'],             'arcade',     'live'),

-- DEFI_DEGEN persona
  ('defi-fundamentals',      'DeFi Fundamentals',        'defi_degen',  'DeFi',             'Beginner',     ARRAY['defi','wallets'],                             'Core DeFi concepts: AMMs, liquidity pools, yield farming.',                'Understand how DEXs, liquidity provision, and yield work.',            '💱', 10, 120, 'badge',  ARRAY['workshop'],             'quiz',       'live'),
  ('trader-joe-master',      'Trader Joe Mastery',       'defi_degen',  'DeFi',             'Intermediate', ARRAY['defi','avalanche_basics'],                    'Deep dive into Trader Joe''s liquidity book and veJOE mechanics.',         'Master concentrated liquidity and ve-tokenomics.',                     '🤠', 12, 250, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('yield-optimizer',        'Yield Optimizer',          'defi_degen',  'DeFi',             'Intermediate', ARRAY['defi','security'],                            'Calculate optimal yield strategies across Benqi, Aave, and Pangolin.',    'Compare yield opportunities and understand risk-reward tradeoffs.',    '📈', 10, 220, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('defi-diner-game',        'DeFi Diner',               'defi_degen',  'DeFi',             'Beginner',     ARRAY['defi','wallets'],                             'Pick the right ingredients (protocols) for each DeFi recipe.',             'Learn which Avalanche DeFi protocols serve which functions.',          '🍽️', 8,  130, 'badge',  ARRAY['workshop'],             'arcade',     'live'),
  ('token-toss-game',        'Token Toss',               'defi_degen',  'DeFi',             'Intermediate', ARRAY['defi','bridges'],                             'Match DeFi tasks to the correct Avalanche protocols.',                     'Build a mental map of the Avalanche DeFi ecosystem.',                  '🎯', 7,  160, 'badge',  ARRAY['workshop'],             'arcade',     'live'),
  ('liquidation-quiz',       'Liquidation Logic',        'defi_degen',  'DeFi',             'Advanced',     ARRAY['defi','security'],                            'Navigate lending positions to avoid liquidation scenarios.',               'Master collateral ratios, health factors, and liquidation mechanics.',  '⚠️', 12, 320, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('bridge-navigator',       'Bridge Navigator',         'defi_degen',  'Bridges',          'Intermediate', ARRAY['bridges','defi'],                             'Choose the optimal bridge route and token path across chains.',            'Understand cross-chain bridges, wrapped assets, and bridge risks.',   '🌉', 10, 200, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('avax-staking-master',    'AVAX Staking Master',      'defi_degen',  'Validators',       'Beginner',     ARRAY['validators','defi'],                          'Learn liquid staking, delegation, and staking rewards on Avalanche.',      'Understand staking mechanics, reward rates, and validator selection.', '🥩', 8,  110, 'badge',  ARRAY['workshop'],             'quiz',       'live'),

-- NFT_ARTIST persona
  ('nft-minting-101',        'NFT Minting 101',          'nft_artist',  'NFT',              'Beginner',     ARRAY['nfts','smart_contracts'],                     'From artwork to on-chain: the complete NFT creation workflow.',            'Understand IPFS, metadata standards, and minting mechanics.',          '🎨', 10, 130, 'badge',  ARRAY['workshop'],             'quiz',       'live'),
  ('royalties-master',       'Royalties & Rights',       'nft_artist',  'NFT',              'Intermediate', ARRAY['nfts','smart_contracts'],                     'Navigate ERC-2981 royalties, operator filters, and creator economics.',   'Master on-chain royalty enforcement and marketplace mechanics.',       '💸', 10, 220, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('chain-cards-game',       'Chain Cards',              'nft_artist',  'NFT',              'Beginner',     ARRAY['nfts','avalanche_basics'],                    'Memory match game with Avalanche NFT ecosystem terms.',                   'Build vocabulary around Avalanche NFT protocols and marketplaces.',   '🃏', 8,  110, 'badge',  ARRAY['workshop'],             'arcade',     'live'),
  ('trait-rarity-calc',      'Trait Rarity Calculator',  'nft_artist',  'NFT',              'Intermediate', ARRAY['nfts'],                                       'Calculate rarity scores for trait combinations in NFT collections.',       'Understand rarity mechanics, trait distributions, and scoring.',       '🎲', 8,  180, 'badge',  ARRAY['workshop'],             'quiz',       'live'),
  ('nft-security-101',       'NFT Security Audit',       'nft_artist',  'Security',         'Advanced',     ARRAY['nfts','security'],                            'Spot vulnerabilities in NFT contracts: reentrancy, metadata exploits.',   'Identify and patch common NFT smart contract vulnerabilities.',        '🛡️', 12, 350, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('marketplace-mastery',    'Marketplace Mastery',      'nft_artist',  'NFT',              'Intermediate', ARRAY['nfts','defi'],                                'Navigate listing, offers, and royalty flows on Avalanche marketplaces.',  'Master Campfire, Joepegs, and NFTrade mechanics.',                    '🛍️', 10, 200, 'badge',  ARRAY['workshop'],             'quiz',       'live'),
  ('generative-art-quiz',    'Generative Art Basics',    'nft_artist',  'NFT',              'Beginner',     ARRAY['nfts'],                                       'How generative art algorithms create unique on-chain artwork.',           'Understand SVG, on-chain storage, and generative systems.',           '🖼️', 8,  120, 'badge',  ARRAY['workshop'],             'quiz',       'live'),

-- VALIDATOR persona
  ('validator-bootcamp',     'Validator Bootcamp',       'validator',   'Validators',       'Beginner',     ARRAY['validators','avalanche_basics'],               'Everything a new validator needs to know to get started.',                'Understand validator requirements, stake, and setup process.',         '🖥️', 12, 140, 'badge',  ARRAY['workshop'],             'quiz',       'live'),
  ('snowman-consensus',      'Snowman Deep Dive',        'validator',   'Validators',       'Advanced',     ARRAY['validators','avalanche_basics'],               'Master the Snowball / Snowflake / Snowman consensus mechanisms.',          'Understand probabilistic finality and sampling-based consensus.',      '❄️', 15, 400, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('subnet-validator',       'Subnet Validator Setup',   'validator',   'Validators',       'Intermediate', ARRAY['validators','smart_contracts'],                'Configure and launch a validator node for a custom Avalanche subnet.',    'Complete subnet validator onboarding from scratch.',                   '⚙️', 15, 280, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('staking-economics',      'Staking Economics',        'validator',   'Validators',       'Intermediate', ARRAY['validators','defi'],                          'Model validator rewards, uptime penalties, and delegation math.',         'Build intuition for validator economics and profitability.',           '📊', 10, 230, 'badge',  ARRAY['workshop'],             'quiz',       'live'),
  ('node-security-quiz',     'Node Security Hardening',  'validator',   'Security',         'Advanced',     ARRAY['validators','security'],                      'Best practices for securing your Avalanche validator node.',              'Implement firewall rules, key management, and monitoring.',            '🔒', 12, 380, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('uptime-champion',        'Uptime Champion',          'validator',   'Validators',       'Beginner',     ARRAY['validators'],                                 'Quick quiz on validator uptime requirements and monitoring tools.',       'Understand uptime SLAs and tools to maintain high availability.',      '⏱️', 8,  120, 'badge',  ARRAY['workshop'],             'quiz',       'live'),
  ('wallet-wars-game',       'Wallet Wars',              'validator',   'Security',         'Intermediate', ARRAY['security','wallets'],                         'Security scenario game — choose the safest wallet action.',               'Recognize phishing, drainers, and social engineering attacks.',       '🛡️', 8,  170, 'badge',  ARRAY['workshop'],             'arcade',     'live'),

-- EXPLORER persona
  ('avax-ecosystem-tour',    'Ecosystem Explorer',       'explorer',    'DeFi',             'Beginner',     ARRAY['avalanche_basics','defi'],                    'A whirlwind tour of the Avalanche ecosystem — protocols, tools, and DAOs.','Map the Avalanche ecosystem across DeFi, NFTs, and tooling.',        '🗺️', 8,  100, 'badge',  ARRAY['community'],            'quiz',       'live'),
  ('dao-governance-101',     'DAO Governance 101',       'explorer',    'DAOs',             'Beginner',     ARRAY['defi','smart_contracts'],                     'How DAOs work: proposals, voting, quorum, and execution.',                'Understand on-chain governance mechanics and voting power.',           '🗳️', 8,  120, 'badge',  ARRAY['community','workshop'], 'quiz',       'live'),
  ('cross-chain-basics',     'Cross-Chain Basics',       'explorer',    'Bridges',          'Beginner',     ARRAY['bridges','avalanche_basics'],                 'What are bridges, messaging protocols, and the risks of cross-chain?',   'Understand bridge mechanics, wrapped assets, and security.',           '🌐', 10, 130, 'badge',  ARRAY['workshop'],             'quiz',       'live'),
  ('crypto-history-speed',   'Crypto History Speedrun',  'explorer',    'DeFi',             'Beginner',     ARRAY['avalanche_basics'],                           'How well do you know crypto history? From Bitcoin to Avalanche.',         'Build context around blockchain evolution and key milestones.',        '📜', 8,  90,  'badge',  ARRAY['community'],            'quiz',       'live'),
  ('wallet-setup-quiz',      'Wallet Setup Quiz',        'explorer',    'Wallets',          'Beginner',     ARRAY['wallets','security'],                         'Set up Core Wallet correctly — network config, seed phrase safety, more.','Master safe wallet setup for Avalanche C-Chain.',                    '👜', 8,  100, 'badge',  ARRAY['workshop'],             'quiz',       'live'),
  ('avalanche-lore',         'Avalanche Lore',           'explorer',    'Validators',       'Beginner',     ARRAY['avalanche_basics'],                           'Trivia on Avalanche''s history, team, and network milestones.',           'Learn the origin story and key milestones of Avalanche.',             '🏔️', 8,  80,  'badge',  ARRAY['community'],            'quiz',       'live'),
  ('security-hygiene',       'Security Hygiene Quiz',    'explorer',    'Security',         'Beginner',     ARRAY['security','wallets'],                         'Core crypto security practices every user must know.',                     'Build habits for safe key management and threat awareness.',          '🧼', 8,  100, 'badge',  ARRAY['community','workshop'], 'quiz',       'live');

-- ─────────────────────────────────────────────────────────────
-- Challenges (7 speedrun challenges)
-- ─────────────────────────────────────────────────────────────
INSERT INTO challenges (id, slug, title, tagline, emoji, accent, tier, ai_ready, est_minutes, xp_reward, badge_title, concept, brief, steps, submission, verification) VALUES
  (gen_random_uuid(), 'deploy-first-contract',
   'Deploy Your First Smart Contract',
   'Ship a real ERC-20 on Avalanche Fuji in 15 minutes',
   '🚀', 'blue', 'beginner', true, 15, 150, 'Deployer Badge',
   'Smart Contract Deployment',
   'Deploy a simple ERC-20 token contract to the Avalanche Fuji C-Chain testnet. You''ll use Remix IDE and MetaMask / Core Wallet to compile, deploy, and verify your contract on Snowtrace.',
   '[{"title":"Get testnet AVAX from faucet","detail":"Visit faucet.avax.network and request test AVAX to pay gas fees. You need at least 0.1 AVAX.","hint":"Make sure your wallet is on Fuji C-Chain (Chain ID 43113)"},{"title":"Open Remix and paste the contract","detail":"Open remix.ethereum.org, create a new file called MyToken.sol, and paste a simple ERC-20 contract using OpenZeppelin imports.","hint":"Use import @openzeppelin/contracts/token/ERC20/ERC20.sol"},{"title":"Compile with Solidity 0.8.20","detail":"In Remix, open the Solidity compiler tab, select version 0.8.20, enable optimization at 200 runs, and click Compile."},{"title":"Deploy to Fuji","detail":"Switch to the Deploy tab, select Injected Provider, ensure MetaMask is on Fuji, and click Deploy. Confirm the transaction in MetaMask.","hint":"Copy your contract address once deployed"},{"title":"Verify on Snowtrace","detail":"Go to testnet.snowtrace.io, find your contract, and use the Verify & Publish feature to upload your source code."}]'::jsonb,
   '{"primary":{"key":"contractAddress","label":"Deployed Contract Address","placeholder":"0x...","kind":"text"},"extras":[{"key":"txHash","label":"Deployment Transaction Hash","placeholder":"0x...","kind":"text"}]}'::jsonb,
   '{"kind":"on_chain","rules":["Contract must be deployed on Fuji C-Chain (chainId 43113)","Contract address must be a valid ERC-20","Transaction must be confirmable on Snowtrace testnet"]}'::jsonb),

  (gen_random_uuid(), 'add-avax-to-metamask',
   'Add Fuji Network to MetaMask',
   'Configure your wallet for the Avalanche ecosystem',
   '🦊', 'orange', 'beginner', false, 10, 100, 'Network Setter',
   'Wallet Configuration',
   'Configure MetaMask to connect to the Avalanche Fuji C-Chain testnet. Learn how custom networks work, what RPC endpoints are, and how to verify your connection is correct.',
   '[{"title":"Open MetaMask network settings","detail":"Click the network dropdown at the top of MetaMask, then select Add Network → Add a network manually."},{"title":"Enter Fuji C-Chain details","detail":"Network Name: Avalanche Fuji C-Chain. New RPC URL: https://api.avax-test.network/ext/bc/C/rpc. Chain ID: 43113. Currency Symbol: AVAX. Block Explorer: https://testnet.snowtrace.io","hint":"The Chain ID 43113 is what uniquely identifies Fuji"},{"title":"Save and switch networks","detail":"Click Save, then switch to the Fuji network. Your wallet should show AVAX as the currency."},{"title":"Get test AVAX","detail":"Visit faucet.avax.network, enter your wallet address, and request test AVAX. You should receive 2 AVAX."}]'::jsonb,
   '{"primary":{"key":"walletAddress","label":"Your Wallet Address on Fuji","placeholder":"0x...","kind":"text"}}'::jsonb,
   '{"kind":"manual","rules":["Submit your Fuji wallet address","Admin will verify testnet AVAX balance on Snowtrace","Must have received at least 1 test AVAX"]}'::jsonb),

  (gen_random_uuid(), 'first-defi-swap',
   'Make Your First DeFi Swap',
   'Execute a real swap on Trader Joe — your first DeFi transaction',
   '🤠', 'green', 'intermediate', true, 20, 200, 'Swap Pioneer',
   'Decentralized Exchange',
   'Connect to Trader Joe (traderjoexyz.com) on Fuji testnet, provide a swap from test AVAX to USDC, and submit the transaction hash as proof. You''ll understand slippage, price impact, and AMM mechanics.',
   '[{"title":"Get test tokens","detail":"Visit faucet.avax.network for test AVAX. You may also need test USDC — check Trader Joe''s faucet on testnet.","hint":"Make sure you''re on the Fuji testnet version of Trader Joe"},{"title":"Connect wallet to Trader Joe","detail":"Go to app.traderjoexyz.com, click Connect Wallet, and ensure you''re on Fuji testnet. Check the network indicator in the top bar."},{"title":"Set slippage tolerance","detail":"Click the settings gear icon and set slippage to 0.5% for stable pairs. For volatile pairs, 1-2% is common.","hint":"Too low slippage = transaction fails. Too high = sandwich attack risk"},{"title":"Execute the swap","detail":"Select AVAX as input and USDC as output. Enter 0.1 AVAX, review the price impact, and confirm. Approve MetaMask transaction."},{"title":"Copy transaction hash","detail":"Once confirmed, click the transaction in MetaMask activity and copy the transaction hash from Snowtrace."}]'::jsonb,
   '{"primary":{"key":"txHash","label":"Swap Transaction Hash","placeholder":"0x...","kind":"text"}}'::jsonb,
   '{"kind":"on_chain","rules":["Transaction must be on Fuji C-Chain","TX must contain a swap event","Must be within the last 72 hours"]}'::jsonb),

  (gen_random_uuid(), 'stake-avax-delegation',
   'Delegate AVAX to a Validator',
   'Earn staking rewards by delegating to a Fuji validator',
   '🥩', 'purple', 'intermediate', false, 25, 250, 'Delegator Badge',
   'Proof of Stake',
   'Using Core Wallet, delegate a small amount of test AVAX to an active validator on Fuji testnet. Learn how proof-of-stake delegation works and how rewards are calculated.',
   '[{"title":"Get test AVAX","detail":"You need at least 25 test AVAX to delegate. Visit faucet.avax.network several times or use the Core Wallet drip."},{"title":"Open Core Wallet Earn tab","detail":"In Core Wallet (core.app), navigate to the Earn section. This is the staking dashboard for AVAX.","hint":"Staking is on the P-Chain, not C-Chain — Core Wallet handles the cross-chain transfer automatically"},{"title":"Find an active validator","detail":"Browse the validator list and pick one with good uptime (>99%), reasonable fee (<10%), and at least 2 weeks remaining."},{"title":"Set delegation amount and duration","detail":"Enter your delegation amount (minimum 25 AVAX on testnet) and set the duration. Minimum is 2 weeks on mainnet; testnet may vary."},{"title":"Submit and record the TX hash","detail":"Confirm the delegation transaction in Core Wallet and copy the transaction hash from the P-Chain explorer."}]'::jsonb,
   '{"primary":{"key":"txHash","label":"Delegation Transaction Hash (P-Chain)","placeholder":"2Lp...","kind":"text"},"extras":[{"key":"nodeId","label":"Validator Node ID you delegated to","placeholder":"NodeID-...","kind":"text"}]}'::jsonb,
   '{"kind":"manual","rules":["P-Chain TX hash must be valid","Delegation must be to an active Fuji validator","Amount must be ≥ 25 test AVAX"]}'::jsonb),

  (gen_random_uuid(), 'mint-first-nft',
   'Mint Your First NFT on Avalanche',
   'Deploy and mint an ERC-721 token on Fuji testnet',
   '🖼️', 'pink', 'intermediate', true, 30, 300, 'NFT Pioneer',
   'ERC-721 Standard',
   'Write, deploy, and mint an ERC-721 NFT contract on Fuji C-Chain. Upload your artwork to IPFS, write the metadata JSON, and mint token #1 to your wallet address.',
   '[{"title":"Create your artwork","detail":"Create a simple digital artwork (PNG or SVG). You can use Canva, Figma, or any tool. Recommended size: 1000x1000px."},{"title":"Upload to IPFS via Pinata","detail":"Go to app.pinata.cloud, create a free account, upload your image file, and copy the IPFS hash (starts with Qm... or baf...).","hint":"The IPFS URI format is: ipfs://YOUR_HASH"},{"title":"Write the metadata JSON","detail":"Create a metadata.json: {\"name\":\"My First NFT\",\"description\":\"...\",\"image\":\"ipfs://YOUR_HASH\"}. Upload this JSON to IPFS too."},{"title":"Deploy ERC-721 to Fuji","detail":"In Remix, write a simple ERC-721 contract extending OpenZeppelin''s ERC721. Add a mint function and deploy to Fuji.","hint":"Use ERC721URIStorage for per-token metadata"},{"title":"Mint token #1","detail":"Call your mint function with your wallet address and the IPFS metadata URI. Copy the transaction hash once confirmed."}]'::jsonb,
   '{"primary":{"key":"contractAddress","label":"NFT Contract Address","placeholder":"0x...","kind":"text"},"extras":[{"key":"mintTxHash","label":"Mint Transaction Hash","placeholder":"0x...","kind":"text"},{"key":"metadataUri","label":"IPFS Metadata URI","placeholder":"ipfs://...","kind":"text"}]}'::jsonb,
   '{"kind":"on_chain","rules":["Contract must implement ERC-721 interface","Mint transaction must be on Fuji","Metadata URI must be a valid IPFS link","Admin will verify token ownership"]}'::jsonb),

  (gen_random_uuid(), 'build-airdrop-contract',
   'Build an Airdrop Contract',
   'Write a Merkle-proof airdrop contract and generate proofs',
   '🌬️', 'blue', 'advanced', true, 45, 450, 'Airdrop Architect',
   'Merkle Trees & Airdrops',
   'Build a complete Merkle airdrop system: generate a recipient list, compute the Merkle tree, deploy the airdrop contract to Fuji, and allow one test address to claim. This is how most major protocols do token distributions.',
   '[{"title":"Install Merkle tooling","detail":"Set up a Hardhat project with @openzeppelin/merkle-tree. Run: npx hardhat init then npm install @openzeppelin/merkle-tree ethers"},{"title":"Generate your recipient list","detail":"Create a CSV or JSON with 5+ test wallet addresses and token amounts. Generate the Merkle root using StandardMerkleTree.of()."},{"title":"Write the MerkleAirdrop contract","detail":"The contract should store the Merkle root, implement claim(amount, proof[]) with OZ''s MerkleProof.verify(), and track claimed addresses.","hint":"Use a mapping(address => bool) to prevent double-claiming"},{"title":"Deploy and fund the contract","detail":"Deploy to Fuji, then transfer your test ERC-20 tokens to the contract address to fund the airdrop."},{"title":"Execute a test claim","detail":"Generate the Merkle proof for one of your test addresses and call claim() from that address. Verify the tokens arrive."}]'::jsonb,
   '{"primary":{"key":"contractAddress","label":"MerkleAirdrop Contract Address","placeholder":"0x...","kind":"text"},"extras":[{"key":"repoUrl","label":"GitHub Repo URL","placeholder":"https://github.com/...","kind":"url"},{"key":"claimTxHash","label":"Test Claim TX Hash","placeholder":"0x...","kind":"text"}]}'::jsonb,
   '{"kind":"on_chain","rules":["Contract must be deployed on Fuji","Claim TX must be valid and on Fuji","GitHub repo must contain complete source code","Merkle root must match the claim proof"]}'::jsonb),

  (gen_random_uuid(), 'create-dao-vote',
   'Launch a DAO Governance Vote',
   'Deploy a Governor contract and pass your first proposal',
   '🗳️', 'purple', 'advanced', false, 60, 500, 'Governance Master',
   'On-Chain Governance',
   'Use OpenZeppelin Governor to deploy a complete DAO: governance token, timelock, and governor contract. Create a proposal, cast a vote, queue it in the timelock, and execute it on Fuji testnet.',
   '[{"title":"Deploy the governance token","detail":"Deploy an ERC-20Votes token. Mint tokens to yourself and delegate voting power to your address (required before voting).","hint":"Call delegate(yourAddress) after minting — you can''t vote without delegating first"},{"title":"Deploy TimelockController","detail":"Deploy OZ TimelockController with a 60-second min delay for testnet. Grant the governor the PROPOSER and EXECUTOR roles."},{"title":"Deploy the Governor contract","detail":"Extend OZ Governor with GovernorVotes and GovernorTimelockControl. Set votingDelay=1 block, votingPeriod=50 blocks."},{"title":"Create and pass a proposal","detail":"Encode a call to a target contract (even just a test call). Submit the proposal, wait for votingDelay, vote FOR, wait for votingPeriod."},{"title":"Queue and execute","detail":"Once the vote passes, call queue() to enter the timelock, wait 60 seconds, then call execute(). Verify the proposal was executed on Snowtrace."}]'::jsonb,
   '{"primary":{"key":"governorAddress","label":"Governor Contract Address","placeholder":"0x...","kind":"text"},"extras":[{"key":"proposalId","label":"Proposal ID (bytes32 or uint256)","placeholder":"0x...","kind":"text"},{"key":"executeTxHash","label":"Execute Transaction Hash","placeholder":"0x...","kind":"text"}]}'::jsonb,
   '{"kind":"on_chain","rules":["Governor contract must implement IGovernor","Proposal must be in Executed state","All contracts must be on Fuji C-Chain"]}'::jsonb);

-- ─────────────────────────────────────────────────────────────
-- Arena Questions (25 questions across topics)
-- ─────────────────────────────────────────────────────────────
INSERT INTO arena_questions (id, topic, question, options, answer, explanation, difficulty) VALUES
  -- avalanche_basics (5)
  (gen_random_uuid(), 'avalanche_basics', 'What is the Chain ID of Avalanche Fuji testnet?',
   ARRAY['43114','43113','1','137'], 1, 'Fuji testnet uses Chain ID 43113. Mainnet is 43114.', 'Beginner'),
  (gen_random_uuid(), 'avalanche_basics', 'Which consensus protocol does the Avalanche C-Chain use?',
   ARRAY['Nakamoto','Tendermint','Snowman','PBFT'], 2, 'Snowman is Avalanche''s linear chain consensus protocol, a variant of Snow consensus.', 'Beginner'),
  (gen_random_uuid(), 'avalanche_basics', 'What does the P-Chain handle on Avalanche?',
   ARRAY['Smart contract execution','DeFi swaps','Staking and subnet management','NFT minting'], 2, 'The Platform Chain (P-Chain) manages validators, delegators, and subnets.', 'Beginner'),
  (gen_random_uuid(), 'avalanche_basics', 'What is the approximate transaction finality time on Avalanche?',
   ARRAY['10 minutes','15 seconds','1-2 seconds','1 hour'], 2, 'Avalanche achieves sub-2-second finality, far faster than Bitcoin or Ethereum.', 'Beginner'),
  (gen_random_uuid(), 'avalanche_basics', 'How many chains does the Avalanche Primary Network have?',
   ARRAY['1','2','3','5'], 2, 'The Primary Network has three chains: P-Chain, C-Chain, and X-Chain.', 'Beginner'),

  -- defi (5)
  (gen_random_uuid(), 'defi', 'What formula does most AMMs (like Trader Joe v1) use?',
   ARRAY['x + y = k','x * y = k','x / y = k','x ^ y = k'], 1, 'The constant product formula x * y = k ensures pool liquidity is always maintained.', 'Intermediate'),
  (gen_random_uuid(), 'defi', 'What is "impermanent loss" in DeFi?',
   ARRAY['Gas fee for failed transactions','Loss from price divergence vs holding','Smart contract hack loss','Permanent token burn'], 1, 'Impermanent loss occurs when pool token prices diverge from when you deposited liquidity.', 'Intermediate'),
  (gen_random_uuid(), 'defi', 'What must you do before swapping an ERC-20 token on a DEX?',
   ARRAY['Bridge the token','Approve the token','Stake the token','Burn the token'], 1, 'You must approve the DEX router to spend your tokens before any swap can execute.', 'Beginner'),
  (gen_random_uuid(), 'defi', 'What does TVL stand for in DeFi?',
   ARRAY['Total Value Locked','Token Vault Ledger','Trade Volume Limit','Transaction Verification Layer'], 0, 'TVL (Total Value Locked) measures how much capital is deposited in a DeFi protocol.', 'Beginner'),
  (gen_random_uuid(), 'defi', 'What happens during a DeFi liquidation?',
   ARRAY['Your wallet is hacked','Collateral is sold to repay debt when health factor drops below 1','Tokens are burned permanently','Gas fees are refunded'], 1, 'When a borrower''s collateral value falls below the liquidation threshold, liquidators can repay debt and claim collateral at a discount.', 'Intermediate'),

  -- smart_contracts (5)
  (gen_random_uuid(), 'smart_contracts', 'What is a smart contract function selector?',
   ARRAY['A 4-byte hash of the function signature','The contract address','The gas price for the function','The function return type'], 0, 'Function selectors are the first 4 bytes of the keccak256 hash of the function signature, used for ABI encoding.', 'Advanced'),
  (gen_random_uuid(), 'smart_contracts', 'Which Solidity keyword prevents reentrancy attacks?',
   ARRAY['payable','pure','nonReentrant (via OpenZeppelin)','view'], 2, 'OpenZeppelin''s ReentrancyGuard and its nonReentrant modifier prevent reentrant calls.', 'Intermediate'),
  (gen_random_uuid(), 'smart_contracts', 'What is the EVM storage slot for the first state variable?',
   ARRAY['Slot 0','Slot 1','Slot 255','Random hash'], 0, 'Solidity stores the first state variable at storage slot 0, incrementing for each subsequent variable.', 'Advanced'),
  (gen_random_uuid(), 'smart_contracts', 'What does the payable keyword enable in Solidity?',
   ARRAY['Free gas transactions','Functions to receive ETH/AVAX','Auto-approve token transfers','Cross-chain calls'], 1, 'payable allows a function or address to receive native cryptocurrency (ETH/AVAX).', 'Beginner'),
  (gen_random_uuid(), 'smart_contracts', 'What ERC standard defines NFTs?',
   ARRAY['ERC-20','ERC-721','ERC-1155','ERC-4337'], 1, 'ERC-721 is the non-fungible token standard. ERC-1155 allows both fungible and non-fungible tokens.', 'Beginner'),

  -- nfts (5)
  (gen_random_uuid(), 'nfts', 'What does IPFS stand for?',
   ARRAY['Internet Protocol File System','InterPlanetary File System','Internal Protocol for Fast Storage','Integrated Peer File Sharing'], 1, 'IPFS (InterPlanetary File System) is a distributed storage protocol commonly used for NFT metadata and images.', 'Beginner'),
  (gen_random_uuid(), 'nfts', 'What is an NFT royalty standard on EVM chains?',
   ARRAY['ERC-20','ERC-721','ERC-2981','ERC-4626'], 2, 'ERC-2981 is the NFT royalty standard, allowing creators to receive a percentage of secondary sales.', 'Intermediate'),
  (gen_random_uuid(), 'nfts', 'Where is NFT metadata typically stored on Avalanche?',
   ARRAY['In the smart contract storage','On IPFS or Arweave','In the transaction data','On a centralized server always'], 1, 'NFT metadata (name, description, image) is typically on IPFS or Arweave for decentralized, persistent storage.', 'Beginner'),
  (gen_random_uuid(), 'nfts', 'What is a "floor price" in NFT terminology?',
   ARRAY['The cost to mint a new token','The lowest listed price for a collection','The average sale price','The developer royalty rate'], 1, 'Floor price is the cheapest NFT currently listed for sale in a collection.', 'Beginner'),
  (gen_random_uuid(), 'nfts', 'Which Avalanche-native NFT marketplace uses the Joepegs brand?',
   ARRAY['OpenSea','Campfire','Joepegs','NFTrade'], 2, 'Joepegs is Trader Joe''s NFT marketplace — a native Avalanche platform for buying, selling, and minting NFTs.', 'Beginner'),

  -- security (5)
  (gen_random_uuid(), 'security', 'What is a "seed phrase" (mnemonic)?',
   ARRAY['Your wallet''s public address','A 12-24 word backup that controls full wallet access','A password for a DEX','A transaction signature'], 1, 'A seed phrase is the master key to your wallet — anyone with it can access all funds on all chains.', 'Beginner'),
  (gen_random_uuid(), 'security', 'What is a "drainer" smart contract?',
   ARRAY['A contract that optimizes gas','A malicious contract designed to steal wallet funds on approval','A contract that burns tokens','A cross-chain bridge contract'], 1, 'Drainer contracts exploit unlimited token approvals to empty wallets in a single transaction.', 'Intermediate'),
  (gen_random_uuid(), 'security', 'What does a re-entrancy attack exploit?',
   ARRAY['Integer overflow in token math','External contract call before state update','Insufficient gas in transactions','Invalid signature verification'], 1, 'Re-entrancy attacks exploit contracts that make external calls before updating their state, allowing attackers to call back in recursively.', 'Advanced'),
  (gen_random_uuid(), 'security', 'What is the safest way to buy a hardware wallet?',
   ARRAY['eBay at 50% off (pre-configured)','Official retailer or manufacturer website','Crypto conferences (secondhand)','Any Amazon seller'], 1, 'Only buy hardware wallets from official manufacturers or authorized retailers to ensure they haven''t been tampered with.', 'Beginner'),
  (gen_random_uuid(), 'security', 'What should you NEVER share with anyone?',
   ARRAY['Your wallet public address','Your seed phrase or private key','Your transaction history','Your username on a DEX'], 1, 'Your seed phrase and private key are the master keys to your funds — sharing them gives someone complete and permanent control.', 'Beginner');

-- ─────────────────────────────────────────────────────────────
-- Platform Events (5 events)
-- ─────────────────────────────────────────────────────────────
INSERT INTO events (id, host_user_id, title, description, format, location, starts_at, ends_at, status, category, difficulty, tracks, missions, capacity, reward_pool, cover_emoji, is_platform_event, requires_approval) VALUES
  (gen_random_uuid(), NULL,
   'Avalanche Hackathon: Build on Fuji',
   'A 48-hour online hackathon building DeFi, NFT, and tooling projects on Avalanche Fuji testnet. Open to all skill levels. $5,000 AVAX prize pool.',
   'zoom', NULL,
   NOW() + INTERVAL '14 days', NOW() + INTERVAL '16 days',
   'live', 'hackathon', 'Intermediate',
   ARRAY['DeFi','Smart Contracts','NFT'],
   ARRAY['deploy-first-contract','build-airdrop-contract','mint-first-nft'],
   300, 5000, '🏆', true, false),

  (gen_random_uuid(), NULL,
   'DeFi Deep Dive Workshop',
   'A hands-on workshop covering Trader Joe, Benqi, and Pangolin. Learn to provide liquidity, earn yield, and understand impermanent loss with real testnet transactions.',
   'zoom', NULL,
   NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '3 hours',
   'live', 'workshop', 'Beginner',
   ARRAY['DeFi','Wallets'],
   ARRAY['first-defi-swap','defi-fundamentals'],
   100, 0, '💱', true, false),

  (gen_random_uuid(), NULL,
   'Validator Node Setup Bootcamp',
   'Set up your first Avalanche validator node from scratch. Covers hardware requirements, AvalancheGo installation, network config, and monitoring. Limited to 30 participants.',
   'zoom', NULL,
   NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '4 hours',
   'live', 'workshop', 'Advanced',
   ARRAY['Validators','Security'],
   ARRAY['validator-bootcamp','subnet-validator','node-security-quiz'],
   30, 0, '🖥️', true, false),

  (gen_random_uuid(), NULL,
   'NFT Creator Day: Mint Your First Avalanche NFT',
   'From artwork to on-chain NFT in one day. Join artists and developers to learn IPFS, ERC-721 deployment, and marketplace listing on Joepegs.',
   'hybrid', 'Nairobi, Kenya (+ Zoom)',
   NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days' + INTERVAL '6 hours',
   'live', 'community', 'Beginner',
   ARRAY['NFT','Smart Contracts'],
   ARRAY['mint-first-nft','nft-minting-101'],
   50, 0, '🎨', true, false),

  (gen_random_uuid(), NULL,
   'Web3 Security & Wallet Safety Summit',
   'A free online summit on crypto security: wallet hygiene, recognizing scams, smart contract auditing basics, and real-world attack case studies.',
   'zoom', NULL,
   NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '5 hours',
   'live', 'community', 'Beginner',
   ARRAY['Security','Wallets'],
   ARRAY['wallet-wars-game','security-hygiene','wallet-setup-quiz'],
   500, 0, '🛡️', true, false);
