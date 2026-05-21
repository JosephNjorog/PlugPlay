"use client";

import { useState, use, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Clock, Target, Zap, ChevronRight, CheckCircle, XCircle, Star, ArrowLeft, Trophy } from "lucide-react";
import { predictScore } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// Lazy load arcade games
const GasRush = dynamic(() => import("@/components/game/GasRush"), { ssr: false, loading: () => <div className="text-white text-center">Loading game...</div> });
const BlockBuilder = dynamic(() => import("@/components/game/BlockBuilder"), { ssr: false, loading: () => <div className="text-white text-center">Loading game...</div> });
const ChainCards = dynamic(() => import("@/components/game/ChainCards"), { ssr: false, loading: () => <div className="text-white text-center">Loading game...</div> });
const TokenToss = dynamic(() => import("@/components/game/TokenToss"), { ssr: false, loading: () => <div className="text-white text-center">Loading game...</div> });
const WalletWars = dynamic(() => import("@/components/game/WalletWars"), { ssr: false, loading: () => <div className="text-white text-center">Loading game...</div> });
const DeFiDiner = dynamic(() => import("@/components/game/DeFiDiner"), { ssr: false, loading: () => <div className="text-white text-center">Loading game...</div> });
const ProtocolPuzzle = dynamic(() => import("@/components/game/ProtocolPuzzle"), { ssr: false, loading: () => <div className="text-white text-center">Loading game...</div> });

const ARCADE_GAMES: Record<string, React.ComponentType<{ onComplete: (score: number, accuracy: number) => void }>> = {
  "gas-rush": GasRush as any,
  "block-builder": BlockBuilder as any,
  "chain-cards": ChainCards as any,
  "token-toss": TokenToss as any,
  "wallet-wars": WalletWars as any,
  "defi-diner": DeFiDiner as any,
  "protocol-puzzle": ProtocolPuzzle as any,
};

// Fallback question bank used when DB has no questions for the given themes
const FALLBACK_QUESTIONS: Array<{ q: string; options: string[]; answer: number }> = [
  { q: "What is the native currency of Avalanche?", options: ["ETH", "AVAX", "SOL", "BNB"], answer: 1 },
  { q: "Avalanche Fuji is a:", options: ["Mainnet", "Sidechain", "Testnet", "Layer 2"], answer: 2 },
  { q: "Avalanche uses which consensus mechanism?", options: ["Proof of Work", "Proof of Stake", "Snowman", "Delegated PoS"], answer: 2 },
  { q: "The Avalanche C-Chain is compatible with:", options: ["Solana VM", "EVM", "WASM", "CosmWasm"], answer: 1 },
  { q: "What is the Avalanche Explorer called?", options: ["Etherscan", "Snowtrace", "Solscan", "BscScan"], answer: 1 },
  { q: "What does DeFi stand for?", options: ["Digital Finance", "Decentralized Finance", "Deferred Finance", "Distributed Finance"], answer: 1 },
  { q: "Smart contracts execute:", options: ["Only on Ethereum", "Only with human approval", "Automatically when conditions are met", "Only on weekdays"], answer: 2 },
  { q: "NFT stands for:", options: ["New Financial Token", "Non-Fungible Token", "Network File Transfer", "Node Finality Test"], answer: 1 },
  { q: "Finality on Avalanche is achieved in approximately:", options: ["10 minutes", "2 seconds", "1 hour", "30 seconds"], answer: 1 },
  { q: "The minimum stake to validate on Avalanche is:", options: ["10 AVAX", "100 AVAX", "2000 AVAX", "500 AVAX"], answer: 2 },
];

type GameState = "idle" | "playing" | "result";

interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
}

