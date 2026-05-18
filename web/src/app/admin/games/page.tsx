"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X, Pencil, Trash2, Gamepad2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PERSONAS = ["builder", "defi_degen", "nft_artist", "validator", "explorer"];
const CATEGORIES = ["DeFi", "NFT", "Validators", "Wallets", "Smart Contracts", "Bridges", "DAOs", "Security"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const GAME_TYPES = ["quiz", "arcade", "puzzle", "simulation"];
const STATUSES = ["draft", "live", "archived"];
const REWARD_TYPES = ["badge", "token", "merch"];

const diffColors: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Advanced: "text-red-400 bg-red-400/10 border-red-400/20",
};

const statusColors: Record<string, string> = {
  draft: "text-slate-400 bg-slate-400/10 border-slate-400/20",
  live: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  archived: "text-slate-600 bg-slate-600/10 border-slate-600/20",
};

const emptyForm = {
  id: "", title: "", persona: "builder", category: "DeFi", difficulty: "Beginner",
  themes: "", description: "", learningOutcome: "", emoji: "🎮", duration: 10,
  xpReward: 100, rewardType: "badge", gameType: "quiz", status: "draft",
};

export default function AdminGamesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ persona: "", status: "" });
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<typeof emptyForm & { _id?: string }>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: games = [], isLoading } = useQuery({
    queryKey: ["admin-games", search, filter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filter.persona) params.set("persona", filter.persona);
      if (filter.status) params.set("status", filter.status);
      return fetch(`/api/admin/games?${params}`).then((r) => r.json());
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const isEdit = modal === "edit";
      const url = isEdit ? `/api/games/${data._id}` : "/api/games";
      const r = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          themes: data.themes.split(",").map((t) => t.trim()).filter(Boolean),
          duration: Number(data.duration),
          xpReward: Number(data.xpReward),
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-games"] });
      toast.success(modal === "edit" ? "Game updated" : "Game created");
      setModal(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/games/${id}`, { method: "DELETE" }).then((r) => { if (!r.ok) throw new Error("Delete failed"); }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-games"] });
      toast.success("Game deleted");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Delete failed"),
  });

  function openEdit(game: any) {
    setForm({
      _id: game.id,
      id: game.id,
      title: game.title || "",
      persona: game.persona || "builder",
      category: game.category || "DeFi",
      difficulty: game.difficulty || "Beginner",
      themes: (game.themes || []).join(", "),
      description: game.description || "",
      learningOutcome: game.learningOutcome || "",
      emoji: game.emoji || "🎮",
      duration: game.duration || 10,
      xpReward: game.xpReward || 100,
      rewardType: game.rewardType || "badge",
      gameType: game.gameType || "quiz",
      status: game.status || "draft",
    });
    setModal("edit");
  }

  function openCreate() {
    setForm(emptyForm);
    setModal("create");
  }

  const field = (key: keyof typeof emptyForm, label: string, type = "text", opts?: string[]) => (
    <div>
      <label className="text-xs text-slate-400 block mb-1">{label}</label>
      {opts ? (
        <select
          value={(form as any)[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-avax-red/50"
        >
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={(form as any)[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-avax-red/50"
        />
      )}
    </div>
  );

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Games</h1>
          <p className="text-slate-400 text-sm">{games.length} total</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-all text-sm">
          <Plus size={15} /> New Game
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 glass-card px-3 py-2 rounded-xl border border-white/[0.06]">
          <Search size={13} className="text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="bg-transparent text-white text-sm w-32 outline-none placeholder:text-slate-600" />
        </div>
        {[
          { label: "Persona", key: "persona", opts: ["", ...PERSONAS] },
          { label: "Status", key: "status", opts: ["", ...STATUSES] },
        ].map(({ label, key, opts }) => (
          <div key={key} className="relative">
            <select
              value={(filter as any)[key]}
              onChange={(e) => setFilter((f) => ({ ...f, [key]: e.target.value }))}
              className="glass-card border border-white/[0.06] text-slate-300 text-sm pl-3 pr-8 py-2 rounded-xl appearance-none bg-transparent focus:outline-none"
            >
              {opts.map((o) => <option key={o} value={o} className="bg-[#0a0a14]">{o || `All ${label}s`}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Game", "Persona", "Category", "Difficulty", "Type", "XP", "Status", ""].map((h) => (
                <th key={h} className="text-left text-slate-500 font-medium text-xs px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              : games.map((game: any) => (
                  <tr key={game.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{game.emoji}</span>
                        <div>
                          <p className="text-white font-medium">{game.title}</p>
                          <p className="text-slate-600 text-xs font-mono">{game.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs capitalize">{game.persona?.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{game.category}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs border px-2 py-0.5 rounded-full", diffColors[game.difficulty])}>{game.difficulty}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs capitalize">{game.gameType}</td>
                    <td className="px-4 py-3 text-arena-gold font-mono font-bold text-xs">{game.xpReward}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs border px-2 py-0.5 rounded-full capitalize", statusColors[game.status])}>{game.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(game)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteTarget(game.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && games.length === 0 && (
          <div className="text-center py-12 text-slate-500">No games found</div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-2xl rounded-2xl border border-white/10 my-4"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Gamepad2 size={18} className="text-avax-red" />
                  <h2 className="text-white font-black">{modal === "edit" ? "Edit Game" : "New Game"}</h2>
                </div>
                <button onClick={() => setModal(null)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"><X size={16} /></button>
              </div>

              <div className="p-6 grid grid-cols-2 gap-4">
                {field("id", "Game ID / Slug (e.g. avax-quiz-101)")}
                {field("title", "Title")}
                {field("emoji", "Emoji")}
                {field("persona", "Persona", "text", PERSONAS)}
                {field("category", "Category", "text", CATEGORIES)}
                {field("difficulty", "Difficulty", "text", DIFFICULTIES)}
                {field("gameType", "Game Type", "text", GAME_TYPES)}
                {field("status", "Status", "text", STATUSES)}
                {field("rewardType", "Reward Type", "text", REWARD_TYPES)}
                <div className="flex gap-3">
                  <div className="flex-1">{field("duration", "Duration (min)", "number")}</div>
                  <div className="flex-1">{field("xpReward", "XP Reward", "number")}</div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Themes (comma separated)</label>
                  <input
                    value={form.themes}
                    onChange={(e) => setForm((f) => ({ ...f, themes: e.target.value }))}
                    placeholder="avalanche, staking, bridges"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-avax-red/50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-avax-red/50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Learning Outcome</label>
                  <textarea
                    rows={2}
                    value={form.learningOutcome}
                    onChange={(e) => setForm((f) => ({ ...f, learningOutcome: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-avax-red/50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 pt-0">
                <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm transition-colors">Cancel</button>
                <button
                  onClick={() => saveMutation.mutate(form)}
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-2 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold px-5 py-2 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 text-sm"
                >
                  {saveMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {modal === "edit" ? "Save Changes" : "Create Game"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-sm rounded-2xl p-6 border border-white/10 text-center">
              <Trash2 size={32} className="text-red-400 mx-auto mb-3" />
              <h3 className="text-white font-black text-lg mb-1">Delete Game?</h3>
              <p className="text-slate-400 text-sm mb-5">This will permanently remove <span className="text-white font-mono">{deleteTarget}</span>. This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm">Cancel</button>
                <button
                  onClick={() => deleteMutation.mutate(deleteTarget)}
                  disabled={deleteMutation.isPending}
                  className="bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
