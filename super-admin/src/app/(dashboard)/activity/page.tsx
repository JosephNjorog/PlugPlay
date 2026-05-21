"use client";

import { useState, useDeferredValue } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity, Search, X, RefreshCw, Download, Filter,
  User, Trash2, Plus, Pencil, Zap, Shield, Calendar, Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  create_question: Plus,
  update_question: Pencil,
  delete_question: Trash2,
  seed_questions:  Database,
  create_game:     Zap,
  update_game:     Pencil,
  delete_game:     Trash2,
  create_event:    Calendar,
  promote_to_admin: Shield,
  promote_to_super_admin: Shield,
  demote_to_player: User,
};

const ACTION_COLORS: Record<string, string> = {
  create_question:       "text-emerald-400 bg-emerald-400/10",
  update_question:       "text-cyan-400 bg-cyan-400/10",
  delete_question:       "text-rose-400 bg-rose-400/10",
  seed_questions:        "text-amber-400 bg-amber-400/10",
  create_game:           "text-emerald-400 bg-emerald-400/10",
  update_game:           "text-cyan-400 bg-cyan-400/10",
  delete_game:           "text-rose-400 bg-rose-400/10",
  create_event:          "text-purple-400 bg-purple-400/10",
  promote_to_admin:      "text-amber-400 bg-amber-400/10",
  promote_to_super_admin: "text-amber-400 bg-amber-400/10",
  demote_to_player:      "text-slate-400 bg-slate-400/10",
};

const ACTION_LABELS: Record<string, string> = {
  create_question:       "Created question",
  update_question:       "Updated question",
  delete_question:       "Deleted question",
  seed_questions:        "Seeded questions",
  create_game:           "Created game",
  update_game:           "Updated game",
  delete_game:           "Deleted game",
  create_event:          "Created event",
  promote_to_admin:      "Promoted to admin",
  promote_to_super_admin: "Promoted to super admin",
  demote_to_player:      "Demoted to player",
};

const ACTION_TYPES = ["all", "create_question", "update_question", "delete_question", "seed_questions",
  "create_game", "create_event", "promote_to_admin", "demote_to_player"] as const;

