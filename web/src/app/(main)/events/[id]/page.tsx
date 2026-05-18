"use client";

import { useState, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft, Calendar, MapPin, Users, Video, Clock, Trophy,
  Zap, CheckCircle, Share2, ExternalLink, QrCode,
} from "lucide-react";

const formatColors: Record<string, string> = {
  irl: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  zoom: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  hybrid: "text-purple-400 bg-purple-400/10 border-purple-400/20",
};
const statusColors: Record<string, string> = {
  live: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  draft: "text-slate-400 bg-slate-400/10 border-slate-400/20",
  paused: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  ended: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const qc = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const r = await fetch(`/api/events/${id}`);
      if (!r.ok) throw new Error("Event not found");
      return r.json();
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (join: boolean) => {
      const r = await fetch(`/api/events/${id}/join`, {
        method: join ? "POST" : "DELETE",
      });
      if (!r.ok) throw new Error();
      return r.json();
    },
    onSuccess: (_, join) => {
      toast.success(join ? "Joined event!" : "Left event");
      qc.invalidateQueries({ queryKey: ["event", id] });
    },
    onError: () => toast.error("Action failed"),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080810] pt-20">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/[0.06] rounded-xl w-48" />
            <div className="h-40 bg-white/[0.06] rounded-2xl" />
            <div className="h-64 bg-white/[0.06] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#080810] pt-20 flex items-center justify-center text-slate-400">
        Event not found.
      </div>
    );
  }

  const joined = event.joined;
  const capacity = event.capacity || 100;
  const participantCount = event.participants?.length || 0;
  const capacityPct = Math.min(100, (participantCount / capacity) * 100);

  return (
    <div className="min-h-screen bg-[#080810] pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link href="/events" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to Events
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl">
              <div className="flex items-start gap-5 mb-6">
                <span className="text-5xl">{event.coverEmoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`text-xs border px-2.5 py-1 rounded-full font-medium capitalize ${formatColors[event.format]}`}>
                      {event.format}
                    </span>
                    <span className={`text-xs border px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[event.status]}`}>
                      {event.status === "live" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1 animate-pulse" />}
                      {event.status}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{event.title}</h1>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed mb-6">{event.description}</p>

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <Calendar size={15} className="text-avax-red flex-shrink-0" />
                  <span>{format(new Date(event.startsAt), "MMM d, yyyy · h:mm a")}</span>
                </div>
                {event.endsAt && (
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <Clock size={15} className="text-arena-purple-light flex-shrink-0" />
                    <span>Ends {format(new Date(event.endsAt), "MMM d, yyyy · h:mm a")}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <MapPin size={15} className="text-arena-cyan flex-shrink-0" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.zoomUrl && (
                  <div className="flex items-center gap-2.5">
                    <Video size={15} className="text-arena-cyan flex-shrink-0" />
                    <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer" className="text-arena-cyan hover:underline flex items-center gap-1">
                      Join Zoom <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Agenda */}
            {event.agenda?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl">
                <h2 className="text-white font-bold text-lg mb-5">Agenda</h2>
                <div className="space-y-4">
                  {event.agenda.map((item: { time: string; title: string }, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="text-avax-red font-mono text-sm w-16 flex-shrink-0 pt-0.5">{item.time}</div>
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-avax-red mt-1.5 flex-shrink-0" />
                          <p className="text-white text-sm">{item.title}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tracks */}
            {event.tracks?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 rounded-2xl">
                <h2 className="text-white font-bold text-lg mb-4">Who It's For</h2>
                <div className="flex flex-wrap gap-2">
                  {event.tracks.map((track: string) => (
                    <span key={track} className="px-4 py-2 rounded-xl bg-arena-purple/10 border border-arena-purple/20 text-arena-purple-light text-sm font-medium capitalize">
                      {track}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Participants */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-2xl">
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Users size={18} className="text-arena-cyan" /> Participants ({participantCount})
              </h2>
              <div className="flex flex-wrap gap-2">
                {event.participants?.slice(0, 24).map((p: any) => (
                  <div key={p.id} title={p.username} className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-lg cursor-default">
                    {p.emoji || "🎮"}
                  </div>
                ))}
                {participantCount > 24 && (
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-xs text-slate-400">
                    +{participantCount - 24}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card neon-border-purple p-6 rounded-2xl sticky top-24">
              {/* Capacity */}
              <div className="mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Spots Filled</span>
                  <span className="text-white font-bold">{participantCount} / {capacity}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-avax-red to-arena-purple transition-all duration-500"
                    style={{ width: `${capacityPct}%` }}
                  />
                </div>
              </div>

              {/* Reward Pool */}
              {event.rewardPool && (
                <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-arena-gold/10 border border-arena-gold/20">
                  <Trophy size={16} className="text-arena-gold" />
                  <div>
                    <div className="text-xs text-slate-500">Reward Pool</div>
                    <div className="text-arena-gold font-bold text-sm">{event.rewardPool}</div>
                  </div>
                </div>
              )}

              {/* Join Button */}
              {session ? (
                event.status === "live" ? (
                  <button
                    onClick={() => joinMutation.mutate(!joined)}
                    disabled={joinMutation.isPending || (capacityPct >= 100 && !joined)}
                    className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all ${
                      joined
                        ? "bg-white/[0.06] border border-white/10 text-white hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
                        : "bg-gradient-to-r from-avax-red to-arena-purple text-white shadow-glow-red hover:opacity-90"
                    } disabled:opacity-50`}
                  >
                    {joinMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : joined ? (
                      <><CheckCircle size={16} /> Joined — Leave</>
                    ) : (
                      <><Zap size={16} /> Join Event</>
                    )}
                  </button>
                ) : (
                  <div className="text-center text-slate-500 text-sm py-3">
                    {event.status === "ended" ? "This event has ended" : "Event not open yet"}
                  </div>
                )
              ) : (
                <Link href="/sign-in" className="block text-center btn-primary py-3 rounded-xl">
                  Sign In to Join
                </Link>
              )}

              {/* Share */}
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
                className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white border border-white/[0.06] hover:border-white/10 py-2.5 rounded-xl transition-all"
              >
                <Share2 size={14} /> Share Event
              </button>

              {/* Arena link */}
              <div className="mt-5 pt-5 border-t border-white/[0.06]">
                <p className="text-xs text-slate-500 mb-3">Participating in the live quiz?</p>
                <Link
                  href="/arena/join"
                  className="flex items-center justify-center gap-2 text-sm text-arena-cyan hover:text-arena-cyan-light border border-arena-cyan/20 hover:border-arena-cyan/40 py-2.5 rounded-xl transition-all"
                >
                  <QrCode size={14} /> Join Arena Session
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
