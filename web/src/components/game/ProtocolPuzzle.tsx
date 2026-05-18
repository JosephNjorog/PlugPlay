"use client";

import { useState } from "react";
import { Trophy, Puzzle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProtocolPuzzleProps {
  onComplete: (score: number, accuracy: number) => void;
}

interface PuzzleRound {
  title: string;
  description: string;
  pieces: { id: string; content: string }[];
  slots: { id: string; label: string; correctPieceId: string }[];
}

const ROUNDS: PuzzleRound[] = [
  {
    title: "How a Swap Works",
    description: "Order the steps of a DEX token swap on Avalanche",
    pieces: [
      { id: "a", content: "User connects wallet" },
      { id: "b", content: "AMM calculates price impact" },
      { id: "c", content: "User approves token spend" },
      { id: "d", content: "Transaction confirmed on C-Chain" },
    ],
    slots: [
      { id: "1", label: "Step 1", correctPieceId: "a" },
      { id: "2", label: "Step 2", correctPieceId: "c" },
      { id: "3", label: "Step 3", correctPieceId: "b" },
      { id: "4", label: "Step 4", correctPieceId: "d" },
    ],
  },
  {
    title: "Avalanche Architecture",
    description: "Match each chain to its primary function",
    pieces: [
      { id: "a", content: "Smart contracts & DeFi" },
      { id: "b", content: "Staking & subnet management" },
      { id: "c", content: "Fast AVAX transfers" },
      { id: "d", content: "Custom app-specific chains" },
    ],
    slots: [
      { id: "1", label: "C-Chain", correctPieceId: "a" },
      { id: "2", label: "P-Chain", correctPieceId: "b" },
      { id: "3", label: "X-Chain", correctPieceId: "c" },
      { id: "4", label: "Subnets", correctPieceId: "d" },
    ],
  },
  {
    title: "NFT Lifecycle",
    description: "Order the stages of creating and selling an NFT",
    pieces: [
      { id: "a", content: "Artist creates digital artwork" },
      { id: "b", content: "Upload to IPFS storage" },
      { id: "c", content: "Deploy & mint on Avalanche" },
      { id: "d", content: "List on NFT marketplace" },
    ],
    slots: [
      { id: "1", label: "Phase 1", correctPieceId: "a" },
      { id: "2", label: "Phase 2", correctPieceId: "b" },
      { id: "3", label: "Phase 3", correctPieceId: "c" },
      { id: "4", label: "Phase 4", correctPieceId: "d" },
    ],
  },
];

export default function ProtocolPuzzle({ onComplete }: ProtocolPuzzleProps) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [slotMap, setSlotMap] = useState<Record<string, string | null>>({ "1": null, "2": null, "3": null, "4": null });
  const [dragging, setDragging] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [perfectRounds, setPerfectRounds] = useState(0);
  const [done, setDone] = useState(false);

  const round = ROUNDS[roundIdx];
  const usedPieces = Object.values(slotMap).filter(Boolean) as string[];
  const availablePieces = round.pieces.filter((p) => !usedPieces.includes(p.id));

  const handleSlotClick = (slotId: string) => {
    if (submitted) return;
    if (dragging) {
      // Place piece
      const prevSlot = Object.entries(slotMap).find(([, v]) => v === dragging)?.[0];
      if (prevSlot) setSlotMap((m) => ({ ...m, [prevSlot]: null }));
      setSlotMap((m) => ({ ...m, [slotId]: dragging }));
      setDragging(null);
    } else if (slotMap[slotId]) {
      // Pick up from slot
      setDragging(slotMap[slotId]);
      setSlotMap((m) => ({ ...m, [slotId]: null }));
    }
  };

  const handlePieceClick = (pieceId: string) => {
    if (submitted) return;
    setDragging(dragging === pieceId ? null : pieceId);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const correct = round.slots.filter((s) => slotMap[s.id] === s.correctPieceId).length;
    const perfect = correct === round.slots.length;
    const score = correct * 75;
    const newTotal = totalScore + score;
    const newPerfect = perfectRounds + (perfect ? 1 : 0);
    setTotalScore(newTotal);
    setPerfectRounds(newPerfect);

    setTimeout(() => {
      if (roundIdx + 1 >= ROUNDS.length) {
        onComplete(newTotal, Math.round((newPerfect / ROUNDS.length) * 100));
        setDone(true);
      } else {
        setRoundIdx((i) => i + 1);
        setSlotMap({ "1": null, "2": null, "3": null, "4": null });
        setDragging(null);
        setSubmitted(false);
      }
    }, 2000);
  };

  const allFilled = round.slots.every((s) => slotMap[s.id] !== null);

  if (done) {
    return (
      <div className="text-center py-8">
        <Trophy size={48} className="text-arena-gold mx-auto mb-3" />
        <h3 className="text-white font-black text-2xl mb-1">Puzzle Master!</h3>
        <p className="text-slate-400 mb-2">{perfectRounds}/{ROUNDS.length} perfect rounds</p>
        <p className="text-arena-gold font-bold text-xl">+{totalScore} XP</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-black flex items-center gap-2"><Puzzle size={16} className="text-arena-purple-light" /> Protocol Puzzle</h3>
          <p className="text-slate-400 text-xs">Click a piece, then click a slot to place it</p>
        </div>
        <span className="text-slate-500 text-xs">{roundIdx + 1}/{ROUNDS.length}</span>
      </div>

      <div className="glass-card p-4 rounded-xl border border-arena-purple/20">
        <h4 className="text-white font-bold mb-1">{round.title}</h4>
        <p className="text-slate-400 text-xs">{round.description}</p>
      </div>

      {/* Slots */}
      <div className="space-y-2">
        {round.slots.map((slot) => {
          const pieceId = slotMap[slot.id];
          const piece = pieceId ? round.pieces.find((p) => p.id === pieceId) : null;
          const isCorrect = submitted && pieceId === slot.correctPieceId;
          const isWrong = submitted && pieceId !== null && pieceId !== slot.correctPieceId;

          return (
            <button
              key={slot.id}
              onClick={() => handleSlotClick(slot.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                isCorrect ? "border-emerald-400/40 bg-emerald-400/10" :
                isWrong ? "border-red-400/40 bg-red-400/10" :
                pieceId ? "border-arena-purple/40 bg-arena-purple/10" :
                dragging ? "border-white/20 bg-white/[0.04] border-dashed" :
                "border-white/[0.06] bg-white/[0.02]"
              )}
            >
              <span className={cn("text-xs font-mono w-14 flex-shrink-0", isCorrect ? "text-emerald-400" : isWrong ? "text-red-400" : "text-slate-500")}>
                {slot.label}
              </span>
              <span className={cn("text-sm font-medium flex-1", isCorrect ? "text-emerald-300" : isWrong ? "text-red-300" : piece ? "text-white" : "text-slate-600 italic")}>
                {piece ? piece.content : "— empty slot —"}
              </span>
              {isCorrect && <span className="text-emerald-400 text-xs">✓</span>}
              {isWrong && <span className="text-red-400 text-xs">✗</span>}
            </button>
          );
        })}
      </div>

      {/* Available pieces */}
      {!submitted && (
        <div>
          <p className="text-slate-500 text-xs mb-2">Available pieces:</p>
          <div className="flex flex-wrap gap-2">
            {availablePieces.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePieceClick(p.id)}
                className={cn(
                  "px-3 py-2 rounded-lg border text-sm transition-all",
                  dragging === p.id
                    ? "border-avax-red/60 bg-avax-red/20 text-white"
                    : "border-white/[0.08] text-slate-300 hover:border-white/20 hover:text-white"
                )}
              >
                {p.content}
              </button>
            ))}
            {availablePieces.length === 0 && <p className="text-slate-600 text-xs">All placed</p>}
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!allFilled || submitted}
        className="w-full bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-40"
      >
        {submitted ? "Next round…" : "Check Answers"}
      </button>
    </div>
  );
}
