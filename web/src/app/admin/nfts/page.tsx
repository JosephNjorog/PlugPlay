"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ExternalLink, Zap, Image, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const rarityColors: Record<string, string> = {
  common: "text-slate-300 bg-slate-300/10 border-slate-300/20",
  rare: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  epic: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  legendary: "text-arena-gold bg-arena-gold/10 border-arena-gold/20",
};

export default function AdminNFTsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"mints" | "badges">("mints");
  const [minting, setMinting] = useState<string | null>(null);

  const { data: nfts = [], isLoading } = useQuery({
    queryKey: ["admin-nfts", tab],
    queryFn: () => fetch(`/api/admin/nfts?type=${tab}`).then((r) => r.json()),
  });

  const mintMutation = useMutation({
    mutationFn: async (badgeId: string) => {
      const r = await fetch("/api/blockchain/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeId }),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin-nfts"] });
      toast.success(`NFT minted! TX: ${data.txHash?.slice(0, 10)}…`);
      setMinting(null);
    },
    onError: (e: Error) => {
      toast.error(e.message || "Mint failed");
      setMinting(null);
    },
  });

  const stats = {
    totalMints: nfts.filter(() => tab === "mints").length,
    totalBadges: nfts.length,
    legendary: nfts.filter((n: any) => n.rarity === "legendary").length,
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">NFT Mints</h1>
          <p className="text-slate-400 text-sm">On-chain badges and mint history</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "On-chain Mints", value: nfts.filter((n: any) => n.txHash).length, icon: Zap, color: "text-emerald-400" },
          { label: "Total Badges", value: nfts.length, icon: Star, color: "text-arena-gold" },
          { label: "Legendary", value: nfts.filter((n: any) => n.rarity === "legendary").length, icon: Image, color: "text-violet-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4 rounded-xl">
            <Icon size={16} className={cn("mb-2", color)} />
            <div className="text-2xl font-black text-white">{isLoading ? <div className="h-7 w-12 bg-white/[0.06] rounded animate-pulse" /> : value}</div>
            <div className="text-slate-500 text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 glass-card p-1 rounded-xl w-fit border border-white/[0.06]">
        {(["mints", "badges"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
              tab === t ? "bg-avax-red/20 text-avax-red-light" : "text-slate-400 hover:text-white"
            )}
          >
            {t === "mints" ? "On-Chain Mints" : "Earned Badges"}
          </button>
        ))}
      </div>

      {/* Mints table */}
      {tab === "mints" && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Player", "Game / Badge", "Token ID", "TX Hash", "Contract", "Minted"].map((h) => (
                  <th key={h} className="text-left text-slate-500 font-medium text-xs px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.04]">
                      {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>)}
                    </tr>
                  ))
                : nfts.map((mint: any) => (
                    <tr key={mint.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-sm">{mint.userEmoji || "👾"}</div>
                          <div>
                            <p className="text-white text-xs font-medium">{mint.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{mint.gameId || "—"}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">#{mint.tokenId}</td>
                      <td className="px-4 py-3">
                        {mint.txHash ? (
                          <a
                            href={`https://testnet.snowtrace.io/tx/${mint.txHash}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-arena-cyan hover:text-arena-cyan/80 text-xs font-mono transition-colors"
                          >
                            {mint.txHash.slice(0, 10)}…
                            <ExternalLink size={10} />
                          </a>
                        ) : <span className="text-slate-600 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                        {mint.contractAddress ? `${mint.contractAddress.slice(0, 8)}…` : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{mint.mintedAt ? format(new Date(mint.mintedAt), "MMM d, yyyy") : "—"}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!isLoading && nfts.length === 0 && (
            <div className="text-center py-12 text-slate-500">No on-chain mints yet</div>
          )}
        </div>
      )}

      {/* Badges grid */}
      {tab === "badges" && (
        <div>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <div key={i} className="h-40 bg-white/[0.04] rounded-2xl animate-pulse" />)}
            </div>
          ) : nfts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No badges earned yet</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {nfts.map((badge: any) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all"
                >
                  <div className="text-4xl mb-2 text-center">{badge.emoji}</div>
                  <div className="text-center mb-2">
                    <p className="text-white font-bold text-sm">{badge.title}</p>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-xs">{badge.userEmoji || "👾"}</div>
                      <p className="text-slate-400 text-xs">{badge.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs border px-2 py-0.5 rounded-full capitalize", rarityColors[badge.rarity] || rarityColors.common)}>
                      {badge.rarity}
                    </span>
                    {!badge.txHash && badge.userId && (
                      <button
                        onClick={() => { setMinting(badge.id); mintMutation.mutate(badge.id); }}
                        disabled={mintMutation.isPending && minting === badge.id}
                        className="text-xs text-arena-cyan bg-arena-cyan/10 border border-arena-cyan/20 px-2.5 py-1 rounded-lg hover:bg-arena-cyan/20 transition-all disabled:opacity-50 flex items-center gap-1"
                      >
                        {mintMutation.isPending && minting === badge.id ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                        Mint
                      </button>
                    )}
                    {badge.txHash && (
                      <a
                        href={`https://testnet.snowtrace.io/tx/${badge.txHash}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                  <p className="text-slate-600 text-xs mt-2">{badge.mintedAt ? format(new Date(badge.mintedAt), "MMM d, yyyy") : "—"}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
