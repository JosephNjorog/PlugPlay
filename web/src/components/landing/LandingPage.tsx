"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Zap, Trophy, Users, ArrowRight, Play, Award, Code, Coins,
  Palette, Wrench, Sparkles, CheckCircle, Menu, X, TrendingUp,
  Shield, Layers, Target, Star, Clock, ChevronRight, Globe,
  Twitter, Github, Flame
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [threshold]);
  return scrolled;
}

function SectionReveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 48 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }} className={className}>
      {children}
    </motion.div>
  );
}

function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = target;
    const duration = 1800;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PERSONAS = [
  {
    emoji: "🦊", name: "DeFi Degen",
    desc: "Deep-dive into liquidity pools, yield farming, and AMMs. Navigate DeFi like a seasoned pro.",
    games: 12, challenges: 3, xpMax: "15,000",
    from: "#F97316", to: "#EAB308",
    border: "rgba(249,115,22,0.3)", glow: "rgba(249,115,22,0.15)",
    tag: "DeFi", id: "defi_degen",
  },
  {
    emoji: "🎨", name: "NFT Collector",
    desc: "Master rarity mechanics, on-chain metadata, and marketplace strategy. Build your blue-chip portfolio.",
    games: 10, challenges: 2, xpMax: "12,000",
    from: "#EC4899", to: "#8B5CF6",
    border: "rgba(236,72,153,0.3)", glow: "rgba(236,72,153,0.15)",
    tag: "NFTs", id: "nft_collector",
  },
  {
    emoji: "⚙️", name: "Chain Builder",
    desc: "Go deep on smart contracts, subnets, validators, and consensus. Build on Avalanche from first principles.",
    games: 9, challenges: 3, xpMax: "18,000",
    from: "#3B82F6", to: "#06B6D4",
    border: "rgba(59,130,246,0.3)", glow: "rgba(59,130,246,0.15)",
    tag: "Dev", id: "chain_builder",
  },
  {
    emoji: "🌱", name: "Crypto Curious",
    desc: "Brand new to Web3? Start with wallets, blockchain basics, and your first on-chain transaction.",
    games: 7, challenges: 2, xpMax: "8,000",
    from: "#10B981", to: "#06B6D4",
    border: "rgba(16,185,129,0.3)", glow: "rgba(16,185,129,0.15)",
    tag: "Beginner", id: "crypto_curious",
  },
];

const GAMES = [
  { emoji: "🚀", title: "Gas Rush", persona: "DeFi Degen", xp: 500, diff: "Medium", color: "#F97316" },
  { emoji: "🏗️", title: "Block Builder", persona: "Chain Builder", xp: 400, diff: "Hard", color: "#3B82F6" },
  { emoji: "🃏", title: "Chain Cards", persona: "All", xp: 300, diff: "Easy", color: "#8B5CF6" },
  { emoji: "🎲", title: "Token Toss", persona: "DeFi Degen", xp: 450, diff: "Medium", color: "#F97316" },
  { emoji: "⚔️", title: "Wallet Wars", persona: "All", xp: 600, diff: "Hard", color: "#EF4444" },
  { emoji: "🍽️", title: "DeFi Diner", persona: "DeFi Degen", xp: 550, diff: "Medium", color: "#F97316" },
  { emoji: "🧩", title: "Protocol Puzzle", persona: "Chain Builder", xp: 500, diff: "Hard", color: "#3B82F6" },
  { emoji: "🎨", title: "NFT Studio", persona: "NFT Collector", xp: 350, diff: "Easy", color: "#EC4899" },
  { emoji: "🌊", title: "Subnet Surfer", persona: "Chain Builder", xp: 650, diff: "Expert", color: "#06B6D4" },
];

