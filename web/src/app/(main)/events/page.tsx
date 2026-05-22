"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Video,
  Users,
  Zap,
  CheckCircle2,
  Clock,
  Globe,
  Radio,
  Trophy,
  ChevronRight,
  Loader2,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ArenaEvent {
  id: string;
  title: string;
  description: string;
  format: string; // irl | zoom | hybrid
  location: string | null;
  zoomUrl: string | null;
  startsAt: string;
  endsAt: string;
  status: string; // live | future | ended / paused / draft
  category: string;
  tracks: string[];
  missions: string[];
  capacity: number;
  rewardPool: string | null;
  coverEmoji: string;
  participantCount: number;
  joined: boolean;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const FORMAT_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  irl: { label: "IRL", icon: MapPin, color: "text-arena-emerald", bg: "bg-arena-emerald/10 border-arena-emerald/20" },
  zoom: { label: "Zoom", icon: Video, color: "text-arena-cyan", bg: "bg-arena-cyan/10 border-arena-cyan/20" },
  hybrid: { label: "Hybrid", icon: Globe, color: "text-arena-purple-light", bg: "bg-arena-purple/10 border-arena-purple/20" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  live: { label: "LIVE", color: "text-avax-red", bg: "bg-avax-red/10 border-avax-red/30", dot: "bg-avax-red animate-pulse" },
  future: { label: "Upcoming", color: "text-arena-cyan", bg: "bg-arena-cyan/10 border-arena-cyan/20", dot: "bg-arena-cyan" },
  ended: { label: "Ended", color: "text-slate-400", bg: "bg-slate-400/10 border-slate-400/20", dot: "bg-slate-500" },
  paused: { label: "Paused", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20", dot: "bg-amber-400" },
};

const FORMAT_FILTERS = ["All", "IRL", "Zoom", "Hybrid"] as const;

// ─── Helpers ───────────────────────────────────────────────────────────────────
function classifyStatus(event: ArenaEvent): "live" | "future" | "ended" {
  if (event.status === "live") return "live";
  if (event.status === "ended" || event.status === "paused") return "ended";
  const now = Date.now();
  if (new Date(event.startsAt).getTime() > now) return "future";
  return "ended";
}

function formatEventDate(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const sameDay =
    start.toLocaleDateString("en-US") === end.toLocaleDateString("en-US");
  const dateStr = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = `${start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  if (sameDay) return `${dateStr} · ${timeStr}`;
  const endDateStr = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${dateStr} – ${endDateStr}`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-white/[0.05] ${className ?? ""}`} />;
}

// ─── EventCard ────────────────────────────────────────────────────────────────
function EventCard({
  event,
  index,
  onJoinToggle,
  isJoining,
}: {
  event: ArenaEvent;
  index: number;
  onJoinToggle: (id: string, joined: boolean) => void;
  isJoining: boolean;
}) {
  const effectiveStatus = classifyStatus(event);
  const statusCfg = STATUS_CONFIG[effectiveStatus] ?? STATUS_CONFIG.ended;
  const formatCfg = FORMAT_CONFIG[event.format] ?? FORMAT_CONFIG.zoom;
  const FormatIcon = formatCfg.icon;
  const capacityPct = Math.min((event.participantCount / Math.max(event.capacity, 1)) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
      className="glass-card-hover rounded-2xl overflow-hidden group"
    >
      {/* Hero strip */}
      <div className="relative px-5 pt-5 pb-4">
        {/* Top status + format badges */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            <span className={`text-xs font-bold border px-2 py-0.5 rounded-full ${statusCfg.color} ${statusCfg.bg}`}>
              {statusCfg.label}
            </span>
          </div>
          <span
            className={`flex items-center gap-1 text-xs font-medium border px-2 py-0.5 rounded-full ${formatCfg.color} ${formatCfg.bg}`}
          >
            <FormatIcon className="w-3 h-3" />
            {formatCfg.label}
          </span>
        </div>

        {/* Emoji + Title */}
        <div className="flex items-start gap-4 mb-3">
          <div className="w-14 h-14 flex-none rounded-2xl bg-gradient-to-br from-avax-red/10 to-arena-purple/15 border border-white/10 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform duration-300">
            {event.coverEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={`/events/${event.id}`}
              className="text-white font-bold text-base leading-snug hover:text-avax-red transition-colors line-clamp-2 block"
            >
              {event.title}
            </Link>
            {(event.location || event.zoomUrl) && (
              <p className="text-slate-500 text-xs mt-1 flex items-center gap-1 line-clamp-1">
                <FormatIcon className="w-3 h-3 flex-none" />
                {event.location ?? "Online"}
              </p>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
          <Clock className="w-3 h-3 flex-none" />
          <span>{formatEventDate(event.startsAt, event.endsAt)}</span>
        </div>

        {/* Tracks / persona tags */}
        {event.tracks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {event.tracks.slice(0, 3).map((track) => (
              <span
                key={track}
                className="text-[10px] text-slate-400 border border-white/[0.08] px-2 py-0.5 rounded-full bg-white/[0.02] capitalize"
              >
                {track}
              </span>
            ))}
            {event.tracks.length > 3 && (
              <span className="text-[10px] text-slate-500 px-1.5">+{event.tracks.length - 3} more</span>
            )}
          </div>
        )}

        {/* Reward pool */}
        {event.rewardPool && (
          <div className="flex items-center gap-1.5 mb-4 text-xs">
            <Trophy className="w-3.5 h-3.5 text-arena-gold" />
            <span className="text-arena-gold font-semibold">{event.rewardPool}</span>
            <span className="text-slate-500">reward pool</span>
          </div>
        )}

        {/* Capacity bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {event.participantCount.toLocaleString()} / {event.capacity.toLocaleString()} participants
            </span>
            <span>{capacityPct.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-avax-red to-arena-purple"
              initial={{ width: "0%" }}
              animate={{ width: `${capacityPct}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: index * 0.06 + 0.3 }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/events/${event.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.18] bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-200"
          >
            View Details
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          {effectiveStatus !== "ended" && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isJoining}
              onClick={() => onJoinToggle(event.id, event.joined)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
                event.joined
                  ? "bg-arena-emerald/10 border border-arena-emerald/30 text-arena-emerald hover:bg-arena-emerald/20"
                  : "btn-primary text-sm px-0 py-2"
              }`}
            >
              {isJoining ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : event.joined ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Joined
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  Join Event
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ tab }: { tab: string }) {
  const messages: Record<string, { title: string; desc: string }> = {
    live: { title: "No live events right now", desc: "Check back soon — live events appear here in real time." },
    upcoming: { title: "No upcoming events", desc: "New events are added regularly. Stay tuned!" },
    past: { title: "No past events", desc: "Completed events will appear here." },
  };
  const msg = messages[tab] ?? messages.live;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center gap-4 py-16 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-3xl">
        {tab === "live" ? "📡" : tab === "upcoming" ? "🗓️" : "📚"}
      </div>
      <div>
        <p className="text-white font-semibold text-base">{msg.title}</p>
        <p className="text-slate-500 text-sm mt-1 max-w-xs">{msg.desc}</p>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EventsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"live" | "upcoming" | "past">("live");
  const [formatFilter, setFormatFilter] = useState("All");
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const { data: events, isLoading, isError } = useQuery<ArenaEvent[]>({
    queryKey: ["events", "list"],
    queryFn: async () => {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Failed to load events");
      return res.json();
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  // Client-side tab + format filtering
  const filteredEvents = (events ?? []).filter((event) => {
    const status = classifyStatus(event);
    if (activeTab === "live" && status !== "live") return false;
    if (activeTab === "upcoming" && status !== "future") return false;
    if (activeTab === "past" && status !== "ended") return false;
    if (formatFilter !== "All" && event.format !== formatFilter.toLowerCase()) return false;
    return true;
  });

  const liveBadgeCount = (events ?? []).filter((e) => classifyStatus(e) === "live").length;

  const handleJoinToggle = async (eventId: string, currentlyJoined: boolean) => {
    if (!session?.user) {
      toast.error("Sign in to join events");
      return;
    }
    setJoiningId(eventId);
    try {
      const method = currentlyJoined ? "DELETE" : "POST";
      const res = await fetch(`/api/events/${eventId}/join`, { method });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to update participation");
        return;
      }
      toast.success(currentlyJoined ? "Left event" : "Joined event!", {
        description: currentlyJoined ? undefined : "You're in! See you there.",
      });
      // Optimistically update cache
      queryClient.setQueryData<ArenaEvent[]>(["events", "list"], (old) =>
        old?.map((e) =>
          e.id === eventId
            ? {
                ...e,
                joined: !currentlyJoined,
                participantCount: e.participantCount + (currentlyJoined ? -1 : 1),
              }
            : e
        )
      );
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      {/* Background */}
      <div className="fixed inset-0 hero-grid-bg opacity-20 pointer-events-none" aria-hidden />
      <div className="fixed top-1/4 left-1/4 w-[600px] h-[400px] rounded-full bg-avax-red/4 blur-[160px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-arena-purple/4 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-avax-red" />
            <span className="text-sm font-semibold text-avax-red uppercase tracking-wider">Events</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white">
                Live{" "}
                <span className="gradient-text">Events</span>
              </h1>
              <p className="text-slate-400 mt-2 text-sm max-w-2xl">
                Join live workshops, IRL hackathons, and virtual challenges. Compete, learn, and earn rewards.
              </p>
            </div>
            {liveBadgeCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-avax-red/10 border border-avax-red/30 neon-border-red"
              >
                <div className="w-2 h-2 rounded-full bg-avax-red animate-pulse" />
                <span className="text-sm font-semibold text-avax-red">
                  {liveBadgeCount} event{liveBadgeCount !== 1 ? "s" : ""} live now
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── Status Tabs + Format Filters ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center gap-4"
        >
          {/* Status tabs */}
          <div className="flex items-center gap-1.5 p-1.5 glass-card rounded-2xl w-fit">
            {(["live", "upcoming", "past"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${
                  activeTab === tab
                    ? tab === "live"
                      ? "bg-avax-red text-white shadow-glow-red"
                      : tab === "upcoming"
                      ? "bg-arena-cyan/20 text-arena-cyan border border-arena-cyan/30"
                      : "bg-white/[0.08] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab === "live" && activeTab === "live" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Format filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {FORMAT_FILTERS.map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormatFilter(fmt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  formatFilter === fmt
                    ? "bg-arena-purple text-white shadow-glow-purple"
                    : "text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/[0.18] bg-white/[0.02]"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Events Grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-72" />
                ))}
              </div>
            ) : isError ? (
              <div className="col-span-full flex flex-col items-center gap-4 py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl">⚠️</div>
                <div>
                  <p className="text-white font-semibold text-base">Failed to load events</p>
                  <p className="text-slate-500 text-sm mt-1">Please refresh the page or try again later.</p>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="grid grid-cols-1">
                <EmptyState tab={activeTab} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredEvents.map((event, i) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={i}
                    onJoinToggle={handleJoinToggle}
                    isJoining={joiningId === event.id}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
