"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  RefreshCw,
  Crown,
  Medal,
  Zap,
  Target,
  Users,
  Clock,
} from "lucide-react";
import {
  formatXP,
  getXPToNextLevel,
  getLevelFromXP,
  getStageFromXP,
  getPersonaColor,
  timeAgo,
  truncateAddress,
} from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface LeaderboardEntry {
  id: string;
  username: string;
  emoji: string;
  persona: string | null;
  xp: number;
  level: number;
  stage: string;
  streak: number;
  walletAddress: string | null;
  statusTag: string | null;
  missionCount: number;
  rank: number;
}

type PersonaFilter =
  | "all"
  | "student"
  | "developer"
  | "builder"
  | "founder"
  | "business";

// ─── Constants ─────────────────────────────────────────────────────────────────
const PERSONA_TABS: { id: PersonaFilter; label: string; emoji: string }[] = [
  { id: "all", label: "All", emoji: "🌐" },
  { id: "student", label: "Student", emoji: "🧑‍🎓" },
  { id: "developer", label: "Developer", emoji: "🧑‍💻" },
  { id: "builder", label: "Builder", emoji: "🏗️" },
  { id: "founder", label: "Founder", emoji: "🚀" },
  { id: "business", label: "Business", emoji: "💼" },
];

const LIMIT_OPTIONS = [10, 25, 50] as const;
type Limit = (typeof LIMIT_OPTIONS)[number];

// ─── Rank Medal ───────────────────────────────────────────────────────────────
function RankMedal({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <Crown className="w-5 h-5 text-arena-gold drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
    );
  if (rank === 2)
    return <Medal className="w-5 h-5 text-slate-300" />;
  if (rank === 3)
    return <Medal className="w-5 h-5 text-amber-600" />;
  return (
    <span className="text-sm font-bold text-white/40 w-5 text-center">
      {rank}
    </span>
  );
}