export default function PlayPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();

  const [gameState, setGameState] = useState<GameState>("idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ correct: boolean; selected: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timeLimit] = useState(300); // total game time limit in seconds
  const [startTime, setStartTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const { data: game, isLoading } = useQuery({
    queryKey: ["game", gameId],
    queryFn: () => fetch(`/api/games/${gameId}`).then((r) => r.json()),
  });

  // Fetch quiz questions from DB; falls back to FALLBACK_QUESTIONS if empty
  const { data: dbQuestions } = useQuery<{ question: string; options: string[]; answer: number }[]>({
    queryKey: ["quiz-questions", game?.themes],
    queryFn: async () => {
      const themes: string[] = game?.themes ?? [];
      const params = new URLSearchParams();
      themes.forEach((t) => params.append("theme", t));
      const res = await fetch(`/api/questions?${params}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!game && !game.error,
    staleTime: 5 * 60 * 1000,
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: { accuracy: number; timeSpent: number }) => {
      const r = await fetch(`/api/missions/${gameId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, timeLimit }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Failed to submit score");
      return data;
    },
    onSuccess: (data) => {
      if (data.xpEarned) toast.success(`+${data.xpEarned} XP earned!`);
      if (data.badge) toast.success(`Badge unlocked: ${data.badge.title} ${data.badge.emoji}`);
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to submit score"),
  });

  // Start timer per question
  useEffect(() => {
    if (gameState !== "playing" || selected !== null) return;
    setTimeLeft(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(-1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentQ, gameState, selected]);

  const startGame = () => {
    const pool: QuizQuestion[] =
      dbQuestions && dbQuestions.length > 0
        ? dbQuestions.map((q) => ({ q: q.question, options: q.options, answer: q.answer }))
        : FALLBACK_QUESTIONS;
    const qs = pool.sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(qs);
    setCurrentQ(0);
    setAnswers([]);
    setSelected(null);
    setStartTime(Date.now());
    setGameState("playing");
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    clearInterval(timerRef.current);
    const isCorrect = idx === questions[currentQ]?.answer;
    setSelected(idx);
    const newAnswers = [...answers, { correct: isCorrect, selected: idx }];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQ + 1 >= questions.length) {
        // Game over
        const accuracy = Math.round((newAnswers.filter((a) => a.correct).length / newAnswers.length) * 100);
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        submitMutation.mutate({ accuracy, timeSpent });
        setGameState("result");
      } else {
        setCurrentQ((q) => q + 1);
        setSelected(null);
      }
    }, 1000);
  };

  // For arcade games
  const handleArcadeComplete = (score: number, accuracy: number) => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    submitMutation.mutate({ accuracy, timeSpent });
    setGameState("result");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080810] pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-avax-red/30 border-t-avax-red rounded-full animate-spin" />
      </div>
    );
  }

  if (!game || game.error) {
    return (
      <div className="min-h-screen bg-[#080810] pt-20 flex flex-col items-center justify-center text-white gap-4">
        <p className="text-slate-400">Game not found</p>
        <button onClick={() => router.back()} className="btn-secondary px-4 py-2 rounded-xl text-sm">Go back</button>
      </div>
    );
  }

  const isArcade = game.gameType === "arcade" || game.category === "Arcade";
  const ArcadeGame = isArcade ? ARCADE_GAMES[gameId] : null;

  // Arcade game
  if (isArcade && ArcadeGame && gameState === "playing") {
    return (
      <div className="min-h-screen bg-[#080810] pt-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setGameState("idle")} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/[0.06]">
              <ArrowLeft size={18} />
            </button>
            <span className="text-white font-bold">{game.title}</span>
          </div>
          <ArcadeGame onComplete={handleArcadeComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080810] pt-20 flex items-center justify-center p-4">
      <div className="absolute inset-0 hero-grid-bg opacity-20" />
      <div className="relative w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {/* Idle / pre-game */}
          {gameState === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-card neon-border-purple p-8 rounded-2xl text-center">
              <div className="text-6xl mb-4">{game.emoji}</div>
              <h1 className="text-3xl font-black text-white mb-2">{game.title}</h1>
              <p className="text-slate-400 mb-6">{game.description}</p>

              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {[
                  { icon: Target, label: game.difficulty, color: "text-amber-400" },
                  { icon: Clock, label: game.duration, color: "text-arena-cyan" },
                  { icon: Zap, label: `+${game.xpReward} XP`, color: "text-arena-gold" },
                  { icon: Star, label: game.category, color: "text-arena-purple-light" },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className={cn("flex items-center gap-1.5 text-sm glass-card px-3 py-1.5 rounded-lg", color)}>
                    <Icon size={14} />
                    {label}
                  </div>
                ))}
              </div>

              <div className="text-left bg-white/[0.03] rounded-xl p-4 mb-8 border border-white/[0.06]">
                <p className="text-slate-300 text-sm leading-relaxed">{game.learningOutcome}</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => router.back()} className="px-5 py-3 border border-white/10 text-slate-400 rounded-xl hover:bg-white/[0.04]">
                  <ArrowLeft size={16} />
                </button>
                <button
                  onClick={() => { setStartTime(Date.now()); setGameState("playing"); if (isArcade) {} else startGame(); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold py-3 rounded-xl shadow-glow-red hover:opacity-90 transition-all"
                >
                  <Zap size={18} />
                  Start Mission
                  <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Quiz playing */}
          {gameState === "playing" && !isArcade && questions.length > 0 && (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Progress */}
              <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                <span>Question {currentQ + 1} of {questions.length}</span>
                <span className={cn("font-bold tabular-nums", timeLeft <= 10 ? "text-red-400" : "text-white")}>
                  {timeLeft}s
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full mb-6">
                <div className="h-full bg-gradient-to-r from-avax-red to-arena-purple rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
              </div>

              {/* Timer bar */}
              <div className="h-1 bg-white/10 rounded-full">
                <div className={cn("h-full rounded-full transition-all duration-1000", timeLeft <= 10 ? "bg-red-500" : "bg-avax-red")} style={{ width: `${(timeLeft / 30) * 100}%` }} />
              </div>

              {/* Question */}
              <AnimatePresence mode="wait">
                <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass-card p-6 rounded-2xl">
                  <p className="text-white text-xl font-semibold text-center leading-relaxed">{questions[currentQ]?.q}</p>
                </motion.div>
              </AnimatePresence>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {questions[currentQ]?.options.map((opt, i) => {
                  const isCorrect = i === questions[currentQ]?.answer;
                  const isSelected = i === selected;
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={selected !== null}
                      className={cn(
                        "p-4 rounded-xl text-left text-sm font-medium transition-all duration-200 border",
                        selected === null ? "glass-card border-white/10 text-white hover:border-arena-purple/40 hover:scale-[1.02]"
                        : isCorrect ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : isSelected ? "bg-red-500/20 border-red-500 text-red-300"
                        : "glass-card border-white/[0.06] text-slate-500"
                      )}
                    >
                      <span className="font-mono text-xs opacity-60 mr-2">{["A", "B", "C", "D"][i]}.</span>
                      {opt}
                      {selected !== null && isCorrect && <CheckCircle className="inline ml-2 text-emerald-400" size={14} />}
                      {selected !== null && isSelected && !isCorrect && <XCircle className="inline ml-2 text-red-400" size={14} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Result */}
          {gameState === "result" && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card neon-border-red p-8 rounded-2xl text-center">
              <div className="text-5xl mb-4">{answers.filter((a) => a.correct).length >= questions.length * 0.7 ? "🏆" : "📊"}</div>
              <h2 className="text-3xl font-black text-white mb-2">Mission Complete!</h2>

              {/* Accuracy */}
              <div className="text-6xl font-black bg-gradient-to-r from-avax-red to-arena-purple bg-clip-text text-transparent mb-1">
                {Math.round((answers.filter((a) => a.correct).length / Math.max(answers.length, 1)) * 100)}%
              </div>
              <p className="text-slate-400 mb-6">Accuracy — {answers.filter((a) => a.correct).length}/{answers.length} correct</p>

              {/* Score breakdown */}
              {submitMutation.data && (
                <div className="glass-card p-4 rounded-xl mb-6 space-y-2 text-left">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">XP Earned</span>
                    <span className="text-arena-gold font-bold">+{submitMutation.data.xpEarned}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Score</span>
                    <span className="text-white font-bold">{submitMutation.data.attempt?.score?.toLocaleString()}</span>
                  </div>
                  {submitMutation.data.badge && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Badge</span>
                      <span className="text-arena-gold">{submitMutation.data.badge.emoji} {submitMutation.data.badge.title}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={startGame} className="flex-1 flex items-center justify-center gap-2 border border-white/10 text-white py-3 rounded-xl hover:bg-white/[0.04]">
                  <Zap size={16} /> Play Again
                </button>
                <button onClick={() => router.push("/library")} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold py-3 rounded-xl">
                  <Trophy size={16} /> More Games
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