const CHALLENGES = [
  { tier: "Starter", title: "First Transaction", badge: "🥉", color: "#10B981" },
  { tier: "Novice", title: "Wallet Setup", badge: "🥈", color: "#3B82F6" },
  { tier: "Intermediate", title: "Token Swap", badge: "🥇", color: "#8B5CF6" },
  { tier: "Advanced", title: "LP Provider", badge: "💎", color: "#EC4899" },
  { tier: "Expert", title: "Deploy ERC-20", badge: "🔮", color: "#F97316" },
  { tier: "Master", title: "Subnet Deploy", badge: "👑", color: "#EAB308" },
  { tier: "Legend", title: "Merkle Airdrop", badge: "🌟", color: "#EF4444" },
];

const NFT_BADGES = [
  { name: "Gas Guru", desc: "Mastered mempool optimization", emoji: "⛽", color: "#F97316", rarity: "Rare" },
  { name: "Chain Architect", desc: "Built a custom subnet", emoji: "🏗️", color: "#3B82F6", rarity: "Epic" },
  { name: "DeFi Sage", desc: "Completed all DeFi challenges", emoji: "🦊", color: "#8B5CF6", rarity: "Legendary" },
  { name: "NFT Maestro", desc: "Curated 10 on-chain pieces", emoji: "🎨", color: "#EC4899", rarity: "Rare" },
];

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#personas", label: "Personas" },
    { href: "#games", label: "Games" },
    { href: "#arena", label: "Arena" },
    { href: "#challenges", label: "Challenges" },
  ];
  return (
    <motion.nav initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#080810]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-xl shadow-black/40" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
            <Zap className="w-4 h-4 text-white fill-current" />
          </div>
          <span className="font-bold text-white tracking-tight">Plug<span className="text-purple-400">n</span>Play</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors duration-200">{l.label}</a>
          ))}
        </div>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-slate-400 hover:text-white px-4 py-2 transition-colors">Sign In</Link>
          <Link href="/sign-up" className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-5 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35">
            Play Free
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-slate-400 hover:text-white p-2">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0c0c18] border-b border-white/[0.06] px-4 pb-4">
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="block py-3 text-slate-400 hover:text-white border-b border-white/[0.04] transition-colors">{l.label}</a>
            ))}
            <div className="flex gap-3 pt-4">
              <Link href="/sign-in" className="flex-1 text-center text-sm text-slate-400 hover:text-white border border-white/10 rounded-lg py-2.5 transition-colors">Sign In</Link>
              <Link href="/sign-up" className="flex-1 text-center text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg py-2.5">Play Free</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const HERO_WORDS = ["DeFi", "NFTs", "Avalanche", "Web3", "Subnets"];

