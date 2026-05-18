"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Users, Gamepad2, Calendar, Trophy, Zap, Swords, Percent, Star, TrendingUp, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { timeAgo } from "@/lib/utils";

const statCards = [
  { key: "totalPlayers", label: "Total Players", icon: Users, color: "from-avax-red to-rose-600", glow: "shadow-glow-red" },
  { key: "totalGames", label: "Total Games", icon: Gamepad2, color: "from-arena-purple to-violet-600", glow: "shadow-glow-purple" },
  { key: "totalEvents", label: "Total Events", icon: Calendar, color: "from-arena-cyan to-blue-600", glow: "shadow-glow-cyan" },
  { key: "completedAttempts", label: "Missions Done", icon: Trophy, color: "from-arena-gold to-orange-600", glow: "shadow-glow-gold" },
  { key: "totalBadges", label: "NFT Badges", icon: Star, color: "from-violet-500 to-purple-600", glow: "shadow-glow-purple" },
  { key: "activeSessions", label: "Live Sessions", icon: Swords, color: "from-emerald-500 to-teal-600", glow: "" },
  { key: "totalParticipants", label: "Participants", icon: Zap, color: "from-pink-500 to-rose-600", glow: "" },
  { key: "completionRate", label: "Completion %", icon: Percent, color: "from-amber-500 to-orange-600", glow: "" },
];

// Mock activity chart data
const generateChartData = () =>
  Array.from({ length: 14 }, (_, i) => ({
    day: `Day ${i + 1}`,
    missions: Math.floor(20 + Math.random() * 80),
    players: Math.floor(10 + Math.random() * 50),
  }));

function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const step = end / 40;
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setDisplay(Math.floor(start));
      if (start >= end) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

export default function AdminDashboard() {
  const [chartData] = useState(generateChartData);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetch("/api/admin/stats").then((r) => r.json()),
    refetchInterval: 30000,
  });

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">Dashboard</h1>
        <p className="text-slate-400 text-sm">Platform-wide metrics and activity</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const value = data?.stats?.[card.key] ?? 0;
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 rounded-2xl"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 ${card.glow}`}>
                <Icon size={18} className="text-white" />
              </div>
              <div className="text-2xl font-black text-white tabular-nums">
                {isLoading ? <div className="h-7 w-16 bg-white/[0.06] rounded animate-pulse" /> : <CountUp value={value} />}
                {card.key === "completionRate" && !isLoading && "%"}
              </div>
              <p className="text-slate-500 text-xs mt-0.5">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <h2 className="text-white font-bold mb-1 flex items-center gap-2">
            <TrendingUp size={16} className="text-avax-red" /> Platform Activity
          </h2>
          <p className="text-slate-500 text-xs mb-5">Last 14 days</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="missions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E84142" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E84142" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="players" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "rgba(10,10,20,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#fff" }} />
              <Area type="monotone" dataKey="missions" stroke="#E84142" fill="url(#missions)" strokeWidth={2} name="Missions" />
              <Area type="monotone" dataKey="players" stroke="#7C3AED" fill="url(#players)" strokeWidth={2} name="Players" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Newest players */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6 rounded-2xl">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <Users size={16} className="text-arena-cyan" /> New Players
          </h2>
          <div className="space-y-3">
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-white/[0.06]" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-white/[0.06] rounded w-24" />
                      <div className="h-2 bg-white/[0.04] rounded w-16" />
                    </div>
                  </div>
                ))
              : data?.newestPlayers?.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-base">
                      {p.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{p.username}</p>
                      <p className="text-slate-500 text-xs capitalize">{p.persona || "no persona"}</p>
                    </div>
                    <span className="text-slate-600 text-xs">{timeAgo(p.createdAt)}</span>
                  </div>
                ))}
          </div>
        </motion.div>
      </div>

      {/* Recent activity feed */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 rounded-2xl mt-6">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
          <Clock size={16} className="text-avax-red" /> Recent Missions
        </h2>
        <div className="space-y-3">
          {isLoading
            ? [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse py-2">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06]" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-white/[0.06] rounded w-40" />
                    <div className="h-2 bg-white/[0.04] rounded w-28" />
                  </div>
                  <div className="h-3 bg-white/[0.04] rounded w-16" />
                </div>
              ))
            : data?.recentAttempts?.map((a: any) => (
                <div key={a.id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-base">
                    {a.playerEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">
                      <span className="font-medium">{a.playerName}</span>{" "}
                      <span className="text-slate-400">completed</span>{" "}
                      <span className="font-medium">{a.gameTitle}</span>
                    </p>
                    <p className="text-slate-500 text-xs">Score: {a.score?.toLocaleString()}</p>
                  </div>
                  <span className="text-slate-600 text-xs flex-shrink-0">{a.completedAt ? timeAgo(a.completedAt) : "—"}</span>
                </div>
              ))}
        </div>
      </motion.div>
    </div>
  );
}
