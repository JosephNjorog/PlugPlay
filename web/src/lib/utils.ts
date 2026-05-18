import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatXP(xp: number): string {
  if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(1)}M`;
  if (xp >= 1_000) return `${(xp / 1_000).toFixed(1)}K`;
  return xp.toString();
}

export function getStageFromXP(xp: number): string {
  if (xp >= 10000) return "leader";
  if (xp >= 5000) return "validator";
  if (xp >= 2000) return "builder";
  if (xp >= 500) return "explorer";
  return "newcomer";
}

export function getLevelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function getXPToNextLevel(xp: number): { current: number; needed: number; progress: number } {
  const level = getLevelFromXP(xp);
  const current = (level - 1) ** 2 * 100;
  const needed = level ** 2 * 100;
  return {
    current: xp - current,
    needed: needed - current,
    progress: Math.round(((xp - current) / (needed - current)) * 100),
  };
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case "legendary": return "text-amber-400";
    case "rare": return "text-violet-400";
    default: return "text-slate-400";
  }
}

export function getRarityGlow(rarity: string): string {
  switch (rarity) {
    case "legendary": return "shadow-glow-gold";
    case "rare": return "shadow-glow-purple";
    default: return "";
  }
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "advanced": return "text-red-400 bg-red-400/10 border-red-400/20";
    case "intermediate": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    default: return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  }
}

export function getPersonaColor(persona: string): string {
  switch (persona) {
    case "developer": return "from-cyan-500 to-blue-600";
    case "builder": return "from-emerald-500 to-teal-600";
    case "founder": return "from-amber-500 to-orange-600";
    case "business": return "from-purple-500 to-violet-600";
    default: return "from-pink-500 to-rose-600";
  }
}

export function generateArenaCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function truncateAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
