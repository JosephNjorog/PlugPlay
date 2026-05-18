"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Zap, ExternalLink } from "lucide-react";

const features = [
  {
    icon: "⚡",
    title: "Avalanche Fuji Testnet",
    description: "All on-chain interactions run on Fuji C-Chain — real blockchain, zero financial risk. Deploy contracts, bridge assets, and verify transactions.",
    color: "from-avax-red to-rose-600",
  },
  {
    icon: "🎖️",
    title: "ERC-721 NFT Badges",
    description: "Complete missions to earn NFT badges that are minted directly to your Core wallet. Rarity scales with difficulty — Common, Rare, Legendary.",
    color: "from-arena-purple to-violet-600",
  },
  {
    icon: "🔍",
    title: "Snowtrace Verification",
    description: "Advanced speedrun challenges verify your on-chain submissions via the Snowtrace API — no cheating, real blockchain proof.",
    color: "from-arena-cyan to-blue-600",
  },
  {
    icon: "🌉",
    title: "Core Wallet Integration",
    description: "Connect your Core wallet to receive token rewards, mint NFT badges, and participate in token-gated events across the Avalanche ecosystem.",
    color: "from-arena-gold to-orange-600",
  },
];

export function BlockchainSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-avax-red/3 to-transparent" />

      {/* Animated blockchain visual */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full opacity-10 hidden xl:block">
        <div className="relative h-full flex flex-col justify-center gap-6 pr-16">
          {Array.from({ length: 8 }, (_, i) => (
            <motion.div
              key={i}
              className="h-12 bg-gradient-to-r from-avax-red/50 to-arena-purple/50 rounded-lg border border-white/10"
              animate={{ x: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-avax-red text-sm font-semibold tracking-widest uppercase">Real Blockchain</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
            Not a Simulation.{" "}
            <span className="bg-gradient-to-r from-avax-red to-arena-gold bg-clip-text text-transparent">
              The Real Chain.
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Plug n' Play Arena uses the Avalanche Fuji testnet — every badge, every speedrun, every verification is on-chain.
          </p>
        </motion.div>

        {/* Network details card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="glass-card neon-border-red p-6 rounded-2xl mb-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { label: "Network", value: "Avalanche Fuji" },
            { label: "Chain ID", value: "43113" },
            { label: "Currency", value: "AVAX" },
            { label: "Explorer", value: "Snowtrace", link: "https://testnet.snowtrace.io" },
          ].map(({ label, value, link }) => (
            <div key={label} className="text-center">
              <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">{label}</div>
              {link ? (
                <a href={link} target="_blank" rel="noopener noreferrer" className="text-avax-red-light font-mono font-bold flex items-center justify-center gap-1 hover:text-avax-red transition-colors">
                  {value} <ExternalLink size={12} />
                </a>
              ) : (
                <div className="text-white font-mono font-bold">{value}</div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-card-hover p-6 rounded-2xl flex gap-5"
            >
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl`}>
                {feature.icon}
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
