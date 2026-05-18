"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, ChevronRight, Loader2, SkipForward, Sparkles } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
type PersonaId = "student" | "developer" | "builder" | "founder" | "business";

interface PersonaCard {
  id: PersonaId;
  emoji: string;
  title: string;
  subtitle: string;
  missions: string[];
  xpRange: string;
  gradientFrom: string;
  gradientTo: string;
  glowColor: string;
  borderColor: string;
}

// ─── Persona data ──────────────────────────────────────────────────────────────
const PERSONAS: PersonaCard[] = [
  {
    id: "student",
    emoji: "🧑‍🎓",
    title: "Student",
    subtitle: "New to Web3 — curious and hungry to learn",
    missions: [
      "What is a blockchain?",
      "Gas fees explained in 5 min",
      "Your first AVAX transaction",
    ],
    xpRange: "50–150 XP / mission",
    gradientFrom: "from-pink-500",
    gradientTo: "to-rose-600",
    glowColor: "rgba(236,72,153,0.35)",
    borderColor: "border-pink-500/40",
  },
  {
    id: "developer",
    emoji: "🧑‍💻",
    title: "Developer",
    subtitle: "Building on Avalanche — hands-on coding challenges",
    missions: [
      "Deploy your first smart contract",
      "Integrate MetaMask in 10 mins",
      "Read on-chain data with ethers.js",
    ],
    xpRange: "150–400 XP / mission",
    gradientFrom: "from-cyan-500",
    gradientTo: "to-blue-600",
    glowColor: "rgba(6,182,212,0.35)",
    borderColor: "border-arena-cyan/40",
  },
  {
    id: "builder",
    emoji: "🏗️",
    title: "Builder",
    subtitle: "Shipping products — full dApp construction zones",
    missions: [
      "Scaffold an Avalanche dApp",
      "Build a token gating flow",
      "Cross-subnet message passing",
    ],
    xpRange: "200–500 XP / mission",
    gradientFrom: "from-emerald-500",
    gradientTo: "to-teal-600",
    glowColor: "rgba(16,185,129,0.35)",
    borderColor: "border-arena-emerald/40",
  },
  {
    id: "founder",
    emoji: "🚀",
    title: "Founder",
    subtitle: "Launching a Web3 startup — strategy & tokenomics",
    missions: [
      "Design a token model",
      "Community growth playbook",
      "Pitch deck for Web3 VCs",
    ],
    xpRange: "250–600 XP / mission",
    gradientFrom: "from-amber-500",
    gradientTo: "to-orange-600",
    glowColor: "rgba(245,158,11,0.35)",
    borderColor: "border-arena-gold/40",
  },
  {
    id: "business",
    emoji: "💼",
    title: "Business",
    subtitle: "Enterprise Web3 — use-cases, strategy, and compliance",
    missions: [
      "Web3 for traditional enterprises",
      "Tokenized assets & RWA",
      "Building a blockchain team",
    ],
    xpRange: "100–300 XP / mission",
    gradientFrom: "from-purple-500",
    gradientTo: "to-violet-600",
    glowColor: "rgba(124,58,237,0.35)",
    borderColor: "border-arena-purple/40",
  },
];

