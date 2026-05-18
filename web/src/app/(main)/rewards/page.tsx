"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery as useSessionQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { Shield, Coins, ShoppingBag, ExternalLink, Loader2, Lock, CheckCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "badges" | "tokens" | "merch";

const rarityConfig: Record<string, { label: string; border: string; bg: string; glow: string; text: string }> = {
  legendary: {
    label: "Legendary",
    border: "border-amber-400/40",
    bg: "bg-amber-400/5",
    glow: "shadow-glow-gold",
    text: "text-amber-400",
  },
  rare: {
    label: "Rare",
    border: "border-violet-400/40",
    bg: "bg-violet-400/5",
    glow: "shadow-glow-purple",
    text: "text-violet-400",
  },
  common: {
    label: "Common",
    border: "border-slate-500/30",
    bg: "bg-slate-500/5",
    glow: "",
    text: "text-slate-400",
  },
};

export default function RewardsPage() {
  const [tab, setTab] = useState<Tab>("badges");
  const { data: session } = useSession();
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetch("/api/profile").then((r) => r.json()),
    enabled: !!session,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["rewards"],
    queryFn: () => fetch("/api/rewards").then((r) => r.json()),
    enabled: !!session,
  });

  const mintMutation = useMutation({
    mutationFn: async (badgeId: string) => {
      const r = await fetch("/api/blockchain/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeId }),
      });
      if (!r.ok) {
        const e = await r.json();
        throw new Error(e.error || "Mint failed");
      }
      return r.json();
    },
    onSuccess: (data) => {
      toast.success(`NFT minted! Token #${data.tokenId}`);
      qc.invalidateQueries({ queryKey: ["rewards"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const claimMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      const r = await fetch("/api/rewards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });
      return r.json();
    },
    onSuccess: () => {
      toast.success("Reward claimed!");
      qc.invalidateQueries({ queryKey: ["rewards"] });
    },
    onError: () => toast.error("Claim failed"),
  });

  const badges = data?.badges || [];
  const rewards = data?.rewards || [];
  const tokens = rewards.filter((r: any) => r.kind === "token");
  const merch = rewards.filter((r: any) => r.kind === "merch");

  const tabs = [
    { id: "badges" as Tab, label: "NFT Badges", icon: Shield, count: badges.length },
    { id: "tokens" as Tab, label: "Token Rewards", icon: Coins, count: tokens.length },
    { id: "merch" as Tab, label: "Merch Vouchers", icon: ShoppingBag, count: merch.length },
  ];

  return (
    <div className="min-h-screen bg-[#080810] pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            My <span className="gradient-text">Rewards</span>
          </h1>
          <p className="text-slate-400">Your earned NFT badges, token rewards, and merchandise vouchers</p>
        </motion.div>

        {/* Stats bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-4 mb-8">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.id} className="glass-card p-4 rounded-xl text-center">
                <Icon size={20} className="text-avax-red mx-auto mb-1" />
                <div className="text-2xl font-black text-white">{t.count}</div>
                <div className="text-slate-500 text-xs">{t.label}</div>
              </div>
            );
          })}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
                  tab === t.id
                    ? "bg-gradient-to-r from-avax-red to-arena-purple text-white shadow-glow-red"
                    : "glass-card text-slate-400 hover:text-white"
                )}
              >
                <Icon size={15} />
                {t.label}
                <span className={cn("text-xs px-1.5 py-0.5 rounded-full", tab === t.id ? "bg-white/20" : "bg-white/[0.06]")}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl h-48 animate-pulse" />
              ))}
            </div>
          ) : tab === "badges" ? (
            <motion.div key="badges" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {badges.length === 0 ? (
                <div className="col-span-full text-center py-16 text-slate-500">
                  <Shield size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No NFT badges yet. Complete missions to earn badges!</p>
                </div>
              ) : (
                badges.map((badge: any) => {
                  const r = rarityConfig[badge.rarity] || rarityConfig.common;
                  return (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("glass-card p-6 rounded-2xl border transition-all hover:scale-[1.02]", r.border, r.bg, r.glow)}
                    >
                      <div className="text-5xl mb-4 text-center">{badge.emoji}</div>
                      <h3 className="text-white font-bold text-center mb-1">{badge.title}</h3>
                      <div className={cn("text-xs text-center font-medium mb-1", r.text)}>{r.label}</div>
                      <p className="text-slate-500 text-xs text-center mb-5">
                        {format(new Date(badge.mintedAt), "MMM d, yyyy")}
                      </p>

                      {!profile?.walletAddress ? (
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-600 border border-white/[0.06] py-2 rounded-xl">
                          <Lock size={12} />
                          Add wallet to mint
                        </div>
                      ) : (
                        <button
                          onClick={() => mintMutation.mutate(badge.id)}
                          disabled={mintMutation.isPending}
                          className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-gradient-to-r from-avax-red/20 to-arena-purple/20 border border-avax-red/30 text-avax-red-light hover:bg-avax-red/30 py-2 rounded-xl transition-all"
                        >
                          {mintMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                          Mint to Wallet
                        </button>
                      )}
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          ) : tab === "tokens" ? (
            <motion.div key="tokens" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tokens.length === 0 ? (
                <div className="col-span-full text-center py-16 text-slate-500">
                  <Coins size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No token rewards yet. Complete advanced challenges!</p>
                </div>
              ) : (
                tokens.map((reward: any) => (
                  <motion.div key={reward.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl">
                    <div className="text-4xl mb-3">🪙</div>
                    <h3 className="text-white font-bold mb-1">{reward.title}</h3>
                    <p className="text-slate-400 text-sm mb-1">{reward.description}</p>
                    <p className="text-arena-gold font-mono font-bold text-lg mb-4">{reward.value}</p>
                    {reward.claimed ? (
                      <div className="flex items-center gap-2 text-emerald-400 text-sm">
                        <CheckCircle size={16} /> Claimed {reward.claimedAt && format(new Date(reward.claimedAt), "MMM d")}
                      </div>
                    ) : (
                      <button
                        onClick={() => claimMutation.mutate(reward.id)}
                        disabled={claimMutation.isPending || !profile?.walletAddress}
                        className="btn-primary py-2 text-sm rounded-xl w-full"
                      >
                        {!profile?.walletAddress ? "Add wallet first" : "Claim Token"}
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div key="merch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {merch.length === 0 ? (
                <div className="col-span-full text-center py-16 text-slate-500">
                  <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No merch vouchers yet. Join events to earn!</p>
                </div>
              ) : (
                merch.map((reward: any) => (
                  <motion.div key={reward.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl border border-dashed border-white/10">
                    <div className="text-4xl mb-3">🎁</div>
                    <h3 className="text-white font-bold mb-1">{reward.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">{reward.description}</p>
                    {reward.claimed ? (
                      <div className="flex items-center gap-2 text-emerald-400 text-sm">
                        <CheckCircle size={16} /> Redeemed
                      </div>
                    ) : (
                      <button
                        onClick={() => claimMutation.mutate(reward.id)}
                        disabled={claimMutation.isPending}
                        className="w-full py-2 text-sm font-semibold border border-emerald-500/30 text-emerald-400 rounded-xl hover:bg-emerald-500/10 transition-all"
                      >
                        Mark as Redeemed
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
