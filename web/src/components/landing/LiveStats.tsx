"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

function CountUp({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

const stats = [
  { value: 5247, label: "Active Players", suffix: "+", color: "text-avax-red" },
  { value: 38, label: "Missions & Games", suffix: "", color: "text-arena-purple-light" },
  { value: 12840, label: "NFT Badges Minted", suffix: "+", color: "text-arena-cyan" },
  { value: 7, label: "Live Events Hosted", suffix: "", color: "text-arena-gold" },
  { value: 125, label: "Countries Reached", suffix: "+", color: "text-arena-emerald" },
  { value: 98, label: "Completion Rate %", suffix: "", color: "text-avax-red-light" },
];

export function LiveStats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-avax-red/3 via-arena-purple/5 to-arena-cyan/3" />
      <div className="absolute inset-0 border-y border-white/[0.04]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <div className={`text-3xl sm:text-4xl font-black ${stat.color} tabular-nums`}>
                {inView ? <CountUp end={stat.value} /> : "0"}
                {stat.suffix}
              </div>
              <div className="text-slate-500 text-xs sm:text-sm mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
