"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChainCardsProps {
  onComplete: (score: number, accuracy: number) => void;
}

interface Card {
  id: number;
  pairId: number;
  content: string;
  type: "term" | "definition";
  flipped: boolean;
  matched: boolean;
}

const PAIRS = [
  { term: "AVAX", definition: "Native token of Avalanche" },
  { term: "C-Chain", definition: "Smart contract compatible EVM chain" },
  { term: "P-Chain", definition: "Platform chain for staking & subnets" },
  { term: "X-Chain", definition: "UTXO-based exchange chain" },
  { term: "Snowman", definition: "Linear chain consensus protocol" },
  { term: "Subnet", definition: "Custom sovereign blockchain network" },
  { term: "43114", definition: "Avalanche Mainnet Chain ID" },
  { term: "Fuji", definition: "Avalanche testnet environment" },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildDeck(): Card[] {
  const selected = shuffle(PAIRS).slice(0, 6);
  const cards: Card[] = [];
  selected.forEach((pair, i) => {
    cards.push({ id: i * 2, pairId: i, content: pair.term, type: "term", flipped: false, matched: false });
    cards.push({ id: i * 2 + 1, pairId: i, content: pair.definition, type: "definition", flipped: false, matched: false });
  });
  return shuffle(cards);
}

export default function ChainCards({ onComplete }: ChainCardsProps) {
  const [cards, setCards] = useState<Card[]>(buildDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [done, setDone] = useState(false);
  const [locked, setLocked] = useState(false);

  const totalPairs = cards.length / 2;

  const handleFlip = useCallback((id: number) => {
    if (locked) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;
    if (flipped.length === 1 && flipped[0] === id) return;

    const newFlipped = [...flipped, id];
    setCards((cs) => cs.map((c) => c.id === id ? { ...c, flipped: true } : c));
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);
      const [a, b] = newFlipped.map((fid) => cards.find((c) => c.id === fid)!);

      if (a.pairId === b.pairId && a.type !== b.type) {
        // Match
        setTimeout(() => {
          setCards((cs) => cs.map((c) => newFlipped.includes(c.id) ? { ...c, matched: true } : c));
          const newMatches = matches + 1;
          setMatches(newMatches);
          setFlipped([]);
          setLocked(false);
          if (newMatches >= totalPairs) {
            const score = Math.max(0, 1000 - moves * 30);
            const accuracy = Math.round((totalPairs / (moves + 1)) * 100);
            onComplete(score, Math.min(accuracy, 100));
            setDone(true);
          }
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setCards((cs) => cs.map((c) => newFlipped.includes(c.id) ? { ...c, flipped: false } : c));
          setFlipped([]);
          setLocked(false);
        }, 1000);
      }
    }
  }, [cards, flipped, locked, matches, moves, totalPairs, onComplete]);

  const reset = () => {
    setCards(buildDeck());
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setDone(false);
    setLocked(false);
  };

  if (done) {
    const score = Math.max(0, 1000 - moves * 30);
    return (
      <div className="text-center py-8">
        <Trophy size={48} className="text-arena-gold mx-auto mb-3" />
        <h3 className="text-white font-black text-2xl mb-1">All Matched!</h3>
        <p className="text-slate-400 mb-1">{matches} pairs in {moves} moves</p>
        <p className="text-arena-gold font-bold text-xl">+{score} XP</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-black">Chain Cards</h3>
          <p className="text-slate-400 text-xs">Match Avalanche terms with their definitions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-white text-sm font-bold">{matches}/{totalPairs} matched</p>
            <p className="text-slate-500 text-xs">{moves} moves</p>
          </div>
          <button onClick={reset} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            className={cn(
              "aspect-square p-2 rounded-xl border text-xs font-medium transition-all duration-300 flex items-center justify-center text-center leading-tight",
              card.matched
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400 cursor-default"
                : card.flipped
                ? card.type === "term"
                  ? "border-avax-red/50 bg-avax-red/15 text-white"
                  : "border-arena-purple/50 bg-arena-purple/15 text-white"
                : "border-white/[0.06] bg-white/[0.02] text-slate-600 hover:border-white/20 hover:text-white cursor-pointer"
            )}
          >
            {card.flipped || card.matched ? (
              <span>{card.content}</span>
            ) : (
              <span className="text-2xl">❓</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <div className="w-3 h-3 rounded bg-avax-red/40" /> Terms
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <div className="w-3 h-3 rounded bg-arena-purple/40" /> Definitions
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <div className="w-3 h-3 rounded bg-emerald-400/40" /> Matched
        </div>
      </div>
    </div>
  );
}