function exportCSV(logs: LogEntry[]) {
  const headers = ["Time", "Admin", "Email", "Action", "Entity Type", "Entity ID", "Details"];
  const rows = logs.map((l) => [
    new Date(l.createdAt).toLocaleString(),
    l.adminName,
    l.adminEmail ?? "",
    l.action,
    l.entityType ?? "",
    l.entityId ?? "",
    l.details ? JSON.stringify(l.details).replace(/,/g, ";") : "",
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `admin-activity-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)   return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60)   return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)   return `${h}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function AdminActivityPage() {
  const [actionFilter, setActionFilter] = useState("all");
  const [search, setSearch]             = useState("");
  const [from, setFrom]                 = useState("");
  const [to, setTo]                     = useState("");
  const deferredSearch                  = useDeferredValue(search);

  const params = new URLSearchParams({ limit: "200" });
  if (actionFilter !== "all") params.set("action", actionFilter);
  if (deferredSearch) params.set("search", deferredSearch);
  if (from) params.set("from", from);
  if (to)   params.set("to",   to);

  const { data: logs = [], isLoading, refetch, isFetching } = useQuery<LogEntry[]>({
    queryKey: ["super-activity", actionFilter, deferredSearch, from, to],
    queryFn: () => fetch(`/api/super/activity?${params}`).then((r) => r.json()),
    staleTime: 20_000,
  });

  // Distinct admins for summary
  const adminMap = new Map<string, { name: string; email: string | null; count: number }>();
  logs.forEach((l) => {
    const existing = adminMap.get(l.adminId);
    if (existing) existing.count++;
    else adminMap.set(l.adminId, { name: l.adminName, email: l.adminEmail, count: 1 });
  });
  const topAdmins = [...adminMap.values()].sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="p-6 space-y-6 text-white">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={18} className="text-arena-gold" />
            <span className="text-xs font-semibold text-arena-gold uppercase tracking-wider">Audit Log</span>
          </div>
          <h1 className="text-3xl font-black text-white">Admin Activity</h1>
          <p className="text-slate-400 text-sm mt-1">{logs.length} log{logs.length !== 1 ? "s" : ""} loaded</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06] text-sm transition-all"
          >
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>
          {logs.length > 0 && (
            <button
              onClick={() => exportCSV(logs)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06] text-sm transition-all"
            >
              <Download size={13} />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Top admins summary */}
      {topAdmins.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {topAdmins.map((a) => (
            <div key={a.name} className="flex items-center gap-2 px-3 py-2 glass rounded-xl border border-white/[0.06]">
              <div className="w-6 h-6 rounded-lg bg-arena-gold/20 flex items-center justify-center text-xs font-bold text-amber-400">
                {a.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white text-xs font-semibold leading-none">{a.name}</p>
                <p className="text-slate-500 text-xs">{a.count} action{a.count !== 1 ? "s" : ""}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative min-w-48 max-w-64 flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search admin or action…"
            className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-arena-gold/30"
          />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X size={12} /></button>}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none focus:border-arena-gold/30 [color-scheme:dark]" />
          <span className="text-slate-500 text-xs">to</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none focus:border-arena-gold/30 [color-scheme:dark]" />
          {(from || to) && (
            <button onClick={() => { setFrom(""); setTo(""); }} className="text-slate-500 hover:text-white">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Action type filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={12} className="text-slate-600" />
          {ACTION_TYPES.map((a) => (
            <button key={a} onClick={() => setActionFilter(a)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap capitalize",
                actionFilter === a ? "bg-arena-gold text-black" : "border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20")}
            >{a === "all" ? "All actions" : a.replace(/_/g, " ")}</button>
          ))}
        </div>
      </div>

      {/* Log table */}
      {isLoading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-arena-gold/30 border-t-arena-gold rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-24 text-slate-500">
          <Activity size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-white/40">No activity logs found</p>
          <p className="text-sm mt-1 text-slate-600">Actions from admin users will appear here</p>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-4 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">When</div>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {logs.map((log, idx) => {
              const Icon = ACTION_ICONS[log.action] ?? Activity;
              const colorClass = ACTION_COLORS[log.action] ?? "text-slate-400 bg-slate-400/10";
              const label = ACTION_LABELS[log.action] ?? log.action.replace(/_/g, " ");

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(idx * 0.015, 0.4) }}
                  className="grid grid-cols-[auto_1fr_auto_auto] gap-x-4 px-4 py-3 items-start hover:bg-white/[0.02] transition-colors"
                >
                  {/* Action */}
                  <div className={cn("flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-white/[0.04] whitespace-nowrap", colorClass)}>
                    <Icon size={13} />
                    <span className="text-xs font-semibold capitalize">{label}</span>
                  </div>

                  {/* Details */}
                  <div className="min-w-0">
                    {log.entityType && (
                      <p className="text-slate-300 text-xs">
                        <span className="text-slate-500">{log.entityType} </span>
                        {log.entityId && <span className="font-mono text-slate-500 text-xs">{log.entityId.slice(0, 8)}…</span>}
                      </p>
                    )}
                    {log.details && (
                      <p className="text-slate-600 text-xs mt-0.5 truncate max-w-xs">
                        {Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                      </p>
                    )}
                  </div>

                  {/* Admin */}
                  <div className="text-right">
                    <p className="text-white text-xs font-semibold">{log.adminName}</p>
                    {log.adminEmail && <p className="text-slate-600 text-xs truncate max-w-32">{log.adminEmail}</p>}
                  </div>

                  {/* Time */}
                  <div className="text-right min-w-16">
                    <p className="text-slate-400 text-xs">{relativeTime(log.createdAt)}</p>
                    <p className="text-slate-600 text-xs">{new Date(log.createdAt).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between text-xs text-slate-600">
            <span>Showing {logs.length} log{logs.length !== 1 ? "s" : ""}</span>
            <span>Most recent first</span>
          </div>
        </div>
      )}
    </div>
  );
}
