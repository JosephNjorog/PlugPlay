"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, ArrowRight, Video } from "lucide-react";

const events = [
  {
    title: "Avalanche Hackathon: DeFi Track",
    format: "IRL",
    location: "Nairobi, Kenya",
    date: "Jun 14, 2026",
    participants: 89,
    tracks: ["Developer", "Builder"],
    reward: "$5,000 + NFTs",
    emoji: "🏆",
    status: "live",
  },
  {
    title: "Web3 Basics Bootcamp",
    format: "Zoom",
    location: "Online",
    date: "Jun 20, 2026",
    participants: 234,
    tracks: ["Student"],
    reward: "NFT Badges",
    emoji: "📚",
    status: "live",
  },
  {
    title: "Founder's Tokenomics Workshop",
    format: "Hybrid",
    location: "Lagos + Online",
    date: "Jul 3, 2026",
    participants: 56,
    tracks: ["Founder", "Business"],
    reward: "Merch + XP",
    emoji: "🚀",
    status: "live",
  },
];

const formatColor: Record<string, string> = {
  IRL: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Zoom: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  Hybrid: "text-purple-400 bg-purple-400/10 border-purple-400/20",
};

export function EventsPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 relative">
      <div className="absolute inset-0 hero-grid-bg opacity-20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4"
        >
          <div>
            <span className="text-arena-emerald text-sm font-semibold tracking-widest uppercase">Live Events</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-3">
              Join the{" "}
              <span className="bg-gradient-to-r from-arena-emerald to-arena-cyan bg-clip-text text-transparent">
                Community
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-lg">
              Hackathons, workshops, and Zoom sessions — all powered by live Arena battles.
            </p>
          </div>
          <Link
            href="/events"
            className="flex-shrink-0 flex items-center gap-2 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl transition-all duration-200"
          >
            All Events <ArrowRight size={14} />
          </Link>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="glass-card-hover p-6 rounded-2xl group relative overflow-hidden"
            >
              {/* Live indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </div>

              <div className="text-3xl mb-4">{event.emoji}</div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs border px-2 py-0.5 rounded-full font-medium ${formatColor[event.format]}`}>
                  {event.format}
                </span>
                {event.tracks.map((t) => (
                  <span key={t} className="text-xs text-slate-400 border border-white/[0.08] px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>

              <h3 className="text-white font-bold text-lg mb-3 group-hover:text-arena-cyan transition-colors leading-snug">
                {event.title}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  {event.format === "Zoom" ? <Video size={13} /> : <MapPin size={13} />}
                  {event.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar size={13} />
                  {event.date}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Users size={13} />
                  {event.participants} joined
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                <span className="text-xs font-mono text-arena-gold">🏆 {event.reward}</span>
                <Link
                  href="/events"
                  className="text-xs text-slate-400 hover:text-arena-cyan flex items-center gap-1 transition-colors"
                >
                  Join <ArrowRight size={12} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
