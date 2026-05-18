"use client";

import { useState, useEffect, useRef } from "react";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface TokenTossProps {
  onComplete: (score: number, accuracy: number) => void;
}

const SCENARIOS = [
  { emoji: "💸", label: "Send AVAX to friend", action: "send", protocols: ["Core Wallet", "MetaMask", "Ledger", "Rabby"], correct: ["Core Wallet", "MetaMask", "Ledger", "Rabby"] },
  { emoji: "🌉", label: "Bridge ETH → AVAX", action: "bridge", protocols: ["Stargate", "Avalanche Bridge", "Wormhole", "Uniswap"], correct: ["Stargate", "Avalanche Bridge", "Wormhole"] },
  { emoji: "🔄", label: "Swap AVAX → USDC", action: "swap", protocols: ["Trader Joe", "Pangolin", "GMX", "Snowtrace"], correct: ["Trader Joe", "Pangolin", "GMX"] },
  { emoji: "🏦", label: "Earn yield on AVAX", action: "stake", protocols: ["Benqi", "Aave", "ANKR", "Snowball"], correct: ["Benqi", "Aave", "ANKR", "Snowball"] },
  { emoji: "🖼️", label: "Buy an Avalanche NFT", action: "nft", protocols: ["Campfire", "NFTrade", "Joepegs", "OpenSea"], correct: ["Campfire", "NFTrade", "Joepegs"] },
  { emoji: "🗳️", label: "Vote on governance", action: "govern", protocols: ["Platypus", "Benqi", "Pangolin", "Snowtrace"], correct: ["Platypus", "Benqi", "Pangolin"] },
];

export default function TokenToss({ onComplete }: TokenTossProps) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [done, setDone] = useState(false);

  const scenario = SCENARIOS[roundIdx];

  const toggle = (p: string) => {
    if (submitted) return;
    setSelected((s) => s.includes(p) ? s.filter((x) => x !== p) : [...s, p]);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const correctSet = new Set(scenario.correct);
    const selectedSet = new Set(selected);
    const hits = selected.filter((p) => correctSet.has(p)).length;
    const misses = selected.filter((p) => !correctSet.has(p)).length;
    const perfect = hits === scenario.correct.length && misses === 0;
    const score = perfect ? 200 : hits * 50 - misses * 25;
    const newTotal = totalScore + Math.max(0, score);
    const newCorrect = correctRounds + (perfect ? 1 : 0);
    setTotalScore(newTotal);
    setCorrectRounds(newCorrect);

    setTimeout(() => {
      if (roundIdx + 1 >= SCENARIOS.length) {
        onComplete(newTotal, Math.round((newCorrect / SCENARIOS.length) * 100));
        setDone(true);
      } else {
        setRoundIdx((i) => i + 1);
        setSelected([]);
        setSubmitted(false);
      }
    }, 1800);
  };

  if (done) {
    return (
      <div className="text-center py-8">
        <Trophy size={48} className="text-arena-gold mx-auto mb-3" />
        <h3 className="text-white font-black text-2xl mb-1">Token Toss Done!</h3>
        <p className="text-slate-400 mb-2">{correctRounds}/{SCENARIOS.length} perfect rounds</p>
        <p className="text-arena-gold font-bold text-xl">+{totalScore} XP</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-black">Token Toss</h3>
          <p className="text-slate-400 text-xs">Select ALL valid protocols for the task</p>
        </div>
        <span className="text-slate-500 text-xs">{roundIdx + 1}/{SCENARIOS.length}</span>
      </div>

      {/* Scenario card */}
      <div className="glass-card p-5 rounded-2xl border border-avax-red/20 text-center">
        <div className="text-5xl mb-3">{scenario.emoji}</div>
        <h4 className="text-white font-black text-lg">{scenario.label}</h4>
        <p className="text-slate-400 text-sm mt-1">Which protocols can do this on Avalanche?</p>
        <p className="text-slate-600 text-xs mt-1">(Select all that apply)</p>
      </div>

      {/* Protocol options */}
      <div className="grid grid-cols-2 gap-3">
        {scenario.protocols.map((p) => {
          const isSelected = selected.includes(p);
          const isCorrect = submitted && scenario.correct.includes(p);
          const isWrong = submitted && isSelected && !scenario.correct.includes(p);
          const missed = submitted && !isSelected && scenario.correct.includes(p);

          return (
            <button
              key={p}
              onClick={() => toggle(p)}
              className={cn(
                "py-3 px-4 rounded-xl border font-medium text-sm transition-all",
                isCorrect && isSelected ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-400" :
                isWrong ? "border-red-400/50 bg-red-400/10 text-red-400 line-through" :
                missed ? "border-emerald-400/30 bg-emerald-400/5 text-emerald-300 opacity-70" :
                isSelected ? "border-avax-red/50 bg-avax-red/15 text-white" :
                "border-white/[0.08] text-slate-300 hover:border-white/20 hover:text-white"
              )}
            >
              {p}
              {isCorrect && isSelected && " ✓"}
              {isWrong && " ✗"}
              {missed && " (missed)"}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={selected.length === 0 || submitted}
        className="w-full bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-40"
      >
        {submitted ? "Next…" : "Confirm Selection"}
      </button>
    </div>
  );
}
