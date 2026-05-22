import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { authConfig } from "./auth.config";

// Hardcode production URL so NextAuth always builds the correct OAuth callback,
// regardless of what NEXTAUTH_URL is set to in Vercel environment variables.
process.env.AUTH_URL = "https://plugplayavax.vercel.app";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

async function getOrCreateGoogleProfile(email: string, name: string | null) {
  // Look up existing user+profile by email
  const rows = await db.execute(sql`
    SELECT u.id AS user_id,
           p.id AS profile_id,
           p.is_admin, p.is_super_admin, p.onboarding_done, p.persona, p.emoji
    FROM   users u
    JOIN   profiles p ON p.user_id = u.id
    WHERE  u.email = ${email.toLowerCase()}
    LIMIT  1
  `);
  const existing = (rows as any).rows?.[0] ?? (rows as any)[0];
  if (existing) return existing;

  // First-time Google sign-in — create user and profile
  const userRows = await db.execute(sql`
    INSERT INTO users (email, password_hash)
    VALUES (${email.toLowerCase()}, '')
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING id
  `);
  const userId = ((userRows as any).rows?.[0] ?? (userRows as any)[0])?.id;
  if (!userId) return null;

  const username = (name ?? email.split("@")[0]).replace(/\s+/g, "_").slice(0, 24);
  const profileRows = await db.execute(sql`
    INSERT INTO profiles (user_id, username, emoji)
    VALUES (${userId}, ${username}, '🎮')
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id, is_admin, is_super_admin, onboarding_done, persona, emoji
  `);
  const profile = (profileRows as any).rows?.[0] ?? (profileRows as any)[0];
  if (!profile) {
    // Profile already existed (race) — re-fetch
    const refetch = await db.execute(sql`
      SELECT p.id AS profile_id, p.is_admin, p.is_super_admin, p.onboarding_done, p.persona, p.emoji
      FROM profiles p WHERE p.user_id = ${userId} LIMIT 1
    `);
    const r = (refetch as any).rows?.[0] ?? (refetch as any)[0];
    return r ? { ...r, profile_id: r.profile_id ?? r.id } : null;
  }
  return {
    profile_id: profile.id,
    is_admin: profile.is_admin,
    is_super_admin: profile.is_super_admin,
    onboarding_done: profile.onboarding_done,
    persona: profile.persona,
    emoji: profile.emoji,
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const rows = await db.execute(sql`
          SELECT u.id          AS user_id,
                 u.email,
                 u.password_hash,
                 p.id          AS profile_id,
                 p.username,
                 p.emoji,
                 p.is_admin,
                 p.is_super_admin,
                 p.onboarding_done,
                 p.persona
          FROM   users u
          JOIN   profiles p ON p.user_id = u.id
          WHERE  u.email = ${email.toLowerCase()}
          LIMIT  1
        `);

        const user = (rows as any).rows?.[0] ?? (rows as any)[0];
        if (!user) return null;
        if (!user.password_hash) return null; // Google-only account

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        return {
          id: user.profile_id,
          email: user.email,
          name: user.username,
          image: user.emoji,
          isAdmin: user.is_admin,
          isSuperAdmin: user.is_super_admin,
          persona: user.persona,
          onboardingDone: user.onboarding_done,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account }) {
      // Credentials provider — user fields come directly
      if (user && account?.provider === "credentials") {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
        token.isSuperAdmin = (user as any).isSuperAdmin;
        token.persona = (user as any).persona;
        token.onboardingDone = (user as any).onboardingDone;
      }
      // Google provider — look up/create our profile
      if (account?.provider === "google" && user?.email) {
        const profile = await getOrCreateGoogleProfile(user.email, user.name ?? null);
        if (profile) {
          token.id = profile.profile_id;
          token.isAdmin = profile.is_admin;
          token.isSuperAdmin = profile.is_super_admin;
          token.persona = profile.persona;
          token.onboardingDone = profile.onboarding_done;
        }
      }
      return token;
    },
  },
});
