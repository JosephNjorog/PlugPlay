"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Calendar, Gamepad2, Trophy, Users,
  Swords, FileCheck, Image, ChevronRight, LogOut, Menu, X, Crown, HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/games", label: "Games", icon: Gamepad2 },
  { href: "/admin/questions", label: "Questions", icon: HelpCircle },
  { href: "/admin/challenges", label: "Challenges", icon: Trophy },
  { href: "/admin/players", label: "Players", icon: Users },
  { href: "/admin/arena", label: "Arena", icon: Swords },
  { href: "/admin/submissions", label: "Submissions", icon: FileCheck },
  { href: "/admin/nfts", label: "NFT Mints", icon: Image },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/sign-in"); return; }
    if (status === "authenticated" && !(session?.user as any)?.isAdmin) { router.push("/"); }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-avax-red/30 border-t-avax-red rounded-full animate-spin" />
      </div>
    );
  }

  if (!(session?.user as any)?.isAdmin) return null;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const Sidebar = ({ mobile = false }) => (
    <div className={cn("flex flex-col h-full", mobile ? "p-4" : "p-5")}>
      {/* Logo */}
      <Link href="/admin" className="flex items-center gap-2.5 mb-8" onClick={() => setSidebarOpen(false)}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-avax-red to-arena-purple flex items-center justify-center shadow-glow-red">
          <span className="text-sm font-bold">A</span>
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-none">Plug n' Play</div>
          <div className="text-avax-red text-xs font-medium">Admin Panel</div>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-avax-red/15 text-avax-red-light border border-avax-red/20"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
              )}
            >
              <Icon size={16} className={active ? "text-avax-red" : ""} />
              {label}
              {active && <ChevronRight size={14} className="ml-auto text-avax-red opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user + super admin link */}
      <div className="space-y-2 pt-4 border-t border-white/[0.06]">
        {(session?.user as any)?.isSuperAdmin && (
          <Link
            href="/super-admin"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-arena-gold hover:bg-arena-gold/10 transition-all"
          >
            <Crown size={15} />
            Super Admin
          </Link>
        )}
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-base">
            {(session?.user as any)?.image || "🎮"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{session?.user?.name}</p>
            <p className="text-slate-500 text-xs">Admin</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080810] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 flex-col fixed top-0 left-0 h-full bg-[#0a0a14] border-r border-white/[0.06] z-40">
        <Sidebar />
      </aside>

      {/* Mobile header + drawer */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-[#0a0a14]/95 backdrop-blur-xl border-b border-white/[0.06]">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-avax-red to-arena-purple flex items-center justify-center text-xs font-bold">A</div>
          <span className="text-white font-bold text-sm">Admin</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg text-slate-400 hover:text-white">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-64 bg-[#0a0a14] border-r border-white/[0.06] z-50 lg:hidden"
            >
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 lg:ml-56 pt-14 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
