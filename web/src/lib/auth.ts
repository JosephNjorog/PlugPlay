import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { authConfig } from "./auth.config";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
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

        // Query users (auth) joined with profiles (app data)
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

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        return {
          id: user.profile_id,          // profiles.id — used everywhere in the app
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
        token.isSuperAdmin = (user as any).isSuperAdmin;
        token.persona = (user as any).persona;
        token.onboardingDone = (user as any).onboardingDone;
      }
      return token;
    },
  },
});
