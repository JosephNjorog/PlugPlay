"use client";

import { useState, useDeferredValue } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Search, X, RefreshCw, Crown, Medal, Zap,
  Target, Users, Calendar, Filter, Download, TrendingUp,
  Wifi, WifiOff, ChevronUp, ChevronDown, Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatXP, getLevelFromXP, getStageFromXP, truncateAddress } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface LeaderboardEntry {
  id: string;
  rank: number;
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
  totalScore: number;
  // event mode extras
  avgAccuracy?: number;
  totalTimeSpent?: number;
  email?: string;
}

interface EventOption {
  id: string;
  title: string;
  status: string;
  coverEmoji: string;
  startsAt: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────────
const PERSONAS = ["all", "student", "developer", "builder", "founder", "business"] as const;
const STAGES = ["all", "newcomer", "explorer", "builder", "validator", "leader"] as const;

const PERSONA_COLORS: Record<string, string> = {
  student:   "bg-pink-500/10 text-pink-400 border-pink-500/20",
  developer: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  builder:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  founder:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
  business:  "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const STAGE_COLORS: Record<string, string> = {
  newcomer:  "text-slate-400",
  explorer:  "text-arena-cyan",
  builder:   "text-arena-emerald",
  validator: "text-arena-gold",
  leader:    "text-avax-red",
};

const STAGE_EMOJIS: Record<string, string> = {
  newcomer: "🌱", explorer: "🧭", builder: "🏗️", validator: "✅", leader: "👑",
};

// ─── Rank badge ──────────────────────────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-glow-gold"><Crown size={14} className="text-white" /></div>;
  if (rank === 2) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center"><Medal size={14} className="text-white" /></div>;
  if (rank === 3) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center"><Medal size={14} className="text-white" /></div>;
  return <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-slate-400 text-xs font-bold tabular-nums">#{rank}</div>;
}

