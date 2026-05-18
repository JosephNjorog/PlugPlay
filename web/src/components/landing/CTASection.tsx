"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Zap, Trophy } from "lucide-react";

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-avax-red/8 via-arena-purple/8 to-arena-cyan/5" />
      <div className="absolute inset-0 hero-grid-bg opacity-40" />

      {/* Glowing orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-arena-purple/5 rounded-full blur-[150px]" />
      <div className="absolute top-0 left-0 w-80 h-80 bg-avax-red/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-arena-cyan/5 rounded-full blur-[100px]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-6 animate-float">🎮</div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            Ready to{" "}
            <span className="bg-gradient-to-r from-avax-red via-arena-purple-light to-arena-cyan bg-clip-text text-transparent">
              Plug In?
            </span>
          </h2>
          <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto">
            Join thousands of Web3 learners who are earning real NFT badges while mastering the Avalanche ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="group flex items-center justify-center gap-3 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold text-xl px-10 py-5 rounded-2xl shadow-glow-red hover:shadow-glow-purple transition-all duration-300 hover:scale-105"
            >
              <Zap size={20} className="group-hover:rotate-12 transition-transform" />
              Start for Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/leaderboard"
              className="flex items-center justify-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white font-bold text-xl px-10 py-5 rounded-2xl transition-all duration-300"
            >
              <Trophy size={20} className="text-arena-gold" />
              View Leaderboard
            </Link>
          </div>

          <p className="mt-8 text-slate-600 text-sm">No wallet required to start. Connect later to mint your NFT badges.</p>
        </motion.div>
      </div>
    </section>
  );
}
