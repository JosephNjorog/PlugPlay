"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Shield, Star, Zap, Flame, Trophy } from "lucide-react";
import { format } from "date-fns";
import { getLevelFromXP, getXPToNextLevel } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function AdminPlayersPage() {
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  const { data: players = [], isLoading } = useQuery({
    queryKey: ["admin-players", search],
    queryFn: () => fetch(`/api/admin/players${search ? `?search=${search}` : ""}`).then((r) => r.json()),
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Players</h1>
          <p className="text-slate-400 text-sm">{players.length} total</p>
        </div>
        <div className="flex items-center gap-2 glass-card px-3 py-2 rounded-xl border border-white/[0.06]">
          <Search size={14} className="text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search players..." className="bg-transparent text-white text-sm w-40 outline-none placeholder:text-slate-600" />
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Player", "Persona", "XP / Level", "Missions", "Badges", "Role", "Joined"].map((h) => (
                <th key={h} className="text-left text-slate-500 font-medium text-xs px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              : players.map((player: any, i: number) => (
                  <tr
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-base">{player.emoji}</div>
                          {i < 3 && (
                            <div className={cn("absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold", i === 0 ? "bg-amber-400 text-black" : i === 1 ? "bg-slate-300 text-black" : "bg-amber-700 text-white")}>
                              {i + 1}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{player.username}</p>
                          {player.statusTag && <p className="text-arena-purple-light text-xs">{player.statusTag}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-300 capitalize text-xs">{player.persona || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-arena-gold font-mono font-bold">{player.xp?.toLocaleString()}</span>
                        <span className="text-slate-600 text-xs"> XP</span>
                      </div>
                      <div className="text-slate-500 text-xs">Lv.{getLevelFromXP(player.xp)} · {player.stage}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{player.missionCount || 0}</td>
                    <td className="px-4 py-3 text-slate-300">{player.badgeCount || 0}</td>
                    <td className="px-4 py-3">
                      {player.isSuperAdmin ? (
                        <span className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">Super Admin</span>
                      ) : player.isAdmin ? (
                        <span className="text-xs text-avax-red bg-avax-red/10 border border-avax-red/20 px-2 py-0.5 rounded-full">Admin</span>
                      ) : (
                        <span className="text-xs text-slate-600">Player</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{format(new Date(player.createdAt), "MMM d, yyyy")}</td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && players.length === 0 && (
          <div className="text-center py-12 text-slate-500">No players found</div>
        )}
      </div>

      {/* Player Detail Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-md rounded-2xl p-6 border border-white/10">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center text-2xl">{selectedPlayer.emoji}</div>
                  <div>
                    <h3 className="text-white font-black text-xl">{selectedPlayer.username}</h3>
                    <p className="text-slate-400 text-sm capitalize">{selectedPlayer.persona || "no persona"}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedPlayer(null)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"><X size={16} /></button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { icon: Zap, label: "XP", value: selectedPlayer.xp?.toLocaleString(), color: "text-arena-gold" },
                  { icon: Shield, label: "Level", value: getLevelFromXP(selectedPlayer.xp), color: "text-arena-purple-light" },
                  { icon: Trophy, label: "Missions", value: selectedPlayer.missionCount, color: "text-avax-red" },
                  { icon: Star, label: "Badges", value: selectedPlayer.badgeCount, color: "text-violet-400" },
                  { icon: Flame, label: "Streak", value: `${selectedPlayer.streak}d`, color: "text-orange-400" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="glass-card p-3 rounded-xl flex items-center gap-2">
                    <Icon size={14} className={color} />
                    <div>
                      <div className={cn("font-bold", color)}>{value}</div>
                      <div className="text-slate-600 text-xs">{label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* XP bar */}
              {(() => {
                const xpInfo = getXPToNextLevel(selectedPlayer.xp);
                return (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Level {getLevelFromXP(selectedPlayer.xp)}</span>
                      <span>{xpInfo.current.toLocaleString()} / {xpInfo.needed.toLocaleString()} XP</span>
                    </div>
                    <div className="xp-bar"><div className="xp-bar-fill" style={{ width: `${xpInfo.progress}%` }} /></div>
                  </div>
                );
              })()}

              <div className="text-xs text-slate-500 space-y-1">
                <p>Email: {selectedPlayer.email}</p>
                {selectedPlayer.walletAddress && <p>Wallet: {selectedPlayer.walletAddress}</p>}
                <p>Joined: {format(new Date(selectedPlayer.createdAt), "PPP")}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
