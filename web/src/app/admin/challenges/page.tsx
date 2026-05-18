"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X, Pencil, Trash2, Trophy, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TIERS = ["beginner", "intermediate", "advanced"];
const ACCENTS = ["blue", "green", "purple", "orange", "pink"];

const tierColors: Record<string, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  advanced: "text-red-400 bg-red-400/10 border-red-400/20",
};

const emptyForm = {
  slug: "", title: "", tagline: "", emoji: "🏆", accent: "purple",
  tier: "beginner", aiReady: false, estMinutes: 15, xpReward: 150, badgeTitle: "",
  concept: "", brief: "", buildPrompt: "",
  stepsJson: '[{"title":"","detail":"","hint":""}]',
  submissionJson: '{"primary":{"key":"txHash","label":"Transaction Hash","placeholder":"0x...","kind":"text"}}',
  verificationJson: '{"kind":"manual","rules":["Submit your completed work","An admin will verify your submission"]}',
};

export default function AdminChallengesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<typeof emptyForm & { _id?: string }>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ["admin-challenges", search, tierFilter],
    queryFn: () => {
      const p = new URLSearchParams();
      if (search) p.set("search", search);
      if (tierFilter) p.set("tier", tierFilter);
      return fetch(`/api/admin/challenges?${p}`).then((r) => r.json());
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      let steps, submission, verification;
      try {
        steps = JSON.parse(data.stepsJson);
        submission = JSON.parse(data.submissionJson);
        verification = JSON.parse(data.verificationJson);
      } catch {
        throw new Error("Invalid JSON in steps, submission, or verification fields");
      }
      const isEdit = modal === "edit";
      const url = isEdit ? `/api/admin/challenges/${data._id}` : "/api/admin/challenges";
      const r = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: data.slug, title: data.title, tagline: data.tagline, emoji: data.emoji,
          accent: data.accent, tier: data.tier, aiReady: data.aiReady,
          estMinutes: Number(data.estMinutes), xpReward: Number(data.xpReward),
          badgeTitle: data.badgeTitle, concept: data.concept, brief: data.brief,
          buildPrompt: data.buildPrompt, steps, submission, verification,
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-challenges"] });
      toast.success(modal === "edit" ? "Challenge updated" : "Challenge created");
      setModal(null);
      setJsonError(null);
    },
    onError: (e: Error) => {
      setJsonError(e.message);
      toast.error(e.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/admin/challenges/${id}`, { method: "DELETE" }).then((r) => { if (!r.ok) throw new Error(); }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-challenges"] });
      toast.success("Challenge deleted");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Delete failed"),
  });

  function openEdit(c: any) {
    setForm({
      _id: c.id,
      slug: c.slug || "", title: c.title || "", tagline: c.tagline || "", emoji: c.emoji || "🏆",
      accent: c.accent || "purple", tier: c.tier || "beginner", aiReady: c.aiReady || false,
      estMinutes: c.estMinutes || 15, xpReward: c.xpReward || 150, badgeTitle: c.badgeTitle || "",
      concept: c.concept || "", brief: c.brief || "", buildPrompt: c.buildPrompt || "",
      stepsJson: JSON.stringify(c.steps || [], null, 2),
      submissionJson: JSON.stringify(c.submission || {}, null, 2),
      verificationJson: JSON.stringify(c.verification || {}, null, 2),
    });
    setJsonError(null);
    setModal("edit");
  }

  function openCreate() {
    setForm(emptyForm);
    setJsonError(null);
    setModal("create");
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Challenges</h1>
          <p className="text-slate-400 text-sm">{challenges.length} total</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-all text-sm">
          <Plus size={15} /> New Challenge
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 glass-card px-3 py-2 rounded-xl border border-white/[0.06]">
          <Search size={13} className="text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="bg-transparent text-white text-sm w-32 outline-none placeholder:text-slate-600" />
        </div>
        <div className="relative">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="glass-card border border-white/[0.06] text-slate-300 text-sm pl-3 pr-8 py-2 rounded-xl appearance-none bg-transparent focus:outline-none"
          >
            <option value="" className="bg-[#0a0a14]">All Tiers</option>
            {TIERS.map((t) => <option key={t} value={t} className="bg-[#0a0a14] capitalize">{t}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Challenge", "Tier", "Concept", "XP", "Badge", "AI Tutor", ""].map((h) => (
                <th key={h} className="text-left text-slate-500 font-medium text-xs px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>)}
                  </tr>
                ))
              : challenges.map((c: any) => (
                  <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{c.emoji}</span>
                        <div>
                          <p className="text-white font-medium">{c.title}</p>
                          <p className="text-slate-600 text-xs font-mono">{c.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs border px-2 py-0.5 rounded-full capitalize", tierColors[c.tier])}>{c.tier}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs max-w-[160px] truncate">{c.concept}</td>
                    <td className="px-4 py-3 text-arena-gold font-mono font-bold text-xs">{c.xpReward}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{c.badgeTitle}</td>
                    <td className="px-4 py-3">
                      {c.aiReady ? (
                        <span className="text-xs text-arena-purple-light bg-arena-purple/10 border border-arena-purple/20 px-2 py-0.5 rounded-full">Yes</span>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"><Pencil size={13} /></button>
                        <button onClick={() => setDeleteTarget(c.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && challenges.length === 0 && (
          <div className="text-center py-12 text-slate-500">No challenges found</div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-2xl rounded-2xl border border-white/10 my-4"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-avax-red" />
                  <h2 className="text-white font-black">{modal === "edit" ? "Edit Challenge" : "New Challenge"}</h2>
                </div>
                <button onClick={() => setModal(null)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"><X size={16} /></button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { k: "slug", l: "Slug (e.g. deploy-first-contract)" },
                    { k: "title", l: "Title" },
                    { k: "tagline", l: "Tagline" },
                    { k: "emoji", l: "Emoji" },
                    { k: "badgeTitle", l: "Badge Title" },
                    { k: "concept", l: "Concept" },
                  ].map(({ k, l }) => (
                    <div key={k}>
                      <label className="text-xs text-slate-400 block mb-1">{l}</label>
                      <input
                        value={(form as any)[k]}
                        onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-avax-red/50"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Tier</label>
                    <select value={form.tier} onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value }))} className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                      {TIERS.map((t) => <option key={t} value={t} className="bg-[#0a0a14] capitalize">{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Accent</label>
                    <select value={form.accent} onChange={(e) => setForm((f) => ({ ...f, accent: e.target.value }))} className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                      {ACCENTS.map((a) => <option key={a} value={a} className="bg-[#0a0a14]">{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Est. Minutes</label>
                    <input type="number" value={form.estMinutes} onChange={(e) => setForm((f) => ({ ...f, estMinutes: Number(e.target.value) }))} className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">XP Reward</label>
                    <input type="number" value={form.xpReward} onChange={(e) => setForm((f) => ({ ...f, xpReward: Number(e.target.value) }))} className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2 col-span-1">
                    <input type="checkbox" id="aiReady" checked={form.aiReady} onChange={(e) => setForm((f) => ({ ...f, aiReady: e.target.checked }))} className="w-4 h-4 accent-purple-500" />
                    <label htmlFor="aiReady" className="text-xs text-slate-300">AI Tutor Ready</label>
                  </div>
                </div>

                {[
                  { k: "brief", l: "Brief" },
                  { k: "buildPrompt", l: "Build Prompt (optional)" },
                ].map(({ k, l }) => (
                  <div key={k}>
                    <label className="text-xs text-slate-400 block mb-1">{l}</label>
                    <textarea rows={2} value={(form as any)[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-avax-red/50" />
                  </div>
                ))}

                {[
                  { k: "stepsJson", l: "Steps (JSON array)" },
                  { k: "submissionJson", l: "Submission Schema (JSON)" },
                  { k: "verificationJson", l: "Verification (JSON)" },
                ].map(({ k, l }) => (
                  <div key={k}>
                    <label className="text-xs text-slate-400 block mb-1">{l}</label>
                    <textarea
                      rows={4}
                      value={(form as any)[k]}
                      onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono resize-y focus:outline-none focus:border-avax-red/50"
                    />
                  </div>
                ))}

                {jsonError && <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{jsonError}</p>}
              </div>

              <div className="flex justify-end gap-3 p-6 pt-0">
                <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm">Cancel</button>
                <button
                  onClick={() => saveMutation.mutate(form)}
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-2 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold px-5 py-2 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 text-sm"
                >
                  {saveMutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {modal === "edit" ? "Save Changes" : "Create Challenge"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-sm rounded-2xl p-6 border border-white/10 text-center">
              <Trash2 size={32} className="text-red-400 mx-auto mb-3" />
              <h3 className="text-white font-black text-lg mb-1">Delete Challenge?</h3>
              <p className="text-slate-400 text-sm mb-5">Permanently removes this challenge and all submissions.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm">Cancel</button>
                <button onClick={() => deleteMutation.mutate(deleteTarget)} disabled={deleteMutation.isPending} className="bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
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
