"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Zap, ArrowRight, Lock, Mail } from "lucide-react";

// ─── Schema ────────────────────────────────────────────────────────────────────
const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignInValues = z.infer<typeof signInSchema>;

// ─── Particle ──────────────────────────────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  drift: number;
}

function BackgroundParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = [
      "rgba(232,65,66,0.7)",
      "rgba(124,58,237,0.7)",
      "rgba(6,182,212,0.7)",
      "rgba(245,158,11,0.5)",
    ];
    const generated: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 8,
      drift: (Math.random() - 0.5) * 120,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{
            y: "-10vh",
            x: p.drift,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Ambient glow orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-avax-red/10 blur-[120px] animate-pulse-glow" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-arena-purple/10 blur-[120px] animate-float" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-arena-cyan/5 blur-[100px] animate-float-delayed" />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInValues) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials", {
          description: "Please check your email and password.",
        });
        return;
      }

      if (result?.ok) {
        toast.success("Welcome back!", { description: "Loading your arena..." });
        // Fetch session to check onboardingDone
        const res = await fetch("/api/profile");
        if (res.ok) {
          const profile = await res.json();
          router.push(profile.onboardingDone ? "/journey" : "/onboarding");
        } else {
          router.push("/journey");
        }
      }
    } catch {
      toast.error("Something went wrong", {
        description: "Please try again in a moment.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080810] flex items-center justify-center overflow-hidden">
      {/* Grid background */}
      <div className="fixed inset-0 hero-grid-bg opacity-40" aria-hidden />
      <BackgroundParticles />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-4 py-8"
      >
        {/* Card */}
        <div className="glass-card p-8 rounded-2xl border border-white/[0.08] shadow-[0_0_60px_rgba(124,58,237,0.15)]">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-avax-red/20 to-arena-purple/20 border border-white/10 mb-4 shadow-glow-red">
              <Zap className="w-8 h-8 text-avax-red" fill="currentColor" />
            </div>
            <h1 className="text-2xl font-bold gradient-text tracking-tight">
              Plug n&apos; Play Arena
            </h1>
            <p className="text-xs text-white/40 mt-1 font-medium tracking-wider uppercase">
              Web3 Learning Platform
            </p>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-white/50 text-sm mt-1">
              Sign in to continue your learning journey
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-white/70"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={isLoading}
                  {...register("email")}
                  className={`w-full bg-white/[0.04] border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all duration-200 focus:bg-white/[0.07] focus:border-arena-purple/50 focus:shadow-[0_0_0_2px_rgba(124,58,237,0.15)] disabled:opacity-60 ${
                    errors.email
                      ? "border-avax-red/60 focus:border-avax-red/80"
                      : "border-white/[0.08]"
                  }`}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-avax-red"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-white/70"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...register("password")}
                  className={`w-full bg-white/[0.04] border rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder-white/25 outline-none transition-all duration-200 focus:bg-white/[0.07] focus:border-arena-purple/50 focus:shadow-[0_0_0_2px_rgba(124,58,237,0.15)] disabled:opacity-60 ${
                    errors.password
                      ? "border-avax-red/60 focus:border-avax-red/80"
                      : "border-white/[0.08]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-avax-red"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 pt-6 border-t border-white/[0.06] text-center"
          >
            <p className="text-sm text-white/40">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="text-arena-purple-light hover:text-white font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Bottom decorative text */}
        <p className="text-center text-xs text-white/20 mt-6">
          Powered by Avalanche &bull; Learn &bull; Build &bull; Earn
        </p>
      </motion.div>
    </div>
  );
}
