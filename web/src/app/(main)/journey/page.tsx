"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import {
  Zap,
  Flame,
  Star,
  Trophy,
  ChevronRight,
  Play,
  CheckCircle2,
  Lock,
  Sparkles,
  TrendingUp,
  Map,
  Award,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Profile {
  id: string;
  username: string;
  emoji: string;
  xp: number;
  level: number;
  stage: string;
  streak: number;
  persona: string | null;
}

interface Game {
  id: string;
  title: string;
  emoji: string;
  category: string;
  difficulty: string;
  description: string;
  xpReward: number;
  status: string;
  completed: boolean;
}

interface NftBadge {
  id: string;
  title: string;
  emoji: string;
  rarity: string;
  mintedAt: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const STAGES = [
  { id: "newcomer", label: "Newcomer", emoji: "🌱", xpThreshold: 0 },
  { id: "explorer", label: "Explorer", emoji: "🧭", xpThreshold: 500 },
  { id: "builder", label: "Builder", emoji: "🏗️", xpThreshold: 2000 },
  { id: "validator", label: "Validator", emoji: "✅", xpThreshold: 5000 },
  { id: "leader", label: "Leader", emoji: "👑", xpThreshold: 12000 },
] as const;

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Advanced: "text-avax-red bg-avax-red/10 border-avax-red/20",
};

const RARITY_STYLES: Record<string, string> = {
  common: "border-slate-400/30 bg-slate-400/5 shadow-none",
  rare: "border-arena-purple/40 bg-arena-purple/10 shadow-glow-purple",
  legendary: "border-arena-gold/40 bg-arena-gold/10 shadow-glow-gold",
};

const RARITY_LABEL_STYLES: Record<string, string> = {
  common: "text-slate-400",
  rare: "text-arena-purple-light",
  legendary: "text-arena-gold",
};

// ─── XP helpers ────────────────────────────────────────────────────────────────
function xpForLevel(level: number) {
  return level * 500;
}

function xpInCurrentLevel(xp: number, level: number) {
  const prev = xpForLevel(level - 1);
  return xp - prev;
}

function xpNeededForLevel(level: number) {
  return xpForLevel(level) - xpForLevel(level - 1);
}

function xpProgressPct(xp: number, level: number) {
  const curr = xpInCurrentLevel(xp, level);
  const range = xpNeededForLevel(level);
  return Math.min(Math.max((curr / range) * 100, 0), 100);
}

