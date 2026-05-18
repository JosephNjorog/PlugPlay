"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

const games = [
  { emoji: "🏃", title: "Gas Rush", category: "Arcade", desc: "Race along a blockchain highway, collect AVAX, dodge gas spikes.", xp: 150, difficulty: "Beginner", color: "from-orange-500 to-red-500" },
  { emoji: "🧩", title: "Block Builder", category: "Arcade", desc: "Stack blockchain components in the correct logical order. Tetris meets Web3.", xp: 200, difficulty: "Intermediate", color: "from-purple-500 to-violet-600" },
  { emoji: "🔐", title: "Wallet Wars", category: "Multiplayer", desc: "Social deduction — identify phishing wallets before your funds disappear.", xp: 300, difficulty: "Advanced", color: "from-cyan-500 to-blue-600" },
  { emoji: "🍕", title: "DeFi Diner", category: "Arcade", desc: "Run a DeFi protocol — route swaps, serve liquidity, manage yield under pressure.", xp: 250, difficulty: "Intermediate", color: "from-emerald-500 to-teal-600" },
  { emoji: "🎯", title: "Token Toss", category: "Arcade", desc: "Toss tokens into staking pools with perfect timing to maximize yield.", xp: 175, difficulty: "Beginner", color: "from-amber-500 to-orange-600" },
  { emoji: "🧠", title: "Speed Trivia Blitz", category: "Quiz", desc: "20 questions. 10 seconds each. No pause. Top scores hit the event leaderboard.", xp: 200, difficulty: "Intermediate", color: "from-pink-500 to-rose-600" },
  { emoji: "🃏", title: "Chain Cards", category: "Puzzle", desc: "Match Web3 concepts to their definitions — race the clock to clear the board.", xp: 125, difficulty: "Beginner", color: "from-indigo-500 to-blue-600" },
  { emoji: "🧬", title: "Protocol Puzzle", category: "Puzzle", desc: "Assemble a working Avalanche transaction flow from components before time runs out.", xp: 225, difficulty: "Advanced", color: "from-teal-500 to-emerald-600" },
  { emoji: "🎲", title: "On-Chain Roulette", category: "Prediction", desc: "Predict real Avalanche blockchain outcomes — block times, validator counts, bridge volumes.", xp: 175, difficulty: "Intermediate", color: "from-violet-500 to-purple-600" },
];

const difficultyColors: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Advanced: "text-red-400 bg-red-400/10 border-red-400/20",
};

export function GameShowcase() {
  const [filter, setFilter] = useState("All");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const categories = ["All", "Arcade", "Quiz", "Puzzle", "Multiplayer", "Prediction"];
  const filtered = filter === "All" ? games : games.filter((g) => g.category === filter);

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-arena-purple/3 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <span className="text-avax-red text-sm font-semibold tracking-widest uppercase">Game Library</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
            10+ Games,{" "}
            <span className="bg-gradient-to-r from-avax-red to-arena-purple-light bg-clip-text text-transparent">
              Infinite Learning
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            From solo speedruns to 50-player live arenas — every game teaches real blockchain concepts.
          </p>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === cat
                  ? "bg-avax-red text-white shadow-glow-red"
                  : "text-slate-400 hover:text-white border border-white/[0.07] hover:border-white/[0.15]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Game cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {filtered.map((game, i) => (
            <motion.div
              key={game.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.06 }}
              className="glass-card-hover p-5 rounded-2xl group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                  {game.emoji}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs border px-2 py-0.5 rounded-full font-medium ${difficultyColors[game.difficulty]}`}>
                    {game.difficulty}
                  </span>
                  <span className="text-xs text-slate-500 border border-white/[0.06] px-2 py-0.5 rounded-full">
                    {game.category}
                  </span>
                </div>
              </div>
              <h3 className="text-white font-bold text-lg mb-2 group-hover:text-avax-red-light transition-colors">
                {game.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{game.desc}</p>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm text-arena-gold font-mono">
                  <Zap size={12} />
                  +{game.xp} XP
                </span>
                <Link
                  href="/sign-up"
                  className={`text-xs font-semibold bg-gradient-to-r ${game.color} bg-clip-text text-transparent hover:opacity-80 flex items-center gap-1 transition-all`}
                >
                  Play Now <ArrowRight size={12} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/library"
            className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white px-6 py-3 rounded-xl transition-all duration-200 hover:bg-white/[0.04]"
          >
            View Full Library <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
