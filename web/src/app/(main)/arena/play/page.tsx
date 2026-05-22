"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Zap, Trophy, CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { getPusherClient, arenaChannel, ARENA_EVENTS } from "@/lib/pusher";

interface Question {
  questionId: string;
  question: string;
  options: string[];
  roundIndex: number;
  timeLimit: number;
}

interface LeaderboardEntry {
  id: string;
  nickname: string;
  score: number;
  rank: number;
  correctAnswers: number;
}

interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: number;
  explanation?: string;
  pointsEarned: number;
}

function ArenaPlayContent() {
  const params = useSearchParams();
  const code = params.get("code") || "";
  const playerId = params.get("playerId") || "";

  const [question, setQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [gameStatus, setGameStatus] = useState<"waiting" | "playing" | "answering" | "ended">("waiting");
  const [startTime, setStartTime] = useState(0);
  const [finalLeaderboard, setFinalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerCount, setPlayerCount] = useState(0);

  const submitAnswer = useCallback(
    async (answer: number) => {
      if (!question || selectedAnswer !== null) return;
      const responseTimeMs = Date.now() - startTime;
      setSelectedAnswer(answer);
      setGameStatus("answering");

      try {
        const res = await fetch(`/api/arena/sessions/${code}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId,
            questionId: question.questionId,
            answer,
            responseTimeMs,
          }),
        });
        const result: AnswerResult = await res.json();
        setAnswerResult(result);
        setTotalScore((prev) => prev + result.pointsEarned);
        if (result.isCorrect) toast.success(`+${result.pointsEarned} pts! 🎯`);
        else toast.error("Wrong answer");
      } catch {
        toast.error("Connection error");
      }
    },
    [question, selectedAnswer, code, playerId, startTime]
  );

  useEffect(() => {
    if (!code) return;
    const pusher = getPusherClient();
    const ch = pusher.subscribe(arenaChannel(code));

    ch.bind(ARENA_EVENTS.PLAYER_JOINED, (data: { playerCount?: number }) => {
      if (data?.playerCount !== undefined) setPlayerCount(data.playerCount);
    });

    ch.bind(ARENA_EVENTS.SESSION_STARTED, () => {
      setGameStatus("playing");
      toast.success("Game started! Get ready!");
    });

    ch.bind(ARENA_EVENTS.QUESTION_PUSHED, (q: Question) => {
      setQuestion(q);
      setSelectedAnswer(null);
      setAnswerResult(null);
      setTimeLeft(q.timeLimit);
      setRoundIndex(q.roundIndex);
      setGameStatus("playing");
      setStartTime(Date.now());
    });

    ch.bind(ARENA_EVENTS.LEADERBOARD_UPDATE, (data: { leaderboard: LeaderboardEntry[] }) => {
      setLeaderboard(data.leaderboard);
    });

    ch.bind(ARENA_EVENTS.SESSION_ENDED, (data: { leaderboard?: LeaderboardEntry[]; message?: string }) => {
      setGameStatus("ended");
      if (data?.leaderboard?.length) {
        setFinalLeaderboard(data.leaderboard);
      }
    });

    ch.bind(ARENA_EVENTS.SESSION_RESTARTED, () => {
      setGameStatus("waiting");
      setQuestion(null);
      setSelectedAnswer(null);
      setAnswerResult(null);
      setTotalScore(0);
      setRoundIndex(0);
      setFinalLeaderboard([]);
      setPlayerCount(0);
      toast.info("Session restarted — waiting for host to start again");
    });

    return () => pusher.unsubscribe(arenaChannel(code));
  }, [code]);

  useEffect(() => {
    if (!question || gameStatus !== "playing" || selectedAnswer !== null) return;
    if (timeLeft <= 0) {
      submitAnswer(-1); // No answer selected
      return;
    }
    const t = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, question, gameStatus, selectedAnswer, submitAnswer]);

  const optionLabels = ["A", "B", "C", "D"];
  const timeProgress = question ? (timeLeft / question.timeLimit) * 100 : 100;

  return (
    <div className="min-h-screen bg-[#080810] flex">
      {/* Main game area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {gameStatus === "waiting" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-avax-red to-arena-purple flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse-glow">⚡</div>
            <h2 className="text-2xl font-bold text-white mb-2">Waiting for host...</h2>
            <p className="text-slate-400 mb-4">Code: <span className="font-mono font-bold text-white">{code}</span></p>

            {playerCount > 0 && (
              <motion.div key={playerCount} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-full px-4 py-2 mb-4">
                <Users size={14} className="text-arena-cyan" />
                <span className="text-arena-cyan font-bold">{playerCount}</span>
                <span className="text-slate-400 text-sm">player{playerCount !== 1 ? "s" : ""} joined</span>
              </motion.div>
            )}

            <div className="flex gap-1 justify-center mt-2">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-arena-purple" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }} />
              ))}
            </div>
          </motion.div>
        )}

        {(gameStatus === "playing" || gameStatus === "answering") && question && (
          <div className="w-full max-w-2xl">
            {/* Timer bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Question {roundIndex + 1}</span>
                <span className={`flex items-center gap-1 font-bold tabular-nums ${timeLeft <= 5 ? "text-red-400" : "text-white"}`}>
                  <Clock size={14} />
                  {timeLeft}s
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full transition-colors ${timeLeft <= 5 ? "bg-red-500" : "bg-gradient-to-r from-avax-red to-arena-purple"}`}
                  style={{ width: `${timeProgress}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </div>
            </div>

            {/* Question */}
            <motion.div
              key={question.questionId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-2xl mb-6 text-center"
            >
              <p className="text-white text-xl font-semibold leading-relaxed">{question.question}</p>
            </motion.div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {question.options.map((option, i) => {
                let variant = "default";
                if (selectedAnswer !== null && answerResult) {
                  if (i === answerResult.correctAnswer) variant = "correct";
                  else if (i === selectedAnswer && !answerResult.isCorrect) variant = "wrong";
                }
                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => selectedAnswer === null && submitAnswer(i)}
                    disabled={selectedAnswer !== null}
                    className={`relative p-4 rounded-xl text-left font-medium transition-all duration-200 ${
                      variant === "correct"
                        ? "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300"
                        : variant === "wrong"
                        ? "bg-red-500/20 border-2 border-red-500 text-red-300"
                        : selectedAnswer !== null
                        ? "bg-white/[0.03] border border-white/[0.06] text-slate-500"
                        : "bg-white/[0.05] border border-white/10 text-white hover:bg-white/[0.1] hover:border-arena-purple/40 hover:scale-[1.02]"
                    }`}
                  >
                    <span className="text-xs font-mono mr-2 opacity-60">{optionLabels[i]}.</span>
                    {option}
                    {variant === "correct" && <CheckCircle className="absolute top-2 right-2 text-emerald-400" size={16} />}
                    {variant === "wrong" && <XCircle className="absolute top-2 right-2 text-red-400" size={16} />}
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {answerResult?.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="glass-card p-4 rounded-xl border border-arena-purple/30 text-slate-300 text-sm"
                >
                  💡 {answerResult.explanation}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {gameStatus === "ended" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">🏆</div>
              <h2 className="text-3xl font-black text-white mb-1">Game Over!</h2>
              <p className="text-slate-400 text-sm">Final Results</p>
            </div>

            {finalLeaderboard.length > 0 ? (
              <div className="glass-card rounded-2xl overflow-hidden">
                {/* Top 3 podium */}
                {finalLeaderboard.slice(0, 3).map((entry, i) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const isMe = entry.id === playerId;
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] ${
                        isMe ? "bg-avax-red/10" : i === 0 ? "bg-arena-gold/5" : "bg-white/[0.02]"
                      }`}
                    >
                      <span className="text-2xl w-8">{medals[i]}</span>
                      <div className="flex-1">
                        <span className={`font-bold ${isMe ? "text-avax-red" : "text-white"}`}>
                          {entry.nickname}{isMe && " (you)"}
                        </span>
                        <p className="text-slate-500 text-xs">{entry.correctAnswers} correct</p>
                      </div>
                      <span className="font-mono font-black text-arena-gold text-lg">{entry.score.toLocaleString()}</span>
                    </motion.div>
                  );
                })}

                {/* Rest of leaderboard */}
                <div className="max-h-48 overflow-y-auto">
                  {finalLeaderboard.slice(3).map((entry, i) => {
                    const isMe = entry.id === playerId;
                    return (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-3 px-5 py-3 border-b border-white/[0.04] ${isMe ? "bg-avax-red/10" : ""}`}
                      >
                        <span className="text-slate-500 text-sm w-8">#{entry.rank}</span>
                        <span className={`flex-1 text-sm ${isMe ? "text-avax-red font-bold" : "text-slate-300"}`}>
                          {entry.nickname}{isMe && " (you)"}
                        </span>
                        <span className="font-mono text-sm text-slate-400">{entry.score.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>

                {/* My score footer */}
                <div className="px-5 py-4 flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Your score</span>
                  <span className="text-2xl font-black text-white">{totalScore.toLocaleString()} <span className="text-sm text-slate-400">pts</span></span>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="text-5xl font-black text-arena-gold mb-1">{totalScore.toLocaleString()}</div>
                <p className="text-slate-400 text-sm">pts</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Live leaderboard sidebar */}
      <div className="w-64 hidden lg:flex flex-col glass-card border-l border-white/[0.06] p-4">
        <h3 className="text-white font-bold flex items-center gap-2 mb-4">
          <Trophy size={16} className="text-arena-gold" />
          Live Rankings
        </h3>
        <div className="space-y-2 flex-1 overflow-y-auto">
          {leaderboard.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-2 p-2.5 rounded-lg ${
                entry.id === playerId ? "bg-avax-red/10 border border-avax-red/20" : "bg-white/[0.03]"
              }`}
            >
              <span className="text-slate-500 text-xs w-4">#{entry.rank}</span>
              <span className="text-white text-sm flex-1 truncate font-medium">{entry.nickname}</span>
              <span className="text-arena-gold font-mono text-xs">{entry.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-avax-red" />
            <span className="text-slate-400 text-sm">My score: <span className="text-white font-bold">{totalScore.toLocaleString()}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ArenaPlayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080810] flex items-center justify-center text-white">Loading arena...</div>}>
      <ArenaPlayContent />
    </Suspense>
  );
}
