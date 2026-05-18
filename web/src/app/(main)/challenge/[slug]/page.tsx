"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Clock, Zap, Shield, ExternalLink, CheckCircle, ChevronDown, ChevronUp, Cpu, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const tierColors: Record<string, string> = {
  beginner: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  intermediate: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  advanced: "text-red-400 border-red-400/30 bg-red-400/10",
};

const accentGradients: Record<string, string> = {
  blue: "from-blue-500 to-cyan-600",
  green: "from-emerald-500 to-teal-600",
  purple: "from-purple-500 to-violet-600",
  orange: "from-amber-500 to-orange-600",
  pink: "from-pink-500 to-rose-600",
};

export default function ChallengePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [submission, setSubmission] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const { data: challenge, isLoading } = useQuery({
    queryKey: ["challenge", slug],
    queryFn: async () => {
      const r = await fetch(`/api/challenges?slug=${slug}`);
      const list = await r.json();
      return list.find((c: any) => c.slug === slug) || list[0];
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/missions/${challenge?.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accuracy: 100,
          timeSpent: 300,
          timeLimit: 900,
          submissionData: submission,
        }),
      });
      if (!r.ok) throw new Error("Submission failed");
      return r.json();
    },
    onSuccess: (data) => {
      setSubmitted(true);
      toast.success(`Challenge submitted! +${data.xpEarned} XP`);
      if (data.badge) toast.success(`Badge earned: ${data.badge.emoji} ${data.badge.title}`);
    },
    onError: () => toast.error("Submission failed"),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080810] pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-avax-red/30 border-t-avax-red rounded-full animate-spin" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-[#080810] pt-20 flex items-center justify-center text-slate-400">
        Challenge not found
      </div>
    );
  }

  const steps: Array<{ title: string; detail: string; hint?: string }> = challenge.steps || [];
  const accentGrad = accentGradients[challenge.accent] || accentGradients.purple;
  const sub = challenge.submission as any;

  return (
    <div className="min-h-screen bg-[#080810] pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-sm transition-colors">
          <ArrowLeft size={16} /> Back to Library
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cn("glass-card p-8 rounded-2xl bg-gradient-to-br", accentGrad, "opacity-5")}>
              <div className="relative">
                <div className="absolute inset-0 -m-8 rounded-2xl bg-gradient-to-br opacity-5 pointer-events-none" style={{ background: "var(--tw-gradient-from)" }} />
                <div className="relative">
                  <div className="text-4xl mb-3">{challenge.emoji}</div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={cn("text-xs border px-2.5 py-1 rounded-full font-medium capitalize", tierColors[challenge.tier])}>
                      {challenge.tier}
                    </span>
                    {challenge.aiReady && (
                      <span className="text-xs border border-arena-purple/30 bg-arena-purple/10 text-arena-purple-light px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                        <Cpu size={10} /> AI Tutor
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-black text-white mb-2">{challenge.title}</h1>
                  <p className="text-slate-400 text-lg mb-4">{challenge.tagline}</p>
                  <div className="flex gap-6 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5"><Clock size={13} /> ~{challenge.estMinutes} min</span>
                    <span className="flex items-center gap-1.5"><Zap size={13} className="text-arena-gold" /> +{challenge.xpReward} XP</span>
                    <span className="flex items-center gap-1.5"><Shield size={13} className="text-violet-400" /> {challenge.badgeTitle}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Brief */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl">
              <h2 className="text-white font-bold mb-3">Mission Brief</h2>
              <p className="text-slate-300 text-sm leading-relaxed">{challenge.brief}</p>
              <div className="mt-4 p-3 bg-arena-cyan/5 border border-arena-cyan/20 rounded-xl">
                <p className="text-arena-cyan text-xs font-medium flex items-center gap-2">
                  <Cpu size={12} /> Concept: {challenge.concept}
                </p>
              </div>
            </motion.div>

            {/* Steps */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 rounded-2xl">
              <h2 className="text-white font-bold mb-5">Steps</h2>
              <div className="space-y-3">
                {steps.map((step, i) => (
                  <div key={i} className={cn("rounded-xl border transition-all", expandedStep === i ? "border-avax-red/30 bg-avax-red/5" : "border-white/[0.06] bg-white/[0.02]")}>
                    <button
                      onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0", expandedStep === i ? "bg-avax-red text-white" : "bg-white/10 text-slate-400")}>
                          {i + 1}
                        </div>
                        <span className="text-white font-medium text-sm">{step.title}</span>
                      </div>
                      {expandedStep === i ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </button>
                    <AnimatePresence>
                      {expandedStep === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="px-4 pb-4">
                            <p className="text-slate-300 text-sm leading-relaxed mb-3">{step.detail}</p>
                            {step.hint && (
                              <div className="p-3 bg-arena-gold/5 border border-arena-gold/20 rounded-lg">
                                <p className="text-arena-gold text-xs">💡 Hint: {step.hint}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Submission */}
            {!submitted ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-2xl">
                <h2 className="text-white font-bold mb-5">Submit Your Work</h2>
                {sub?.primary && (
                  <div className="mb-4">
                    <label className="text-sm text-slate-400 block mb-2">{sub.primary.label}</label>
                    <input
                      type={sub.primary.kind === "url" ? "url" : "text"}
                      placeholder={sub.primary.placeholder}
                      value={submission[sub.primary.key] || ""}
                      onChange={(e) => setSubmission((prev) => ({ ...prev, [sub.primary.key]: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-avax-red/50 transition-colors"
                    />
                  </div>
                )}
                {sub?.extras?.map((extra: any) => (
                  <div key={extra.key} className="mb-4">
                    <label className="text-sm text-slate-400 block mb-2">{extra.label}</label>
                    <input
                      type={extra.kind === "url" ? "url" : "text"}
                      placeholder={extra.placeholder}
                      value={submission[extra.key] || ""}
                      onChange={(e) => setSubmission((prev) => ({ ...prev, [extra.key]: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-avax-red/50 transition-colors"
                    />
                  </div>
                ))}
                {session ? (
                  <button
                    onClick={() => submitMutation.mutate()}
                    disabled={submitMutation.isPending || !submission[sub?.primary?.key]}
                    className="flex items-center gap-2 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-40"
                  >
                    {submitMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
                    Submit Challenge
                  </button>
                ) : (
                  <button onClick={() => router.push("/sign-in")} className="btn-primary px-6 py-3 rounded-xl">Sign In to Submit</button>
                )}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card neon-border-cyan p-8 rounded-2xl text-center">
                <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
                <h3 className="text-white font-black text-xl mb-2">Submission Received!</h3>
                <p className="text-slate-400 text-sm">An admin will verify your submission. Check back for your badge!</p>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="glass-card p-5 rounded-2xl sticky top-24">
              <h3 className="text-white font-bold mb-4">Verification</h3>
              <div className="space-y-3 text-sm text-slate-400">
                {((challenge.verification as any)?.rules || []).map((rule: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-4 h-4 rounded-full border border-avax-red/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-avax-red" />
                    </div>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-xs text-slate-600 flex items-center gap-1.5">
                  <ExternalLink size={11} />
                  {(challenge.verification as any)?.kind === "on_chain" ? "Auto-verified via Snowtrace API" : "Manual review by admin"}
                </p>
              </div>
            </div>

            {/* Avalanche links */}
            <div className="glass-card p-5 rounded-2xl">
              <h3 className="text-white font-bold mb-3 text-sm">Useful Links</h3>
              <div className="space-y-2">
                {[
                  { label: "Fuji Faucet", url: "https://faucet.avax.network" },
                  { label: "Snowtrace (Testnet)", url: "https://testnet.snowtrace.io" },
                  { label: "Core Wallet", url: "https://core.app" },
                  { label: "Avalanche Docs", url: "https://docs.avax.network" },
                ].map(({ label, url }) => (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-xs text-slate-400 hover:text-arena-cyan transition-colors group">
                    <span>{label}</span>
                    <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
