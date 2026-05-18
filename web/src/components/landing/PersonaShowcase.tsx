"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const personas = [
  {
    id: "student",
    emoji: "🧑‍🎓",
    title: "Student",
    subtitle: "New to Web3",
    description: "Master Avalanche fundamentals, set up your first wallet, and earn your Newcomer NFT badge.",
    missions: ["Wallet Setup 101", "AVAX Basics Quiz", "Consensus Explorer"],
    xpRange: "0–500 XP",
    gradient: "from-pink-500 to-rose-600",
    glow: "shadow-[0_0_30px_rgba(244,114,182,0.3)]",
    border: "border-pink-500/30",
    bgAccent: "bg-pink-500/5",
  },
  {
    id: "developer",
    emoji: "🧑‍💻",
    title: "Developer",
    subtitle: "Builder & Coder",
    description: "Deploy smart contracts on Fuji, interact with the C-Chain, and race through Solidity speedruns.",
    missions: ["Fuji Deploy Race", "Token Contract Build", "Bridge Challenge"],
    xpRange: "500–5K XP",
    gradient: "from-cyan-500 to-blue-600",
    glow: "shadow-[0_0_30px_rgba(6,182,212,0.3)]",
    border: "border-cyan-500/30",
    bgAccent: "bg-cyan-500/5",
  },
  {
    id: "builder",
    emoji: "🏗️",
    title: "Builder",
    subtitle: "Protocol Builder",
    description: "Navigate DeFi primitives, bridge assets, and deploy full protocol stacks on Avalanche.",
    missions: ["DeFi Diner Challenge", "Protocol Puzzle", "Liquidity Sprint"],
    xpRange: "2K–10K XP",
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
    border: "border-emerald-500/30",
    bgAccent: "bg-emerald-500/5",
  },
  {
    id: "founder",
    emoji: "🚀",
    title: "Founder",
    subtitle: "Startup & Project",
    description: "Master tokenomics, ecosystem strategy, and build your vision on the Avalanche ecosystem.",
    missions: ["Tokenomics Design", "Ecosystem Roulette", "DAO Builder"],
    xpRange: "5K–20K XP",
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.3)]",
    border: "border-amber-500/30",
    bgAccent: "bg-amber-500/5",
  },
  {
    id: "business",
    emoji: "💼",
    title: "Business",
    subtitle: "Enterprise Web3",
    description: "Understand institutional blockchain adoption, compliance, and Web3 business strategy.",
    missions: ["Compliance Quiz", "Enterprise DeFi", "On-Chain Roulette"],
    xpRange: "All Levels",
    gradient: "from-purple-500 to-violet-600",
    glow: "shadow-[0_0_30px_rgba(124,58,237,0.3)]",
    border: "border-purple-500/30",
    bgAccent: "bg-purple-500/5",
  },
];

export function PersonaShowcase() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const p = personas[active];

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-arena-purple-light text-sm font-semibold tracking-widest uppercase">5 Personas</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
            Your Journey, <span className="gradient-text">Your Rules</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Every persona gets a curated path of missions, challenges, and events tailored to where you are in Web3.
          </p>
        </motion.div>

        {/* Persona selector tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {personas.map((persona, i) => (
            <motion.button
              key={persona.id}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
              onClick={() => setActive(i)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                active === i
                  ? `bg-gradient-to-r ${persona.gradient} text-white ${persona.glow}`
                  : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06] hover:border-white/[0.12]"
              }`}
            >
              <span>{persona.emoji}</span>
              {persona.title}
            </motion.button>
          ))}
        </div>

        {/* Showcase panel */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`glass-card ${p.bgAccent} ${p.border} border rounded-3xl overflow-hidden`}
        >
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left: Info */}
            <div className="p-8 sm:p-12 flex flex-col justify-between">
              <div>
                <div className="text-5xl mb-6">{p.emoji}</div>
                <h3 className="text-3xl font-black text-white mb-2">{p.title}</h3>
                <p className="text-slate-400 font-medium mb-4">{p.subtitle}</p>
                <p className="text-slate-300 text-lg leading-relaxed mb-8">{p.description}</p>

                <div className="space-y-3 mb-8">
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Featured Missions</div>
                  {p.missions.map((m) => (
                    <div key={m} className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${p.gradient}`} />
                      <span className="text-slate-300 text-sm">{m}</span>
                    </div>
                  ))}
                </div>

                <div className={`inline-flex items-center gap-2 text-sm font-mono bg-gradient-to-r ${p.gradient} bg-clip-text text-transparent`}>
                  <span>🏆</span>
                  {p.xpRange}
                </div>
              </div>

              <Link
                href="/sign-up"
                className={`mt-8 self-start inline-flex items-center gap-2 bg-gradient-to-r ${p.gradient} text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all duration-200 hover:gap-3`}
              >
                Start as {p.title}
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right: Visual */}
            <div className={`relative p-8 sm:p-12 bg-gradient-to-br ${p.gradient} opacity-[0.08] rounded-r-3xl`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[200px] opacity-10 select-none">{p.emoji}</span>
              </div>
              <div className="relative space-y-4">
                {/* Mock mission cards */}
                {p.missions.map((mission, i) => (
                  <motion.div
                    key={mission}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-4 rounded-xl flex items-center gap-3"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.gradient} flex items-center justify-center text-sm`}>
                      {i === 0 ? "🎯" : i === 1 ? "⚡" : "🏆"}
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{mission}</div>
                      <div className="text-slate-500 text-xs">{["Beginner", "Intermediate", "Advanced"][i]}</div>
                    </div>
                    <div className={`text-xs font-mono bg-gradient-to-r ${p.gradient} bg-clip-text text-transparent`}>
                      +{[100, 150, 200][i]} XP
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