// ─── CSV export ──────────────────────────────────────────────────────────────────
function exportCSV(entries: LeaderboardEntry[], eventMode: boolean) {
  const headers = eventMode
    ? ["Rank", "Username", "Persona", "Level", "Stage", "Total Score", "Missions", "Avg Accuracy", "Time Spent (s)", "Wallet"]
    : ["Rank", "Username", "Email", "Persona", "XP", "Level", "Stage", "Missions", "Total Score", "Streak", "Wallet"];

  const rows = entries.map((e) =>
    eventMode
      ? [e.rank, e.username, e.persona ?? "", e.level, e.stage, e.totalScore, e.missionCount, e.avgAccuracy ?? 0, e.totalTimeSpent ?? 0, e.walletAddress ?? ""]
      : [e.rank, e.username, e.email ?? "", e.persona ?? "", e.xp, e.level, e.stage, e.missionCount, e.totalScore, e.streak, e.walletAddress ?? ""]
  );

  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leaderboard-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Stat card ───────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="glass-card p-4 rounded-xl border border-white/[0.06]">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", color)}>
        <Icon size={15} className="text-white" />
      </div>
      <p className="text-white font-bold text-xl tabular-nums">{value}</p>
      <p className="text-slate-500 text-xs mt-0.5">{label}</p>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────────
export default function AdminLeaderboardPage() {
  const [mode, setMode] = useState<"global" | "event">("global");
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [personaFilter, setPersonaFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<"xp" | "missions" | "score" | "streak" | "level">("xp");
  const deferredSearch = useDeferredValue(search);

  // Load events for the event picker
  const { data: eventList = [] } = useQuery<EventOption[]>({
    queryKey: ["admin-events-picker"],
    queryFn: () => fetch("/api/events").then((r) => r.json()),
    staleTime: 60_000,
  });

  // Load leaderboard
  const params = new URLSearchParams({ mode, limit: "200" });
  if (mode === "event" && selectedEventId) params.set("eventId", selectedEventId);
  if (personaFilter !== "all") params.set("persona", personaFilter);
  if (stageFilter !== "all") params.set("stage", stageFilter);
  if (deferredSearch) params.set("search", deferredSearch);

  const { data: rawEntries = [], isLoading, refetch, isFetching } = useQuery<LeaderboardEntry[]>({
    queryKey: ["admin-leaderboard", mode, selectedEventId, personaFilter, stageFilter, deferredSearch],
    queryFn: () => fetch(`/api/admin/leaderboard?${params}`).then((r) => r.json()),
    staleTime: 30_000,
    enabled: mode === "global" || (mode === "event" && !!selectedEventId),
  });

  // Client-side re-sort
  const entries = [...rawEntries].sort((a, b) => {
    if (sortCol === "xp")       return b.xp - a.xp;
    if (sortCol === "missions") return b.missionCount - a.missionCount;
    if (sortCol === "score")    return b.totalScore - a.totalScore;
    if (sortCol === "streak")   return b.streak - a.streak;
    if (sortCol === "level")    return b.level - a.level;
    return 0;
  });

  const selectedEvent = eventList.find((e) => e.id === selectedEventId);

  // Stats
  const topXP    = entries[0]?.xp ?? 0;
  const avgXP    = entries.length ? Math.round(entries.reduce((s, e) => s + e.xp, 0) / entries.length) : 0;
  const totalMissions = entries.reduce((s, e) => s + e.missionCount, 0);

  const SortHeader = ({ col, label }: { col: typeof sortCol; label: string }) => (
    <button
      onClick={() => setSortCol(col)}
      className={cn("flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors", sortCol === col ? "text-avax-red" : "text-slate-500 hover:text-slate-300")}
    >
      {label}
      {sortCol === col ? <ChevronDown size={11} /> : <Minus size={11} className="opacity-30" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#080810] text-white p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={18} className="text-avax-red" />
            <span className="text-xs font-semibold text-avax-red uppercase tracking-wider">Leaderboard</span>
          </div>
          <h1 className="text-3xl font-black text-white">
            {mode === "event" && selectedEvent ? `${selectedEvent.coverEmoji} ${selectedEvent.title}` : "Global Leaderboard"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">{entries.length} player{entries.length !== 1 ? "s" : ""} ranked</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06] text-sm transition-all"
          >
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>
          {entries.length > 0 && (
            <button
              onClick={() => exportCSV(entries, mode === "event")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06] text-sm transition-all"
            >
              <Download size={13} />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* ── Mode toggle ── */}
      <div className="flex items-center gap-2 p-1.5 glass-card rounded-2xl w-fit">
        <button
          onClick={() => setMode("global")}
          className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200", mode === "global" ? "bg-avax-red text-white shadow-glow-red" : "text-slate-400 hover:text-white")}
        >
          <TrendingUp size={15} />
          Global
        </button>
        <button
          onClick={() => setMode("event")}
          className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200", mode === "event" ? "bg-arena-purple text-white shadow-glow-purple" : "text-slate-400 hover:text-white")}
        >
          <Calendar size={15} />
          By Event
        </button>
      </div>

      {/* ── Event picker (event mode only) ── */}
      <AnimatePresence>
        {mode === "event" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Event</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {eventList.length === 0 && (
                  <p className="text-slate-500 text-sm col-span-full">No events found.</p>
                )}
                {eventList.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedEventId(ev.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                      selectedEventId === ev.id
                        ? "border-arena-purple/50 bg-arena-purple/10 text-white"
                        : "border-white/[0.06] bg-white/[0.02] text-slate-300 hover:bg-white/[0.05] hover:border-white/15"
                    )}
                  >
                    <span className="text-xl">{ev.coverEmoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{ev.title}</p>
                      <span className={cn("text-xs", ev.status === "live" ? "text-avax-red" : "text-slate-500")}>
                        {ev.status === "live" ? "🔴 LIVE" : ev.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative min-w-48 max-w-64 flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username…"
            className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-avax-red/30"
          />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X size={12} /></button>}
        </div>

        {/* Persona */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={12} className="text-slate-600" />
          {PERSONAS.map((p) => (
            <button
              key={p}
              onClick={() => setPersonaFilter(p)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize whitespace-nowrap",
                personaFilter === p ? "bg-avax-red text-white" : "border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20"
              )}
            >
              {p === "all" ? "All personas" : p}
            </button>
          ))}
        </div>

        {/* Stage */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STAGES.map((s) => (
            <button
              key={s}
              onClick={() => setStageFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize whitespace-nowrap",
                stageFilter === s ? "bg-arena-purple text-white" : "border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20"
              )}
            >
              {s === "all" ? "All stages" : `${STAGE_EMOJIS[s]} ${s}`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats row ── */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Players ranked" value={entries.length} icon={Users} color="bg-avax-red/20" />
          <StatCard label="Top XP" value={topXP.toLocaleString()} icon={Zap} color="bg-arena-gold/20" />
          <StatCard label="Average XP" value={avgXP.toLocaleString()} icon={TrendingUp} color="bg-arena-purple/20" />
          <StatCard label="Total missions" value={totalMissions.toLocaleString()} icon={Target} color="bg-arena-cyan/20" />
        </div>
      )}

      {/* ── Table ── */}
      {isLoading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-avax-red/30 border-t-avax-red rounded-full animate-spin" />
        </div>
      ) : mode === "event" && !selectedEventId ? (
        <div className="text-center py-24 text-slate-500">
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-white/40">Select an event above to view its leaderboard</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-24 text-slate-500">
          <Trophy size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-white/40">No players match the current filters</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-white/[0.06] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-x-4 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-8">Rank</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Player</div>
            <SortHeader col="level"    label="Level" />
            <SortHeader col="xp"      label="XP" />
            <SortHeader col="score"   label="Score" />
            <SortHeader col="missions" label="Missions" />
            <SortHeader col="streak"  label="Streak" />
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/[0.04]">
            {entries.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.4) }}
                className={cn(
                  "grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-x-4 px-4 py-3 items-center transition-colors hover:bg-white/[0.03]",
                  entry.rank <= 3 ? "bg-arena-gold/[0.025]" : ""
                )}
              >
                {/* Rank */}
                <RankBadge rank={entry.rank} />

                {/* Player */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border",
                    entry.rank === 1 ? "border-amber-400/30 bg-amber-400/10" :
                    entry.rank === 2 ? "border-slate-300/20 bg-slate-300/5" :
                    entry.rank === 3 ? "border-orange-600/20 bg-orange-600/5" :
                    "border-white/[0.06] bg-white/[0.02]"
                  )}>
                    {entry.emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold text-sm truncate">{entry.username}</p>
                      {entry.persona && (
                        <span className={cn("text-xs border px-1.5 py-0.5 rounded-md capitalize", PERSONA_COLORS[entry.persona] ?? "text-slate-400 border-slate-500/20")}>
                          {entry.persona}
                        </span>
                      )}
                      {entry.statusTag && (
                        <span className="text-xs text-arena-gold bg-arena-gold/10 border border-arena-gold/20 px-1.5 py-0.5 rounded-md">{entry.statusTag}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("text-xs capitalize", STAGE_COLORS[entry.stage] ?? "text-slate-500")}>
                        {STAGE_EMOJIS[entry.stage] ?? ""} {entry.stage}
                      </span>
                      {entry.walletAddress && (
                        <span className="text-xs text-slate-600 font-mono">{truncateAddress(entry.walletAddress)}</span>
                      )}
                      {mode === "global" && entry.email && (
                        <span className="text-xs text-slate-600 truncate max-w-32">{entry.email}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Level */}
                <div className="text-right">
                  <p className="text-white font-bold text-sm">Lv {entry.level}</p>
                </div>

                {/* XP */}
                <div className="text-right">
                  <p className={cn("font-bold text-sm tabular-nums", entry.rank === 1 ? "text-arena-gold" : "text-arena-gold/70")}>
                    {entry.xp.toLocaleString()}
                  </p>
                  <p className="text-slate-600 text-xs">XP</p>
                </div>

                {/* Total Score */}
                <div className="text-right">
                  <p className="text-arena-cyan font-bold text-sm tabular-nums">{(entry.totalScore ?? 0).toLocaleString()}</p>
                  {mode === "event" && entry.avgAccuracy != null && (
                    <p className="text-slate-600 text-xs">{entry.avgAccuracy}% acc</p>
                  )}
                </div>

                {/* Missions */}
                <div className="text-right">
                  <p className="text-white font-semibold text-sm tabular-nums">{entry.missionCount}</p>
                  {mode === "event" && entry.totalTimeSpent != null && (
                    <p className="text-slate-600 text-xs">{Math.round(entry.totalTimeSpent / 60)}m</p>
                  )}
                </div>

                {/* Streak */}
                <div className="text-right">
                  <p className={cn("text-sm font-semibold tabular-nums", entry.streak > 0 ? "text-orange-400" : "text-slate-600")}>
                    {entry.streak > 0 ? `🔥${entry.streak}` : "—"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between text-xs text-slate-600">
            <span>Showing {entries.length} player{entries.length !== 1 ? "s" : ""}</span>
            <span>Sorted by {sortCol}</span>
          </div>
        </div>
      )}
    </div>
  );
}
