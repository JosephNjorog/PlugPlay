"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Swords, Users, Zap, Play, Plus, RotateCcw, Square,
  ChevronRight, Crown, ArrowRight, Wifi,
} from "lucide-react";
import { getPusherClient, arenaChannel, ARENA_EVENTS } from "@/lib/pusher";
import { cn } from "@/lib/utils";

const joinSchema = z.object({
  code: z.string().length(6, "Code must be 6 characters").toUpperCase(),
  nickname: z.string().min(1, "Nickname required").max(32),
});
type JoinForm = z.infer<typeof joinSchema>;

const TOPICS = [
  { value: "avalanche_basics", label: "Avalanche Basics" },
  { value: "defi",             label: "DeFi & Staking" },
  { value: "smart_contracts",  label: "Smart Contracts" },
  { value: "nfts",             label: "NFTs & Bridges" },
  { value: "security",         label: "Security & Wallets" },
  { value: "validators",       label: "Validators & Consensus" },
];

const statusColors: Record<string, string> = {
  waiting: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  active:  "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  ended:   "text-slate-500 bg-slate-500/10 border-slate-500/20",
};

export default function ArenaPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const qc = useQueryClient();
  const isAdmin = (session?.user as any)?.isAdmin;

  // ── Join state (non-admin / quick join) ────────────────────────────
  const [joined, setJoined] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [playerCount, setPlayerCount] = useState(0);
  const [maxPlayers, setMaxPlayers] = useState(300);
  const [isJoining, setIsJoining] = useState(false);

  const joinForm = useForm<JoinForm>({
    resolver: zodResolver(joinSchema),
    defaultValues: { nickname: (session?.user?.name || "").slice(0, 32) },
  });

  useEffect(() => {
    if (!joined || !joinCode) return;
    const pusher = getPusherClient();
    const ch = pusher.subscribe(arenaChannel(joinCode));
    ch.bind(ARENA_EVENTS.PLAYER_JOINED, (d: { playerCount?: number }) => {
      if (d?.playerCount !== undefined) setPlayerCount(d.playerCount);
    });
    ch.bind(ARENA_EVENTS.SESSION_STARTED, () => {
      router.push(`/arena/play?code=${joinCode}&playerId=${playerId}`);
    });
    return () => pusher.unsubscribe(arenaChannel(joinCode));
  }, [joined, joinCode, playerId, router]);

  const onJoin = async (data: JoinForm) => {
    setIsJoining(true);
    try {
      const res = await fetch(`/api/arena/sessions/${data.code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: data.nickname }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to join");
        return;
      }
      const { player, session: s, playerCount: cnt } = await res.json();
      setPlayerId(player.id);
      setJoinCode(data.code.toUpperCase());
      setPlayerCount(cnt ?? 1);
      setMaxPlayers(s?.maxPlayers ?? 300);
      setJoined(true);
      toast.success("Joined! Waiting for host to start...");
    } catch {
      toast.error("Connection error");
    } finally {
      setIsJoining(false);
    }
  };

  // ── Admin session management ────────────────────────────────────────
  const [createForm, setCreateForm] = useState({ topic: "avalanche_basics", maxPlayers: 300 });

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["arena-sessions"],
    queryFn: () => fetch("/api/arena/sessions").then((r) => r.json()),
    refetchInterval: 8000,
    enabled: !!isAdmin,
  });

  const createSession = useMutation({
    mutationFn: () => fetch("/api/arena/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    }).then((r) => r.json()),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ["arena-sessions"] });
      toast.success(`Session ${s.code} created`);
    },
  });

  const endSession = useMutation({
    mutationFn: (code: string) => fetch(`/api/arena/sessions/${code}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["arena-sessions"] }); toast.success("Session ended"); },
  });

  const restartSession = useMutation({
    mutationFn: (code: string) => fetch(`/api/arena/sessions/${code}`, { method: "PATCH" }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["arena-sessions"] }); toast.success("Session restarted"); },
  });

  const startSession = useMutation({
    mutationFn: (code: string) => fetch(`/api/arena/sessions/${code}/start`, { method: "POST" }).then((r) => r.json()),
    onSuccess: (data, code) => {
      qc.invalidateQueries({ queryKey: ["arena-sessions"] });
      toast.success(`Game started — ${data.questionCount} questions`);
    },
  });

  const nextQuestion = useMutation({
    mutationFn: (code: string) => fetch(`/api/arena/sessions/${code}/next`, { method: "POST" }).then((r) => r.json()),
    onSuccess: (data) => {
      if (data.done) { qc.invalidateQueries({ queryKey: ["arena-sessions"] }); toast.success("Session complete!"); }
      else toast.success(`Question ${data.roundIndex + 1} pushed`);
    },
  });

  // ── Non-admin: joined waiting screen ───────────────────────────────
  if (!isAdmin && joined) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-sm p-8 rounded-2xl text-center border border-arena-cyan/20">
          <div className="w-14 h-14 rounded-full bg-arena-cyan/20 border border-arena-cyan/30 flex items-center justify-center mx-auto mb-4">
            <Wifi size={22} className="text-arena-cyan animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">You're in!</h2>
          <p className="text-slate-400 text-sm mb-4">Code: <span className="font-mono font-bold text-white">{joinCode}</span></p>
          <motion.div key={playerCount} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-full px-4 py-2 mb-3">
            <Users size={13} className="text-arena-cyan" />
            <span className="text-arena-cyan font-bold">{playerCount}</span>
            <span className="text-slate-400 text-sm">/ {maxPlayers} joined</span>
          </motion.div>
          <div className="w-full bg-white/[0.06] rounded-full h-1.5 mb-6 overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-arena-cyan to-arena-purple rounded-full" animate={{ width: `${Math.min((playerCount / maxPlayers) * 100, 100)}%` }} transition={{ duration: 0.4 }} />
          </div>
          <p className="text-slate-500 text-sm mb-6">Waiting for the host to start...</p>
          <div className="flex gap-3">
            <button onClick={() => router.push(`/arena/play?code=${joinCode}&playerId=${playerId}`)} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-arena-cyan to-arena-purple text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all text-sm">
              <Zap size={14} /> Go to Arena
            </button>
            <button onClick={() => setJoined(false)} className="px-4 py-3 border border-white/10 text-slate-400 rounded-xl hover:bg-white/[0.04] text-sm">Leave</button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Non-admin: join form ────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-avax-red to-arena-purple flex items-center justify-center text-2xl mx-auto mb-4 shadow-glow-red">⚡</div>
            <h1 className="text-3xl font-black text-white mb-2">Join the Arena</h1>
            <p className="text-slate-400">Enter your 6-character code to compete live</p>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 rounded-2xl border border-arena-purple/20">
            <form onSubmit={joinForm.handleSubmit(onJoin)} className="space-y-5">
              <div>
                <label className="text-sm text-slate-400 font-medium block mb-2">Arena Code</label>
                <input
                  {...joinForm.register("code")}
                  placeholder="ABC123"
                  maxLength={6}
                  onChange={(e) => joinForm.setValue("code", e.target.value.toUpperCase())}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl font-bold font-mono tracking-widest placeholder:text-white/20 focus:outline-none focus:border-arena-purple/50"
                />
                {joinForm.formState.errors.code && <p className="text-red-400 text-xs mt-1">{joinForm.formState.errors.code.message}</p>}
              </div>
              <div>
                <label className="text-sm text-slate-400 font-medium block mb-2">Your Nickname</label>
                <input {...joinForm.register("nickname")} placeholder="BlockchainBoss" className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-arena-purple/50" />
                {joinForm.formState.errors.nickname && <p className="text-red-400 text-xs mt-1">{joinForm.formState.errors.nickname.message}</p>}
              </div>
              <button type="submit" disabled={isJoining} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:opacity-90 transition-all shadow-glow-red">
                {isJoining ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap size={16} /> Enter Arena <ArrowRight size={16} /></>}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Admin: full session dashboard ───────────────────────────────────
  const activeSessions = (sessions as any[]).filter((s) => s.status === "active");
  const waitingSessions = (sessions as any[]).filter((s) => s.status === "waiting");

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-arena-gold text-sm font-semibold mb-1"><Crown size={13} /> Host Dashboard</div>
          <h1 className="text-2xl font-black text-white">Arena</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/arena/host")}
            className="flex items-center gap-2 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-all text-sm"
          >
            <Swords size={15} /> Full Host View
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Sessions", value: (sessions as any[]).length, color: "text-avax-red" },
          { label: "Active", value: activeSessions.length, color: "text-emerald-400" },
          { label: "Waiting", value: waitingSessions.length, color: "text-amber-400" },
          { label: "Ended", value: (sessions as any[]).filter((s) => s.status === "ended").length, color: "text-slate-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-4 rounded-xl">
            <div className={cn("text-2xl font-black mb-0.5", color)}>{value}</div>
            <div className="text-slate-500 text-xs">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Session list */}
        <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-white font-bold text-sm flex items-center gap-2"><Swords size={14} className="text-avax-red" /> Sessions</h2>
            <span className="text-slate-500 text-xs">{(sessions as any[]).length} total</span>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-white/[0.04] rounded-xl animate-pulse" />)}</div>
          ) : (sessions as any[]).length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No sessions yet — create one</div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {(sessions as any[]).map((s: any) => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white font-mono font-bold tracking-widest text-sm">{s.code}</span>
                      <span className={cn("text-xs border px-1.5 py-0.5 rounded-full capitalize", statusColors[s.status])}>{s.status}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="capitalize">{(s.topic ?? "").replace(/_/g, " ")}</span>
                      <span className="flex items-center gap-1"><Users size={10} />{s.playerCount || 0}/{s.maxPlayers}</span>
                      <span>Round {(s.roundIndex || 0) + 1}</span>
                      {s.createdAt && <span>{format(new Date(s.createdAt), "HH:mm")}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {s.status === "waiting" && (
                      <button onClick={() => startSession.mutate(s.code)} disabled={startSession.isPending} className="flex items-center gap-1 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-all disabled:opacity-50">
                        <Play size={11} /> Start
                      </button>
                    )}
                    {s.status === "active" && (
                      <button onClick={() => nextQuestion.mutate(s.code)} disabled={nextQuestion.isPending} className="flex items-center gap-1 text-xs bg-arena-purple/10 border border-arena-purple/20 text-arena-purple-light px-2.5 py-1.5 rounded-lg hover:bg-arena-purple/20 transition-all disabled:opacity-50">
                        <ChevronRight size={11} /> Next Q
                      </button>
                    )}
                    <button onClick={() => restartSession.mutate(s.code)} disabled={restartSession.isPending} className="text-xs bg-arena-cyan/10 border border-arena-cyan/20 text-arena-cyan px-2.5 py-1.5 rounded-lg hover:bg-arena-cyan/20 transition-all" title="Restart">
                      <RotateCcw size={11} />
                    </button>
                    {s.status !== "ended" && (
                      <button onClick={() => endSession.mutate(s.code)} disabled={endSession.isPending} className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-red-500/20 transition-all">
                        <Square size={11} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create session + join */}
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-2xl">
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><Plus size={14} className="text-avax-red" /> New Session</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Topic</label>
                <select value={createForm.topic} onChange={(e) => setCreateForm((f) => ({ ...f, topic: e.target.value }))} className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                  {TOPICS.map((t) => <option key={t.value} value={t.value} className="bg-[#0a0a14]">{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Max Players</label>
                <input type="number" min={2} max={300} value={createForm.maxPlayers} onChange={(e) => setCreateForm((f) => ({ ...f, maxPlayers: Number(e.target.value) }))} className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
              </div>
            </div>
            <button onClick={() => createSession.mutate()} disabled={createSession.isPending} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-all text-sm disabled:opacity-50">
              {createSession.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus size={14} /> Create Session</>}
            </button>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-arena-purple/20">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><Zap size={14} className="text-arena-cyan" /> Quick Join</h3>
            <form onSubmit={joinForm.handleSubmit(onJoin)} className="space-y-3">
              <input {...joinForm.register("code")} placeholder="Session code" maxLength={6} onChange={(e) => joinForm.setValue("code", e.target.value.toUpperCase())} className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-center font-mono font-bold tracking-widest text-sm placeholder:text-white/30 focus:outline-none" />
              <input {...joinForm.register("nickname")} placeholder="Your nickname" className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none" />
              <button type="submit" disabled={isJoining} className="w-full flex items-center justify-center gap-2 border border-arena-cyan/30 text-arena-cyan py-2.5 rounded-xl hover:bg-arena-cyan/10 transition-all text-sm font-bold disabled:opacity-50">
                {isJoining ? <div className="w-4 h-4 border-2 border-arena-cyan/30 border-t-arena-cyan rounded-full animate-spin" /> : <><ArrowRight size={14} /> Join as Player</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
