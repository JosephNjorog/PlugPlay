"use client";

import { useState } from "react";
import { Trophy, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeFiDinerProps {
  onComplete: (score: number, accuracy: number) => void;
}

interface Order {
  customer: string;
  emoji: string;
  want: string;
  ingredients: { name: string; icon: string; needed: boolean }[];
}

const ORDERS: Order[] = [
  {
    customer: "Alice the Validator",
    emoji: "👩‍💻",
    want: "Stake AVAX",
    ingredients: [
      { name: "AVAX tokens", icon: "🔺", needed: true },
      { name: "Validator node", icon: "🖥️", needed: true },
      { name: "2,000 AVAX min", icon: "💰", needed: true },
      { name: "NFT collection", icon: "🖼️", needed: false },
      { name: "14-day lock", icon: "🔒", needed: true },
      { name: "Credit card", icon: "💳", needed: false },
    ],
  },
  {
    customer: "Bob the Trader",
    emoji: "📈",
    want: "Swap AVAX → JOE",
    ingredients: [
      { name: "Trader Joe DEX", icon: "🏪", needed: true },
      { name: "AVAX in wallet", icon: "🔺", needed: true },
      { name: "Slippage tolerance", icon: "⚙️", needed: true },
      { name: "Gas fee (AVAX)", icon: "⛽", needed: true },
      { name: "KYC verification", icon: "📋", needed: false },
      { name: "ETH wallet", icon: "💎", needed: false },
    ],
  },
  {
    customer: "Carol the Creator",
    emoji: "🎨",
    want: "Mint an NFT",
    ingredients: [
      { name: "Smart contract", icon: "📜", needed: true },
      { name: "IPFS metadata", icon: "🌐", needed: true },
      { name: "AVAX for gas", icon: "⛽", needed: true },
      { name: "NFT marketplace", icon: "🛍️", needed: true },
      { name: "Mining rig", icon: "⛏️", needed: false },
      { name: "Bank account", icon: "🏦", needed: false },
    ],
  },
  {
    customer: "Dave the DeFi Degen",
    emoji: "🦍",
    want: "Provide Liquidity",
    ingredients: [
      { name: "Two token pair", icon: "🔁", needed: true },
      { name: "Equal value ratio", icon: "⚖️", needed: true },
      { name: "LP tokens received", icon: "🎫", needed: true },
      { name: "Impermanent loss risk", icon: "⚠️", needed: true },
      { name: "Social security number", icon: "🆔", needed: false },
      { name: "Physical warehouse", icon: "🏭", needed: false },
    ],
  },
];

export default function DeFiDiner({ onComplete }: DeFiDinerProps) {
  const [orderIdx, setOrderIdx] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [perfectOrders, setPerfectOrders] = useState(0);
  const [done, setDone] = useState(false);

  const order = ORDERS[orderIdx];
  const needed = order.ingredients.filter((i) => i.needed).map((i) => i.name);
  const notNeeded = order.ingredients.filter((i) => !i.needed).map((i) => i.name);

  const toggle = (name: string) => {
    if (submitted) return;
    setSelected((s) => s.includes(name) ? s.filter((x) => x !== name) : [...s, name]);
  };

  const handleServe = () => {
    setSubmitted(true);
    const correct = selected.filter((s) => needed.includes(s)).length;
    const wrong = selected.filter((s) => notNeeded.includes(s)).length;
    const missed = needed.filter((n) => !selected.includes(n)).length;
    const perfect = correct === needed.length && wrong === 0;
    const score = Math.max(0, correct * 60 - wrong * 40 - missed * 20);
    const newTotal = totalScore + score;
    const newPerfect = perfectOrders + (perfect ? 1 : 0);
    setTotalScore(newTotal);
    setPerfectOrders(newPerfect);

    setTimeout(() => {
      if (orderIdx + 1 >= ORDERS.length) {
        onComplete(newTotal, Math.round((newPerfect / ORDERS.length) * 100));
        setDone(true);
      } else {
        setOrderIdx((i) => i + 1);
        setSelected([]);
        setSubmitted(false);
      }
    }, 2000);
  };

  if (done) {
    return (
      <div className="text-center py-8">
        <Trophy size={48} className="text-arena-gold mx-auto mb-3" />
        <h3 className="text-white font-black text-2xl mb-1">Diner Champion!</h3>
        <p className="text-slate-400 mb-2">{perfectOrders}/{ORDERS.length} perfect orders</p>
        <p className="text-arena-gold font-bold text-xl">+{totalScore} XP</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-black flex items-center gap-2"><ChefHat size={16} className="text-orange-400" /> DeFi Diner</h3>
          <p className="text-slate-400 text-xs">Select only what's needed for the order</p>
        </div>
        <span className="text-slate-500 text-xs">{orderIdx + 1}/{ORDERS.length}</span>
      </div>

      {/* Order ticket */}
      <div className="glass-card p-4 rounded-xl border border-amber-400/20 bg-amber-400/5">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">{order.emoji}</span>
          <div>
            <p className="text-white font-bold">{order.customer}</p>
            <p className="text-amber-300 text-sm">Order: <strong>{order.want}</strong></p>
          </div>
        </div>
      </div>

      {/* Ingredients shelf */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {order.ingredients.map((ing) => {
          const isSelected = selected.includes(ing.name);
          const isCorrect = submitted && ing.needed && isSelected;
          const isWrong = submitted && !ing.needed && isSelected;
          const isMissed = submitted && ing.needed && !isSelected;

          return (
            <button
              key={ing.name}
              onClick={() => toggle(ing.name)}
              className={cn(
                "p-3 rounded-xl border text-left transition-all",
                isCorrect ? "border-emerald-400/50 bg-emerald-400/10" :
                isWrong ? "border-red-400/50 bg-red-400/10" :
                isMissed ? "border-amber-400/30 bg-amber-400/5 opacity-60" :
                isSelected ? "border-avax-red/50 bg-avax-red/10" :
                "border-white/[0.06] hover:border-white/20"
              )}
            >
              <div className="text-xl mb-1">{ing.icon}</div>
              <div className={cn("text-xs font-medium", isCorrect ? "text-emerald-400" : isWrong ? "text-red-400 line-through" : "text-slate-300")}>
                {ing.name}
              </div>
              {isMissed && <div className="text-amber-400 text-xs">needed!</div>}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleServe}
        disabled={selected.length === 0 || submitted}
        className="w-full bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-40"
      >
        {submitted ? "Next order…" : `🍽️ Serve Order (${selected.length} items selected)`}
      </button>
    </div>
  );
}
