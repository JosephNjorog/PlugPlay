"use client";

import { use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trophy, Users, Zap, Target, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function ResultsContent({ code }: { code: string }) {
  const searchParams = useSearchParams();
  const myPlayerId = searchParams.get("playerId") ?? "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["arena-leaderboard", code],
    queryFn: () => fetch(`/api/arena/sessions/${code}/leaderboard`).then((r) => r.json()),
    staleTime: 60_000,
  });

  const handleShare = () => {
    const url = `${window.location.origin}/arena/results/${code}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Results link copied!")).catch(() => {});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-arena-purple/30 border-t-arena-purple rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading results…</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.session) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-white font-bold text-xl mb-2">Session not found</h2>
          <p className="text-slate-400 text-sm mb-6">Code <span className="font-mono text-white">{code}</span> doesn't exist.</p>
          <Link href="/arena" className="text-arena-cyan underline text-sm">Back to Arena</Link>
        </div>
      </div>
    );
  }

  const { session, leaderboard, stats } = data;
  const myEntry = leaderboard.find((p: any) => p.id === myPlayerId);
  const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-[#080810] p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">

        {/* Back + Share */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/arena" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
            <ArrowLeft size={14} /> Back to Arena
          </Link>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all"
          >
            <Share2 size={13} /> Share Results
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="text-3xl font-black text-white mb-1">Final Results</h1>
          <p className="text-slate-400 text-sm capitalize">
            {(session.topic ?? "").replace(/_/g, " ")} · Code:{" "}
            <span className="font-mono font-bold text-white">{session.code}</span>
          </p>
          {session.createdAt && (
            <p className="text-slate-600 text-xs mt-1">
              {format(new Date(session.createdAt), "MMMM d, yyyy · HH:mm")}
            </p>
          )}
        </div>

        {/* My result card (if player) */}
        {myEntry && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 rounded-2xl border border-avax-red/30 mb-6"
          >
            <p className="text-slate-400 text-xs mb-2 font-medium uppercase tracking-wider">Your Result</p>
            <div className="flex items-center gap-4">
              <div className="text-4xl">{medals[myEntry.rank] ?? `#${myEntry.rank}`}</div>
              <div className="flex-1">
                <div className="text-white font-bold text-lg">{myEntry.nickname}</div>
                <div className="text-slate-400 text-sm">
                  {myEntry.correctAnswers} correct · {myEntry.answersSubmitted} answered
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-arena-gold">{myEntry.score.toLocaleString()}</div>
                <div className="text-slate-500 text-xs">pts</div>
              </div>
            </div>
            {myEntry.rank > 3 && (
              <div className="mt-3 pt-3 border-t border-white/[0.06] text-xs text-slate-500">
                Top {Math.round((myEntry.rank / stats.totalPlayers) * 100)}% of {stats.totalPlayers} players
              </div>
            )}
          </motion.div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Users, label: "Players", value: stats.totalPlayers, color: "text-arena-cyan" },
            { icon: Zap,   label: "Rounds",  value: stats.roundsPlayed, color: "text-arena-purple-light" },
            { icon: Target, label: "Top Score", value: stats.topScore.toLocaleString(), color: "text-arena-gold" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="glass-card p-3 rounded-xl text-center">
              <Icon size={14} className={cn("mx-auto mb-1", color)} />
              <div className={cn("font-black text-lg", color)}>{value}</div>
              <div className="text-slate-500 text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Podium */}
        {topThree.length > 0 && (
          <div className="glass-card rounded-2xl overflow-hidden mb-3">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <h2 className="text-white font-bold text-sm flex items-center gap-2">
                <Trophy size={13} className="text-arena-gold" /> Top Players
              </h2>
            </div>
            {topThree.map((p: any, i: number) => {
              const isMe = p.id === myPlayerId;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 border-b border-white/[0.04]",
                    i === 0 ? "bg-arena-gold/5" : "",
                    isMe ? "bg-avax-red/10" : ""
                  )}
                >
                  <span className="text-2xl w-8 text-center">{medals[i + 1]}</span>
                  <div className="flex-1 min-w-0">
                    <div className={cn("font-bold truncate", isMe ? "text-avax-red" : "text-white")}>
                      {p.nickname}{isMe && " (you)"}
                    </div>
                    <div className="text-slate-500 text-xs">{p.correctAnswers}/{p.answersSubmitted} correct</div>
                  </div>
                  <div className={cn("font-mono font-black text-lg", i === 0 ? "text-arena-gold" : "text-white")}>
                    {p.score.toLocaleString()}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Full rankings */}
        {rest.length > 0 && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <h2 className="text-white font-bold text-sm">All Rankings</h2>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {rest.map((p: any) => {
                const isMe = p.id === myPlayerId;
                return (
                  <div
                    key={p.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm",
                      isMe ? "bg-avax-red/10" : "hover:bg-white/[0.02]"
                    )}
                  >
                    <span className="text-slate-500 w-8 text-xs font-mono">#{p.rank}</span>
                    <div className="flex-1 min-w-0">
                      <span className={cn("truncate block font-medium", isMe ? "text-avax-red" : "text-slate-300")}>
                        {p.nickname}{isMe && " (you)"}
                      </span>
                      <span className="text-slate-600 text-xs">{p.correctAnswers}/{p.answersSubmitted} correct</span>
                    </div>
                    <span className={cn("font-mono font-bold", isMe ? "text-white" : "text-slate-400")}>
                      {p.score.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {leaderboard.length === 0 && (
          <div className="text-center py-16 text-slate-500">No players recorded for this session.</div>
        )}

        <div className="mt-8 text-center">
          <Link href="/arena" className="text-arena-cyan text-sm hover:underline">Join another session →</Link>
        </div>
      </div>
    </div>
  );
}

export default function ArenaResultsPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080810] flex items-center justify-center text-white">Loading…</div>}>
      <ResultsContent code={code.toUpperCase()} />
    </Suspense>
  );
}