function Hero() {
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % HERO_WORDS.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-purple-600/[0.12] rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] bg-blue-600/[0.10] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -right-32 w-[400px] h-[400px] bg-cyan-500/[0.08] rounded-full blur-[90px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-900/[0.15] rounded-full blur-[100px]" />
      </div>

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(rgba(139,92,246,0.15) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Gradient vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-transparent to-[#050510] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-4 leading-[0.92]">
          <span className="text-white">Master </span>
          <span className="relative inline-block">
            <AnimatePresence mode="wait">
              <motion.span key={wordIdx}
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                transition={{ duration: 0.4 }}
                className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent inline-block"
              >
                {HERO_WORDS[wordIdx]}
              </motion.span>
            </AnimatePresence>
          </span>
          <br />
          <span className="text-white">Through Play</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          The world&apos;s first gamified Web3 learning arena. Play 38+ games, complete real challenges,
          and earn NFT badges — all verified on-chain.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Link href="/sign-up"
            className="group inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.45)] hover:-translate-y-0.5">
            Start Playing Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#how-it-works"
            className="inline-flex items-center justify-center gap-2.5 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.10] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 backdrop-blur-sm hover:-translate-y-0.5">
            <Play className="w-4 h-4 fill-white/80" />
            See How It Works
          </a>
        </motion.div>

        {/* Trust stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
          {[
            { icon: Users, color: "text-purple-400", text: "12,000+ Players" },
            { icon: Zap, color: "text-yellow-400", text: "38 Games" },
            { icon: Award, color: "text-blue-400", text: "NFT Badges on Fuji" },
            { icon: Shield, color: "text-green-400", text: "Free to Play" },
          ].map((s, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              {s.text}
            </span>
          ))}
        </motion.div>

        {/* Floating game preview cards */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.6 }}
          className="relative mt-16 max-w-3xl mx-auto h-48 pointer-events-none select-none hidden sm:block">
          {[
            { emoji: "🚀", title: "Gas Rush", xp: "500 XP", left: "0%", top: "0%", rotate: "-6deg", z: 1 },
            { emoji: "⚔️", title: "Wallet Wars", xp: "600 XP", left: "30%", top: "-20%", rotate: "2deg", z: 3 },
            { emoji: "🧩", title: "Protocol Puzzle", xp: "500 XP", left: "62%", top: "0%", rotate: "5deg", z: 2 },
          ].map((card, i) => (
            <motion.div key={i} animate={{ y: [0, -8, 0] }} transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.7, ease: "easeInOut" }}
              className="absolute bg-white/[0.06] border border-white/[0.12] rounded-2xl px-5 py-4 backdrop-blur-md shadow-2xl"
              style={{ left: card.left, top: card.top, rotate: card.rotate, zIndex: card.z, minWidth: 160 }}>
              <div className="text-2xl mb-1">{card.emoji}</div>
              <div className="text-white font-semibold text-sm">{card.title}</div>
              <div className="text-purple-400 text-xs font-medium mt-0.5">{card.xp}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600 text-xs">
        <span>Scroll to explore</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.4, repeat: Infinity }}
          className="w-5 h-8 border border-slate-700 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1 h-1.5 bg-slate-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = [
    { icon: Users, label: "Players Worldwide", value: 12847, suffix: "+", color: "text-purple-400" },
    { icon: Zap, label: "XP Awarded", value: 2500000, suffix: "+", color: "text-yellow-400" },
    { icon: Trophy, label: "Games Played", value: 94000, suffix: "+", color: "text-blue-400" },
    { icon: Award, label: "NFT Badges Minted", value: 3200, suffix: "+", color: "text-green-400" },
  ];
  return (
    <section className="relative py-12 border-y border-white/[0.05] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-950/30 via-slate-950/50 to-blue-950/30" />
      <div className="relative max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <SectionReveal key={i} delay={i * 0.1} className="text-center">
              <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
              <div className="text-3xl font-black text-white mb-0.5">
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Personas ─────────────────────────────────────────────────────────────────

function PersonasSection() {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <section id="personas" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-600/[0.05] rounded-full blur-[100px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4">
        <SectionReveal className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest text-purple-400 uppercase mb-4 bg-purple-400/10 px-3 py-1 rounded-full border border-purple-400/20">
            Learning Paths
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 tracking-tight">
            Choose Your Persona
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Every learner is different. Pick the path that matches your goals — your games, challenges, and XP rewards are tailored to you.
          </p>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PERSONAS.map((p, i) => (
            <SectionReveal key={p.id} delay={i * 0.08}>
              <Link
                href="/sign-up"
                className="relative group rounded-2xl p-6 block cursor-pointer transition-all duration-300 hover:-translate-y-2"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: hovered === i ? `linear-gradient(135deg, ${p.from}15, ${p.to}10)` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${hovered === i ? p.border : "rgba(255,255,255,0.07)"}`,
                  boxShadow: hovered === i ? `0 24px 60px ${p.glow}` : "none",
                  transition: "all 0.3s ease",
                }}>
                {/* Gradient glow orb */}
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle, ${p.from}60, transparent)` }} />

                <div className="relative z-10">
                  {/* Emoji */}
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{p.emoji}</div>

                  {/* Tag */}
                  <span className="inline-block text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full mb-3"
                    style={{ background: `${p.from}20`, color: p.from, border: `1px solid ${p.from}30` }}>
                    {p.tag}
                  </span>

                  <h3 className="text-lg font-bold text-white mb-2">{p.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-5">{p.desc}</p>

                  <div className="border-t border-white/[0.06] pt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div><div className="text-white font-bold">{p.games}</div><div className="text-slate-500">Games</div></div>
                    <div><div className="text-white font-bold">{p.challenges}</div><div className="text-slate-500">Challenges</div></div>
                    <div><div className="text-white font-bold">{p.xpMax}</div><div className="text-slate-500">Max XP</div></div>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: p.from }}>
                    Choose Path <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Games ────────────────────────────────────────────────────────────────────

function GamesSection() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "DeFi Degen", "Chain Builder", "NFT Collector"];
  const filtered = filter === "All" ? GAMES : GAMES.filter(g => g.persona === filter || g.persona === "All");
  const diffColor: Record<string, string> = { Easy: "#10B981", Medium: "#F59E0B", Hard: "#EF4444", Expert: "#8B5CF6" };

  return (
    <section id="games" className="relative py-32 bg-gradient-to-b from-transparent via-[#0a0a18] to-transparent">
      <div className="max-w-7xl mx-auto px-4">
        <SectionReveal className="text-center mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
            Game Library
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 tracking-tight">
            38 Games. One Arena.
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Every game teaches a real Web3 concept. From gas mechanics to NFT rarity — learn by doing, not by reading.
          </p>
        </SectionReveal>

        {/* Filter tabs */}
        <SectionReveal className="flex flex-wrap justify-center gap-2 mb-10">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-sm px-5 py-2 rounded-full border transition-all duration-200 ${
                filter === f
                  ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20"
                  : "bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20"
              }`}>
              {f}
            </button>
          ))}
        </SectionReveal>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((g, i) => (
              <motion.div key={g.title} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}>
                <Link href="/sign-up"
                  className="group block rounded-2xl p-5 bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.15] hover:bg-white/[0.06] transition-all duration-200 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{g.emoji}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${diffColor[g.diff]}20`, color: diffColor[g.diff] }}>
                      {g.diff}
                    </span>
                  </div>
                  <h3 className="text-white font-bold mb-1">{g.title}</h3>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span style={{ color: g.color }} className="font-medium">
                      {g.persona === "All" ? "All Personas" : g.persona}
                    </span>
                    <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                      <Zap className="w-3 h-3 fill-current" />{g.xp} XP
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <SectionReveal className="text-center mt-10">
          <Link href="/sign-up" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors">
            View all 38 games <ArrowRight className="w-4 h-4" />
          </Link>
        </SectionReveal>
      </div>
    </section>
  );
}

