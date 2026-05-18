"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Zap, Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface GasRushProps {
  onComplete: (score: number, accuracy: number) => void;
}

const ROUNDS = 8;
const TIME_PER_ROUND = 5000; // ms

interface Transaction {
  id: number;
  gasPrice: number; // gwei
  type: "fast" | "slow" | "trap";
  emoji: string;
  label: string;
}

function generateTx(id: number): Transaction {
  const r = Math.random();
  if (r < 0.4) return { id, gasPrice: 25 + Math.floor(Math.random() * 30), type: "fast", emoji: "⚡", label: "Priority TX" };
  if (r < 0.75) return { id, gasPrice: 5 + Math.floor(Math.random() * 15), type: "slow", emoji: "🐢", label: "Low Priority" };
  return { id, gasPrice: 1 + Math.floor(Math.random() * 4), type: "trap", emoji: "💸", label: "Dust TX" };
}

export default function GasRush({ onComplete }: GasRushProps) {
  const [round, setRound] = useState(0);
  const [txPool, setTxPool] = useState<Transaction[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND);
  const [results, setResults] = useState<{ correct: boolean; xp: number }[]>([]);
  const [phase, setPhase] = useState<"playing" | "reveal" | "done">("playing");
  const [revealed, setRevealed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateRound = useCallback(() => {
    const pool: Transaction[] = Array.from({ length: 6 }, (_, i) => generateTx(i));
    setTxPool(pool);
    setSelected([]);
    setTimeLeft(TIME_PER_ROUND);
    setRevealed(false);
    setPhase("playing");
  }, []);

  useEffect(() => { generateRound(); }, [round, generateRound]);

  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 100) {
          clearInterval(timerRef.current!);
          handleReveal();
          return 0;
        }
        return t - 100;
      });
    }, 100);
    return () => clearInterval(timerRef.current!);
  }, [phase]);

  function handleReveal() {
    setPhase("reveal");
    setRevealed(true);
    const fastTxIds = txPool.filter((t) => t.type === "fast").map((t) => t.id);
    const correct = fastTxIds.every((id) => selected.includes(id)) && selected.every((id) => fastTxIds.includes(id));
    const xp = correct ? 125 : selected.filter((id) => fastTxIds.includes(id)).length * 30;
    const newResults = [...results, { correct, xp }];
    setResults(newResults);

    setTimeout(() => {
      if (round + 1 >= ROUNDS) {
        const totalXp = newResults.reduce((s, r) => s + r.xp, 0);
        const correctCount = newResults.filter((r) => r.correct).length;
        onComplete(totalXp, Math.round((correctCount / ROUNDS) * 100));
        setPhase("done");
      } else {
        setRound((r) => r + 1);
      }
    }, 1500);
  }

  const toggleTx = (id: number) => {
    if (phase !== "playing") return;
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  };

  const progress = (timeLeft / TIME_PER_ROUND) * 100;
  const fastTxIds = txPool.filter((t) => t.type === "fast").map((t) => t.id);

  if (phase === "done") {
    const total = results.reduce((s, r) => s + r.xp, 0);
    const correct = results.filter((r) => r.correct).length;
    return (
      <div className="text-center py-8">
        <Trophy size={48} className="text-arena-gold mx-auto mb-3" />
        <h3 className="text-white font-black text-2xl mb-1">Gas Rush Complete!</h3>
        <p className="text-slate-400 mb-2">{correct}/{ROUNDS} rounds correct</p>
        <p className="text-arena-gold font-bold text-xl">+{total} XP</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-black flex items-center gap-2"><Flame size={18} className="text-orange-400" /> Gas Rush</h3>
          <p className="text-slate-400 text-xs">Select high-priority transactions before the block closes</p>
        </div>
        <div className="text-right">
          <p className="text-white font-bold">Round {round + 1}/{ROUNDS}</p>
          <p className="text-slate-500 text-xs">{results.filter((r) => r.correct).length} correct</p>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", timeLeft > 2000 ? "bg-emerald-400" : timeLeft > 1000 ? "bg-amber-400" : "bg-red-400")}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Block info */}
      <div className="glass-card p-3 rounded-xl flex items-center justify-between text-xs text-slate-400">
        <span>⛽ Base Fee: 12 gwei</span>
        <span>📦 Block #{Math.floor(Math.random() * 9999999) + 30000000}</span>
        <span>⏱ {(timeLeft / 1000).toFixed(1)}s</span>
      </div>

      {/* Mempool */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {txPool.map((tx) => {
          const isSelected = selected.includes(tx.id);
          const isCorrect = revealed && tx.type === "fast";
          const isWrong = revealed && isSelected && tx.type !== "fast";

          return (
            <button
              key={tx.id}
              onClick={() => toggleTx(tx.id)}
              className={cn(
                "p-3 rounded-xl border text-left transition-all",
                revealed
                  ? isCorrect
                    ? "border-emerald-400/50 bg-emerald-400/10"
                    : isWrong
                    ? "border-red-400/50 bg-red-400/10"
                    : "border-white/[0.06] opacity-50"
                  : isSelected
                  ? "border-avax-red/50 bg-avax-red/10"
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]"
              )}
            >
              <div className="text-2xl mb-1">{tx.emoji}</div>
              <div className="text-white text-xs font-bold">{tx.gasPrice} gwei</div>
              <div className="text-slate-500 text-xs">{tx.label}</div>
            </button>
          );
        })}
      </div>

      {phase === "playing" && (
        <button
          onClick={handleReveal}
          disabled={selected.length === 0}
          className="w-full bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Zap size={16} /> Include in Block
        </button>
      )}

      {phase === "reveal" && (
        <div className={cn("text-center py-2 rounded-xl text-sm font-bold", results[results.length - 1]?.correct ? "text-emerald-400 bg-emerald-400/10" : "text-amber-400 bg-amber-400/10")}>
          {results[results.length - 1]?.correct ? `✅ Perfect! +${results[results.length - 1].xp} XP` : `⚡ +${results[results.length - 1]?.xp} XP — pick only Priority TXs next time`}
        </div>
      )}
    </div>
  );
}
