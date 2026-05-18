import type { NextAuthConfig } from "next-auth";

// Edge-safe auth config — no bcryptjs, no DB imports.
// Used only by middleware to read the JWT token.
export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth;
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
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
