"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Zap, Users, ArrowRight, Wifi, QrCode } from "lucide-react";
import { getPusherClient, arenaChannel, ARENA_EVENTS } from "@/lib/pusher";

const schema = z.object({
  code: z.string().length(6, "Code must be 6 characters").toUpperCase(),
  nickname: z.string().min(1, "Nickname required").max(32),
  walletAddress: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ArenaJoinPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isJoining, setIsJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [playerId, setPlayerId] = useState<string>("");
  const [sessionCode, setSessionCode] = useState<string>("");
  const [playerCount, setPlayerCount] = useState(0);
  const [maxPlayers, setMaxPlayers] = useState(300);

  useEffect(() => {
    if (!joined || !sessionCode) return;
    const pusher = getPusherClient();
    const ch = pusher.subscribe(arenaChannel(sessionCode));
    ch.bind(ARENA_EVENTS.PLAYER_JOINED, (data: { playerCount?: number }) => {
      if (data?.playerCount !== undefined) setPlayerCount(data.playerCount);
    });
    return () => pusher.unsubscribe(arenaChannel(sessionCode));
  }, [joined, sessionCode]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nickname: (session?.user?.name || "").slice(0, 32),
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsJoining(true);
    try {
      const res = await fetch(`/api/arena/sessions/${data.code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: data.nickname, walletAddress: data.walletAddress }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to join session");
        return;
      }

      const { player, session: arenaSession, playerCount: count } = await res.json();
      setPlayerId(player.id);
      setSessionCode(data.code.toUpperCase());
      setPlayerCount(count ?? 1);
      setMaxPlayers(arenaSession?.maxPlayers ?? 300);
      setJoined(true);
      toast.success("Joined the arena! Waiting for host to start...");
    } catch {
      toast.error("Connection error");
    } finally {
      setIsJoining(false);
    }
  };

  const handlePlay = () => {
    router.push(`/arena/play?code=${sessionCode}&playerId=${playerId}`);
  };

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 hero-grid-bg opacity-30" />
      <div className="absolute inset-0 bg-gradient-radial from-arena-purple/5 via-transparent to-transparent" />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-avax-red to-arena-purple flex items-center justify-center text-2xl mx-auto mb-4 shadow-glow-red">
            ⚡
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Join the Arena</h1>
          <p className="text-slate-400">Enter your 6-character code to compete live</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!joined ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card neon-border-purple p-6 rounded-2xl"
            >
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Code input */}
                <div>
                  <label className="text-sm text-slate-400 font-medium block mb-2">Arena Code</label>
                  <input
                    {...form.register("code")}
                    placeholder="ABC123"
                    maxLength={6}
                    onChange={(e) => form.setValue("code", e.target.value.toUpperCase())}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl font-bold font-mono tracking-widest placeholder:text-white/20 focus:outline-none focus:border-arena-purple/50 transition-colors"
                  />
                  {form.formState.errors.code && (
                    <p className="text-red-400 text-xs mt-1">{form.formState.errors.code.message}</p>
                  )}
                </div>

                {/* Nickname */}
                <div>
                  <label className="text-sm text-slate-400 font-medium block mb-2">Your Nickname</label>
                  <input
                    {...form.register("nickname")}
                    placeholder="BlockchainBoss"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-arena-purple/50 transition-colors"
                  />
                  {form.formState.errors.nickname && (
                    <p className="text-red-400 text-xs mt-1">{form.formState.errors.nickname.message}</p>
                  )}
                </div>

                {/* Wallet (optional) */}
                <div>
                  <label className="text-sm text-slate-400 font-medium block mb-2">
                    Wallet Address <span className="text-slate-600">(optional — for NFT prize)</span>
                  </label>
                  <input
                    {...form.register("walletAddress")}
                    placeholder="0x..."
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder:text-white/30 focus:outline-none focus:border-arena-purple/50 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isJoining}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:opacity-90 transition-all shadow-glow-red"
                >
                  {isJoining ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap size={16} />
                      Enter Arena
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-3 text-slate-600 text-sm">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <QrCode size={14} />
                <span>Or scan the QR code at your event</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card neon-border-cyan p-8 rounded-2xl text-center"
            >
              <div className="w-16 h-16 rounded-full bg-arena-cyan/20 border border-arena-cyan/30 flex items-center justify-center mx-auto mb-4">
                <Wifi size={24} className="text-arena-cyan animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">You're in!</h2>
              <p className="text-slate-400 mb-3">Arena code: <span className="text-white font-mono font-bold">{sessionCode}</span></p>

              {/* Live player counter */}
              <motion.div
                key={playerCount}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center gap-2 mb-2"
              >
                <Users size={16} className="text-arena-cyan" />
                <span className="text-arena-cyan font-bold text-lg">{playerCount}</span>
                <span className="text-slate-500 text-sm">/ {maxPlayers} joined</span>
              </motion.div>
              <div className="w-full bg-white/[0.06] rounded-full h-1.5 mb-6 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-arena-cyan to-arena-purple rounded-full"
                  animate={{ width: `${Math.min((playerCount / maxPlayers) * 100, 100)}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              <p className="text-slate-500 text-sm mb-6">Waiting for the host to start the session...</p>

              <div className="flex gap-3">
                <button
                  onClick={handlePlay}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-arena-cyan to-arena-purple text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all"
                >
                  <Zap size={16} />
                  Go to Arena
                </button>
                <button
                  onClick={() => setJoined(false)}
                  className="px-4 py-3 border border-white/10 text-slate-400 rounded-xl hover:bg-white/[0.04]"
                >
                  Leave
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info footer */}
        <div className="mt-6 flex items-center justify-center gap-6 text-slate-600 text-xs">
          <span className="flex items-center gap-1.5"><Users size={12} /> Live multiplayer</span>
          <span className="flex items-center gap-1.5"><Zap size={12} /> Real-time scoring</span>
        </div>
      </div>
    </div>
  );
}