// ─── Arena ────────────────────────────────────────────────────────────────────

function ArenaSection() {
  const [players] = useState(Math.floor(Math.random() * 80) + 20);
  const features = [
    { icon: Target, text: "Live questions pushed to all players simultaneously" },
    { icon: TrendingUp, text: "Real-time leaderboard updates every answer" },
    { icon: Users, text: "Up to 50 players per session" },
    { icon: Trophy, text: "Bonus XP multiplier for finishing in the top 3" },
  ];
  return (
    <section id="arena" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent" />
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div>
            <SectionReveal>
              <span className="inline-block text-xs font-semibold tracking-widest text-purple-400 uppercase mb-4 bg-purple-400/10 px-3 py-1 rounded-full border border-purple-400/20">
                Live Multiplayer
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 tracking-tight leading-[1.05]">
                Battle Live.<br />
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Learn Fast.</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                The Arena puts you and up to 50 players in the same session. Answer Web3 questions faster and more accurately than everyone else. Climb the live leaderboard. Earn bonus XP.
              </p>
              <ul className="space-y-4 mb-8">
                {features.map((f, i) => (
                  <SectionReveal key={i} delay={i * 0.07}>
                    <li className="flex items-start gap-3 text-slate-300">
                      <div className="w-6 h-6 rounded-md bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <f.icon className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <span className="text-sm leading-relaxed">{f.text}</span>
                    </li>
                  </SectionReveal>
                ))}
              </ul>
              <div className="flex gap-3">
                <Link href="/sign-up"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/25 hover:-translate-y-0.5">
                  Join the Arena <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </SectionReveal>
          </div>

          {/* Right: mock arena UI */}
          <SectionReveal delay={0.2}>
            <div className="relative">
              {/* Live badge */}
              <div className="absolute -top-3 -right-3 z-20 flex items-center gap-2 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-red-500/30">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                {players} Players Live
              </div>

              {/* Arena window */}
              <div className="bg-[#0c0c1a] border border-white/[0.10] rounded-3xl overflow-hidden shadow-2xl shadow-black/60">
                {/* Header bar */}
                <div className="bg-white/[0.04] border-b border-white/[0.06] px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                  </div>
                  <span className="text-xs text-slate-500 font-mono">arena.plugnplay.xyz · round 3/7</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-mono text-yellow-400 font-bold">0:12</span>
                  </div>
                </div>

                <div className="p-5">
                  {/* Question */}
                  <div className="mb-5">
                    <p className="text-xs text-purple-400 font-semibold mb-2">Round 3 · Gas Mechanics</p>
                    <p className="text-white font-semibold text-sm leading-relaxed">
                      When the Avalanche C-Chain mempool is full, what happens to transactions with the base fee?
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 mb-5">
                    {[
                      { label: "A", text: "They are dropped immediately", wrong: true },
                      { label: "B", text: "They are queued until the next block", correct: true },
                      { label: "C", text: "They are processed by validators for free", wrong: false },
                      { label: "D", text: "They are sent to a secondary chain", wrong: false },
                    ].map((opt, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border text-sm transition-all ${
                        opt.correct ? "bg-green-500/10 border-green-500/40 text-green-300" :
                        opt.wrong ? "bg-red-500/10 border-red-500/30 text-red-400 opacity-60" :
                        "bg-white/[0.03] border-white/[0.08] text-slate-400"
                      }`}>
                        <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                          opt.correct ? "bg-green-500/30 text-green-300" : "bg-white/[0.06] text-slate-400"
                        }`}>{opt.label}</span>
                        {opt.text}
                        {opt.correct && <CheckCircle className="w-4 h-4 ml-auto text-green-400" />}
                      </div>
                    ))}
                  </div>

                  {/* Leaderboard strip */}
                  <div className="border-t border-white/[0.06] pt-4">
                    <p className="text-xs text-slate-500 mb-3">Live Leaderboard</p>
                    <div className="space-y-1.5">
                      {[
                        { rank: 1, name: "defi_degen", xp: 1850, color: "#EAB308" },
                        { rank: 2, name: "chain_buidlr", xp: 1720, color: "#94A3B8" },
                        { rank: 3, name: "nft_maxi", xp: 1640, color: "#CD7F32" },
                      ].map(p => (
                        <div key={p.rank} className="flex items-center gap-3 text-xs">
                          <span className="w-4 text-center font-bold" style={{ color: p.color }}>#{p.rank}</span>
                          <span className="flex-1 text-slate-300 font-mono">{p.name}</span>
                          <span className="text-yellow-400 font-semibold">{p.xp.toLocaleString()} XP</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}

// ─── Challenges ───────────────────────────────────────────────────────────────

function ChallengesSection() {
  return (
    <section id="challenges" className="relative py-32 bg-gradient-to-b from-transparent via-[#0a0a18] to-transparent">
      <div className="max-w-6xl mx-auto px-4">
        <SectionReveal className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest text-green-400 uppercase mb-4 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
            Real-World Challenges
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 tracking-tight">
            Prove What You Know
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Challenges are hands-on tasks — deploy a contract, execute a real transaction, build something on-chain.
            Submit proof. Get verified. Earn a badge.
          </p>
        </SectionReveal>

        {/* Tier ladder */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-6 bottom-6 w-px bg-gradient-to-b from-green-500/30 via-purple-500/30 to-red-500/30 hidden lg:block" />

          <div className="grid grid-cols-1 gap-4">
            {CHALLENGES.map((c, i) => (
              <SectionReveal key={i} delay={i * 0.07}>
                <div className={`flex items-center gap-5 rounded-2xl p-5 bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.05] transition-all duration-200 group ${i % 2 === 0 ? "lg:mr-[50%]" : "lg:ml-[50%]"}`}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border"
                    style={{ background: `${c.color}15`, borderColor: `${c.color}30` }}>
                    {c.badge}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold tracking-widest uppercase"
                        style={{ color: c.color }}>{c.tier}</span>
                    </div>
                    <h3 className="text-white font-bold">{c.title}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 group-hover:text-slate-300 transition-colors shrink-0">
                    <span>View Challenge</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>

        <SectionReveal className="mt-10 text-center">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            All challenge completions are verified on-chain via Snowtrace
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}

// ─── NFT Badges ───────────────────────────────────────────────────────────────

function NFTSection() {
  const rarityColor: Record<string, string> = { Rare: "#3B82F6", Epic: "#8B5CF6", Legendary: "#F59E0B" };
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-600/[0.06] rounded-full blur-[120px]" />
      </div>
      <div className="max-w-6xl mx-auto px-4">
        <SectionReveal className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest text-yellow-400 uppercase mb-4 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
            On-Chain Rewards
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 tracking-tight">
            Earn NFT Badges
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Every major achievement mints a real NFT badge on Avalanche Fuji C-Chain.
            Your proof of learning lives on-chain, forever.
          </p>
        </SectionReveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {NFT_BADGES.map((b, i) => (
            <SectionReveal key={i} delay={i * 0.08}>
              <div className="group relative rounded-3xl p-6 text-center overflow-hidden cursor-default"
                style={{ background: `linear-gradient(145deg, ${b.color}12, transparent)`, border: `1px solid ${b.color}25` }}>
                {/* Shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

                <div className="relative z-10">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{b.emoji}</div>
                  <span className="inline-block text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full mb-3"
                    style={{ background: `${rarityColor[b.rarity]}20`, color: rarityColor[b.rarity], border: `1px solid ${rarityColor[b.rarity]}30` }}>
                    {b.rarity}
                  </span>
                  <h3 className="text-white font-bold text-sm mb-1">{b.name}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{b.desc}</p>

                  {/* On-chain pill */}
                  <div className="mt-4 flex items-center justify-center gap-1 text-[10px] text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: b.color }} />
                    Avalanche Fuji
                  </div>
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    {
      step: "01", icon: Sparkles, title: "Sign Up & Pick Your Persona",
      desc: "Create a free account in seconds. Choose the learning path that matches your Web3 goals — DeFi, NFTs, Chain Building, or Beginner.",
      color: "#8B5CF6",
    },
    {
      step: "02", icon: Flame, title: "Play Games & Complete Challenges",
      desc: "Jump into 38 interactive games and 7 real-world challenges. Compete in the Arena live or grind solo at your own pace.",
      color: "#3B82F6",
    },
    {
      step: "03", icon: Award, title: "Earn XP, Badges & NFTs",
      desc: "Every correct answer, completed challenge, and Arena win earns XP and unlocks NFT badges minted on Avalanche Fuji C-Chain.",
      color: "#10B981",
    },
  ];
  return (
    <section id="how-it-works" className="relative py-32 bg-gradient-to-b from-transparent via-[#08081a] to-transparent">
      <div className="max-w-6xl mx-auto px-4">
        <SectionReveal className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest text-cyan-400 uppercase mb-4 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20">
            Getting Started
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 tracking-tight">
            How It Works
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            From zero to on-chain achievements in three steps.
          </p>
        </SectionReveal>

        <div className="grid lg:grid-cols-3 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="absolute top-12 left-[calc(33.3%+12px)] right-[calc(33.3%+12px)] h-px bg-gradient-to-r from-purple-500/30 via-blue-500/40 to-green-500/30 hidden lg:block" />

          {steps.map((s, i) => (
            <SectionReveal key={i} delay={i * 0.12}>
              <div className="relative rounded-2xl p-7 bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.14] transition-all duration-200 group">
                {/* Step number */}
                <div className="absolute -top-3.5 left-7 text-[10px] font-black tracking-widest text-slate-600 bg-[#080810] px-2">
                  STEP {s.step}
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border group-hover:scale-110 transition-transform duration-300"
                  style={{ background: `${s.color}15`, borderColor: `${s.color}30` }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>

                <h3 className="text-white font-bold text-lg mb-3">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/60 via-[#080810] to-blue-950/60" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-purple-600/[0.12] rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-blue-600/[0.10] rounded-full blur-[100px]" />
      </div>
      <div className="absolute inset-0"
        style={{ backgroundImage: "radial-gradient(rgba(139,92,246,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <SectionReveal>
          <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.10] rounded-full px-4 py-1.5 text-sm text-slate-300 mb-8">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            Free to play · No wallet required to start
          </div>
          <h2 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tight leading-[1.0]">
            Ready to Level Up<br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Your Web3 Knowledge?
            </span>
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Join 12,000+ learners who are mastering Web3 on their own terms.
            Play. Learn. Earn. All on Avalanche.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up"
              className="group inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold px-10 py-4 rounded-xl transition-all duration-200 shadow-[0_0_50px_rgba(139,92,246,0.35)] hover:shadow-[0_0_70px_rgba(139,92,246,0.5)] hover:-translate-y-0.5 text-lg">
              Create Free Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/sign-in"
              className="inline-flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.10] text-white font-semibold px-10 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 text-lg">
              Sign In
            </Link>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const links = {
    Platform: [
      { label: "Games", href: "/sign-up" },
      { label: "Challenges", href: "/sign-up" },
      { label: "Arena", href: "/sign-up" },
      { label: "Leaderboard", href: "/sign-up" },
    ],
    Learn: [
      { label: "DeFi Basics", href: "/sign-up" },
      { label: "NFT 101", href: "/sign-up" },
      { label: "Avalanche Docs", href: "https://docs.avax.network" },
      { label: "Fuji Testnet", href: "https://faucet.avax.network" },
    ],
    Company: [
      { label: "About", href: "#" },
      { label: "Events", href: "/sign-up" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  };
  return (
    <footer className="border-t border-white/[0.06] bg-[#050510]">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group w-fit">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Zap className="w-4 h-4 text-white fill-current" />
              </div>
              <span className="font-bold text-white tracking-tight">Plug<span className="text-purple-400">n</span>Play Arena</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-5 max-w-xs">
              The gamified Web3 learning platform built on Avalanche. Master DeFi, NFTs, and blockchain — one game at a time.
            </p>
            {/* Avalanche badge */}
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5 text-xs text-red-400 font-medium">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              Built on Avalanche
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.label}>
                    <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-slate-500 hover:text-slate-300 text-sm transition-colors duration-150">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">© 2026 Plug n' Play Arena. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-400 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://github.com/JosephNjorog/PlugPlay" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-400 transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://docs.avax.network" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-400 transition-colors">
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-x-hidden">
      <Nav />
      <Hero />
      <StatsBar />
      <PersonasSection />
      <GamesSection />
      <ArenaSection />
      <ChallengesSection />
      <NFTSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}
