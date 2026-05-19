import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { sql } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Query users JOIN profiles — only grant access if is_super_admin
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

        return {
          id: user.profile_id,
          email: user.email,
          name: user.username,
          image: user.emoji,
        };
      },
    }),
  ],
  pages: { signIn: "/sign-in" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.id;
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});
