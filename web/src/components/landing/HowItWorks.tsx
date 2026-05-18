"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { UserCheck, Gamepad2, Trophy, Cpu } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserCheck,
    title: "Choose Your Persona",
    description: "Pick from Student, Developer, Builder, Founder, or Business. Your persona shapes every mission, challenge, and event surfaced on your journey.",
    color: "from-avax-red to-rose-600",
    glow: "shadow-glow-red",
    delay: 0,
  },
  {
    step: "02",
    icon: Gamepad2,
    title: "Play Missions & Games",
    description: "Tackle a growing library of quizzes, arcade games, simulations, and team challenges — all built around real Avalanche concepts.",
    color: "from-arena-purple to-violet-600",
    glow: "shadow-glow-purple",
    delay: 0.15,
  },
  {
    step: "03",
    icon: Cpu,
    title: "Race On-Chain Speedruns",
    description: "Deploy contracts on Fuji, bridge assets, and verify your on-chain transactions through the Snowtrace API to complete advanced challenges.",
    color: "from-arena-cyan to-blue-600",
    glow: "shadow-glow-cyan",
    delay: 0.3,
  },
  {
    step: "04",
    icon: Trophy,
    title: "Earn & Compete",
    description: "Collect XP, level up through 5 stages, mint real NFT badges on Fuji, and compete in live Arena sessions hosted at IRL events and hackathons.",
    color: "from-arena-gold to-orange-600",
    glow: "shadow-glow-gold",
    delay: 0.45,
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 relative">
      <div className="absolute inset-0 hero-grid-bg opacity-30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-arena-cyan text-sm font-semibold tracking-widest uppercase">How It Works</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
            Four Steps to{" "}
            <span className="bg-gradient-to-r from-arena-cyan to-arena-purple-light bg-clip-text text-transparent">
              Mastery
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            A structured journey from blockchain newcomer to on-chain expert.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: step.delay }}
                className="glass-card-hover p-6 rounded-2xl relative group"
              >
                {/* Connector line (desktop) */}
                <div className="hidden lg:block absolute top-8 right-0 w-full h-px bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />

                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center ${step.glow} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <span className="text-5xl font-black text-white/[0.04] group-hover:text-white/[0.07] transition-colors font-mono">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-white font-bold text-lg mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
