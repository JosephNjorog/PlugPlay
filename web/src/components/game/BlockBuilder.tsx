"use client";

import { useState, useCallback } from "react";
import { Trophy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlockBuilderProps {
  onComplete: (score: number, accuracy: number) => void;
}

interface BlockField {
  id: string;
  label: string;
  correctValue: string;
  hint: string;
  options: string[];
}

const BLOCK_CHALLENGES: { title: string; description: string; fields: BlockField[] }[] = [
  {
    title: "Build a Fuji Block Header",
    description: "Fill in the correct values for an Avalanche C-Chain block",
    fields: [
      { id: "chainId", label: "Chain ID", correctValue: "43113", hint: "Fuji testnet chain identifier", options: ["43114", "43113", "1", "137"] },
      { id: "consensus", label: "Consensus", correctValue: "Snowman", hint: "Avalanche's linear chain consensus protocol", options: ["Nakamoto", "Snowman", "Tendermint", "PBFT"] },
      { id: "finality", label: "Finality", correctValue: "~1-2s", hint: "How fast does Avalanche finalize transactions?", options: ["~10 min", "~15s", "~1-2s", "~4s"] },
      { id: "tps", label: "Peak TPS", correctValue: "4500+", hint: "Max transactions per second on C-Chain", options: ["15", "4500+", "65000", "100"] },
    ],
  },
  {
    title: "Subnet Architecture",
    description: "Configure an Avalanche subnet correctly",
    fields: [
      { id: "validator", label: "Validator Requirement", correctValue: "2,000 AVAX", hint: "Minimum stake to become a validator on mainnet", options: ["100 AVAX", "32 ETH", "2,000 AVAX", "1,000 AVAX"] },
      { id: "duration", label: "Min Stake Duration", correctValue: "2 weeks", hint: "Minimum time you must stake to validate", options: ["24 hours", "1 week", "2 weeks", "1 month"] },
      { id: "chains", label: "Primary Network Chains", correctValue: "3 (P, C, X)", hint: "How many chains does the primary network have?", options: ["1", "2", "3 (P, C, X)", "5"] },
      { id: "vm", label: "Default C-Chain VM", correctValue: "EVM", hint: "Which VM does the C-Chain run?", options: ["AVM", "EVM", "WASM", "MoveVM"] },
    ],
  },
  {
    title: "DeFi Transaction",
    description: "Structure a valid DeFi swap transaction",
    fields: [
      { id: "slippage", label: "Safe Slippage %", correctValue: "0.5%", hint: "Common slippage for stablecoin swaps", options: ["0%", "0.5%", "5%", "50%"] },
      { id: "approval", label: "First Step", correctValue: "Approve token", hint: "What must you do before swapping an ERC-20?", options: ["Bridge token", "Approve token", "Wrap token", "Stake token"] },
      { id: "gas", label: "Gas Token on C-Chain", correctValue: "AVAX", hint: "Which token pays for gas fees?", options: ["ETH", "AVAX", "USDC", "WAVAX"] },
      { id: "amm", label: "AMM Formula", correctValue: "x * y = k", hint: "Classic constant product formula", options: ["x + y = k", "x * y = k", "x / y = k", "x ^ y = k"] },
    ],
  },
];

export default function BlockBuilder({ onComplete }: BlockBuilderProps) {
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const challenge = BLOCK_CHALLENGES[challengeIdx];

  const handleSubmit = useCallback(() => {
    const correctCount = challenge.fields.filter((f) => answers[f.id] === f.correctValue).length;
    const score = correctCount * 75;
    const newTotal = totalScore + score;
    const newCorrect = totalCorrect + correctCount;
    setSubmitted(true);
    setTotalScore(newTotal);
    setTotalCorrect(newCorrect);

    setTimeout(() => {
      if (challengeIdx + 1 >= BLOCK_CHALLENGES.length) {
        const totalFields = BLOCK_CHALLENGES.reduce((s, c) => s + c.fields.length, 0);
        onComplete(newTotal, Math.round((newCorrect / totalFields) * 100));
        setDone(true);
      } else {
        setChallengeIdx((i) => i + 1);
        setAnswers({});
        setSubmitted(false);
      }
    }, 2000);
  }, [answers, challenge, challengeIdx, totalScore, totalCorrect, onComplete]);

  const allAnswered = challenge.fields.every((f) => answers[f.id]);

  if (done) {
    return (
      <div className="text-center py-8">
        <Trophy size={48} className="text-arena-gold mx-auto mb-3" />
        <h3 className="text-white font-black text-2xl mb-1">Block Builder Complete!</h3>
        <p className="text-slate-400 mb-2">{totalCorrect} correct answers</p>
        <p className="text-arena-gold font-bold text-xl">+{totalScore} XP</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-white font-black text-lg">{challenge.title}</h3>
          <p className="text-slate-400 text-xs mt-0.5">{challenge.description}</p>
        </div>
        <span className="text-slate-500 text-xs mt-1">{challengeIdx + 1}/{BLOCK_CHALLENGES.length}</span>
      </div>

      {/* Block visual */}
      <div className="glass-card p-4 rounded-xl border border-avax-red/20 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-sm bg-avax-red" />
          <span className="text-white font-bold text-sm font-mono">BLOCK #{Math.floor(Math.random() * 999999 + 100000)}</span>
        </div>

        {challenge.fields.map((field) => {
          const val = answers[field.id];
          const isCorrect = submitted && val === field.correctValue;
          const isWrong = submitted && val !== field.correctValue;

          return (
            <div key={field.id} className={cn("p-3 rounded-lg border transition-all", isCorrect ? "border-emerald-400/30 bg-emerald-400/5" : isWrong ? "border-red-400/30 bg-red-400/5" : "border-white/[0.06] bg-white/[0.02]")}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-xs font-mono">{field.label}:</span>
                {submitted && (
                  <span className={cn("text-xs font-bold", isCorrect ? "text-emerald-400" : "text-red-400")}>
                    {isCorrect ? "✓ Correct" : `✗ ${field.correctValue}`}
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {field.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => !submitted && setAnswers((a) => ({ ...a, [field.id]: opt }))}
                    disabled={submitted}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      val === opt && !submitted
                        ? "border-avax-red/50 bg-avax-red/15 text-white"
                        : submitted && opt === field.correctValue
                        ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-400"
                        : submitted && val === opt && val !== field.correctValue
                        ? "border-red-400/50 bg-red-400/10 text-red-400"
                        : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {!submitted && <p className="text-slate-600 text-xs mt-1.5">💡 {field.hint}</p>}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || submitted}
        className="w-full bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-40"
      >
        {submitted ? "Next block…" : "Seal Block"}
      </button>
    </div>
  );
}
