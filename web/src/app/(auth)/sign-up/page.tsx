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
import {
  Eye,
  EyeOff,
  Loader2,
  Zap,
  ArrowRight,
  Lock,
  Mail,
  User,
} from "lucide-react";

// ─── Schema ────────────────────────────────────────────────────────────────────
const signUpSchema = z
  .object({
    username: z
      .string()
      .min(2, "Username must be at least 2 characters")
      .max(32, "Username must be 32 characters or less")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

// ─── Password strength ─────────────────────────────────────────────────────────
type StrengthLevel = "empty" | "weak" | "medium" | "strong";

function getPasswordStrength(pw: string): StrengthLevel {
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

const strengthConfig: Record<
  Exclude<StrengthLevel, "empty">,
  { label: string; color: string; bars: number; textColor: string }
> = {
  weak: {
    label: "Weak",
    color: "bg-avax-red",
    bars: 1,
    textColor: "text-avax-red",
  },
  medium: {
    label: "Medium",
    color: "bg-arena-gold",
    bars: 2,
    textColor: "text-arena-gold",
  },
  strong: {
    label: "Strong",
    color: "bg-arena-emerald",
    bars: 3,
    textColor: "text-arena-emerald",
  },
};

function PasswordStrength({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  if (strength === "empty") return null;
  const cfg = strengthConfig[strength];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2 space-y-1.5"
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < cfg.bars ? cfg.color : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${cfg.textColor}`}>{cfg.label} password</p>
    </motion.div>
  );
}

// ─── Particles (reused from sign-in) ─────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
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
      "rgba(16,185,129,0.5)",
    ];
    setParticles(
      Array.from({ length: 25 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 12 + 8,
        delay: Math.random() * 8,
        drift: (Math.random() - 0.5) * 120,
      }))
    );
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
          animate={{ y: "-10vh", x: p.drift, opacity: [0, 1, 1, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-arena-purple/10 blur-[120px] animate-pulse-glow" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-avax-red/10 blur-[120px] animate-float" />
      <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-arena-emerald/5 blur-[100px] animate-float-delayed" />
    </div>
  );
}

// ─── Input wrapper ─────────────────────────────────────────────────────────────
function FormField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-white/70">
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-avax-red"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const passwordValue = watch("password");

  const onSubmit = async (data: SignUpValues) => {
    setIsLoading(true);
    try {
      // 1. Register
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          username: data.username,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error("Registration failed", {
          description: json.error ?? "Please try again.",
        });
        return;
      }

      // 2. Sign in immediately
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Account created but sign-in failed", {
          description: "Please sign in manually.",
        });
        router.push("/sign-in");
        return;
      }

      toast.success("Account created!", {
        description: "Welcome to the Arena. Let's set up your profile.",
      });
      router.push("/onboarding");
    } catch {
      toast.error("Something went wrong", {
        description: "Please try again in a moment.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (hasError?: boolean) =>
    `w-full bg-white/[0.04] border rounded-xl py-3 text-sm text-white placeholder-white/25 outline-none transition-all duration-200 focus:bg-white/[0.07] focus:border-arena-purple/50 focus:shadow-[0_0_0_2px_rgba(124,58,237,0.15)] disabled:opacity-60 ${
      hasError
        ? "border-avax-red/60 focus:border-avax-red/80"
        : "border-white/[0.08]"
    }`;

  return (
    <div className="relative min-h-screen bg-[#080810] flex items-center justify-center overflow-hidden py-10">
      <div className="fixed inset-0 hero-grid-bg opacity-40" aria-hidden />
      <BackgroundParticles />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-4 py-8"
      >
        <div className="glass-card p-8 rounded-2xl border border-white/[0.08] shadow-[0_0_60px_rgba(124,58,237,0.15)]">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-arena-purple/20 to-arena-cyan/20 border border-white/10 mb-4 shadow-glow-purple">
              <Zap className="w-8 h-8 text-arena-purple-light" fill="currentColor" />
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
            <h2 className="text-2xl font-bold text-white">Create your account</h2>
            <p className="text-white/50 text-sm mt-1">
              Join thousands learning Web3 through gameplay
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
            {/* Username */}
            <FormField id="username" label="Username" error={errors.username?.message}>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="your_username"
                  disabled={isLoading}
                  {...register("username")}
                  className={`${inputClass(!!errors.username)} pl-10 pr-4`}
                />
              </div>
            </FormField>

            {/* Email */}
            <FormField id="email" label="Email address" error={errors.email?.message}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={isLoading}
                  {...register("email")}
                  className={`${inputClass(!!errors.email)} pl-10 pr-4`}
                />
              </div>
            </FormField>

            {/* Password */}
            <FormField id="password" label="Password" error={errors.password?.message}>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...register("password")}
                  className={`${inputClass(!!errors.password)} pl-10 pr-12`}
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
                {passwordValue && <PasswordStrength password={passwordValue} />}
              </AnimatePresence>
            </FormField>

            {/* Confirm Password */}
            <FormField
              id="confirmPassword"
              label="Confirm password"
              error={errors.confirmPassword?.message}
            >
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...register("confirmPassword")}
                  className={`${inputClass(!!errors.confirmPassword)} pl-10 pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </FormField>

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
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Terms note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-xs text-white/25 text-center mt-4"
          >
            By creating an account you agree to our{" "}
            <span className="text-white/40 hover:text-white/60 cursor-pointer transition-colors">
              Terms of Service
            </span>
          </motion.p>

          {/* Google Sign-Up */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32 }} className="mt-5">
            <div className="relative flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs text-white/25 font-medium">or sign up with</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
              className="w-full flex items-center justify-center gap-3 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.09] hover:border-white/20 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
                <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
                <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </motion.div>

          {/* Sign in link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 pt-6 border-t border-white/[0.06] text-center"
          >
            <p className="text-sm text-white/40">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-arena-purple-light hover:text-white font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          Powered by Avalanche &bull; Learn &bull; Build &bull; Earn
        </p>
      </motion.div>
    </div>
  );
}