// ─── Animated number ───────────────────────────────────────────────────────────
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { stiffness: 50, damping: 18 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    const unsub = springVal.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [springVal]);

  return <span className={className}>{display.toLocaleString()}</span>;
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-white/[0.05] ${className ?? ""}`}
    />
  );
}

// ─── GameCard ──────────────────────────────────────────────────────────────────
function GameCard({ game, index }: { game: Game; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: "easeOut" }}
      className="glass-card-hover p-5 rounded-2xl group relative overflow-hidden"
    >
      {game.completed && (
        <div className="absolute inset-0 bg-arena-emerald/5 rounded-2xl z-0" />
      )}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-avax-red/20 to-arena-purple/20 flex items-center justify-center text-2xl border border-white/10 group-hover:scale-105 transition-transform duration-300">
            {game.emoji}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {game.completed ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-arena-emerald bg-arena-emerald/10 border border-arena-emerald/20 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Done
              </span>
            ) : (
              <span
                className={`text-xs border px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLORS[game.difficulty] ?? "text-slate-400 border-slate-400/20 bg-slate-400/5"}`}
              >
                {game.difficulty}
              </span>
            )}
            <span className="text-[10px] text-slate-500 border border-white/[0.06] px-2 py-0.5 rounded-full">
              {game.category}
            </span>
          </div>
        </div>

        <h3 className="text-white font-bold text-base mb-1.5 group-hover:text-avax-red transition-colors line-clamp-1">
          {game.title}
        </h3>
        <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2">
          {game.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm text-arena-gold font-mono font-semibold">
            <Zap className="w-3.5 h-3.5" />
            +{game.xpReward} XP
          </span>
          <Link
            href={`/play/${game.id}`}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-avax-red/10 hover:bg-avax-red/20 text-avax-red border border-avax-red/20 hover:border-avax-red/40 transition-all duration-200"
          >
            <Play className="w-3 h-3" />
            Play
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── NFT Badge Card ───────────────────────────────────────────────────────────
function BadgeCard({ badge }: { badge: NftBadge }) {
  const rarity = badge.rarity as "common" | "rare" | "legendary";
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className={`flex-none w-28 rounded-2xl border p-3 flex flex-col items-center gap-2 cursor-default transition-all duration-300 ${RARITY_STYLES[rarity] ?? RARITY_STYLES.common}`}
    >
      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-white/[0.04]">
        {badge.emoji}
      </div>
      <p className="text-white text-xs font-semibold text-center leading-tight line-clamp-2">
        {badge.title}
      </p>
      <span className={`text-[10px] font-bold uppercase tracking-wide ${RARITY_LABEL_STYLES[rarity] ?? "text-slate-400"}`}>
        {badge.rarity}
      </span>
      <p className="text-slate-500 text-[9px]">
        {new Date(badge.mintedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
    </motion.div>
  );
}

// ─── Stage Roadmap ────────────────────────────────────────────────────────────
function StageRoadmap({ currentStage }: { currentStage: string }) {
  const currentIdx = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-2 scrollbar-hide">
      {STAGES.map((stage, i) => {
        const isActive = stage.id === currentStage;
        const isDone = i < currentIdx;
        const isLocked = i > currentIdx;

        return (
          <div key={stage.id} className="flex items-center flex-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border transition-all duration-300 min-w-[90px] ${
                isActive
                  ? "bg-avax-red/10 border-avax-red/40 shadow-glow-red"
                  : isDone
                  ? "bg-arena-emerald/5 border-arena-emerald/20"
                  : "bg-white/[0.02] border-white/[0.06]"
              }`}
            >
              <span className="text-xl">{stage.emoji}</span>
              <span
                className={`text-xs font-semibold ${
                  isActive ? "text-avax-red" : isDone ? "text-arena-emerald" : "text-slate-500"
                }`}
              >
                {stage.label}
              </span>
              {isDone && <CheckCircle2 className="w-3 h-3 text-arena-emerald" />}
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-avax-red animate-pulse" />}
              {isLocked && <Lock className="w-3 h-3 text-slate-600" />}
            </motion.div>

            {i < STAGES.length - 1 && (
              <div
                className={`h-px w-6 flex-none transition-colors duration-300 ${
                  i < currentIdx ? "bg-arena-emerald/40" : "bg-white/[0.06]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function JourneyPage() {
  const { data: session } = useSession();

  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      return res.json();
    },
    enabled: !!session?.user,
    staleTime: 30_000,
  });

  const { data: rewardsData, isLoading: rewardsLoading } = useQuery<{
    badges: NftBadge[];
    rewards: unknown[];
  }>({
    queryKey: ["rewards"],
    queryFn: async () => {
      const res = await fetch("/api/rewards");
      if (!res.ok) throw new Error("Failed to load rewards");
      return res.json();
    },
    enabled: !!session?.user,
    staleTime: 60_000,
  });

  const { data: games, isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ["games", "journey", profile?.persona],
    queryFn: async () => {
      const params = new URLSearchParams({ status: "live" });
      if (profile?.persona) params.set("persona", profile.persona);
      const res = await fetch(`/api/games?${params}`);
      if (!res.ok) throw new Error("Failed to load games");
      return res.json();
    },
    enabled: !!session?.user && !!profile,
    staleTime: 60_000,
  });

  const upNextGames = games?.filter((g) => !g.completed).slice(0, 6) ?? [];
  const badges = rewardsData?.badges ?? [];
  const xpPct = profile ? xpProgressPct(profile.xp, profile.level) : 0;
  const inLevelXp = profile ? xpInCurrentLevel(profile.xp, profile.level) : 0;
  const neededXp = profile ? xpNeededForLevel(profile.level) : 500;

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      {/* Background glows */}
      <div className="fixed inset-0 hero-grid-bg opacity-20 pointer-events-none" aria-hidden />
      <div className="fixed top-0 left-1/3 w-[700px] h-[400px] rounded-full bg-arena-purple/5 blur-[160px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-avax-red/4 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Map className="w-5 h-5 text-avax-red" />
              <span className="text-sm font-semibold text-avax-red uppercase tracking-wider">
                My Journey
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white">
              Your{" "}
              <span className="gradient-text">Arena</span>
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Track progress, collect badges, and level up your Web3 skills.
            </p>
          </div>
          {profile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 glass-card rounded-2xl"
            >
              <span className="text-2xl">{profile.emoji}</span>
              <div>
                <p className="text-white font-bold text-sm">{profile.username}</p>
                <p className="text-slate-400 text-xs capitalize">{profile.stage}</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ── Hero Stats Row ── */}
        {profileLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : profile ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {/* Level badge */}
            <div className="glass-card p-5 rounded-2xl flex flex-col items-center justify-center gap-2 neon-border-red">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-avax-red to-arena-purple flex items-center justify-center shadow-glow-red">
                <span className="text-xl font-black text-white">{profile.level}</span>
              </div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Level</p>
            </div>

            {/* XP Total */}
            <div className="glass-card p-5 rounded-2xl flex flex-col items-center justify-center gap-2 neon-border-purple">
              <div className="flex items-center gap-1.5">
                <Zap className="w-5 h-5 text-arena-gold" />
                <AnimatedNumber value={profile.xp} className="text-3xl font-black text-white" />
              </div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total XP</p>
            </div>

            {/* Streak */}
            <div className="glass-card p-5 rounded-2xl flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-1.5">
                <Flame className="w-6 h-6 text-orange-400" />
                <span className="text-3xl font-black text-white">{profile.streak}</span>
              </div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Day Streak</p>
            </div>

            {/* Stage badge */}
            <div className="glass-card p-5 rounded-2xl flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 text-arena-gold" />
                <span className="text-xl font-bold text-white capitalize">{profile.stage}</span>
              </div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Stage</p>
            </div>
          </motion.div>
        ) : null}

        {/* ── XP Progress Bar ── */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-avax-red" />
                <span className="text-sm font-semibold text-white">XP Progress — Level {profile.level}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-arena-gold font-mono font-bold">{inLevelXp.toLocaleString()}</span>
                <span className="text-slate-500">/</span>
                <span className="text-slate-400 font-mono">{neededXp.toLocaleString()} XP</span>
                <span className="text-slate-600 text-xs">to Level {profile.level + 1}</span>
              </div>
            </div>
            <div className="xp-bar h-3">
              <motion.div
                className="xp-bar-fill h-3"
                initial={{ width: "0%" }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-slate-500">Level {profile.level}</span>
              <span className="text-xs text-slate-500 font-medium">{xpPct.toFixed(1)}%</span>
              <span className="text-xs text-slate-500">Level {profile.level + 1}</span>
            </div>
          </motion.div>
        )}

        {/* ── NFT Badge Shelf ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-arena-gold" />
            <h2 className="text-lg font-bold text-white">NFT Badges</h2>
            {!rewardsLoading && (
              <span className="ml-auto text-xs text-slate-500">{badges.length} earned</span>
            )}
          </div>

          {rewardsLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="flex-none w-28 h-36" />
              ))}
            </div>
          ) : badges.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
              <Trophy className="w-10 h-10 text-slate-600" />
              <p className="text-slate-400 text-sm">No badges yet — complete missions to earn your first NFT badge!</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {badges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Journey Stage Roadmap ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Map className="w-5 h-5 text-arena-cyan" />
            <h2 className="text-lg font-bold text-white">Journey Roadmap</h2>
          </div>
          <div className="glass-card p-5 rounded-2xl">
            {profileLoading ? (
              <Skeleton className="h-20" />
            ) : (
              <StageRoadmap currentStage={profile?.stage ?? "newcomer"} />
            )}
          </div>
        </motion.div>

        {/* ── Up Next Missions ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-arena-purple-light" />
              <h2 className="text-lg font-bold text-white">Up Next</h2>
              <span className="text-xs text-slate-500 ml-1">— missions curated for you</span>
            </div>
            <Link
              href="/library"
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
            >
              View All
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {gamesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-44" />
              ))}
            </div>
          ) : upNextGames.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
              <CheckCircle2 className="w-12 h-12 text-arena-emerald" />
              <p className="text-white font-semibold">All caught up!</p>
              <p className="text-slate-400 text-sm max-w-sm">
                You&apos;ve completed all available missions. Check back soon for new challenges, or explore the full library.
              </p>
              <Link href="/library" className="btn-primary mt-2 text-sm px-5 py-2.5 inline-flex items-center gap-2">
                Browse Library
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upNextGames.map((game, i) => (
                <GameCard key={game.id} game={game} index={i} />
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
