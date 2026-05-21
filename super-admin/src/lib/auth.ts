import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { sql } from "drizzle-orm";

async function getSuperAdminProfile(email: string) {
  const rows = await db.execute(sql`
    SELECT p.id AS profile_id, p.username, p.emoji, p.is_super_admin
    FROM   users u
    JOIN   profiles p ON p.user_id = u.id
    WHERE  u.email = ${email.toLowerCase()}
    LIMIT  1
  `);
  const user = (rows as any).rows?.[0] ?? (rows as any)[0];
  if (!user || !user.is_super_admin) return null;
  return user;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const rows = await db.execute(sql`
          SELECT u.id          AS user_id,
                 u.email,
                 u.password_hash,
                 p.id          AS profile_id,
                 p.username,
                 p.emoji,
                 p.is_super_admin
          FROM   users u
          JOIN   profiles p ON p.user_id = u.id
          WHERE  u.email = ${credentials.email as string}
          LIMIT  1
        `);

        const user = (rows as any).rows?.[0] ?? (rows as any)[0];
        if (!user) return null;
        if (!user.is_super_admin) return null;

        const valid = await bcrypt.compare(credentials.password as string, user.password_hash);
        if (!valid) return null;

        return { id: user.profile_id, email: user.email, name: user.username, image: user.emoji };
      },
    }),
  ],
  pages: { signIn: "/sign-in", error: "/sign-in" },
  callbacks: {
    async signIn({ account, profile }) {
      // For Google OAuth — block non-super-admins at the door
      if (account?.provider === "google" && profile?.email) {
        const sa = await getSuperAdminProfile(profile.email);
        return !!sa;
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user && account?.provider === "credentials") {
        token.id = user.id;
        token.isSuperAdmin = true;
      }
      if (account?.provider === "google" && profile?.email) {
        const sa = await getSuperAdminProfile(profile.email);
        if (sa) {
          token.id = sa.profile_id;
          token.isSuperAdmin = true;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).isSuperAdmin = token.isSuperAdmin;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});
