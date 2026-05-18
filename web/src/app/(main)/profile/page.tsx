"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { User, Wallet, Save, Key, Shield, Zap, Flame } from "lucide-react";
import { cn, getLevelFromXP, getStageFromXP, getXPToNextLevel, truncateAddress } from "@/lib/utils";

const profileSchema = z.object({
  username: z.string().min(2).max(32),
  emoji: z.string().min(1),
  walletAddress: z.string().optional(),
  statusTag: z.string().max(30).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(8, "Min 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const EMOJI_OPTIONS = ["🎮", "🧑‍💻", "🚀", "🏗️", "💼", "🧑‍🎓", "⚡", "🔥", "🛡️", "🏆",
  "🦊", "🐉", "🦁", "🌊", "🌙", "⭐", "💎", "🎯", "🧬", "🔬",
  "🤖", "👾", "🎲", "🃏", "🏄", "🧙", "🦸", "🕵️", "🧑‍🚀", "🎭"];

const PERSONA_LABELS: Record<string, string> = {
  student: "🧑‍🎓 Student",
  developer: "🧑‍💻 Developer",
  builder: "🏗️ Builder",
  founder: "🚀 Founder",
  business: "💼 Business",
};

const STAGE_COLORS: Record<string, string> = {
  newcomer: "text-slate-400",
  explorer: "text-emerald-400",
  builder: "text-cyan-400",
  validator: "text-purple-400",
  leader: "text-amber-400",
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const qc = useQueryClient();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetch("/api/profile").then((r) => r.json()),
    enabled: !!session,
  });

  const profileForm = useForm({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  // Populate form when profile loads
  useQuery({
    queryKey: ["profile-init"],
    queryFn: async () => {
      if (!profile) return null;
      profileForm.reset({
        username: profile.username,
        emoji: profile.emoji || "🎮",
        walletAddress: profile.walletAddress || "",
        statusTag: profile.statusTag || "",
      });
      return null;
    },
    enabled: !!profile,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const r = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error("Update failed");
      return r.json();
    },
    onSuccess: () => {
      toast.success("Profile updated!");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => toast.error("Update failed"),
  });

  const passwordMutation = useMutation({
    mutationFn: async (data: any) => {
      const r = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!r.ok) {
        const e = await r.json();
        throw new Error(e.error || "Failed");
      }
    },
    onSuccess: () => {
      toast.success("Password updated!");
      passwordForm.reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080810] pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-avax-red/30 border-t-avax-red rounded-full animate-spin" />
      </div>
    );
  }

  const xpInfo = profile ? getXPToNextLevel(profile.xp) : null;

  return (
    <div className="min-h-screen bg-[#080810] pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black text-white mb-1">Profile</h1>
          <p className="text-slate-400">Manage your identity and account settings</p>
        </motion.div>

        {/* Stats overview */}
        {profile && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl mb-6">
            <div className="flex items-center gap-5 mb-5">
              <div className="w-20 h-20 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-4xl">
                {profile.emoji}
              </div>
              <div>
                <h2 className="text-white text-2xl font-black">{profile.username}</h2>
                {profile.statusTag && <p className="text-arena-purple-light text-sm mt-0.5">✦ {profile.statusTag}</p>}
                <p className="text-slate-500 text-sm">{profile.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: Zap, label: "XP", value: profile.xp?.toLocaleString(), color: "text-arena-gold" },
                { icon: Shield, label: "Level", value: getLevelFromXP(profile.xp), color: "text-arena-purple-light" },
                { icon: Flame, label: "Streak", value: `${profile.streak}d`, color: "text-orange-400" },
                { icon: User, label: "Stage", value: profile.stage, color: STAGE_COLORS[profile.stage] || "text-slate-400" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="text-center">
                  <Icon size={16} className={cn(color, "mx-auto mb-1")} />
                  <div className={cn("font-bold capitalize", color)}>{value}</div>
                  <div className="text-slate-600 text-xs">{label}</div>
                </div>
              ))}
            </div>
            {xpInfo && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Level {getLevelFromXP(profile.xp)} → {getLevelFromXP(profile.xp) + 1}</span>
                  <span>{xpInfo.current.toLocaleString()} / {xpInfo.needed.toLocaleString()} XP</span>
                </div>
                <div className="xp-bar"><div className="xp-bar-fill" style={{ width: `${xpInfo.progress}%` }} /></div>
              </div>
            )}
          </motion.div>
        )}

        {/* Profile edit */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-2xl mb-6">
          <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2"><User size={18} className="text-avax-red" /> Profile Details</h3>
          <form onSubmit={profileForm.handleSubmit((d) => updateMutation.mutate(d))} className="space-y-5">
            {/* Emoji picker */}
            <div>
              <label className="text-sm text-slate-400 block mb-2">Avatar Emoji</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                  className="w-14 h-14 rounded-xl bg-white/[0.06] border border-white/10 text-3xl hover:bg-white/[0.1] transition-all"
                >
                  {profileForm.watch("emoji") || profile?.emoji || "🎮"}
                </button>
                <span className="text-slate-500 text-sm">Click to change</span>
              </div>
              {emojiPickerOpen && (
                <div className="mt-3 p-4 glass-card rounded-xl grid grid-cols-10 gap-2">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => { profileForm.setValue("emoji", e); setEmojiPickerOpen(false); }}
                      className="w-9 h-9 rounded-lg hover:bg-white/10 text-xl flex items-center justify-center transition-all"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-2">Username</label>
              <input {...profileForm.register("username")} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-arena-purple/50 transition-colors" />
              {profileForm.formState.errors.username && <p className="text-red-400 text-xs mt-1">{profileForm.formState.errors.username.message as string}</p>}
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-2">Status Tag <span className="text-slate-600">(shows on profile)</span></label>
              <input {...profileForm.register("statusTag")} placeholder="e.g. DeFi Builder 🏗️" maxLength={30} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-arena-purple/50 transition-colors" />
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-2 flex items-center gap-2">
                <Wallet size={14} /> Core Wallet Address <span className="text-slate-600">(for NFT minting)</span>
              </label>
              <input {...profileForm.register("walletAddress")} placeholder="0x..." className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-arena-cyan/50 transition-colors" />
            </div>

            {/* Persona display (read-only) */}
            {profile?.persona && (
              <div>
                <label className="text-sm text-slate-400 block mb-2">Persona</label>
                <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white">
                  {PERSONA_LABELS[profile.persona] || profile.persona}
                  <span className="text-slate-600 text-xs ml-auto">(set at onboarding)</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all shadow-glow-red disabled:opacity-50"
            >
              {updateMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </form>
        </motion.div>

        {/* Password change */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 rounded-2xl">
          <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2"><Key size={18} className="text-arena-purple-light" /> Change Password</h3>
          <form onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate(d))} className="space-y-4">
            {[
              { name: "currentPassword", label: "Current Password" },
              { name: "newPassword", label: "New Password" },
              { name: "confirmPassword", label: "Confirm New Password" },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="text-sm text-slate-400 block mb-2">{label}</label>
                <input
                  type="password"
                  {...passwordForm.register(name as any)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arena-purple/50 transition-colors"
                />
                {passwordForm.formState.errors[name as any] && (
                  <p className="text-red-400 text-xs mt-1">{(passwordForm.formState.errors as any)[name]?.message}</p>
                )}
              </div>
            ))}
            <button
              type="submit"
              disabled={passwordMutation.isPending}
              className="flex items-center gap-2 border border-arena-purple/30 text-arena-purple-light hover:bg-arena-purple/10 font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50"
            >
              {passwordMutation.isPending ? <div className="w-4 h-4 border-2 border-arena-purple/30 border-t-arena-purple rounded-full animate-spin" /> : <Key size={16} />}
              Update Password
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
