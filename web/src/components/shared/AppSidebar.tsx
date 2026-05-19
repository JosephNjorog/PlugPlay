"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, Map, Swords, Calendar,
  Trophy, Gift, User, ShieldCheck, LogOut, Zap,
  ChevronLeft, Menu, X, Settings, TrendingUp,
} from "lucide-react";

interface ProfileData {
  id: string; username: string; emoji: string;
  xp: number; level: number; stage: string; is_admin?: boolean;
}

const NAV = [
  { href: "/journey",     label: "Journey",     icon: Map,              desc: "Your learning path" },
  { href: "/library",     label: "Library",      icon: BookOpen,         desc: "All 38 games" },
  { href: "/arena/join",  label: "Arena",        icon: Swords,           desc: "Live multiplayer" },
  { href: "/events",      label: "Events",       icon: Calendar,         desc: "IRL & virtual" },
  { href: "/leaderboard", label: "Leaderboard",  icon: Trophy,           desc: "Top players" },
  { href: "/rewards",     label: "Rewards",      icon: Gift,             desc: "NFT badges" },
];

const XP_FOR_LEVEL = (lvl: number) => lvl * 500;

function NavItem({ href, label, icon: Icon, active, collapsed }: {
  href: string; label: string; icon: any; active: boolean; collapsed: boolean;
}) {
  return (
    <Link href={href}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
        active
          ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
          : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
      }`}
      title={collapsed ? label : undefined}>
      <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? "text-purple-400" : "text-slate-500 group-hover:text-slate-300"}`} style={{ width: 18, height: 18 }} />
      {!collapsed && <span className="truncate">{label}</span>}
      {active && !collapsed && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
      )}
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: profile } = useQuery<ProfileData>({
    queryKey: ["profile"],
    queryFn: () => fetch("/api/profile").then(r => r.json()),
    enabled: !!session?.user,
    staleTime: 60_000,
  });

  const displayName = profile?.username ?? session?.user?.name ?? "Player";
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const emoji = profile?.emoji ?? "🎮";
  const xpToNext = XP_FOR_LEVEL(level);
  const xpPct = Math.min(100, (xp % xpToNext) / xpToNext * 100);
  const isAdmin = !!(session?.user as any)?.isAdmin || !!profile?.is_admin;

  const sidebarContent = (isMobile = false) => (
    <div className={`flex flex-col h-full ${isMobile ? "w-72" : collapsed ? "w-[72px]" : "w-60"} transition-all duration-200`}>

      {/* Logo + collapse */}
      <div className={`flex items-center h-14 px-3 border-b border-white/[0.06] shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <Link href="/journey" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-md shadow-purple-500/30">
              <Zap className="w-3.5 h-3.5 text-white fill-current" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight">Plug<span className="text-purple-400">n</span>Play</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white fill-current" />
          </div>
        )}
        {!isMobile && (
          <button onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-colors ml-auto">
            <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        )}
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} className="p-1.5 text-slate-400 hover:text-white ml-auto">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User card */}
      <div className={`px-3 py-4 border-b border-white/[0.06] shrink-0 ${collapsed ? "px-2" : ""}`}>
        {collapsed ? (
          <div className="flex justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/[0.10] flex items-center justify-center text-lg">
              {emoji}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/[0.10] flex items-center justify-center text-xl shrink-0">
              {emoji}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{displayName}</p>
              <p className="text-slate-500 text-xs">Level {level} · {profile?.stage ?? "Explorer"}</p>
            </div>
          </div>
        )}
        {!collapsed && (
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-400" />{xp.toLocaleString()} XP</span>
              <span>{xpToNext.toLocaleString()} to lv{level + 1}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
            </div>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {!collapsed && <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase px-3 mb-2">Menu</p>}
        {NAV.map(item => (
          <NavItem key={item.href} {...item} active={pathname.startsWith(item.href)} collapsed={collapsed} />
        ))}

        {isAdmin && (
          <>
            {!collapsed && <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase px-3 mt-4 mb-2">Admin</p>}
            {collapsed && <div className="my-2 border-t border-white/[0.05]" />}
            <NavItem href="/admin" label="Admin Panel" icon={ShieldCheck} active={pathname.startsWith("/admin")} collapsed={collapsed} />
          </>
        )}
      </nav>

      {/* Bottom: profile + sign out */}
      <div className={`border-t border-white/[0.06] px-3 py-3 space-y-0.5 shrink-0`}>
        <NavItem href="/profile" label="Profile" icon={User} active={pathname === "/profile"} collapsed={collapsed} />
        <button onClick={() => signOut({ callbackUrl: "/" })}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-150 ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Sign Out" : undefined}>
          <LogOut style={{ width: 18, height: 18 }} className="shrink-0" />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-[#080810] border-r border-white/[0.06]"
        style={{ width: collapsed ? 72 : 240, transition: "width 0.2s ease" }}>
        {sidebarContent()}
      </aside>

      {/* Mobile: top bar with hamburger */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-[#080810]/90 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4">
        <button onClick={() => setMobileOpen(true)} className="p-2 text-slate-400 hover:text-white transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/journey" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <Zap className="w-3 h-3 text-white fill-current" />
          </div>
          <span className="font-bold text-white text-sm">Plug<span className="text-purple-400">n</span>Play</span>
        </Link>
        <Link href="/profile" className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.10] flex items-center justify-center text-base">
          {emoji}
        </Link>
      </div>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 bg-[#080810] border-r border-white/[0.06] overflow-y-auto">
              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
