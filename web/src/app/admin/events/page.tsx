"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Search, Edit, Trash2, Eye, Users, Upload, RefreshCw, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type EventStatus = "all" | "draft" | "live" | "paused" | "ended";

const statusColors: Record<string, string> = {
  live: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  draft: "text-slate-400 bg-slate-400/10 border-slate-400/20",
  paused: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  ended: "text-red-400 bg-red-400/10 border-red-400/20",
};

const formatColors: Record<string, string> = {
  irl: "text-cyan-400",
  zoom: "text-purple-400",
  hybrid: "text-emerald-400",
};

const EMPTY_EVENT = {
  title: "", description: "", format: "irl", location: "", zoomUrl: "",
  startsAt: "", endsAt: "", category: "community", difficulty: "beginner",
  tracks: [] as string[], missions: [] as string[], capacity: 100,
  rewardPool: "", coverEmoji: "🎮", agenda: [] as any[],
};

export default function AdminEventsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<EventStatus>("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editEvent, setEditEvent] = useState<any>(null);
  const [form, setForm] = useState<typeof EMPTY_EVENT>(EMPTY_EVENT);
  const [lumaModal, setLumaModal] = useState<string | null>(null);
  const [lumaEventId, setLumaEventId] = useState("");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-events", statusFilter, search],
    queryFn: () => {
      const p = new URLSearchParams();
      if (statusFilter !== "all") p.set("status", statusFilter);
      if (search) p.set("search", search);
      return fetch(`/api/admin/events?${p}`).then((r) => r.json());
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = editEvent ? "PATCH" : "POST";
      const url = editEvent ? `/api/events/${editEvent.id}` : "/api/admin/events";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error("Save failed");
      return r.json();
    },
    onSuccess: () => {
      toast.success(editEvent ? "Event updated!" : "Event created!");
      qc.invalidateQueries({ queryKey: ["admin-events"] });
      setShowCreate(false);
      setEditEvent(null);
      setForm(EMPTY_EVENT);
    },
    onError: () => toast.error("Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/events/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => { toast.success("Event deleted"); qc.invalidateQueries({ queryKey: ["admin-events"] }); },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetch(`/api/events/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-events"] }); },
  });

  const lumaMutation = useMutation({
    mutationFn: ({ eventId, lumaEventId }: { eventId: string; lumaEventId: string }) =>
      fetch("/api/admin/luma-sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventId, lumaEventId }) }).then((r) => r.json()),
    onSuccess: (data) => {
      toast.success(`Synced! ${data.matched} matched, ${data.preRegistered} pre-registered`);
      setLumaModal(null);
    },
    onError: () => toast.error("Luma sync failed"),
  });

  const openEdit = (event: any) => {
    setEditEvent(event);
    setForm({
      title: event.title,
      description: event.description,
      format: event.format,
      location: event.location || "",
      zoomUrl: event.zoomUrl || "",
      startsAt: event.startsAt?.slice(0, 16),
      endsAt: event.endsAt?.slice(0, 16),
      category: event.category,
      difficulty: event.difficulty,
      tracks: event.tracks || [],
      missions: event.missions || [],
      capacity: event.capacity,
      rewardPool: event.rewardPool || "",
      coverEmoji: event.coverEmoji,
      agenda: event.agenda || [],
    });
    setShowCreate(true);
  };

  const personas = ["student", "developer", "builder", "founder", "business"];

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Events</h1>
          <p className="text-slate-400 text-sm">{events.length} total</p>
        </div>
        <button
          onClick={() => { setEditEvent(null); setForm(EMPTY_EVENT); setShowCreate(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-glow-red hover:opacity-90 transition-all"
        >
          <Plus size={16} /> Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1">
          {(["all", "draft", "live", "paused", "ended"] as EventStatus[]).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all", statusFilter === s ? "bg-avax-red text-white" : "text-slate-400 hover:text-white border border-white/[0.06]")}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-lg border border-white/[0.06] ml-auto">
          <Search size={14} className="text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..." className="bg-transparent text-white text-sm w-40 outline-none placeholder:text-slate-600" />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Event", "Format", "Dates", "Participants", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left text-slate-500 font-medium text-xs px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              : events.map((event: any) => (
                  <tr key={event.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{event.coverEmoji}</span>
                        <div>
                          <p className="text-white font-medium">{event.title}</p>
                          <p className="text-slate-500 text-xs">{event.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("uppercase text-xs font-bold", formatColors[event.format])}>{event.format}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      <div>{format(new Date(event.startsAt), "MMM d, yyyy")}</div>
                      <div className="text-slate-600">{event.location || "Online"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Users size={12} /> {event.participantCount || 0} / {event.capacity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={event.status}
                        onChange={(e) => statusMutation.mutate({ id: event.id, status: e.target.value })}
                        className={cn("text-xs border px-2 py-1 rounded-lg bg-transparent cursor-pointer focus:outline-none", statusColors[event.status])}
                      >
                        {["draft", "live", "paused", "ended"].map((s) => <option key={s} value={s} className="bg-[#0a0a14]">{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(event)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]" title="Edit"><Edit size={14} /></button>
                        <button onClick={() => setLumaModal(event.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-arena-cyan hover:bg-arena-cyan/10" title="Luma Sync"><RefreshCw size={14} /></button>
                        <button onClick={() => { if (confirm("Delete this event?")) deleteMutation.mutate(event.id); }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && events.length === 0 && (
          <div className="text-center py-12 text-slate-500">No events found</div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto pt-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-2xl rounded-2xl p-6 border border-white/10 my-4">
            <h2 className="text-white font-bold text-xl mb-5">{editEvent ? "Edit Event" : "Create Event"}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Title", key: "title", type: "text" },
                  { label: "Cover Emoji", key: "coverEmoji", type: "text" },
                  { label: "Capacity", key: "capacity", type: "number" },
                  { label: "Reward Pool", key: "rewardPool", type: "text" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="text-slate-400 text-xs block mb-1">{label}</label>
                    <input type={type} value={(form as any)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-arena-purple/40" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-400 text-xs block mb-1">Format</label>
                  <select value={form.format} onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))} className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-3 py-2 text-white text-sm">
                    {["irl", "zoom", "hybrid"].map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-3 py-2 text-white text-sm">
                    {["community", "hackathon", "workshop", "bootcamp", "summit"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1">Difficulty</label>
                  <select value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))} className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-3 py-2 text-white text-sm">
                    {["beginner", "intermediate", "advanced"].map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Location", key: "location" },
                  { label: "Zoom URL", key: "zoomUrl" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-slate-400 text-xs block mb-1">{label}</label>
                    <input value={(form as any)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Start Date", key: "startsAt" },
                  { label: "End Date", key: "endsAt" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-slate-400 text-xs block mb-1">{label}</label>
                    <input type="datetime-local" value={(form as any)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-2">Tracks (personas)</label>
                <div className="flex flex-wrap gap-2">
                  {personas.map((p) => (
                    <button key={p} type="button" onClick={() => setForm((f) => ({ ...f, tracks: f.tracks.includes(p) ? f.tracks.filter((t) => t !== p) : [...f.tracks, p] }))} className={cn("px-3 py-1 rounded-lg text-xs capitalize transition-all", form.tracks.includes(p) ? "bg-avax-red text-white" : "bg-white/[0.04] text-slate-400 border border-white/[0.06]")}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowCreate(false); setEditEvent(null); }} className="flex-1 border border-white/10 text-slate-400 py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="flex-1 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50">
                {saveMutation.isPending ? "Saving..." : editEvent ? "Update Event" : "Create Event"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Luma Sync Modal */}
      {lumaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md rounded-2xl p-6 border border-white/10">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2"><RefreshCw size={16} className="text-arena-cyan" /> Luma Sync</h2>
            <label className="text-slate-400 text-sm block mb-2">Luma Event ID</label>
            <input value={lumaEventId} onChange={(e) => setLumaEventId(e.target.value)} placeholder="evt-abc123" className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none" />
            <div className="flex gap-3">
              <button onClick={() => setLumaModal(null)} className="flex-1 border border-white/10 text-slate-400 py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={() => lumaMutation.mutate({ eventId: lumaModal, lumaEventId })} disabled={lumaMutation.isPending} className="flex-1 bg-arena-cyan text-black font-bold py-2.5 rounded-xl text-sm disabled:opacity-50">
                {lumaMutation.isPending ? "Syncing..." : "Sync Attendees"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
