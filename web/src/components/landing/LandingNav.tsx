"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, Trophy, BookOpen, Calendar, ChevronRight } from "lucide-react";

const navLinks = [
  { label: "Journey", href: "/journey", icon: Zap },
  { label: "Library", href: "/library", icon: BookOpen },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
];

export function LandingNav() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#080810]/90 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-avax-red to-arena-purple flex items-center justify-center shadow-glow-red group-hover:shadow-glow-purple transition-all duration-300">
              <span className="text-sm font-bold">P</span>
            </div>
            <span className="font-bold text-lg">
              <span className="text-white">Plug</span>
              <span className="text-avax-red">n'</span>
              <span className="text-white">Play</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <Link
                href="/journey"
                className="flex items-center gap-2 bg-gradient-to-r from-avax-red to-arena-purple text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all duration-200 shadow-glow-red"
              >
                <Zap size={14} />
                Play Now
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/[0.06] transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="flex items-center gap-2 bg-gradient-to-r from-avax-red to-arena-purple text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all duration-200 shadow-glow-red"
                >
                  Get Started
                  <ChevronRight size={14} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0d0d1a]/95 backdrop-blur-xl border-b border-white/[0.06]"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06]"
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
              <div className="pt-3 space-y-2">
                {session ? (
                  <Link
                    href="/journey"
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-avax-red to-arena-purple text-white font-semibold py-3 rounded-xl"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Zap size={16} />
                    Play Now
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      className="flex items-center justify-center w-full border border-white/10 text-white py-3 rounded-xl"
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-avax-red to-arena-purple text-white font-semibold py-3 rounded-xl"
                      onClick={() => setMobileOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