// ─── Podium Card ──────────────────────────────────────────────────────────────
function PodiumCard({
  entry,
  index,
}: {
  entry: LeaderboardEntry;
  index: number;
}) {
  const configs = {
    0: {
      // #1 - Gold
      glow: "shadow-glow-gold",
      border: "border-arena-gold/40",
      bg: "from-arena-gold/10 to-amber-600/5",
      labelBg: "bg-arena-gold/20 text-arena-gold",
      ringColor: "#F59E0B",
      crown: "👑",
      scale: "scale-105 z-10",
      height: "h-full",
      badgeText: "1st Place",
    },
    1: {
      // #2 - Silver
      glow: "shadow-[0_0_20px_rgba(203,213,225,0.2)]",
      border: "border-slate-400/30",
      bg: "from-slate-400/10 to-slate-600/5",
      labelBg: "bg-slate-400/20 text-slate-300",
      ringColor: "#CBD5E1",
      crown: "🥈",
      scale: "",
      height: "h-full",
      badgeText: "2nd Place",
    },
    2: {
      // #3 - Bronze
      glow: "shadow-[0_0_20px_rgba(180,83,9,0.2)]",
      border: "border-amber-700/30",
      bg: "from-amber-700/10 to-amber-900/5",
      labelBg: "bg-amber-700/20 text-amber-600",
      ringColor: "#B45309",
      crown: "🥉",
      scale: "",
      height: "h-full",
      badgeText: "3rd Place",
    },
  } as const;

  const cfg = configs[index as 0 | 1 | 2];
  const xpData = getXPToNextLevel(entry.xp);
  const personaGrad = getPersonaColor(entry.persona || "student");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      className={`relative flex flex-col items-center p-5 rounded-2xl border bg-gradient-to-b ${cfg.bg} ${cfg.border} ${cfg.glow} ${cfg.scale} ${cfg.height} transition-all duration-300`}
    >
      {/* Rank badge */}
      <div
        className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold border ${cfg.labelBg} border-current/20`}
      >
        {cfg.badgeText}
      </div>

      {/* Crown emoji */}
      <div className="text-2xl mb-2 mt-2">{cfg.crown}</div>

      {/* Avatar ring */}
      <div
        className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2 mb-3"
        style={{
          borderColor: cfg.ringColor,
          boxShadow: `0 0 16px ${cfg.ringColor}40`,
          background: `radial-gradient(ellipse at center, ${cfg.ringColor}15, transparent 70%)`,
        }}
      >
        {entry.emoji}
        {/* Level badge */}
        <div
          className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br ${personaGrad} border border-black/30`}
        >
          {entry.level}
        </div>
      </div>

      {/* Username */}
      <h3 className="font-bold text-white text-center text-sm leading-tight mb-0.5 max-w-[120px] truncate">
        {entry.username}
      </h3>

      {/* Persona */}
      {entry.persona && (
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full bg-gradient-to-r ${personaGrad} bg-opacity-20 text-white/70 mb-2 capitalize`}
        >
          {entry.persona}
        </span>
      )}

      {/* XP */}
      <div className="flex items-center gap-1 mb-1">
        <Zap className="w-3.5 h-3.5 text-arena-gold" />
        <span className="text-sm font-bold text-white">{formatXP(entry.xp)}</span>
        <span className="text-xs text-white/40">XP</span>
      </div>

      {/* Stage */}
      <span className="text-[10px] text-white/40 capitalize mb-3">
        {entry.stage}
      </span>

      {/* XP Progress bar */}
      <div className="w-full xp-bar mb-2">
        <div
          className="xp-bar-fill"
          style={{ width: `${xpData.progress}%` }}
        />
      </div>

      {/* Mission count */}
      <div className="flex items-center gap-1 text-xs text-white/40">
        <Target className="w-3 h-3" />
        <span>{entry.missionCount} missions</span>
      </div>
    </motion.div>
  );
}

// ─── Ranked Row ───────────────────────────────────────────────────────────────
function RankedRow({
  entry,
  isCurrentUser,
  index,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
  index: number;
}) {
  const xpData = getXPToNextLevel(entry.xp);
  const personaGrad = getPersonaColor(entry.persona || "student");

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-200 ${
        isCurrentUser
          ? "border-avax-red/40 bg-avax-red/5 shadow-glow-red"
          : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.08]"
      }`}
    >
      {/* Rank */}
      <div className="w-8 flex items-center justify-center flex-shrink-0">
        <RankMedal rank={entry.rank} />
      </div>

      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border border-white/10"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.05), transparent)`,
        }}
      >
        {entry.emoji}
      </div>

      {/* Username + persona */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-white text-sm truncate">
            {entry.username}
          </span>
          {isCurrentUser && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-avax-red/20 text-avax-red font-bold">
              You
            </span>
          )}
          {entry.persona && (
            <span
              className={`hidden sm:inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full bg-gradient-to-r ${personaGrad} bg-opacity-15 text-white/60 capitalize`}
            >
              {entry.persona}
            </span>
          )}
        </div>
        {/* XP bar (narrow) */}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 max-w-[120px] xp-bar h-1">
            <div
              className="xp-bar-fill"
              style={{ width: `${xpData.progress}%` }}
            />
          </div>
          <span className="text-[10px] text-white/30 hidden sm:inline">
            {entry.stage}
          </span>
        </div>
      </div>

      {/* XP */}
      <div className="text-right flex-shrink-0">
        <div className="flex items-center gap-1 justify-end">
          <Zap className="w-3 h-3 text-arena-gold" />
          <span className="text-sm font-bold text-white">{formatXP(entry.xp)}</span>
        </div>
        <span className="text-[10px] text-white/30">XP</span>
      </div>

      {/* Level badge */}
      <div
        className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center flex-shrink-0 bg-gradient-to-br ${personaGrad} bg-opacity-20 border border-white/10`}
      >
        <span className="text-[10px] text-white/40 leading-none">Lv</span>
        <span className="text-xs font-bold text-white leading-none">{entry.level}</span>
      </div>

      {/* Missions */}
      <div className="text-right flex-shrink-0 hidden md:block">
        <div className="flex items-center gap-1 justify-end">
          <Target className="w-3 h-3 text-white/30" />
          <span className="text-sm font-medium text-white/60">{entry.missionCount}</span>
        </div>
        <span className="text-[10px] text-white/30">missions</span>
      </div>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/[0.05] bg-white/[0.02] animate-pulse">
      <div className="w-8 h-5 rounded bg-white/10" />
      <div className="w-10 h-10 rounded-xl bg-white/10" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-white/10 rounded w-32" />
        <div className="h-1.5 bg-white/10 rounded w-24" />
      </div>
      <div className="w-12 h-5 rounded bg-white/10" />
      <div className="w-9 h-9 rounded-xl bg-white/10" />
    </div>
  );
}

function PodiumSkeleton() {
  return (
    <div className="flex flex-col items-center p-5 rounded-2xl border border-white/10 bg-white/[0.02] animate-pulse gap-3">
      <div className="w-16 h-16 rounded-2xl bg-white/10" />
      <div className="h-4 w-24 rounded bg-white/10" />
      <div className="h-3 w-16 rounded bg-white/10" />
      <div className="h-3 w-20 rounded bg-white/10" />
      <div className="w-full h-1.5 rounded-full bg-white/10" />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [persona, setPersona] = useState<PersonaFilter>("all");
  const [limit, setLimit] = useState<Limit>(25);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const {
    data: entries,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", persona, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        persona,
        limit: limit.toString(),
      });
      const res = await fetch(`/api/leaderboard?${params}`);
      if (!res.ok) throw new Error("Failed to load leaderboard");
      return res.json();
    },
    staleTime: 60_000,
  });

  const handleRefresh = useCallback(async () => {
    await refetch();
    setLastRefreshed(new Date());
  }, [refetch]);

  const currentUserId = (session?.user as any)?.id as string | undefined;
  const podium = entries?.slice(0, 3) ?? [];
  const rest = entries?.slice(3) ?? [];

  // Find current user rank for highlighting
  const currentUserInList = entries?.find((e) => e.id === currentUserId);

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      {/* Background */}
      <div className="fixed inset-0 hero-grid-bg opacity-20 pointer-events-none" />
      <div className="fixed top-20 left-1/3 w-[500px] h-[500px] rounded-full bg-arena-gold/3 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-20 right-1/4 w-[400px] h-[400px] rounded-full bg-arena-purple/4 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arena-gold/20 to-amber-600/10 border border-arena-gold/20 flex items-center justify-center shadow-glow-gold">
                <Trophy className="w-5 h-5 text-arena-gold" />
              </div>
              <h1 className="text-3xl font-bold text-white">
                Leader<span className="gradient-text">board</span>
              </h1>
            </div>
            <p className="text-white/40 text-sm">
              Top players ranked by XP earned across all missions
            </p>
          </div>

          {/* Refresh */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isFetching}
              className="flex items-center gap-2 px-3 py-2 rounded-xl btn-secondary text-sm disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </motion.button>
            <span className="text-[11px] text-white/30 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(lastRefreshed)}
            </span>
          </div>
        </motion.div>

        {/* ── Persona Filter Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-4 scrollbar-none"
        >
          {PERSONA_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPersona(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
                persona === tab.id
                  ? "bg-arena-purple/20 border border-arena-purple/40 text-arena-purple-light shadow-glow-purple"
                  : "bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* ── Controls bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-between mb-6 gap-4"
        >
          {/* Stats */}
          <div className="flex items-center gap-2 text-sm text-white/40">
            <Users className="w-4 h-4" />
            <span>
              {isLoading ? "—" : `${entries?.length ?? 0} players`}
            </span>
          </div>

          {/* Limit selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-white/30 mr-1">Show:</span>
            {LIMIT_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setLimit(n)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  limit === n
                    ? "bg-avax-red/20 border border-avax-red/40 text-avax-red"
                    : "bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Current user rank banner (if not in top 3) ── */}
        <AnimatePresence>
          {currentUserInList && currentUserInList.rank > 3 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-avax-red/30 bg-avax-red/5 mb-4 text-sm"
            >
              <span className="text-avax-red font-bold">#{currentUserInList.rank}</span>
              <span className="text-white/50">Your current rank</span>
              <Zap className="w-3.5 h-3.5 text-arena-gold ml-auto" />
              <span className="font-semibold text-white">{formatXP(currentUserInList.xp)} XP</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty State ── */}
        {!isLoading && entries?.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-white mb-2">
              No players yet
            </h3>
            <p className="text-white/40 text-sm">
              Be the first to earn XP and claim the top spot!
            </p>
          </motion.div>
        )}

        {/* ── Podium ── */}
        {(isLoading || (entries && entries.length > 0)) && (
          <>
            {/* Reorder: 2nd | 1st | 3rd */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-3 gap-3 mb-8 items-end"
            >
              {isLoading ? (
                <>
                  <PodiumSkeleton />
                  <PodiumSkeleton />
                  <PodiumSkeleton />
                </>
              ) : (
                <>
                  {/* 2nd */}
                  {podium[1] ? (
                    <PodiumCard entry={podium[1]} index={1} />
                  ) : (
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] h-full min-h-[200px] flex items-center justify-center text-white/20 text-sm">
                      —
                    </div>
                  )}
                  {/* 1st */}
                  {podium[0] ? (
                    <PodiumCard entry={podium[0]} index={0} />
                  ) : (
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] h-full min-h-[200px] flex items-center justify-center text-white/20 text-sm">
                      —
                    </div>
                  )}
                  {/* 3rd */}
                  {podium[2] ? (
                    <PodiumCard entry={podium[2]} index={2} />
                  ) : (
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] h-full min-h-[200px] flex items-center justify-center text-white/20 text-sm">
                      —
                    </div>
                  )}
                </>
              )}
            </motion.div>

            {/* ── Ranked List ── */}
            {(isLoading ? Array.from({ length: 8 }) : rest).length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 px-4 pb-2 text-xs font-semibold text-white/30 uppercase tracking-wider">
                  <span className="w-8">Rank</span>
                  <span className="w-10" />
                  <span className="flex-1">Player</span>
                  <span className="w-16 text-right">XP</span>
                  <span className="w-9 text-center">Lv</span>
                  <span className="hidden md:block w-16 text-right">Missions</span>
                </div>

                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))
                  : rest.map((entry, i) => (
                      <RankedRow
                        key={entry.id}
                        entry={entry}
                        isCurrentUser={entry.id === currentUserId}
                        index={i}
                      />
                    ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
