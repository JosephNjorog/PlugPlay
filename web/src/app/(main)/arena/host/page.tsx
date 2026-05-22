"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Play, Square, Users, Zap, ChevronRight, Crown, RefreshCw, RotateCcw } from "lucide-react";
import { getPusherClient, arenaChannel, ARENA_EVENTS } from "@/lib/pusher";

interface Player { id: string; nickname: string; score: number; correctAnswers: number; }

const TOPICS = [
  { value: "avalanche_basics",  label: "Avalanche Basics" },
  { value: "defi",              label: "DeFi & Staking" },
  { value: "smart_contracts",   label: "Smart Contracts" },
  { value: "nfts",              label: "NFTs & Bridges" },
  { value: "security",          label: "Security & Wallets" },
  { value: "validators",        label: "Validators & Consensus" },
];

export default function ArenaHostPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<"setup" | "waiting" | "active" | "ended">("setup");
  const [topic, setTopic] = useState(TOPICS[0].value);
  const [roundIndex, setRoundIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isNexting, setIsNexting] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(50);
  const [sessionCode, setSessionCode] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/arena/join` : "";

  useEffect(() => {
    if (!sessionCode) return;
    const pusher = getPusherClient();
    const ch = pusher.subscribe(arenaChannel(sessionCode));

    ch.bind(ARENA_EVENTS.PLAYER_JOINED, (data: { playerId: string; nickname: string }) => {
      setPlayers((prev) => {
        if (prev.find((p) => p.id === data.playerId)) return prev;
        return [...prev, { id: data.playerId, nickname: data.nickname, score: 0, correctAnswers: 0 }];
      });
    });

    ch.bind(ARENA_EVENTS.LEADERBOARD_UPDATE, (data: { leaderboard: Player[] }) => {
      setPlayers(data.leaderboard);
    });

    return () => {
      pusher.unsubscribe(arenaChannel(sessionCode));
    };
  }, [sessionCode]);

  const createSession = async () => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/arena/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, maxPlayers }),
      });
      if (!res.ok) throw new Error("Failed to create session");
      const s = await res.json();
      setSessionCode(s.code);
      setSessionId(s.id);
      setStep("waiting");
      toast.success(`Arena session created! Code: ${s.code}`);
    } catch {
      toast.error("Failed to create session");
    } finally {
      setIsCreating(false);
    }
  };

  const startSession = async () => {
    setIsStarting(true);
    try {
      const res = await fetch(`/api/arena/sessions/${sessionCode}/start`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRoundIndex(0);
      setTotalQuestions(data.questionCount || 0);
      setStep("active");
      toast.success(`Game started! ${data.questionCount} questions ready.`);
    } catch {
      toast.error("Failed to start session");
    } finally {
      setIsStarting(false);
    }
  };

  const nextQuestion = async () => {
    setIsNexting(true);
    try {
      const res = await fetch(`/api/arena/sessions/${sessionCode}/next`, { method: "POST" });
      const data = await res.json();
      if (data.done) {
        setStep("ended");
        toast.success("All questions done — session ended!");
      } else {
        setRoundIndex(data.roundIndex);
        toast.success(`Question ${data.roundIndex + 1} of ${data.totalQuestions} pushed`);
      }
    } catch {
      toast.error("Failed to advance question");
    } finally {
      setIsNexting(false);
    }
  };

  const endSession = async () => {
    await fetch(`/api/arena/sessions/${sessionCode}`, { method: "DELETE" });
    setStep("ended");
    toast.success("Session ended");
  };

  const restartSession = async () => {
    setIsRestarting(true);
    try {
      const res = await fetch(`/api/arena/sessions/${sessionCode}`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      setPlayers((prev) => prev.map((p) => ({ ...p, score: 0, correctAnswers: 0 })));
      setRoundIndex(0);
      setTotalQuestions(0);
      setStep("waiting");
      toast.success("Session restarted — scores reset, waiting for host to start again");
    } catch {
      toast.error("Failed to restart session");
    } finally {
      setIsRestarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080810] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-arena-gold text-sm font-semibold mb-1">
              <Crown size={14} />
              Host Dashboard
            </div>
            <h1 className="text-3xl font-black text-white">Arena Control</h1>
          </div>
          {step !== "setup" && (
            <div className="glass-card px-5 py-2 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-mono font-bold text-xl tracking-widest">{sessionCode}</span>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {step === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="glass-card p-6 rounded-2xl">
                <h2 className="text-white font-bold text-xl mb-4">Session Setup</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Quiz Topic</label>
                    <div className="space-y-2">
                      {TOPICS.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setTopic(t.value)}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                            topic === t.value
                              ? "bg-avax-red/20 border border-avax-red/40 text-avax-red-light"
                              : "bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Max Players</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[10, 25, 50, 100].map((n) => (
                        <button
                          key={n}
                          onClick={() => setMaxPlayers(n)}
                          className={`py-3 rounded-xl text-sm font-bold transition-all ${
                            maxPlayers === n
                              ? "bg-arena-purple text-white"
                              : "bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                      <p className="text-slate-400 text-sm">Players join at:</p>
                      <p className="text-white font-mono text-xs mt-1 break-all">{joinUrl}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={createSession}
                  disabled={isCreating}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all shadow-glow-red disabled:opacity-50"
                >
                  {isCreating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap size={18} /> Create Arena Session</>}
                </button>
              </div>
            </motion.div>
          )}

          {(step === "waiting" || step === "active") && (
            <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-2 gap-6">
              {/* QR Code */}
              <div className="glass-card p-6 rounded-2xl text-center">
                <h3 className="text-white font-bold mb-4">Players Scan to Join</h3>
                <div className="bg-white p-4 rounded-xl inline-block mb-4">
                  <QRCodeSVG value={joinUrl} size={200} />
                </div>
                <div className="text-4xl font-black text-white font-mono tracking-widest mb-2">{sessionCode}</div>
                <p className="text-slate-500 text-sm">or go to {joinUrl}</p>
              </div>

              {/* Players + Controls */}
              <div className="space-y-4">
                <div className="glass-card p-5 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <Users size={16} className="text-arena-cyan" />
                      Players ({players.length})
                    </h3>
                    {step === "active" && (
                      <span className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {players.length === 0 ? (
                      <p className="text-slate-600 text-sm text-center py-4">Waiting for players to join...</p>
                    ) : (
                      players.map((player, i) => (
                        <div key={player.id} className="flex items-center justify-between glass-card p-3 rounded-xl">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-xs w-5">#{i + 1}</span>
                            <span className="text-white text-sm font-medium">{player.nickname}</span>
                          </div>
                          {step === "active" && (
                            <span className="text-arena-gold font-mono text-sm">{player.score.toLocaleString()} pts</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl space-y-3">
                  {step === "waiting" && (
                    <button
                      onClick={startSession}
                      disabled={isStarting || players.length === 0}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:opacity-90 transition-all"
                    >
                      {isStarting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={16} />}
                      Start Game ({players.length} players)
                    </button>
                  )}
                  {step === "active" && (
                    <>
                      <div className="text-center text-slate-400 text-xs mb-1">
                        Question <span className="text-white font-bold">{roundIndex + 1}</span>
                        {totalQuestions > 0 && <> of <span className="text-white font-bold">{totalQuestions}</span></>}
                      </div>
                      <button
                        onClick={nextQuestion}
                        disabled={isNexting}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-arena-purple to-arena-cyan text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:opacity-90 transition-all"
                      >
                        {isNexting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ChevronRight size={16} />}
                        Next Question
                      </button>
                    </>
                  )}
                  <button
                    onClick={restartSession}
                    disabled={isRestarting}
                    className="w-full flex items-center justify-center gap-2 border border-arena-cyan/30 text-arena-cyan py-3 rounded-xl hover:bg-arena-cyan/10 transition-all disabled:opacity-50"
                  >
                    {isRestarting ? <div className="w-4 h-4 border-2 border-arena-cyan/30 border-t-arena-cyan rounded-full animate-spin" /> : <RotateCcw size={16} />}
                    Restart Session
                  </button>
                  <button
                    onClick={endSession}
                    className="w-full flex items-center justify-center gap-2 border border-red-500/30 text-red-400 py-3 rounded-xl hover:bg-red-500/10 transition-all"
                  >
                    <Square size={16} />
                    End Session
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === "ended" && (
            <motion.div key="ended" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-black text-white mb-2">Session Complete!</h2>
              <p className="text-slate-400 mb-6">{players.length} players competed</p>
              {players.slice(0, 3).map((p, i) => (
                <div key={p.id} className="glass-card p-4 rounded-xl mb-2 max-w-sm mx-auto flex items-center justify-between">
                  <span className="text-2xl">{["🥇", "🥈", "🥉"][i]}</span>
                  <span className="text-white font-bold">{p.nickname}</span>
                  <span className="text-arena-gold font-mono">{p.score.toLocaleString()} pts</span>
                </div>
              ))}
              <div className="mt-8 flex gap-3 justify-center">
                <button
                  onClick={restartSession}
                  disabled={isRestarting}
                  className="flex items-center gap-2 px-5 py-3 border border-arena-cyan/30 text-arena-cyan rounded-xl hover:bg-arena-cyan/10 transition-all font-bold disabled:opacity-50"
                >
                  {isRestarting ? <div className="w-4 h-4 border-2 border-arena-cyan/30 border-t-arena-cyan rounded-full animate-spin" /> : <RotateCcw size={16} />}
                  Restart Same Session
                </button>
                <button onClick={() => setStep("setup")} className="btn-primary flex items-center gap-2">
                  <RefreshCw size={16} />
                  New Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
