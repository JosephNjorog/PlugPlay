"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Zap, Lock, CheckCircle2, AlertCircle } from "lucide-react";

function getPasswordStrength(pw: string): "empty" | "weak" | "medium" | "strong" {
  if (!pw) return "empty";
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 1) return "weak";
  if (score <= 3) return "medium";
  return "strong";
}

const strengthCfg = {
  weak:   { label: "Weak",   color: "bg-avax-red",      bars: 1, textColor: "text-avax-red"      },
  medium: { label: "Medium", color: "bg-arena-gold",    bars: 2, textColor: "text-arena-gold"    },
  strong: { label: "Strong", color: "bg-arena-emerald", bars: 3, textColor: "text-arena-emerald" },
};

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const strength = getPasswordStrength(newPassword);
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  if (!token) {
    return (
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-avax-red mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Invalid link</h2>
        <p className="text-white/50 text-sm mb-6">This password reset link is invalid or missing a token.</p>
        <Link href="/forgot-password" className="text-arena-purple-light hover:text-white text-sm font-medium transition-colors">
          Request a new link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
    if (newPassword.length < 8) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
      toast.success("Password updated! Sign in with your new password.");
      setTimeout(() => router.push("/sign-in"), 2500);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    return (
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
        <h2 className="text-xl font-bold text-white mb-2">Password updated!</h2>
        <p className="text-white/50 text-sm">Redirecting you to sign in…</p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Set new password</h2>
        <p className="text-white/50 text-sm mt-1">Must be at least 8 characters.</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 p-3 rounded-xl bg-avax-red/10 border border-avax-red/20 text-avax-red text-sm mb-4"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New password */}
        <div className="space-y-1.5">
          <label htmlFor="newPassword" className="text-sm font-medium text-white/70">New password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              id="newPassword"
              type={showNew ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              required
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pl-10 pr-12 text-sm text-white placeholder-white/25 outline-none transition-all duration-200 focus:bg-white/[0.07] focus:border-arena-purple/50 focus:shadow-[0_0_0_2px_rgba(124,58,237,0.15)] disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {/* Strength bar */}
          <AnimatePresence>
            {newPassword && strength !== "empty" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1"
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strengthCfg[strength].bars ? strengthCfg[strength].color : "bg-white/10"}`} />
                  ))}
                </div>
                <p className={`text-xs font-medium ${strengthCfg[strength].textColor}`}>{strengthCfg[strength].label} password</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-white/70">Confirm new password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
              className={`w-full bg-white/[0.04] border rounded-xl py-3 pl-10 pr-12 text-sm text-white placeholder-white/25 outline-none transition-all duration-200 focus:bg-white/[0.07] disabled:opacity-60 ${mismatch ? "border-avax-red/60" : "border-white/[0.08] focus:border-arena-purple/50 focus:shadow-[0_0_0_2px_rgba(124,58,237,0.15)]"}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <AnimatePresence>
            {mismatch && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-avax-red"
              >
                Passwords don't match
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading || newPassword.length < 8 || mismatch || !confirmPassword}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating…
            </>
          ) : (
            "Update password"
          )}
        </motion.button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen bg-[#080810] flex items-center justify-center overflow-hidden p-4">
      <div className="fixed inset-0 hero-grid-bg opacity-40" aria-hidden />
      <div className="fixed -top-40 -right-40 w-96 h-96 rounded-full bg-arena-purple/10 blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-40 -left-40 w-96 h-96 rounded-full bg-avax-red/10 blur-[120px] pointer-events-none" />

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

          <Suspense fallback={<div className="text-white/50 text-sm text-center">Loading…</div>}>
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
            <Link href="/sign-in" className="text-sm text-white/40 hover:text-white/70 transition-colors">
              Back to sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