// ─── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {[1, 2].map((s) => (
        <div key={s} className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-all duration-300 ${
              step === s
                ? "bg-avax-red border-avax-red text-white shadow-glow-red"
                : step > s
                ? "bg-arena-emerald border-arena-emerald text-white"
                : "bg-white/5 border-white/20 text-white/40"
            }`}
          >
            {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
          </div>
          <span
            className={`text-sm font-medium ${
              step === s ? "text-white" : "text-white/40"
            }`}
          >
            {s === 1 ? "Choose Persona" : "Confirm"}
          </span>
          {s < 2 && (
            <ChevronRight className="w-4 h-4 text-white/20" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Persona card ──────────────────────────────────────────────────────────────
function PersonaCardComponent({
  persona,
  isSelected,
  onSelect,
  index,
}: {
  persona: PersonaCard;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`relative text-left w-full rounded-2xl border p-5 transition-all duration-300 cursor-pointer overflow-hidden ${
        isSelected
          ? `${persona.borderColor} bg-white/[0.07]`
          : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.15]"
      }`}
      style={
        isSelected
          ? {
              boxShadow: `0 0 30px ${persona.glowColor}, 0 0 60px ${persona.glowColor.replace("0.35", "0.1")}`,
            }
          : undefined
      }
    >
      {/* Gradient top strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${persona.gradientFrom} ${persona.gradientTo} opacity-0 transition-opacity duration-300 ${
          isSelected ? "opacity-100" : "group-hover:opacity-50"
        }`}
      />

      {/* Selected checkmark */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-3 right-3"
          >
            <CheckCircle2 className="w-5 h-5 text-arena-emerald" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji */}
      <div
        className={`text-3xl mb-3 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br ${persona.gradientFrom} ${persona.gradientTo} bg-opacity-10`}
        style={{ background: `linear-gradient(135deg, ${persona.glowColor.replace("0.35", "0.15")}, transparent)` }}
      >
        {persona.emoji}
      </div>

      {/* Title + subtitle */}
      <h3 className="text-base font-bold text-white mb-1">{persona.title}</h3>
      <p className="text-xs text-white/50 mb-3 leading-relaxed">{persona.subtitle}</p>

      {/* Mission previews */}
      <ul className="space-y-1 mb-3">
        {persona.missions.map((m, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-white/40">
            <span className="text-arena-cyan mt-0.5">▸</span>
            <span>{m}</span>
          </li>
        ))}
      </ul>

      {/* XP range */}
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r ${persona.gradientFrom} ${persona.gradientTo} bg-opacity-15`}
        style={{ background: `linear-gradient(135deg, ${persona.glowColor.replace("0.35", "0.12")}, transparent)` }}
      >
        <Sparkles className="w-3 h-3 text-arena-gold" />
        <span className="text-white/70">{persona.xpRange}</span>
      </div>
    </motion.button>
  );
}

// ─── Confirmation step ─────────────────────────────────────────────────────────
function ConfirmStep({
  persona,
  onBack,
  onConfirm,
  isLoading,
}: {
  persona: PersonaCard;
  onBack: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <motion.div
      key="confirm"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center text-center max-w-md mx-auto"
    >
      {/* Large emoji */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl mb-6 border border-white/10"
        style={{
          background: `radial-gradient(ellipse at center, ${persona.glowColor.replace("0.35", "0.2")}, transparent 70%)`,
          boxShadow: `0 0 40px ${persona.glowColor}`,
        }}
      >
        {persona.emoji}
      </motion.div>

      <h2 className="text-3xl font-bold text-white mb-2">
        You&apos;re a{" "}
        <span className="gradient-text">{persona.title}</span>
      </h2>
      <p className="text-white/50 mb-8 leading-relaxed">{persona.subtitle}</p>

      {/* Missions preview */}
      <div className="w-full glass-card rounded-2xl p-5 mb-8 text-left">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
          Your first missions
        </p>
        <ul className="space-y-2">
          {persona.missions.map((m, i) => (
            <li key={i} className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-br ${persona.gradientFrom} ${persona.gradientTo} text-white flex-shrink-0`}
              >
                {i + 1}
              </div>
              <span className="text-sm text-white/70">{m}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-arena-gold" />
          <span className="text-xs text-white/50">{persona.xpRange}</span>
        </div>
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="btn-secondary flex-1 disabled:opacity-60"
        >
          Back
        </button>
        <motion.button
          onClick={onConfirm}
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.03 }}
          whileTap={{ scale: isLoading ? 1 : 0.97 }}
          className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Starting…
            </>
          ) : (
            <>
              Start Journey
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPersona, setSelectedPersona] = useState<PersonaId | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedCard = PERSONAS.find((p) => p.id === selectedPersona);

  const handleNext = () => {
    if (!selectedPersona) {
      toast.error("Please select a persona to continue");
      return;
    }
    setStep(2);
  };

  const handleConfirm = async () => {
    if (!selectedPersona) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona: selectedPersona, onboardingDone: true }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error("Failed to save your persona", {
          description: err.error ?? "Please try again.",
        });
        return;
      }
      toast.success("You're all set!", {
        description: "Welcome to the Arena. Let the games begin!",
      });
      router.push("/journey");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingDone: true }),
      });
      router.push("/journey");
    } catch {
      router.push("/journey");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      {/* Background */}
      <div className="fixed inset-0 hero-grid-bg opacity-30" aria-hidden />
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-arena-purple/5 blur-[160px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-avax-red/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-arena-purple/10 border border-arena-purple/20 text-arena-purple-light text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Welcome to Plug n&apos; Play Arena
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Who are{" "}
            <span className="gradient-text">you?</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Choose your learning persona. This shapes your missions, XP rewards, and journey path.
          </p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex justify-center mb-10">
          <StepIndicator step={step} />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.35 }}
            >
              {/* Persona grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                {PERSONAS.map((persona, i) => (
                  <PersonaCardComponent
                    key={persona.id}
                    persona={persona}
                    isSelected={selectedPersona === persona.id}
                    onSelect={() => setSelectedPersona(persona.id)}
                    index={i}
                  />
                ))}
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-between max-w-md mx-auto"
              >
                <button
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors disabled:opacity-40"
                >
                  <SkipForward className="w-4 h-4" />
                  Skip for now
                </button>

                <motion.button
                  onClick={handleNext}
                  disabled={!selectedPersona || isLoading}
                  whileHover={{ scale: selectedPersona ? 1.04 : 1 }}
                  whileTap={{ scale: selectedPersona ? 0.97 : 1 }}
                  className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </motion.div>
          ) : (
            selectedCard && (
              <ConfirmStep
                persona={selectedCard}
                onBack={() => setStep(1)}
                onConfirm={handleConfirm}
                isLoading={isLoading}
              />
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
