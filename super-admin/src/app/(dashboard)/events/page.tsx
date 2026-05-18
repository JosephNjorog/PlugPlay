"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, CheckCircle, XCircle, Eye, Clock, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  draft: "text-slate-400 bg-slate-400/10 border-slate-400/20",
  live: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  paused: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  ended: "text-slate-600 bg-slate-600/10 border-slate-600/20",
};

export default function EventApprovalPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"draft" | "live" | "ended">("draft");
  const [preview, setPreview] = useState<any>(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["super-events", tab],
    queryFn: () => fetch(`/api/super/events?status=${tab}`).then((r) => r.json()),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" }) =>
      fetch("/api/super/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      }).then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["super-events"] });
      toast.success(vars.action === "approve" ? "Event approved — now live" : "Event rejected");
      setPreview(null);
    },
    onError: () => toast.error("Action failed"),
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arena-cyan to-blue-600 flex items-center justify-center">
          <Calendar size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Event Approval</h1>
          <p className="text-slate-400 text-sm">Review and publish platform events</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 glass p-1 rounded-xl w-fit border border-white/[0.06]">
        {(["draft", "live", "ended"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
              tab === t ? "bg-avax-red/20 text-avax-red" : "text-slate-400 hover:text-white"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Event", "Host", "Date", "Format", "Status", "Actions"].map((h) => (
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
              : events.map((ev: any) => (
                  <tr key={ev.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{ev.coverEmoji}</span>
                        <div>
                          <p className="text-white font-medium text-xs">{ev.title}</p>
                          <p className="text-slate-600 text-xs">{ev.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{ev.hostName || "Platform"}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {ev.startsAt ? format(new Date(ev.startsAt), "MMM d, yyyy") : "TBD"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs capitalize">{ev.format}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs border px-2 py-0.5 rounded-full capitalize", statusColors[ev.status])}>{ev.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setPreview(ev)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
                          <Eye size={13} />
                        </button>
                        {ev.status === "draft" && (
                          <>
                            <button
                              onClick={() => approveMutation.mutate({ id: ev.id, action: "approve" })}
                              disabled={approveMutation.isPending}
                              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-all disabled:opacity-50"
                            >
                              <CheckCircle size={13} />
                            </button>
                            <button
                              onClick={() => approveMutation.mutate({ id: ev.id, action: "reject" })}
                              disabled={approveMutation.isPending}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-50"
                            >
                              <XCircle size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && events.length === 0 && (
          <div className="text-center py-12 text-slate-500">No {tab} events</div>
        )}
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass w-full max-w-lg rounded-2xl border border-white/10 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{preview.coverEmoji}</span>
                <div>
                  <h3 className="text-white font-black">{preview.title}</h3>
                  <span className={cn("text-xs border px-2 py-0.5 rounded-full capitalize", statusColors[preview.status])}>{preview.status}</span>
                </div>
              </div>
              <button onClick={() => setPreview(null)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"><X size={16} /></button>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-4">{preview.description}</p>

            <div className="space-y-2 text-sm text-slate-400 mb-5">
              <div className="flex justify-between"><span>Format</span><span className="text-white capitalize">{preview.format}</span></div>
              <div className="flex justify-between"><span>Date</span><span className="text-white">{preview.startsAt ? format(new Date(preview.startsAt), "PPP") : "TBD"}</span></div>
              <div className="flex justify-between"><span>Capacity</span><span className="text-white">{preview.capacity || "Unlimited"}</span></div>
              <div className="flex justify-between"><span>Reward Pool</span><span className="text-arena-gold">{preview.rewardPool ? `$${preview.rewardPool}` : "—"}</span></div>
            </div>

            {preview.status === "draft" && (
              <div className="flex gap-2">
                <button
                  onClick={() => approveMutation.mutate({ id: preview.id, action: "approve" })}
                  disabled={approveMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                >
                  {approveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Approve & Publish
                </button>
                <button
                  onClick={() => approveMutation.mutate({ id: preview.id, action: "reject" })}
                  disabled={approveMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                >
                  <XCircle size={14} /> Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
