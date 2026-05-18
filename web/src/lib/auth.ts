import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, profiles } from "@/lib/db";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
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

        const [user] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.email, email.toLowerCase()))
          .limit(1);

        if (!user) return null;

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          isAdmin: user.isAdmin,
          isSuperAdmin: user.isSuperAdmin,
          persona: user.persona,
          onboardingDone: user.onboardingDone,
        };
      },
    }),
  ],
  callbacks: {
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
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).isAdmin = token.isAdmin;
        (session.user as any).isSuperAdmin = token.isSuperAdmin;
        (session.user as any).persona = token.persona;
        (session.user as any).onboardingDone = token.onboardingDone;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});
