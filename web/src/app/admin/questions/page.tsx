"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  HelpCircle, Plus, Pencil, Trash2, Search, X,
  CheckCircle2, Database, Loader2, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Question {
  id: string;
  theme: string;
  question: string;
  options: string[];
  answer: number;
  difficulty: string;
  active: boolean;
  createdAt: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────────
const THEMES = [
  "Avalanche Basics",
  "DeFi & Staking",
  "Smart Contracts",
  "NFTs & Bridges",
  "Consensus & Validators",
];
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const DIFF_COLORS: Record<string, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  advanced: "text-avax-red bg-avax-red/10 border-avax-red/20",
};

const emptyForm = {
  theme: THEMES[0],
  question: "",
  options: ["", "", "", ""],
  answer: 0,
  difficulty: "beginner",
  active: true,
};

// ─── Question Form Modal ────────────────────────────────────────────────────────
function QuestionModal({
  initial,
  onSave,
  onClose,
  isSaving,
}: {
  initial: typeof emptyForm & { id?: string };
  onSave: (data: typeof emptyForm & { id?: string }) => void;
  onClose: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const isEdit = !!initial.id;

  const setOption = (i: number, val: string) => {
    const next = [...form.options];
    next[i] = val;
    setForm((f) => ({ ...f, options: next }));
  };

  const isValid =
    form.question.trim().length >= 5 &&
    form.options.every((o) => o.trim().length > 0) &&
    form.theme.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative z-10 w-full max-w-xl bg-[#0f0f1a] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-white font-bold text-lg">
            {isEdit ? "Edit Question" : "Add Question"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06]">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Theme + Difficulty row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Theme</label>
              <select
                value={form.theme}
                onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-avax-red/40"
              >
                {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
                <option value="__custom">+ Custom theme…</option>
              </select>
              {form.theme === "__custom" && (
                <input
                  autoFocus
                  placeholder="Type theme name…"
                  className="w-full mt-1.5 bg-white/[0.04] border border-avax-red/30 rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 outline-none"
                  onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}
                />
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-avax-red/40 capitalize"
              >
                {DIFFICULTIES.map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
              </select>
            </div>
          </div>

          {/* Question text */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Question</label>
            <textarea
              value={form.question}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              placeholder="Type the question here…"
              rows={2}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-avax-red/40 resize-none"
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Answer Options — click the radio to mark the correct one
            </label>
            {form.options.map((opt, i) => (
              <div key={i} className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all",
                form.answer === i
                  ? "border-arena-emerald/40 bg-arena-emerald/5"
                  : "border-white/[0.06] bg-white/[0.02]"
              )}>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, answer: i }))}
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all",
                    form.answer === i
                      ? "border-arena-emerald bg-arena-emerald"
                      : "border-white/20 hover:border-white/40"
                  )}
                >
                  {form.answer === i && <div className="w-2 h-2 rounded-full bg-white" />}
                </button>
                <span className="text-slate-500 text-xs font-mono w-4">{["A", "B", "C", "D"][i]}</span>
                <input
                  value={opt}
                  onChange={(e) => setOption(i, e.target.value)}
                  placeholder={`Option ${["A", "B", "C", "D"][i]}…`}
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
                />
              </div>
            ))}
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
              className={cn(
                "relative w-10 h-5 rounded-full transition-all",
                form.active ? "bg-arena-emerald" : "bg-white/10"
              )}
            >
              <div className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
                form.active ? "left-5" : "left-0.5"
              )} />
            </button>
            <span className="text-sm text-slate-400">
              {form.active ? "Active — shown to players" : "Inactive — hidden from players"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button onClick={onClose} className="flex-1 border border-white/10 text-slate-400 hover:text-white rounded-xl py-2.5 text-sm transition-all hover:bg-white/[0.04]">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!isValid || isSaving}
            className="flex-1 bg-gradient-to-r from-avax-red to-arena-purple text-white font-semibold rounded-xl py-2.5 text-sm disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isSaving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : isEdit ? "Save changes" : "Add question"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminQuestionsPage() {
  const qc = useQueryClient();
  const [themeFilter, setThemeFilter] = useState("All");
  const [diffFilter, setDiffFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<typeof emptyForm & { id?: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ["admin-questions", themeFilter, diffFilter],
    queryFn: () => {
      const p = new URLSearchParams();
      if (themeFilter !== "All") p.set("theme", themeFilter);
      if (diffFilter !== "All") p.set("difficulty", diffFilter);
      return fetch(`/api/admin/questions?${p}`).then((r) => r.json());
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof emptyForm & { id?: string }) => {
      const { id, ...body } = data;
      const url = id ? `/api/admin/questions/${id}` : "/api/admin/questions";
      const res = await fetch(url, {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-questions"] });
      toast.success(modal?.id ? "Question updated" : "Question added");
      setModal(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/admin/questions/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-questions"] });
      toast.success("Question deleted");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete"),
  });

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/questions/seed", { method: "POST" });
      const data = await res.json();
      qc.invalidateQueries({ queryKey: ["admin-questions"] });
      toast.success(`Seeded ${data.inserted} new questions (${data.total} total defaults)`);
    } catch {
      toast.error("Failed to seed questions");
    } finally {
      setSeeding(false);
    }
  };

  const filtered = questions.filter((q) =>
    search ? q.question.toLowerCase().includes(search.toLowerCase()) : true
  );

  // Group by theme for display
  const grouped = filtered.reduce<Record<string, Question[]>>((acc, q) => {
    if (!acc[q.theme]) acc[q.theme] = [];
    acc[q.theme].push(q);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#080810] text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle size={18} className="text-avax-red" />
            <span className="text-xs font-semibold text-avax-red uppercase tracking-wider">Question Bank</span>
          </div>
          <h1 className="text-3xl font-black text-white">Quiz Questions</h1>
          <p className="text-slate-400 text-sm mt-1">
            {questions.length} question{questions.length !== 1 ? "s" : ""} across {Object.keys(grouped).length} theme{Object.keys(grouped).length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.06] text-sm transition-all disabled:opacity-40"
          >
            {seeding ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
            Seed defaults
          </button>
          <button
            onClick={() => setModal({ ...emptyForm })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-avax-red/15 border border-avax-red/20 text-avax-red hover:bg-avax-red/25 text-sm font-semibold transition-all"
          >
            <Plus size={14} />
            Add question
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions…"
            className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-avax-red/30"
          />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X size={13} /></button>}
        </div>

        {/* Theme pills */}
        <div className="flex gap-1.5 flex-wrap">
          {["All", ...THEMES].map((t) => (
            <button
              key={t}
              onClick={() => setThemeFilter(t)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                themeFilter === t
                  ? "bg-avax-red text-white"
                  : "border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20"
              )}
            >
              {t === "All" ? "All themes" : t}
            </button>
          ))}
        </div>

        {/* Difficulty pills */}
        <div className="flex gap-1.5">
          {["All", ...DIFFICULTIES].map((d) => (
            <button
              key={d}
              onClick={() => setDiffFilter(d)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
                diffFilter === d
                  ? "bg-arena-purple text-white"
                  : "border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20"
              )}
            >
              {d === "All" ? "All levels" : d}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-avax-red/30 border-t-avax-red rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <HelpCircle size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-white/40">No questions found</p>
          <p className="text-sm mt-1">Try "Seed defaults" to load the built-in question bank, or add one manually.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([theme, qs]) => (
            <div key={theme}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-white font-bold">{theme}</h2>
                <span className="text-xs text-slate-500 border border-white/[0.06] px-2 py-0.5 rounded-full">{qs.length}</span>
              </div>
              <div className="space-y-2">
                {qs.map((q, idx) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl border transition-all group",
                      q.active
                        ? "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                        : "border-white/[0.04] bg-white/[0.01] opacity-50"
                    )}
                  >
                    {/* Correct answer preview */}
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-arena-emerald/10 border border-arena-emerald/20 flex items-center justify-center">
                      <span className="text-arena-emerald text-xs font-bold">{["A", "B", "C", "D"][q.answer]}</span>
                    </div>

                    {/* Question + options */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium leading-snug mb-2">{q.question}</p>
                      <div className="grid grid-cols-2 gap-1">
                        {q.options.map((opt, i) => (
                          <p key={i} className={cn(
                            "text-xs px-2 py-1 rounded-lg",
                            i === q.answer
                              ? "text-arena-emerald bg-arena-emerald/10"
                              : "text-slate-500"
                          )}>
                            <span className="font-mono mr-1">{["A", "B", "C", "D"][i]}.</span>{opt}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Meta + actions */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={cn("text-xs border px-2 py-0.5 rounded-full capitalize", DIFF_COLORS[q.difficulty] ?? "text-slate-400 border-slate-400/20")}>
                        {q.difficulty}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setModal({ id: q.id, theme: q.theme, question: q.question, options: q.options, answer: q.answer, difficulty: q.difficulty, active: q.active })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.08] transition-all"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(q.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-avax-red hover:bg-avax-red/10 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      <AnimatePresence>
        {modal && (
          <QuestionModal
            initial={modal}
            onSave={(data) => saveMutation.mutate(data)}
            onClose={() => setModal(null)}
            isSaving={saveMutation.isPending}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 bg-[#0f0f1a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm text-center"
            >
              <Trash2 size={32} className="text-avax-red mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg mb-2">Delete question?</h3>
              <p className="text-slate-400 text-sm mb-6">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 border border-white/10 text-slate-400 hover:text-white rounded-xl py-2.5 text-sm transition-all">
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteTarget)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-avax-red/80 hover:bg-avax-red text-white font-semibold rounded-xl py-2.5 text-sm transition-all flex items-center justify-center gap-2"
                >
                  {deleteMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
