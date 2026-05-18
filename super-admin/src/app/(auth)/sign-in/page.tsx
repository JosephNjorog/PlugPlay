"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Crown, Eye, EyeOff, Lock, Mail, ShieldAlert } from "lucide-react";

export default function SuperAdminSignIn() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Access denied. Super admin credentials required.");
    } else {
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen bg-[#060610] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-arena-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 left-1/4 w-64 h-64 bg-avax-red/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Crown header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-arena-gold to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-glow-gold crown-glow">
            <Crown size={32} className="text-black" />
          </div>
          <h1 className="text-white font-black text-2xl">Super Admin</h1>
          <p className="text-slate-500 text-sm mt-1">Restricted — authorized access only</p>
        </div>

        {/* Warning banner */}
        <div className="flex items-center gap-2 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 mb-6">
          <ShieldAlert size={15} className="text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-xs">This panel is for the platform owner only. All access attempts are logged.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="owner@example.com"
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-arena-gold/40 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••••••"
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-10 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-arena-gold/40 transition-colors"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5">
              <ShieldAlert size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-arena-gold to-amber-600 text-black font-black py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Crown size={16} /> Access Panel
              </>
            )}
          </button>
        </form>

        <p className="text-center text-slate-700 text-xs mt-6">
          Plug n' Play Arena · Super Admin Panel v1.0
        </p>
      </div>
    </div>
  );
}
