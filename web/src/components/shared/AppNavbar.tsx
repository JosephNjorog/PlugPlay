"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  Map,
  BookOpen,
  Calendar,
  Swords,
  Trophy,
  LogOut,
  User,
  Gift,
  ShieldCheck,
  Menu,
  X,
  Zap,
  ChevronDown,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ProfileData {
  id: string;
  username: string;
  emoji: string;
  xp: number;
  level: number;
  stage: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  onboardingDone: boolean;
}

// ─── Nav links config ──────────────────────────────────────────────────────────
const NAV_LINKS = [
  { href: "/journey", label: "Journey", icon: Map },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/arena/join", label: "Arena", icon: Swords },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
] as const;

// XP thresholds per level (simple linear: 500 * level)
function xpForLevel(level: number) {
  return level * 500;
}

function xpProgress(xp: number, level: number) {
  const prevThreshold = xpForLevel(level - 1);
  const nextThreshold = xpForLevel(level);
  const current = xp - prevThreshold;
  const range = nextThreshold - prevThreshold;
  return Math.min(Math.max(current / range, 0), 1);
}

// ─── Animated XP number ────────────────────────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  const motionVal = useMotionValue(value);
  const springVal = useSpring(motionVal, { stiffness: 60, damping: 20 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    const unsub = springVal.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [springVal]);

  return <span>{display.toLocaleString()}</span>;
}

// ─── XP Progress Ring ──────────────────────────────────────────────────────────
function XPRing({
  xp,
  level,
  progress,
}: {
  xp: number;
  level: number;
  progress: number;
}) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * progress;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="48" height="48" className="-rotate-90">
        {/* Track */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="3"
        />
        {/* Progress */}
        <motion.circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="url(#xpGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - dash }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
        <defs>
          <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E84142" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>
      {/* Level badge in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white">{level}</span>
      </div>
    </div>
  );
}

// ─── XP Badge ─────────────────────────────────────────────────────────────────
function XPBadge({ profile }: { profile: ProfileData }) {
  const progress = xpProgress(profile.xp, profile.level);
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-colors cursor-default">
      <XPRing xp={profile.xp} level={profile.level} progress={progress} />
      <div className="hidden sm:block">
        <div className="flex items-center gap-1 text-xs font-semibold text-white">
          <Zap className="w-3 h-3 text-arena-gold" />
          <AnimatedNumber value={profile.xp} />
          <span className="text-white/40">XP</span>
        </div>
        <p className="text-[10px] text-white/40 capitalize">{profile.stage}</p>
      </div>
    </div>
  );
}

// ─── User dropdown ─────────────────────────────────────────────────────────────
function UserDropdown({
  profile,
  isOpen,
  onClose,
}: {
  profile: ProfileData;
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    onClose();
    await signOut({ redirect: false });
    router.push("/sign-in");
  };

  const items = [
    { icon: User, label: "Profile", href: "/profile" },
    { icon: Gift, label: "Rewards", href: "/rewards" },
    ...(profile.isAdmin || profile.isSuperAdmin
      ? [{ icon: ShieldCheck, label: "Admin", href: "/admin" }]
      : []),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-52 z-50 glass-card rounded-2xl border border-white/[0.1] shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_30px_rgba(124,58,237,0.1)] overflow-hidden"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-avax-red/20 to-arena-purple/20 flex items-center justify-center text-xl border border-white/10">
                  {profile.emoji}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {profile.username}
                  </p>
                  <p className="text-xs text-white/40 capitalize">{profile.stage}</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              {items.map(({ icon: Icon, label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  <Icon className="w-4 h-4 text-white/40" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Sign out */}
            <div className="py-1 border-t border-white/[0.06]">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-avax-red/80 hover:text-avax-red hover:bg-avax-red/[0.05] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Mobile nav ────────────────────────────────────────────────────────────────
function MobileMenu({
  isOpen,
  onClose,
  pathname,
  profile,
}: {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  profile: ProfileData | undefined;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    onClose();
    await signOut({ redirect: false });
    router.push("/sign-in");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-72 z-50 bg-[#0d0d1a] border-l border-white/[0.08] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-avax-red" fill="currentColor" />
                <span className="font-bold text-white text-sm">Menu</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User badge */}
            {profile && (
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-avax-red/20 to-arena-purple/20 flex items-center justify-center text-2xl border border-white/10">
                    {profile.emoji}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{profile.username}</p>
                    <div className="flex items-center gap-1 text-xs text-white/50">
                      <Zap className="w-3 h-3 text-arena-gold" />
                      <span>{profile.xp.toLocaleString()} XP</span>
                      <span className="text-white/30">·</span>
                      <span className="capitalize">{profile.stage}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Nav links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-avax-red/10 text-avax-red border border-avax-red/20"
                        : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {label}
                  </Link>
                );
              })}

              {/* Admin link (mobile) */}
              {profile?.isAdmin && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-arena-purple-light hover:bg-arena-purple/10 transition-all"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Admin
                </Link>
              )}
            </nav>

            {/* Bottom actions */}
            <div className="px-3 py-4 border-t border-white/[0.06] space-y-1">
              <Link
                href="/profile"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <Link
                href="/rewards"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <Gift className="w-4 h-4" />
                Rewards
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-avax-red/70 hover:text-avax-red hover:bg-avax-red/[0.05] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Navbar ───────────────────────────────────────────────────────────────
export function AppNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: profile } = useQuery<ProfileData>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      return res.json();
    },
    enabled: !!session?.user,
    staleTime: 30 * 1000,
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-30 h-16"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-[#080810]/80 backdrop-blur-xl border-b border-white/[0.06]" />

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* ── Logo ── */}
          <Link
            href="/journey"
            className="flex items-center gap-2.5 flex-shrink-0 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-avax-red/30 to-arena-purple/30 flex items-center justify-center border border-white/10 group-hover:shadow-glow-red transition-all duration-300">
              <Zap
                className="w-4 h-4 text-avax-red group-hover:text-avax-red transition-colors"
                fill="currentColor"
              />
            </div>
            <span className="font-bold text-white hidden sm:block text-sm leading-tight">
              Plug n&apos; Play
              <span className="gradient-text"> Arena</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href ||
                (href !== "/journey" && pathname.startsWith(href + "/"));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-white bg-white/[0.06]"
                      : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-avax-red rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Right Side ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* XP Badge */}
            {profile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <XPBadge profile={profile} />
              </motion.div>
            )}

            {/* User Avatar + Dropdown */}
            <div ref={dropdownRef} className="relative hidden sm:block">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                {/* Emoji avatar */}
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-avax-red/20 to-arena-purple/20 flex items-center justify-center text-base border border-white/10 flex-shrink-0">
                  {profile?.emoji ?? session?.user?.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <span className="text-sm font-medium text-white/80 hidden md:block max-w-[80px] truncate">
                  {profile?.username ?? session?.user?.name ?? "…"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </motion.button>

              {profile && (
                <UserDropdown
                  profile={profile}
                  isOpen={dropdownOpen}
                  onClose={() => setDropdownOpen(false)}
                />
              )}
            </div>

            {/* Mobile hamburger */}
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/[0.05] text-white/60 hover:text-white transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
        profile={profile}
      />
    </>
  );
}
