"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, Play, Zap, Shield, Trophy, Cpu } from "lucide-react";

const floatingCards = [
  { emoji: "🏃", title: "Gas Rush", xp: "+150 XP", color: "from-orange-500/20 to-red-500/20", delay: 0, x: -20, y: 0 },
  { emoji: "🧩", title: "Block Builder", xp: "+200 XP", color: "from-purple-500/20 to-violet-500/20", delay: 0.5, x: 20, y: -30 },
  { emoji: "🔐", title: "Wallet Wars", xp: "+NFT", color: "from-cyan-500/20 to-blue-500/20", delay: 1, x: -10, y: 20 },
  { emoji: "🎯", title: "Token Toss", xp: "+175 XP", color: "from-emerald-500/20 to-teal-500/20", delay: 1.5, x: 30, y: 10 },
];

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  duration: 8 + Math.random() * 12,
  delay: Math.random() * 8,
  size: 1 + Math.random() * 3,
}));

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 hero-grid-bg opacity-100" />
      <div className="absolute inset-0 bg-gradient-radial from-arena-purple/8 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-radial from-avax-red/5 via-transparent to-transparent" style={{ backgroundPosition: "70% 30%" }} />

      {/* Animated particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-arena-purple/40"
          style={{
            left: `${p.x}%`,
            bottom: 0,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -window?.innerHeight || -800],
            x: [0, (Math.random() - 0.5) * 100],
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-avax-red/5 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-arena-purple/5 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 right-1/3 w-60 h-60 bg-arena-cyan/5 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: "2s" }} />

      {/* Floating game cards (desktop) */}
      <div className="absolute inset-0 hidden lg:block">
        {floatingCards.map((card, i) => (
          <motion.div
            key={i}
            className={`absolute glass-card bg-gradient-to-br ${card.color} p-4 rounded-2xl border border-white/10 w-44`}
            style={{
              top: `${25 + i * 15}%`,
              [i % 2 === 0 ? "left" : "right"]: `${5 + (i % 2 === 0 ? 0 : 2)}%`,
            }}
            animate={{ y: [card.y, card.y - 15, card.y] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: card.delay }}
          >
            <div className="text-2xl mb-2">{card.emoji}</div>
            <div className="text-white font-semibold text-sm">{card.title}</div>
            <div className="text-arena-gold text-xs font-mono mt-1">{card.xp}</div>
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 pt-20"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-avax-red/10 border border-avax-red/20 text-avax-red-light text-sm font-medium px-4 py-1.5 rounded-full mb-8"
        >
          <Zap size={12} className="animate-pulse" />
          <span>Built on Avalanche Fuji Testnet</span>
          <span className="w-1.5 h-1.5 rounded-full bg-avax-red animate-pulse" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-5xl sm:text-6xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-6"
        >
          <span className="text-white">Learn Web3.</span>
          <br />
          <span className="bg-gradient-to-r from-avax-red via-arena-purple-light to-arena-cyan bg-clip-text text-transparent animated-gradient">
            Play to Earn.
          </span>
          <br />
          <span className="text-white">Level Up.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Choose your persona. Complete missions. Race speedrun challenges. Compete in live arenas.
          Earn real NFT badges on the Avalanche blockchain.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Link
            href="/sign-up"
            className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-glow-red hover:shadow-glow-purple transition-all duration-300 hover:scale-105"
          >
            <Zap size={18} className="group-hover:rotate-12 transition-transform" />
            Start Playing Free
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/arena/join"
            className="group flex items-center justify-center gap-3 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-300"
          >
            <Play size={18} className="text-avax-red" />
            Join Live Arena
          </Link>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {[
            { icon: Shield, label: "NFT Badges" },
            { icon: Trophy, label: "Live Leaderboard" },
            { icon: Cpu, label: "On-Chain Speedruns" },
            { icon: Zap, label: "Real-Time Arena" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 text-sm text-slate-400 border border-white/[0.07] bg-white/[0.03] px-4 py-2 rounded-full"
            >
              <Icon size={14} className="text-arena-purple-light" />
              {label}
            </span>
          ))}
        </motion.div>

        {/* Social proof bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {["🧑‍💻", "👩‍🎓", "🧑‍🚀", "👩‍💼", "🧑‍🔬"].map((emoji, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs">
                  {emoji}
                </div>
              ))}
            </div>
            <span>5,000+ players</span>
          </div>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />
          <span>38 missions available</span>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />
          <span>Avalanche Fuji testnet</span>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />
          <span>Free to play</span>
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#080810] to-transparent pointer-events-none" />

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-white/40 animate-scan" />
        </div>
      </motion.div>
    </section>
  );
}
