"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mail, Loader2, ArrowLeft, Zap, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      toast.error("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080810] flex items-center justify-center overflow-hidden p-4">
      <div className="fixed inset-0 hero-grid-bg opacity-40" aria-hidden />
      <div className="fixed -top-40 -right-40 w-96 h-96 rounded-full bg-arena-purple/10 blur-[120px] animate-pulse-glow pointer-events-none" />
      <div className="fixed -bottom-40 -left-40 w-96 h-96 rounded-full bg-avax-red/10 blur-[120px] animate-float pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card p-8 rounded-2xl border border-white/[0.08] shadow-[0_0_60px_rgba(124,58,237,0.12)]">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-arena-purple/20 to-arena-cyan/20 border border-white/10 mb-4 shadow-glow-purple">
              <Zap className="w-7 h-7 text-arena-purple-light" fill="currentColor" />
            </div>
            <h1 className="text-xl font-bold gradient-text tracking-tight">Plug n' Play Arena</h1>
          </div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-arena-emerald/10 border border-arena-emerald/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-arena-emerald" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                If <span className="text-white/70 font-medium">{email}</span> is registered, we've sent a password reset link. It expires in 1 hour.
              </p>
              <p className="text-white/30 text-xs mb-6">
                Didn't receive it? Check your spam folder or try again with a different email.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-arena-purple-light hover:text-white text-sm font-medium transition-colors"
              >
                Try a different email
              </button>
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Forgot password?</h2>
                <p className="text-white/50 text-sm mt-1">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-white/70">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/25 outline-none transition-all duration-200 focus:bg-white/[0.07] focus:border-arena-purple/50 focus:shadow-[0_0_0_2px_rgba(124,58,237,0.15)] disabled:opacity-60"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading || !email}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </motion.button>
              </form>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
