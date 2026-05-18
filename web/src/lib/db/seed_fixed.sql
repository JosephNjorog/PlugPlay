-- ============================================================
-- Plug n' Play Arena — Fixed Seed (matches actual Neon DB schema)
-- Safe to run multiple times — all inserts use ON CONFLICT DO NOTHING
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
-- Games (38 total — duration as TEXT to match existing schema)
-- ─────────────────────────────────────────────────────────────
INSERT INTO games (id, title, persona, category, difficulty, themes, description, learning_outcome, emoji, duration, xp_reward, reward_type, event_types, game_type, status) VALUES
  ('avax-basics-quiz',       'AVAX Basics Blitz',        'builder',     'Smart Contracts',  'Beginner',     ARRAY['avalanche_basics','smart_contracts'],         'Race through 10 rapid-fire questions about Avalanche fundamentals.',         'Understand chain architecture, consensus, and AVAX tokenomics.',        '⚡', '8 min',  100, 'badge',  ARRAY['hackathon','workshop'], 'quiz',       'live'),
  ('deploy-first-contract',  'Deploy Your First Contract','builder',     'Smart Contracts',  'Intermediate', ARRAY['smart_contracts','developer_tools'],          'Step-by-step quiz on deploying ERC-20 contracts to Fuji testnet.',          'Master the deploy workflow: compile → deploy → verify.',                '🔧', '12 min', 200, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('solidity-speedrun',      'Solidity Speedrun',        'builder',     'Smart Contracts',  'Advanced',     ARRAY['smart_contracts','security'],                 'Race against the clock on Solidity security pitfalls and patterns.',        'Identify re-entrancy, integer overflow, and access control bugs.',      '🏃', '15 min', 350, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('block-builder-game',     'Block Builder',            'builder',     'Smart Contracts',  'Beginner',     ARRAY['avalanche_basics','developer_tools'],          'Build correct block headers and subnet configs in this puzzle game.',      'Learn block structure and Avalanche subnet parameters.',                '🧱', '10 min', 150, 'badge',  ARRAY['workshop'],             'arcade',     'live'),
  ('gas-rush-game',          'Gas Rush',                 'builder',     'Smart Contracts',  'Intermediate', ARRAY['smart_contracts','gas_optimization'],          'Sort transactions by gas priority before the block closes.',               'Understand gas fees, priority, and mempool mechanics.',                 '⛽', '7 min',  180, 'badge',  ARRAY['hackathon','workshop'], 'arcade',     'live'),
  ('abi-decoder',            'ABI Decoder Challenge',    'builder',     'Smart Contracts',  'Advanced',     ARRAY['smart_contracts','developer_tools'],           'Match function selectors to their Solidity signatures.',                    'Understand ABI encoding, function selectors, and calldata.',           '🔑', '10 min', 300, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('subnet-architect',       'Subnet Architect',         'builder',     'Validators',       'Advanced',     ARRAY['validators','smart_contracts'],                'Design a custom subnet — choose VM, validators, and gas settings.',        'Understand subnet customization and validator requirements.',           '🏗️', '15 min', 400, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('protocol-puzzle-game',   'Protocol Puzzle',          'builder',     'Smart Contracts',  'Beginner',     ARRAY['avalanche_basics','smart_contracts'],          'Arrange protocol concepts into the correct sequence.',                      'Build intuition for Avalanche''s layered architecture.',               '🧩', '8 min',  120, 'badge',  ARRAY['workshop'],             'arcade',     'live'),
  ('defi-fundamentals',      'DeFi Fundamentals',        'defi_degen',  'DeFi',             'Beginner',     ARRAY['defi','wallets'],                             'Core DeFi concepts: AMMs, liquidity pools, yield farming.',                'Understand how DEXs, liquidity provision, and yield work.',            '💱', '10 min', 120, 'badge',  ARRAY['workshop'],             'quiz',       'live'),
  ('trader-joe-master',      'Trader Joe Mastery',       'defi_degen',  'DeFi',             'Intermediate', ARRAY['defi','avalanche_basics'],                    'Deep dive into Trader Joe''s liquidity book and veJOE mechanics.',         'Master concentrated liquidity and ve-tokenomics.',                     '🤠', '12 min', 250, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('yield-optimizer',        'Yield Optimizer',          'defi_degen',  'DeFi',             'Intermediate', ARRAY['defi','security'],                            'Calculate optimal yield strategies across Benqi, Aave, and Pangolin.',    'Compare yield opportunities and understand risk-reward tradeoffs.',    '📈', '10 min', 220, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('defi-diner-game',        'DeFi Diner',               'defi_degen',  'DeFi',             'Beginner',     ARRAY['defi','wallets'],                             'Pick the right ingredients (protocols) for each DeFi recipe.',             'Learn which Avalanche DeFi protocols serve which functions.',          '🍽️', '8 min',  130, 'badge',  ARRAY['workshop'],             'arcade',     'live'),
  ('token-toss-game',        'Token Toss',               'defi_degen',  'DeFi',             'Intermediate', ARRAY['defi','bridges'],                             'Match DeFi tasks to the correct Avalanche protocols.',                     'Build a mental map of the Avalanche DeFi ecosystem.',                  '🎯', '7 min',  160, 'badge',  ARRAY['workshop'],             'arcade',     'live'),
  ('liquidation-quiz',       'Liquidation Logic',        'defi_degen',  'DeFi',             'Advanced',     ARRAY['defi','security'],                            'Navigate lending positions to avoid liquidation scenarios.',               'Master collateral ratios, health factors, and liquidation mechanics.',  '⚠️', '12 min', 320, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('bridge-navigator',       'Bridge Navigator',         'defi_degen',  'Bridges',          'Intermediate', ARRAY['bridges','defi'],                             'Choose the optimal bridge route and token path across chains.',            'Understand cross-chain bridges, wrapped assets, and bridge risks.',   '🌉', '10 min', 200, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('avax-staking-master',    'AVAX Staking Master',      'defi_degen',  'Validators',       'Beginner',     ARRAY['validators','defi'],                          'Learn liquid staking, delegation, and staking rewards on Avalanche.',      'Understand staking mechanics, reward rates, and validator selection.', '🥩', '8 min',  110, 'badge',  ARRAY['workshop'],             'quiz',       'live'),
  ('nft-minting-101',        'NFT Minting 101',          'nft_artist',  'NFT',              'Beginner',     ARRAY['nfts','smart_contracts'],                     'From artwork to on-chain: the complete NFT creation workflow.',            'Understand IPFS, metadata standards, and minting mechanics.',          '🎨', '10 min', 130, 'badge',  ARRAY['workshop'],             'quiz',       'live'),
  ('royalties-master',       'Royalties & Rights',       'nft_artist',  'NFT',              'Intermediate', ARRAY['nfts','smart_contracts'],                     'Navigate ERC-2981 royalties, operator filters, and creator economics.',   'Master on-chain royalty enforcement and marketplace mechanics.',       '💸', '10 min', 220, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('chain-cards-game',       'Chain Cards',              'nft_artist',  'NFT',              'Beginner',     ARRAY['nfts','avalanche_basics'],                    'Memory match game with Avalanche NFT ecosystem terms.',                   'Build vocabulary around Avalanche NFT protocols and marketplaces.',   '🃏', '8 min',  110, 'badge',  ARRAY['workshop'],             'arcade',     'live'),
  ('trait-rarity-calc',      'Trait Rarity Calculator',  'nft_artist',  'NFT',              'Intermediate', ARRAY['nfts'],                                       'Calculate rarity scores for trait combinations in NFT collections.',       'Understand rarity mechanics, trait distributions, and scoring.',       '🎲', '8 min',  180, 'badge',  ARRAY['workshop'],             'quiz',       'live'),
  ('nft-security-101',       'NFT Security Audit',       'nft_artist',  'Security',         'Advanced',     ARRAY['nfts','security'],                            'Spot vulnerabilities in NFT contracts: reentrancy, metadata exploits.',   'Identify and patch common NFT smart contract vulnerabilities.',        '🛡️', '12 min', 350, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('marketplace-mastery',    'Marketplace Mastery',      'nft_artist',  'NFT',              'Intermediate', ARRAY['nfts','defi'],                                'Navigate listing, offers, and royalty flows on Avalanche marketplaces.',  'Master Campfire, Joepegs, and NFTrade mechanics.',                    '🛍️', '10 min', 200, 'badge',  ARRAY['workshop'],             'quiz',       'live'),
  ('generative-art-quiz',    'Generative Art Basics',    'nft_artist',  'NFT',              'Beginner',     ARRAY['nfts'],                                       'How generative art algorithms create unique on-chain artwork.',           'Understand SVG, on-chain storage, and generative systems.',           '🖼️', '8 min',  120, 'badge',  ARRAY['workshop'],             'quiz',       'live'),
  ('validator-bootcamp',     'Validator Bootcamp',       'validator',   'Validators',       'Beginner',     ARRAY['validators','avalanche_basics'],               'Everything a new validator needs to know to get started.',                'Understand validator requirements, stake, and setup process.',         '🖥️', '12 min', 140, 'badge',  ARRAY['workshop'],             'quiz',       'live'),
  ('snowman-consensus',      'Snowman Deep Dive',        'validator',   'Validators',       'Advanced',     ARRAY['validators','avalanche_basics'],               'Master the Snowball / Snowflake / Snowman consensus mechanisms.',          'Understand probabilistic finality and sampling-based consensus.',      '❄️', '15 min', 400, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('subnet-validator',       'Subnet Validator Setup',   'validator',   'Validators',       'Intermediate', ARRAY['validators','smart_contracts'],                'Configure and launch a validator node for a custom Avalanche subnet.',    'Complete subnet validator onboarding from scratch.',                   '⚙️', '15 min', 280, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('staking-economics',      'Staking Economics',        'validator',   'Validators',       'Intermediate', ARRAY['validators','defi'],                          'Model validator rewards, uptime penalties, and delegation math.',         'Build intuition for validator economics and profitability.',           '📊', '10 min', 230, 'badge',  ARRAY['workshop'],             'quiz',       'live'),
  ('node-security-quiz',     'Node Security Hardening',  'validator',   'Security',         'Advanced',     ARRAY['validators','security'],                      'Best practices for securing your Avalanche validator node.',              'Implement firewall rules, key management, and monitoring.',            '🔒', '12 min', 380, 'badge',  ARRAY['hackathon'],            'quiz',       'live'),
  ('uptime-champion',        'Uptime Champion',          'validator',   'Validators',       'Beginner',     ARRAY['validators'],                                 'Quick quiz on validator uptime requirements and monitoring tools.',       'Understand uptime SLAs and tools to maintain high availability.',      '⏱️', '8 min',  120, 'badge',  ARRAY['workshop'],             'quiz',       'live'),
  ('wallet-wars-game',       'Wallet Wars',              'validator',   'Security',         'Intermediate', ARRAY['security','wallets'],                         'Security scenario game — choose the safest wallet action.',               'Recognize phishing, drainers, and social engineering attacks.',       '🛡️', '8 min',  170, 'badge',  ARRAY['workshop'],             'arcade',     'live'),
  ('avax-ecosystem-tour',    'Ecosystem Explorer',       'explorer',    'DeFi',             'Beginner',     ARRAY['avalanche_basics','defi'],                    'A whirlwind tour of the Avalanche ecosystem — protocols, tools, and DAOs.','Map the Avalanche ecosystem across DeFi, NFTs, and tooling.',        '🗺️', '8 min',  100, 'badge',  ARRAY['community'],            'quiz',       'live'),
  ('dao-governance-101',     'DAO Governance 101',       'explorer',    'DAOs',             'Beginner',     ARRAY['defi','smart_contracts'],                     'How DAOs work: proposals, voting, quorum, and execution.',                'Understand on-chain governance mechanics and voting power.',           '🗳️', '8 min',  120, 'badge',  ARRAY['community','workshop'], 'quiz',       'live'),
  ('cross-chain-basics',     'Cross-Chain Basics',       'explorer',    'Bridges',          'Beginner',     ARRAY['bridges','avalanche_basics'],                 'What are bridges, messaging protocols, and the risks of cross-chain?',   'Understand bridge mechanics, wrapped assets, and security.',           '🌐', '10 min', 130, 'badge',  ARRAY['workshop'],             'quiz',       'live'),
  ('crypto-history-speed',   'Crypto History Speedrun',  'explorer',    'DeFi',             'Beginner',     ARRAY['avalanche_basics'],                           'How well do you know crypto history? From Bitcoin to Avalanche.',         'Build context around blockchain evolution and key milestones.',        '📜', '8 min',  90,  'badge',  ARRAY['community'],            'quiz',       'live'),
  ('wallet-setup-quiz',      'Wallet Setup Quiz',        'explorer',    'Wallets',          'Beginner',     ARRAY['wallets','security'],                         'Set up Core Wallet correctly — network config, seed phrase safety, more.','Master safe wallet setup for Avalanche C-Chain.',                    '👜', '8 min',  100, 'badge',  ARRAY['workshop'],             'quiz',       'live'),
  ('avalanche-lore',         'Avalanche Lore',           'explorer',    'Validators',       'Beginner',     ARRAY['avalanche_basics'],                           'Trivia on Avalanche''s history, team, and network milestones.',           'Learn the origin story and key milestones of Avalanche.',             '🏔️', '8 min',  80,  'badge',  ARRAY['community'],            'quiz',       'live'),
  ('security-hygiene',       'Security Hygiene Quiz',    'explorer',    'Security',         'Beginner',     ARRAY['security','wallets'],                         'Core crypto security practices every user must know.',                     'Build habits for safe key management and threat awareness.',          '🧼', '8 min',  100, 'badge',  ARRAY['community','workshop'], 'quiz',       'live')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- Challenges (id as text to match existing schema)
-- ─────────────────────────────────────────────────────────────
INSERT INTO challenges (id, slug, title, tagline, emoji, accent, tier, ai_ready, est_minutes, xp_reward, badge_title, concept, brief, steps, submission, verification) VALUES
  ('challenge-deploy-contract', 'deploy-first-contract',
   'Deploy Your First Smart Contract', 'Ship a real ERC-20 on Avalanche Fuji in 15 minutes',
   '🚀', 'blue', 'beginner', true, 15, 150, 'Deployer Badge', 'Smart Contract Deployment',
   'Deploy a simple ERC-20 token contract to the Avalanche Fuji C-Chain testnet using Remix IDE and MetaMask.',
   '[{"title":"Get testnet AVAX from faucet","detail":"Visit faucet.avax.network and request test AVAX to pay gas fees.","hint":"Make sure your wallet is on Fuji C-Chain (Chain ID 43113)"},{"title":"Open Remix and paste the contract","detail":"Open remix.ethereum.org, create MyToken.sol, and paste a simple ERC-20 using OpenZeppelin imports."},{"title":"Compile with Solidity 0.8.20","detail":"Select version 0.8.20, enable optimization at 200 runs, and click Compile."},{"title":"Deploy to Fuji","detail":"Switch to Deploy tab, select Injected Provider, ensure MetaMask is on Fuji, and click Deploy.","hint":"Copy your contract address once deployed"},{"title":"Verify on Snowtrace","detail":"Go to testnet.snowtrace.io, find your contract, and use Verify & Publish to upload your source code."}]'::jsonb,
   '{"primary":{"key":"contractAddress","label":"Deployed Contract Address","placeholder":"0x...","kind":"text"},"extras":[{"key":"txHash","label":"Deployment Transaction Hash","placeholder":"0x...","kind":"text"}]}'::jsonb,
   '{"kind":"on_chain","rules":["Contract must be deployed on Fuji C-Chain (chainId 43113)","Contract address must be a valid ERC-20","Transaction must be confirmable on Snowtrace testnet"]}'::jsonb),

  ('challenge-add-network', 'add-avax-to-metamask',
   'Add Fuji Network to MetaMask', 'Configure your wallet for the Avalanche ecosystem',
   '🦊', 'orange', 'beginner', false, 10, 100, 'Network Setter', 'Wallet Configuration',
   'Configure MetaMask to connect to the Avalanche Fuji C-Chain testnet.',
   '[{"title":"Open MetaMask network settings","detail":"Click the network dropdown, then Add Network → Add a network manually."},{"title":"Enter Fuji C-Chain details","detail":"Network Name: Avalanche Fuji C-Chain. RPC URL: https://api.avax-test.network/ext/bc/C/rpc. Chain ID: 43113. Symbol: AVAX.","hint":"Chain ID 43113 uniquely identifies Fuji"},{"title":"Save and switch networks","detail":"Click Save, then switch to Fuji. Your wallet should show AVAX as the currency."},{"title":"Get test AVAX","detail":"Visit faucet.avax.network and request test AVAX."}]'::jsonb,
   '{"primary":{"key":"walletAddress","label":"Your Wallet Address on Fuji","placeholder":"0x...","kind":"text"}}'::jsonb,
   '{"kind":"manual","rules":["Submit your Fuji wallet address","Admin will verify testnet AVAX balance on Snowtrace","Must have received at least 1 test AVAX"]}'::jsonb),

  ('challenge-defi-swap', 'first-defi-swap',
   'Make Your First DeFi Swap', 'Execute a real swap on Trader Joe — your first DeFi transaction',
   '🤠', 'green', 'intermediate', true, 20, 200, 'Swap Pioneer', 'Decentralized Exchange',
   'Connect to Trader Joe on Fuji testnet, execute a swap from test AVAX to USDC, and submit the transaction hash.',
   '[{"title":"Get test tokens","detail":"Visit faucet.avax.network for test AVAX.","hint":"Make sure you are on the Fuji testnet version of Trader Joe"},{"title":"Connect wallet to Trader Joe","detail":"Go to app.traderjoexyz.com, click Connect Wallet, ensure you are on Fuji testnet."},{"title":"Set slippage tolerance","detail":"Click the settings gear and set slippage to 0.5% for stable pairs.","hint":"Too low slippage = transaction fails"},{"title":"Execute the swap","detail":"Select AVAX as input, USDC as output, enter 0.1 AVAX, and confirm in MetaMask."},{"title":"Copy transaction hash","detail":"Once confirmed, copy the transaction hash from MetaMask activity or Snowtrace."}]'::jsonb,
   '{"primary":{"key":"txHash","label":"Swap Transaction Hash","placeholder":"0x...","kind":"text"}}'::jsonb,
   '{"kind":"on_chain","rules":["Transaction must be on Fuji C-Chain","TX must contain a swap event","Must be within the last 72 hours"]}'::jsonb),

  ('challenge-stake-avax', 'stake-avax-delegation',
   'Delegate AVAX to a Validator', 'Earn staking rewards by delegating to a Fuji validator',
   '🥩', 'purple', 'intermediate', false, 25, 250, 'Delegator Badge', 'Proof of Stake',
   'Using Core Wallet, delegate test AVAX to an active validator on Fuji testnet.',
   '[{"title":"Get test AVAX","detail":"You need at least 25 test AVAX. Visit faucet.avax.network."},{"title":"Open Core Wallet Earn tab","detail":"In Core Wallet, navigate to the Earn section.","hint":"Staking is on P-Chain — Core Wallet handles the cross-chain transfer"},{"title":"Find an active validator","detail":"Pick one with >99% uptime, <10% fee, and at least 2 weeks remaining."},{"title":"Set delegation amount","detail":"Enter your delegation amount and duration. Minimum is 25 test AVAX."},{"title":"Submit and record TX","detail":"Confirm the transaction and copy the P-Chain transaction hash."}]'::jsonb,
   '{"primary":{"key":"txHash","label":"Delegation Transaction Hash (P-Chain)","placeholder":"2Lp...","kind":"text"},"extras":[{"key":"nodeId","label":"Validator Node ID","placeholder":"NodeID-...","kind":"text"}]}'::jsonb,
   '{"kind":"manual","rules":["P-Chain TX hash must be valid","Delegation must be to an active Fuji validator","Amount must be at least 25 test AVAX"]}'::jsonb),

  ('challenge-mint-nft', 'mint-first-nft',
   'Mint Your First NFT on Avalanche', 'Deploy and mint an ERC-721 token on Fuji testnet',
   '🖼️', 'pink', 'intermediate', true, 30, 300, 'NFT Pioneer', 'ERC-721 Standard',
   'Write, deploy, and mint an ERC-721 NFT contract on Fuji C-Chain with IPFS metadata.',
   '[{"title":"Create your artwork","detail":"Create a digital artwork (PNG or SVG). Recommended size: 1000x1000px."},{"title":"Upload to IPFS via Pinata","detail":"Go to app.pinata.cloud, upload your image, and copy the IPFS hash.","hint":"IPFS URI format: ipfs://YOUR_HASH"},{"title":"Write the metadata JSON","detail":"Create metadata.json: {\"name\":\"My First NFT\",\"image\":\"ipfs://YOUR_HASH\"}. Upload to IPFS."},{"title":"Deploy ERC-721 to Fuji","detail":"In Remix, write a simple ERC-721 contract extending OpenZeppelin and deploy to Fuji.","hint":"Use ERC721URIStorage for per-token metadata"},{"title":"Mint token #1","detail":"Call your mint function with your wallet address and IPFS metadata URI."}]'::jsonb,
   '{"primary":{"key":"contractAddress","label":"NFT Contract Address","placeholder":"0x...","kind":"text"},"extras":[{"key":"mintTxHash","label":"Mint Transaction Hash","placeholder":"0x...","kind":"text"},{"key":"metadataUri","label":"IPFS Metadata URI","placeholder":"ipfs://...","kind":"text"}]}'::jsonb,
   '{"kind":"on_chain","rules":["Contract must implement ERC-721","Mint transaction must be on Fuji","Metadata URI must be a valid IPFS link"]}'::jsonb),

  ('challenge-airdrop', 'build-airdrop-contract',
   'Build an Airdrop Contract', 'Write a Merkle-proof airdrop contract and generate proofs',
   '🌬️', 'blue', 'advanced', true, 45, 450, 'Airdrop Architect', 'Merkle Trees',
   'Build a complete Merkle airdrop system: generate a recipient list, compute the Merkle tree, deploy to Fuji, and allow a test address to claim.',
   '[{"title":"Install Merkle tooling","detail":"Set up a Hardhat project with @openzeppelin/merkle-tree."},{"title":"Generate recipient list","detail":"Create 5+ test wallet addresses and amounts. Generate the Merkle root."},{"title":"Write MerkleAirdrop contract","detail":"Store Merkle root, implement claim(amount, proof[]) with MerkleProof.verify().","hint":"Use mapping(address => bool) to prevent double-claiming"},{"title":"Deploy and fund contract","detail":"Deploy to Fuji, then transfer test ERC-20 tokens to the contract."},{"title":"Execute a test claim","detail":"Generate a Merkle proof and call claim() from a test address."}]'::jsonb,
   '{"primary":{"key":"contractAddress","label":"MerkleAirdrop Contract Address","placeholder":"0x...","kind":"text"},"extras":[{"key":"repoUrl","label":"GitHub Repo URL","placeholder":"https://github.com/...","kind":"url"},{"key":"claimTxHash","label":"Test Claim TX Hash","placeholder":"0x...","kind":"text"}]}'::jsonb,
   '{"kind":"on_chain","rules":["Contract must be on Fuji","Claim TX must be valid","GitHub repo must contain complete source code"]}'::jsonb),

  ('challenge-dao-vote', 'create-dao-vote',
   'Launch a DAO Governance Vote', 'Deploy a Governor contract and pass your first proposal',
   '🗳️', 'purple', 'advanced', false, 60, 500, 'Governance Master', 'On-Chain Governance',
   'Use OpenZeppelin Governor to deploy a complete DAO: governance token, timelock, and governor contract.',
   '[{"title":"Deploy governance token","detail":"Deploy an ERC-20Votes token. Mint tokens and delegate to yourself.","hint":"Call delegate(yourAddress) after minting"},{"title":"Deploy TimelockController","detail":"Deploy OZ TimelockController with 60-second min delay for testnet."},{"title":"Deploy Governor contract","detail":"Extend OZ Governor with GovernorVotes and GovernorTimelockControl."},{"title":"Create and pass a proposal","detail":"Submit a proposal, wait for votingDelay, vote FOR, wait for votingPeriod."},{"title":"Queue and execute","detail":"Call queue(), wait 60 seconds, then call execute()."}]'::jsonb,
   '{"primary":{"key":"governorAddress","label":"Governor Contract Address","placeholder":"0x...","kind":"text"},"extras":[{"key":"proposalId","label":"Proposal ID","placeholder":"0x...","kind":"text"},{"key":"executeTxHash","label":"Execute Transaction Hash","placeholder":"0x...","kind":"text"}]}'::jsonb,
   '{"kind":"on_chain","rules":["Governor contract must implement IGovernor","Proposal must be in Executed state","All contracts must be on Fuji C-Chain"]}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- Arena Questions (correct_answer = text, options = jsonb, difficulty = easy/medium/hard)
-- ─────────────────────────────────────────────────────────────
INSERT INTO arena_questions (id, topic, question_text, options, correct_answer, explanation, difficulty) VALUES
  (gen_random_uuid(), 'avalanche_basics', 'What is the Chain ID of Avalanche Fuji testnet?',
   '["43114","43113","1","137"]'::jsonb, '43113', 'Fuji testnet uses Chain ID 43113. Mainnet is 43114.', 'easy'),
  (gen_random_uuid(), 'avalanche_basics', 'Which consensus protocol does the Avalanche C-Chain use?',
   '["Nakamoto","Tendermint","Snowman","PBFT"]'::jsonb, 'Snowman', 'Snowman is Avalanche''s linear chain consensus protocol.', 'easy'),
  (gen_random_uuid(), 'avalanche_basics', 'What does the P-Chain handle on Avalanche?',
   '["Smart contract execution","DeFi swaps","Staking and subnet management","NFT minting"]'::jsonb, 'Staking and subnet management', 'The Platform Chain (P-Chain) manages validators, delegators, and subnets.', 'easy'),
  (gen_random_uuid(), 'avalanche_basics', 'What is the approximate transaction finality time on Avalanche?',
   '["10 minutes","15 seconds","1-2 seconds","1 hour"]'::jsonb, '1-2 seconds', 'Avalanche achieves sub-2-second finality.', 'easy'),
  (gen_random_uuid(), 'avalanche_basics', 'How many chains does the Avalanche Primary Network have?',
   '["1","2","3","5"]'::jsonb, '3', 'The Primary Network has three chains: P-Chain, C-Chain, and X-Chain.', 'easy'),
  (gen_random_uuid(), 'defi', 'What formula does most AMMs (like Trader Joe v1) use?',
   '["x + y = k","x * y = k","x / y = k","x ^ y = k"]'::jsonb, 'x * y = k', 'The constant product formula x * y = k ensures pool liquidity is always maintained.', 'medium'),
  (gen_random_uuid(), 'defi', 'What is "impermanent loss" in DeFi?',
   '["Gas fee for failed transactions","Loss from price divergence vs holding","Smart contract hack loss","Permanent token burn"]'::jsonb, 'Loss from price divergence vs holding', 'Impermanent loss occurs when pool token prices diverge from when you deposited.', 'medium'),
  (gen_random_uuid(), 'defi', 'What must you do before swapping an ERC-20 token on a DEX?',
   '["Bridge the token","Approve the token","Stake the token","Burn the token"]'::jsonb, 'Approve the token', 'You must approve the DEX router to spend your tokens before any swap.', 'easy'),
  (gen_random_uuid(), 'defi', 'What does TVL stand for in DeFi?',
   '["Total Value Locked","Token Vault Ledger","Trade Volume Limit","Transaction Verification Layer"]'::jsonb, 'Total Value Locked', 'TVL measures how much capital is deposited in a DeFi protocol.', 'easy'),
  (gen_random_uuid(), 'defi', 'What happens during a DeFi liquidation?',
   '["Your wallet is hacked","Collateral is sold to repay debt when health factor drops below 1","Tokens are burned permanently","Gas fees are refunded"]'::jsonb, 'Collateral is sold to repay debt when health factor drops below 1', 'When collateral value falls below the liquidation threshold, liquidators can repay debt and claim collateral at a discount.', 'medium'),
  (gen_random_uuid(), 'smart_contracts', 'What is a smart contract function selector?',
   '["A 4-byte hash of the function signature","The contract address","The gas price for the function","The function return type"]'::jsonb, 'A 4-byte hash of the function signature', 'Function selectors are the first 4 bytes of the keccak256 hash of the function signature.', 'hard'),
  (gen_random_uuid(), 'smart_contracts', 'Which Solidity keyword prevents reentrancy attacks?',
   '["payable","pure","nonReentrant (via OpenZeppelin)","view"]'::jsonb, 'nonReentrant (via OpenZeppelin)', 'OpenZeppelin''s ReentrancyGuard and nonReentrant modifier prevent reentrant calls.', 'medium'),
  (gen_random_uuid(), 'smart_contracts', 'What does the payable keyword enable in Solidity?',
   '["Free gas transactions","Functions to receive ETH/AVAX","Auto-approve token transfers","Cross-chain calls"]'::jsonb, 'Functions to receive ETH/AVAX', 'payable allows a function or address to receive native cryptocurrency.', 'easy'),
  (gen_random_uuid(), 'smart_contracts', 'What ERC standard defines NFTs?',
   '["ERC-20","ERC-721","ERC-1155","ERC-4337"]'::jsonb, 'ERC-721', 'ERC-721 is the non-fungible token standard. ERC-1155 allows both fungible and non-fungible tokens.', 'easy'),
  (gen_random_uuid(), 'smart_contracts', 'What is the EVM storage slot for the first state variable?',
   '["Slot 0","Slot 1","Slot 255","Random hash"]'::jsonb, 'Slot 0', 'Solidity stores the first state variable at storage slot 0.', 'hard'),
  (gen_random_uuid(), 'nfts', 'What does IPFS stand for?',
   '["Internet Protocol File System","InterPlanetary File System","Internal Protocol for Fast Storage","Integrated Peer File Sharing"]'::jsonb, 'InterPlanetary File System', 'IPFS is a distributed storage protocol commonly used for NFT metadata and images.', 'easy'),
  (gen_random_uuid(), 'nfts', 'What is an NFT royalty standard on EVM chains?',
   '["ERC-20","ERC-721","ERC-2981","ERC-4626"]'::jsonb, 'ERC-2981', 'ERC-2981 is the NFT royalty standard, allowing creators to receive a percentage of secondary sales.', 'medium'),
  (gen_random_uuid(), 'nfts', 'What is a "floor price" in NFT terminology?',
   '["The cost to mint a new token","The lowest listed price for a collection","The average sale price","The developer royalty rate"]'::jsonb, 'The lowest listed price for a collection', 'Floor price is the cheapest NFT currently listed for sale in a collection.', 'easy'),
  (gen_random_uuid(), 'nfts', 'Which Avalanche-native NFT marketplace uses the Joepegs brand?',
   '["OpenSea","Campfire","Joepegs","NFTrade"]'::jsonb, 'Joepegs', 'Joepegs is Trader Joe''s NFT marketplace — a native Avalanche platform.', 'easy'),
  (gen_random_uuid(), 'nfts', 'Where is NFT metadata typically stored on Avalanche?',
   '["In the smart contract storage","On IPFS or Arweave","In the transaction data","On a centralized server always"]'::jsonb, 'On IPFS or Arweave', 'NFT metadata is typically on IPFS or Arweave for decentralized, persistent storage.', 'easy'),
  (gen_random_uuid(), 'security', 'What is a "seed phrase" (mnemonic)?',
   '["Your wallet public address","A 12-24 word backup that controls full wallet access","A password for a DEX","A transaction signature"]'::jsonb, 'A 12-24 word backup that controls full wallet access', 'A seed phrase is the master key to your wallet — anyone with it can access all funds.', 'easy'),
  (gen_random_uuid(), 'security', 'What is a "drainer" smart contract?',
   '["A contract that optimizes gas","A malicious contract designed to steal wallet funds on approval","A contract that burns tokens","A cross-chain bridge contract"]'::jsonb, 'A malicious contract designed to steal wallet funds on approval', 'Drainer contracts exploit unlimited token approvals to empty wallets.', 'medium'),
  (gen_random_uuid(), 'security', 'What does a re-entrancy attack exploit?',
   '["Integer overflow in token math","External contract call before state update","Insufficient gas in transactions","Invalid signature verification"]'::jsonb, 'External contract call before state update', 'Re-entrancy attacks exploit contracts that make external calls before updating their state.', 'hard'),
  (gen_random_uuid(), 'security', 'What is the safest way to buy a hardware wallet?',
   '["eBay at 50% off","Official retailer or manufacturer website","Crypto conferences secondhand","Any Amazon seller"]'::jsonb, 'Official retailer or manufacturer website', 'Only buy hardware wallets from official manufacturers or authorized retailers.', 'easy'),
  (gen_random_uuid(), 'security', 'What should you NEVER share with anyone?',
   '["Your wallet public address","Your seed phrase or private key","Your transaction history","Your username on a DEX"]'::jsonb, 'Your seed phrase or private key', 'Your seed phrase and private key are the master keys to your funds.', 'easy');

-- ─────────────────────────────────────────────────────────────
-- Platform Events
-- ─────────────────────────────────────────────────────────────
INSERT INTO events (id, host_user_id, title, description, format, location, starts_at, ends_at, status, category, difficulty, tracks, missions, capacity, reward_pool, cover_emoji, is_platform_event, requires_approval) VALUES
  (gen_random_uuid(), NULL, 'Avalanche Hackathon: Build on Fuji',
   'A 48-hour online hackathon building DeFi, NFT, and tooling projects on Avalanche Fuji testnet. $5,000 AVAX prize pool.',
   'zoom', NULL, NOW() + INTERVAL '14 days', NOW() + INTERVAL '16 days',
   'live', 'hackathon', 'Intermediate', ARRAY['DeFi','Smart Contracts','NFT'],
   ARRAY['challenge-deploy-contract','challenge-airdrop','challenge-mint-nft'],
   300, '5000', '🏆', true, false),

  (gen_random_uuid(), NULL, 'DeFi Deep Dive Workshop',
   'Hands-on workshop covering Trader Joe, Benqi, and Pangolin. Learn liquidity provision, yield, and impermanent loss.',
   'zoom', NULL, NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '3 hours',
   'live', 'workshop', 'Beginner', ARRAY['DeFi','Wallets'],
   ARRAY['challenge-defi-swap','defi-fundamentals'],
   100, '0', '💱', true, false),

  (gen_random_uuid(), NULL, 'Validator Node Setup Bootcamp',
   'Set up your first Avalanche validator node from scratch. Covers hardware, AvalancheGo, and monitoring. Limited to 30.',
   'zoom', NULL, NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '4 hours',
   'live', 'workshop', 'Advanced', ARRAY['Validators','Security'],
   ARRAY['validator-bootcamp','subnet-validator','node-security-quiz'],
   30, '0', '🖥️', true, false),

  (gen_random_uuid(), NULL, 'NFT Creator Day: Mint Your First Avalanche NFT',
   'From artwork to on-chain NFT in one day. Learn IPFS, ERC-721 deployment, and Joepegs marketplace listing.',
   'hybrid', 'Nairobi, Kenya (+ Zoom)', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days' + INTERVAL '6 hours',
   'live', 'community', 'Beginner', ARRAY['NFT','Smart Contracts'],
   ARRAY['challenge-mint-nft','nft-minting-101'],
   50, '0', '🎨', true, false),

  (gen_random_uuid(), NULL, 'Web3 Security & Wallet Safety Summit',
   'Free online summit on crypto security: wallet hygiene, recognizing scams, smart contract auditing basics.',
   'zoom', NULL, NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '5 hours',
   'live', 'community', 'Beginner', ARRAY['Security','Wallets'],
   ARRAY['wallet-wars-game','security-hygiene','wallet-setup-quiz'],
   500, '0', '🛡️', true, false);
