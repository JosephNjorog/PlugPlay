"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Crown, LayoutDashboard, Users, Calendar, Settings, LogOut, Medal, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/roles", label: "Roles & Admins", icon: Users },
  { href: "/events", label: "Event Approval", icon: Calendar },
  { href: "/leaderboard", label: "Leaderboard", icon: Medal },
  { href: "/activity", label: "Activity Log", icon: Activity },
  { href: "/settings", label: "Settings & NFT", icon: Settings },
];

export default function SuperAdminNav({ user }: { user: any }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="hidden lg:flex w-60 flex-col fixed top-0 left-0 h-full bg-[#0a0a16] border-r border-white/[0.05] z-40">
      <div className="flex flex-col h-full p-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-arena-gold to-amber-600 flex items-center justify-center shadow-glow-gold crown-glow">
            <Crown size={18} className="text-black" />
          </div>
          <div>
            <div className="text-white font-black text-sm leading-none">Plug n' Play</div>
            <div className="text-arena-gold text-xs font-medium">Super Admin</div>
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
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-arena-gold/15 text-arena-gold border border-arena-gold/20"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                <Icon size={16} className={active ? "text-arena-gold" : ""} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="pt-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-arena-gold/20 flex items-center justify-center text-lg">
              {user?.image || "👑"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name || "Owner"}</p>
              <p className="text-arena-gold text-xs">Supreme Owner</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
