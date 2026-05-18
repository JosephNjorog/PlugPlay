"use client";

import { useState, useDeferredValue } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  Zap,
  Play,
  CheckCircle2,
  Timer,
  Award,
  Swords,
  Filter,
  X,
  SlidersHorizontal,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Game {
  id: string;
  title: string;
  emoji: string;
  category: string;
  difficulty: string;
  description: string;
  xpReward: number;
  persona: string;
  status: string;
  completed: boolean;
}

interface Challenge {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  emoji: string;
  tier: string;
  estMinutes: number;
  xpReward: number;
  badgeTitle: string;
  completed: boolean;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Quiz", "Simulation", "Puzzle", "Build Challenge", "Arcade", "Team Challenge"] as const;
const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"] as const;
const PERSONAS = ["All", "Student", "Developer", "Builder", "Founder", "Business"] as const;
const TIERS = ["All", "beginner", "intermediate", "advanced"] as const;

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Advanced: "text-avax-red bg-avax-red/10 border-avax-red/20",
};

const TIER_COLORS: Record<string, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  advanced: "text-avax-red bg-avax-red/10 border-avax-red/20",
};

const CHALLENGE_ACCENT_COLORS: Record<string, string> = {
  blue: "from-cyan-500 to-blue-600",
  green: "from-emerald-500 to-teal-600",
  purple: "from-arena-purple to-violet-600",
  orange: "from-amber-500 to-orange-600",
  pink: "from-pink-500 to-rose-600",
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-white/[0.05] ${className ?? ""}`} />;
}

// ─── GameCard ──────────────────────────────────────────────────────────────────
function GameCard({ game, index }: { game: Game; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
      className="glass-card-hover p-5 rounded-2xl group relative overflow-hidden flex flex-col"
    >
      {game.completed && (
        <div className="absolute inset-0 bg-arena-emerald/[0.04] rounded-2xl" />
      )}
      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-avax-red/20 to-arena-purple/20 flex items-center justify-center text-2xl border border-white/10 group-hover:scale-105 transition-transform duration-300">
            {game.emoji}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {game.completed ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-arena-emerald bg-arena-emerald/10 border border-arena-emerald/20 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Completed
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
        <p className="text-slate-400 text-xs leading-relaxed mb-4 flex-1 line-clamp-3">
          {game.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
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

// ─── ChallengeCard ────────────────────────────────────────────────────────────
function ChallengeCard({ challenge, index }: { challenge: Challenge; index: number }) {
  const tier = challenge.tier as keyof typeof TIER_COLORS;
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
      className="glass-card-hover p-5 rounded-2xl group relative overflow-hidden flex flex-col"
    >
      {/* Top accent strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${CHALLENGE_ACCENT_COLORS.blue} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-arena-purple/20 to-arena-cyan/20 flex items-center justify-center text-2xl border border-white/10 group-hover:scale-105 transition-transform duration-300">
            {challenge.emoji}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {challenge.completed ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-arena-emerald bg-arena-emerald/10 border border-arena-emerald/20 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Done
              </span>
            ) : (
              <span
                className={`text-xs border px-2 py-0.5 rounded-full font-medium ${TIER_COLORS[tier] ?? "text-slate-400 border-slate-400/20"}`}
              >
                {tierLabel}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-white font-bold text-base mb-1 group-hover:text-arena-cyan transition-colors line-clamp-1">
          {challenge.title}
        </h3>
        <p className="text-slate-400 text-xs leading-relaxed mb-3 flex-1 line-clamp-2">
          {challenge.tagline}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 mb-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Timer className="w-3 h-3" />
            ~{challenge.estMinutes} min
          </span>
          <span className="flex items-center gap-1 text-arena-gold font-semibold">
            <Zap className="w-3 h-3" />
            +{challenge.xpReward} XP
          </span>
          {challenge.badgeTitle && (
            <span className="flex items-center gap-1 text-arena-purple-light">
              <Award className="w-3 h-3" />
              NFT
            </span>
          )}
        </div>

        <Link
          href={`/challenge/${challenge.slug}`}
          className="flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-arena-purple/10 hover:bg-arena-purple/20 text-arena-purple-light border border-arena-purple/20 hover:border-arena-purple/40 transition-all duration-200 mt-auto"
        >
          <Swords className="w-3.5 h-3.5" />
          Start Challenge
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Filter Pill ──────────────────────────────────────────────────────────────
function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
        active
          ? "bg-avax-red text-white shadow-glow-red"
          : "text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/[0.2] bg-white/[0.02] hover:bg-white/[0.05]"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ query }: { query: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center gap-4 py-16 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
        <Search className="w-7 h-7 text-slate-600" />
      </div>
      <div>
        <p className="text-white font-semibold text-base">
          {query ? `No results for "${query}"` : "Nothing here yet"}
        </p>
        <p className="text-slate-500 text-sm mt-1 max-w-xs">
          {query
            ? "Try adjusting your filters or search term."
            : "Check back soon — new content is added regularly."}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LibraryPage() {
  const { data: session } = useSession();

  // Tab state
  const [activeTab, setActiveTab] = useState<"missions" | "challenges">("missions");

  // Mission filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [personaFilter, setPersonaFilter] = useState("All");

  // Challenge filters
  const [tierFilter, setTierFilter] = useState("All");

  const deferredSearch = useDeferredValue(search);

  // Build games query params
  const gamesParams = new URLSearchParams({ status: "live" });
  if (categoryFilter !== "All") gamesParams.set("category", categoryFilter);
  if (difficultyFilter !== "All") gamesParams.set("difficulty", difficultyFilter);
  if (personaFilter !== "All") gamesParams.set("persona", personaFilter.toLowerCase());
  if (deferredSearch) gamesParams.set("search", deferredSearch);

  const { data: games, isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ["games", "library", categoryFilter, difficultyFilter, personaFilter, deferredSearch],
    queryFn: async () => {
      const res = await fetch(`/api/games?${gamesParams}`);
      if (!res.ok) throw new Error("Failed to load games");
      return res.json();
    },
    enabled: !!session?.user && activeTab === "missions",
    staleTime: 60_000,
  });

  // Build challenges query params
  const challengesParams = new URLSearchParams();
  if (tierFilter !== "All") challengesParams.set("tier", tierFilter.toLowerCase());

  const { data: challenges, isLoading: challengesLoading } = useQuery<Challenge[]>({
    queryKey: ["challenges", "library", tierFilter],
    queryFn: async () => {
      const res = await fetch(`/api/challenges?${challengesParams}`);
      if (!res.ok) throw new Error("Failed to load challenges");
      return res.json();
    },
    enabled: !!session?.user && activeTab === "challenges",
    staleTime: 60_000,
  });

  const hasActiveFilters =
    categoryFilter !== "All" ||
    difficultyFilter !== "All" ||
    personaFilter !== "All" ||
    search !== "";

  const clearFilters = () => {
    setCategoryFilter("All");
    setDifficultyFilter("All");
    setPersonaFilter("All");
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      {/* Background */}
      <div className="fixed inset-0 hero-grid-bg opacity-20 pointer-events-none" aria-hidden />
      <div className="fixed top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-arena-purple/4 blur-[160px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-avax-red" />
            <span className="text-sm font-semibold text-avax-red uppercase tracking-wider">Library</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white">
            Game{" "}
            <span className="gradient-text">Library</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">
            Explore missions, speedrun challenges, and interactive games — all designed to level up your Web3 knowledge.
          </p>
        </motion.div>

        {/* ── Tab Switcher ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 p-1.5 glass-card rounded-2xl w-fit"
        >
          <button
            onClick={() => setActiveTab("missions")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === "missions"
                ? "bg-avax-red text-white shadow-glow-red"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Play className="w-4 h-4" />
            Missions &amp; Games
          </button>
          <button
            onClick={() => setActiveTab("challenges")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === "challenges"
                ? "bg-arena-purple text-white shadow-glow-purple"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Swords className="w-4 h-4" />
            Speedrun Challenges
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "missions" ? (
            <motion.div
              key="missions"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search missions, games…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] focus:border-avax-red/40 focus:bg-white/[0.06] text-white placeholder-slate-500 text-sm outline-none transition-all duration-200"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Row */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Category</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <FilterPill
                      key={cat}
                      label={cat}
                      active={categoryFilter === cat}
                      onClick={() => setCategoryFilter(cat)}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-2 mr-2">
                    <Filter className="w-3 h-3 text-slate-600" />
                    <span className="text-xs text-slate-600">Difficulty:</span>
                  </div>
                  {DIFFICULTIES.map((d) => (
                    <FilterPill
                      key={d}
                      label={d}
                      active={difficultyFilter === d}
                      onClick={() => setDifficultyFilter(d)}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-2 mr-2">
                    <Filter className="w-3 h-3 text-slate-600" />
                    <span className="text-xs text-slate-600">Persona:</span>
                  </div>
                  {PERSONAS.map((p) => (
                    <FilterPill
                      key={p}
                      label={p}
                      active={personaFilter === p}
                      onClick={() => setPersonaFilter(p)}
                    />
                  ))}
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-xs text-avax-red hover:text-avax-red/80 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Clear all filters
                  </button>
                )}
              </div>

              {/* Games Grid */}
              {gamesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(9)].map((_, i) => (
                    <Skeleton key={i} className="h-52" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {games && games.length > 0 ? (
                    games.map((game, i) => (
                      <GameCard key={game.id} game={game} index={i} />
                    ))
                  ) : (
                    <EmptyState query={deferredSearch} />
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Tier Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Tier</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TIERS.map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setTierFilter(tier)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 capitalize whitespace-nowrap ${
                        tierFilter === tier
                          ? "bg-arena-purple text-white shadow-glow-purple"
                          : "text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/[0.2] bg-white/[0.02] hover:bg-white/[0.05]"
                      }`}
                    >
                      {tier === "All" ? "All Tiers" : tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Challenges Grid */}
              {challengesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-56" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {challenges && challenges.length > 0 ? (
                    challenges.map((challenge, i) => (
                      <ChallengeCard key={challenge.id} challenge={challenge} index={i} />
                    ))
                  ) : (
                    <EmptyState query="" />
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
