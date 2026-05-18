"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, ExternalLink, X, FileCheck, Loader2, Link2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS_TABS = ["pending", "verified", "rejected"] as const;
type StatusTab = typeof STATUS_TABS[number];

const statusStyles: Record<StatusTab, string> = {
  pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  verified: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  rejected: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function AdminSubmissionsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<StatusTab>("pending");
  const [selected, setSelected] = useState<any>(null);

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["admin-submissions", tab],
    queryFn: () => fetch(`/api/admin/submissions?status=${tab}`).then((r) => r.json()),
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, action, notes }: { id: string; action: "approve" | "reject"; notes?: string }) => {
      const r = await fetch(`/api/admin/submissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, notes }),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-submissions"] });
      toast.success(vars.action === "approve" ? "Submission approved — XP & badge awarded" : "Submission rejected");
      setSelected(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const verifyOnChainMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/admin/submissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "verify-onchain" }),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-submissions"] });
      toast.success("On-chain verification complete");
      setSelected(null);
    },
    onError: (e: Error) => toast.error(e.message || "On-chain verification failed"),
  });

  const submissionData = selected?.submissionData as Record<string, string> | null;

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Submissions</h1>
          <p className="text-slate-400 text-sm">Review and verify challenge completions</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 glass-card p-1 rounded-xl w-fit border border-white/[0.06]">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
              tab === t ? "bg-avax-red/20 text-avax-red-light" : "text-slate-400 hover:text-white"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Player", "Challenge / Game", "Score", "Submitted", "Status", ""].map((h) => (
                <th key={h} className="text-left text-slate-500 font-medium text-xs px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>)}
                  </tr>
                ))
              : submissions.map((sub: any) => (
                  <tr key={sub.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setSelected(sub)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-sm">{sub.playerEmoji || "👾"}</div>
                        <div>
                          <p className="text-white font-medium text-xs">{sub.playerName || "—"}</p>
                          <p className="text-slate-600 text-xs truncate max-w-[100px]">{sub.playerEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white text-xs font-medium">{sub.gameTitle || sub.gameId}</p>
                      {sub.eventId && <p className="text-slate-600 text-xs">event submission</p>}
                    </td>
                    <td className="px-4 py-3 text-arena-gold font-mono font-bold text-xs">{sub.score?.toLocaleString() || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{sub.completedAt ? timeAgo(sub.completedAt) : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs border px-2 py-0.5 rounded-full capitalize", statusStyles[sub.status as StatusTab] || statusStyles.pending)}>
                        {sub.verified ? "verified" : sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {tab === "pending" && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); reviewMutation.mutate({ id: sub.id, action: "approve" }); }}
                              disabled={reviewMutation.isPending}
                              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-all"
                            >
                              <CheckCircle size={15} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); reviewMutation.mutate({ id: sub.id, action: "reject" }); }}
                              disabled={reviewMutation.isPending}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-all"
                            >
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && submissions.length === 0 && (
          <div className="text-center py-12 text-slate-500">No {tab} submissions</div>
        )}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-lg rounded-2xl border border-white/10">
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center text-xl">{selected.playerEmoji || "👾"}</div>
                  <div>
                    <h3 className="text-white font-black">{selected.playerName}</h3>
                    <p className="text-slate-500 text-xs">{selected.playerEmail}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"><X size={16} /></button>
              </div>

              <div className="p-6 space-y-4">
                {/* Game info */}
                <div className="glass-card p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Challenge</span>
                    <span className="text-white font-medium">{selected.gameTitle || selected.gameId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Score</span>
                    <span className="text-arena-gold font-bold">{selected.score?.toLocaleString() || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Accuracy</span>
                    <span className="text-white">{selected.accuracy ? `${selected.accuracy}%` : "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Time Spent</span>
                    <span className="text-white">{selected.timeSpent ? `${Math.round(selected.timeSpent / 60)}m` : "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Submitted</span>
                    <span className="text-white">{selected.completedAt ? format(new Date(selected.completedAt), "PPP p") : "—"}</span>
                  </div>
                </div>

                {/* Submission data */}
                {submissionData && Object.keys(submissionData).length > 0 && (
                  <div>
                    <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><FileCheck size={14} /> Submission Data</h4>
                    <div className="space-y-2">
                      {Object.entries(submissionData).map(([k, v]) => (
                        <div key={k} className="flex items-start justify-between gap-3 text-sm">
                          <span className="text-slate-400 capitalize flex-shrink-0">{k}</span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-white font-mono text-xs truncate max-w-[200px]">{v}</span>
                            {(v.startsWith("0x") || v.startsWith("http")) && (
                              <a
                                href={v.startsWith("0x") ? `https://testnet.snowtrace.io/tx/${v}` : v}
                                target="_blank" rel="noopener noreferrer"
                                className="text-arena-cyan hover:text-arena-cyan/80 flex-shrink-0"
                              >
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* On-chain tx hash link */}
                {selected.txHash && (
                  <div className="p-3 bg-emerald-400/5 border border-emerald-400/20 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs">
                      <Link2 size={13} />
                      <span className="font-mono truncate max-w-[240px]">{selected.txHash}</span>
                    </div>
                    <a href={`https://testnet.snowtrace.io/tx/${selected.txHash}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )}

                {/* Actions */}
                {tab === "pending" && (
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => reviewMutation.mutate({ id: selected.id, action: "approve" })}
                        disabled={reviewMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                      >
                        {reviewMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        Approve
                      </button>
                      <button
                        onClick={() => reviewMutation.mutate({ id: selected.id, action: "reject" })}
                        disabled={reviewMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                      >
                        {reviewMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                        Reject
                      </button>
                    </div>
                    {submissionData?.txHash && (
                      <button
                        onClick={() => verifyOnChainMutation.mutate(selected.id)}
                        disabled={verifyOnChainMutation.isPending}
                        className="flex items-center justify-center gap-2 glass-card border border-arena-cyan/20 text-arena-cyan hover:bg-arena-cyan/10 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                      >
                        {verifyOnChainMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        Verify On-Chain via Snowtrace
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
