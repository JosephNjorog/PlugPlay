"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X, Swords, Users, Zap, Brain, Play, ChevronRight, RotateCcw, BarChart2, Trophy, Clock, Target, Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const TOPICS = [
  "avalanche_basics", "defi", "nfts", "smart_contracts",
  "validators", "bridges", "wallets", "security",
  "bitcoin_pizza",
];

const statusColors: Record<string, string> = {
  waiting: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  ended: "text-slate-500 bg-slate-500/10 border-slate-500/20",
};

export default function AdminArenaPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ topic: "avalanche_basics", maxPlayers: 20 });
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [resultsCode, setResultsCode] = useState<string | null>(null);
  const [questionsModal, setQuestionsModal] = useState(false);
  const [qForm, setQForm] = useState({
    topic: "avalanche_basics", question: "", options: ["", "", "", ""],
    answer: 0, explanation: "", difficulty: "Beginner",
  });

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["admin-arena-sessions"],
    queryFn: () => fetch("/api/arena/sessions").then((r) => r.json()),
    refetchInterval: 10000,
  });

  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ["admin-arena-questions"],
    queryFn: () => fetch("/api/arena/questions").then((r) => r.json()),
  });

  const createSession = useMutation({
    mutationFn: () => fetch("/api/arena/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-arena-sessions"] });
      toast.success("Arena session created");
      setCreateModal(false);
    },
    onError: () => toast.error("Failed to create session"),
  });

  const endSession = useMutation({
    mutationFn: (code: string) => fetch(`/api/arena/sessions/${code}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-arena-sessions"] });
      toast.success("Session ended");
      setSelectedSession(null);
    },
    onError: () => toast.error("Failed to end session"),
  });

  const restartSession = useMutation({
    mutationFn: (code: string) => fetch(`/api/arena/sessions/${code}`, { method: "PATCH" }).then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-arena-sessions"] });
      toast.success("Session restarted — scores cleared");
      setSelectedSession((s: any) => s ? { ...s, status: "waiting", roundIndex: 0 } : s);
    },
    onError: () => toast.error("Failed to restart session"),
  });

  const startSession = useMutation({
    mutationFn: (code: string) =>
      fetch(`/api/arena/sessions/${code}/start`, { method: "POST" }).then((r) => {
        if (!r.ok) throw new Error(); return r.json();
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin-arena-sessions"] });
      toast.success(`Game started — ${data.questionCount} questions ready`);
      setSelectedSession((s: any) => s ? { ...s, status: "active" } : s);
    },
    onError: () => toast.error("Failed to start session"),
  });

  const nextQuestion = useMutation({
    mutationFn: (code: string) =>
      fetch(`/api/arena/sessions/${code}/next`, { method: "POST" }).then((r) => {
        if (!r.ok) throw new Error(); return r.json();
      }),
    onSuccess: (data) => {
      if (data.done) {
        qc.invalidateQueries({ queryKey: ["admin-arena-sessions"] });
        setSelectedSession(null);
        toast.success("All questions done — session ended!");
      } else {
        toast.success(`Question ${data.roundIndex + 1} of ${data.totalQuestions} pushed`);
      }
    },
    onError: () => toast.error("Failed to push next question"),
  });

  const { data: resultsData, isLoading: resultsLoading } = useQuery({
    queryKey: ["arena-results", resultsCode],
    queryFn: () => fetch(`/api/arena/sessions/${resultsCode}/results`).then((r) => r.json()),
    enabled: !!resultsCode,
  });

  const addQuestion = useMutation({
    mutationFn: () => fetch("/api/arena/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...qForm, answer: Number(qForm.answer) }),
    }).then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-arena-questions"] });
      toast.success("Question added");
      setQForm({ topic: "avalanche_basics", question: "", options: ["", "", "", ""], answer: 0, explanation: "", difficulty: "Beginner" });
    },
    onError: () => toast.error("Failed to add question"),
  });

  const filtered = sessions.filter((s: any) =>
    !search || s.code.includes(search.toUpperCase()) || (s.topic ?? "").includes(search.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Arena</h1>
          <p className="text-slate-400 text-sm">Live quiz sessions & question bank</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setQuestionsModal(true)} className="flex items-center gap-2 glass-card border border-white/[0.08] text-white px-4 py-2 rounded-xl hover:bg-white/[0.06] transition-all text-sm">
            <Brain size={15} /> Questions
          </button>
          <button onClick={() => setCreateModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-all text-sm">
            <Plus size={15} /> New Session
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Sessions", value: sessions.length, icon: Swords, color: "text-avax-red" },
          { label: "Active", value: sessions.filter((s: any) => s.status === "active").length, icon: Zap, color: "text-emerald-400" },
          { label: "Waiting", value: sessions.filter((s: any) => s.status === "waiting").length, icon: Users, color: "text-amber-400" },
          { label: "Questions", value: questions.length, icon: Brain, color: "text-arena-purple-light" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4 rounded-xl">
            <Icon size={16} className={cn("mb-2", color)} />
            <div className="text-xl font-black text-white">{value}</div>
            <div className="text-slate-500 text-xs">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2 glass-card px-3 py-2 rounded-xl border border-white/[0.06]">
          <Search size={13} className="text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by code or topic..." className="bg-transparent text-white text-sm w-40 outline-none placeholder:text-slate-600" />
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Code", "Topic", "Status", "Players", "Round", "Created", ""].map((h) => (
                <th key={h} className="text-left text-slate-500 font-medium text-xs px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>)}
                  </tr>
                ))
              : filtered.map((session: any) => (
                  <tr key={session.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setSelectedSession(session)}>
                    <td className="px-4 py-3">
                      <span className="text-white font-mono font-bold text-lg tracking-widest">{session.code}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 capitalize text-xs">{(session.topic ?? "").replace(/_/g, " ")}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs border px-2 py-0.5 rounded-full capitalize", statusColors[session.status])}>{session.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                        <Users size={12} />
                        {session.playerCount || 0} / {session.maxPlayers}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{session.roundIndex + 1}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{session.createdAt ? format(new Date(session.createdAt), "MMM d, HH:mm") : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); setResultsCode(session.code); }}
                          className="text-xs text-arena-gold bg-arena-gold/10 border border-arena-gold/20 px-2.5 py-1 rounded-lg hover:bg-arena-gold/20 transition-all"
                          title="View results"
                        >
                          <BarChart2 size={11} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); restartSession.mutate(session.code); }}
                          className="text-xs text-arena-cyan bg-arena-cyan/10 border border-arena-cyan/20 px-2.5 py-1 rounded-lg hover:bg-arena-cyan/20 transition-all"
                          title="Restart session"
                        >
                          <RotateCcw size={11} />
                        </button>
                        {session.status !== "ended" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); endSession.mutate(session.code); }}
                            className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-1 rounded-lg hover:bg-red-400/20 transition-all"
                          >
                            End
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">No sessions found</div>
        )}
      </div>

      {/* Session detail modal */}
      <AnimatePresence>
        {selectedSession && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-md rounded-2xl p-6 border border-white/10">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="text-3xl font-black text-white font-mono tracking-widest mb-1">{selectedSession.code}</div>
                  <span className={cn("text-xs border px-2 py-0.5 rounded-full capitalize", statusColors[selectedSession.status])}>{selectedSession.status}</span>
                </div>
                <button onClick={() => setSelectedSession(null)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"><X size={16} /></button>
              </div>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-slate-400">
                  <span>Topic</span><span className="text-white capitalize">{(selectedSession.topic ?? "").replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Players</span><span className="text-white">{selectedSession.playerCount || 0} / {selectedSession.maxPlayers}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Round</span><span className="text-white">{selectedSession.roundIndex + 1}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Created</span><span className="text-white">{selectedSession.createdAt ? format(new Date(selectedSession.createdAt), "PPP p") : "—"}</span>
                </div>
              </div>

              {selectedSession.status === "waiting" && (
                <button
                  onClick={() => startSession.mutate(selectedSession.code)}
                  disabled={startSession.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-all text-sm disabled:opacity-50 mb-2"
                >
                  <Play size={14} />
                  {startSession.isPending ? "Starting…" : "Start Game"}
                </button>
              )}
              {selectedSession.status === "active" && (
                <button
                  onClick={() => nextQuestion.mutate(selectedSession.code)}
                  disabled={nextQuestion.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-arena-purple to-arena-cyan text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-all text-sm disabled:opacity-50 mb-2"
                >
                  <ChevronRight size={14} />
                  {nextQuestion.isPending ? "Pushing…" : "Next Question"}
                </button>
              )}
              <button
                onClick={() => { setResultsCode(selectedSession.code); setSelectedSession(null); }}
                className="w-full flex items-center justify-center gap-2 border border-arena-gold/30 text-arena-gold hover:bg-arena-gold/10 py-2.5 rounded-xl text-sm font-bold transition-all mb-2"
              >
                <BarChart2 size={14} /> View Full Results
              </button>
              <button
                onClick={() => restartSession.mutate(selectedSession.code)}
                disabled={restartSession.isPending}
                className="w-full flex items-center justify-center gap-2 border border-arena-cyan/30 text-arena-cyan hover:bg-arena-cyan/10 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 mb-2"
              >
                {restartSession.isPending ? <div className="w-4 h-4 border-2 border-arena-cyan/30 border-t-arena-cyan rounded-full animate-spin" /> : <RotateCcw size={14} />}
                {restartSession.isPending ? "Restarting…" : "Restart Session"}
              </button>
              {selectedSession.status !== "ended" && (
                <button
                  onClick={() => endSession.mutate(selectedSession.code)}
                  disabled={endSession.isPending}
                  className="w-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 py-2.5 rounded-xl text-sm font-bold transition-all"
                >
                  {endSession.isPending ? "Ending…" : "End Session"}
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Results modal */}
      <AnimatePresence>
        {resultsCode && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-2xl rounded-2xl border border-white/10 my-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-white font-black text-xl flex items-center gap-2">
                    <Trophy size={18} className="text-arena-gold" />
                    Session Results — <span className="font-mono tracking-widest">{resultsCode}</span>
                  </h2>
                  {resultsData?.session && (
                    <p className="text-slate-400 text-xs mt-1 capitalize">
                      {(resultsData.session.topic ?? "").replace(/_/g, " ")} ·{" "}
                      {resultsData.session.createdAt ? format(new Date(resultsData.session.createdAt), "MMM d, yyyy HH:mm") : ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {resultsData?.leaderboard?.length > 0 && (
                    <button
                      onClick={() => {
                        const rows = ["Rank,Nickname,Score,Correct Answers,Answers Submitted,Joined At",
                          ...(resultsData.leaderboard as any[]).map((p: any) =>
                            `${p.rank},${p.nickname},${p.score},${p.correctAnswers},${p.answersSubmitted},${p.joinedAt ?? ""}`)
                        ].join("\n");
                        const a = document.createElement("a");
                        a.href = URL.createObjectURL(new Blob([rows], { type: "text/csv" }));
                        a.download = `arena-${resultsCode}-results.csv`;
                        a.click();
                      }}
                      className="flex items-center gap-1.5 text-xs text-slate-400 border border-white/10 px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-all"
                    >
                      <Download size={12} /> Export CSV
                    </button>
                  )}
                  <button onClick={() => setResultsCode(null)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {resultsLoading ? (
                <div className="p-8 text-center text-slate-500">Loading results…</div>
              ) : resultsData ? (
                <>
                  {/* Stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.06]">
                    {[
                      { icon: Users, label: "Players Joined", value: resultsData.stats.totalPlayers, color: "text-arena-cyan" },
                      { icon: Target, label: "Active Players", value: resultsData.stats.activePlayers, color: "text-emerald-400" },
                      { icon: Zap, label: "Rounds Played", value: resultsData.stats.roundsPlayed, color: "text-arena-purple-light" },
                      { icon: Clock, label: "Duration",
                        value: resultsData.stats.durationMs
                          ? `${Math.floor(resultsData.stats.durationMs / 60000)}m ${Math.floor((resultsData.stats.durationMs % 60000) / 1000)}s`
                          : "—",
                        color: "text-amber-400" },
                    ].map(({ icon: Icon, label, value, color }) => (
                      <div key={label} className="bg-[#080810] p-4 text-center">
                        <Icon size={14} className={cn("mx-auto mb-1", color)} />
                        <div className="text-white font-black text-lg">{value}</div>
                        <div className="text-slate-500 text-xs">{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-px bg-white/[0.06]">
                    {[
                      { label: "Top Score", value: resultsData.stats.topScore.toLocaleString(), color: "text-arena-gold" },
                      { label: "Avg Score", value: resultsData.stats.avgScore.toLocaleString(), color: "text-white" },
                      { label: "Total Answers", value: resultsData.stats.totalAnswers.toLocaleString(), color: "text-white" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-[#080810] p-3 text-center">
                        <div className={cn("font-black text-base", color)}>{value}</div>
                        <div className="text-slate-500 text-xs">{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Leaderboard */}
                  <div className="p-4">
                    <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                      <Trophy size={13} className="text-arena-gold" /> Full Leaderboard ({resultsData.leaderboard.length} players)
                    </h3>
                    <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1">
                      {(resultsData.leaderboard as any[]).map((p: any) => {
                        const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
                        return (
                          <div key={p.id} className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm",
                            p.rank <= 3 ? "bg-arena-gold/5 border border-arena-gold/10" : "bg-white/[0.03]"
                          )}>
                            <span className="w-7 text-center text-xs font-bold">
                              {medals[p.rank] ?? <span className="text-slate-500">#{p.rank}</span>}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className={cn("font-medium truncate block", p.rank <= 3 ? "text-white" : "text-slate-300")}>
                                {p.nickname}
                              </span>
                              {p.walletAddress && (
                                <span className="text-slate-600 font-mono text-xs truncate block">{p.walletAddress.slice(0, 10)}…</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs shrink-0">
                              <span className="text-emerald-400">{p.correctAnswers}/{p.answersSubmitted} correct</span>
                              <span className={cn("font-mono font-bold", p.rank <= 3 ? "text-arena-gold" : "text-white")}>
                                {p.score.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-500">No data found</div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create session modal */}
      <AnimatePresence>
        {createModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-black flex items-center gap-2"><Swords size={18} className="text-avax-red" /> New Session</h2>
                <button onClick={() => setCreateModal(false)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"><X size={16} /></button>
              </div>

              <div className="space-y-4 mb-5">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Topic</label>
                  <select
                    value={createForm.topic}
                    onChange={(e) => setCreateForm((f) => ({ ...f, topic: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                  >
                    {TOPICS.map((t) => <option key={t} value={t} className="bg-[#0a0a14] capitalize">{t.replace("_", " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Max Players</label>
                  <input
                    type="number" min={2} max={100}
                    value={createForm.maxPlayers}
                    onChange={(e) => setCreateForm((f) => ({ ...f, maxPlayers: Number(e.target.value) }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setCreateModal(false)} className="flex-1 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-sm border border-white/[0.06]">Cancel</button>
                <button
                  onClick={() => createSession.mutate()}
                  disabled={createSession.isPending}
                  className="flex-1 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-all text-sm disabled:opacity-50"
                >
                  {createSession.isPending ? "Creating…" : "Create Session"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Questions bank modal */}
      <AnimatePresence>
        {questionsModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-2xl rounded-2xl border border-white/10 my-4">
              <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                <h2 className="text-white font-black flex items-center gap-2"><Brain size={18} className="text-arena-purple-light" /> Question Bank ({questions.length})</h2>
                <button onClick={() => setQuestionsModal(false)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"><X size={16} /></button>
              </div>

              {/* Add question form */}
              <div className="p-6 border-b border-white/[0.06]">
                <h3 className="text-white font-bold text-sm mb-4">Add Question</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Topic</label>
                    <select value={qForm.topic} onChange={(e) => setQForm((f) => ({ ...f, topic: e.target.value }))} className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                      {TOPICS.map((t) => <option key={t} value={t} className="bg-[#0a0a14] capitalize">{t.replace("_", " ")}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Difficulty</label>
                    <select value={qForm.difficulty} onChange={(e) => setQForm((f) => ({ ...f, difficulty: e.target.value }))} className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                      {["Beginner", "Intermediate", "Advanced"].map((d) => <option key={d} value={d} className="bg-[#0a0a14]">{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-xs text-slate-400 block mb-1">Question</label>
                  <input value={qForm.question} onChange={(e) => setQForm((f) => ({ ...f, question: e.target.value }))} className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {qForm.options.map((opt, i) => (
                    <div key={i}>
                      <label className="text-xs text-slate-400 block mb-1">Option {i + 1} {i === qForm.answer && <span className="text-emerald-400">(correct)</span>}</label>
                      <input
                        value={opt}
                        onChange={(e) => setQForm((f) => { const opts = [...f.options]; opts[i] = e.target.value; return { ...f, options: opts }; })}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Correct Answer Index (0-3)</label>
                    <input type="number" min={0} max={3} value={qForm.answer} onChange={(e) => setQForm((f) => ({ ...f, answer: Number(e.target.value) }))} className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Explanation</label>
                    <input value={qForm.explanation} onChange={(e) => setQForm((f) => ({ ...f, explanation: e.target.value }))} className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                  </div>
                </div>
                <button
                  onClick={() => addQuestion.mutate()}
                  disabled={addQuestion.isPending || !qForm.question}
                  className="flex items-center gap-2 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-all text-sm disabled:opacity-50"
                >
                  {addQuestion.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={14} />}
                  Add Question
                </button>
              </div>

              {/* Question list */}
              <div className="p-6 max-h-80 overflow-y-auto space-y-3">
                {questionsLoading
                  ? [...Array(3)].map((_, i) => <div key={i} className="h-14 bg-white/[0.04] rounded-xl animate-pulse" />)
                  : questions.map((q: any) => (
                      <div key={q.id} className="glass-card p-3 rounded-xl">
                        <p className="text-white text-sm font-medium mb-1">{q.question}</p>
                        <div className="flex gap-2 flex-wrap">
                          {q.options?.map((opt: string, i: number) => (
                            <span key={i} className={cn("text-xs px-2 py-0.5 rounded-full border", i === q.answer ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-slate-500 border-white/10")}>
                              {opt}
                            </span>
                          ))}
                        </div>
                        <p className="text-slate-600 text-xs mt-1 capitalize">{q.topic?.replace("_", " ")} · {q.difficulty}</p>
                      </div>
                    ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
