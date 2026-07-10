import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { normalizePhone } from "./phone";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "zabarkhan-super-secret-key-2026-marketplace",
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phone: { label: "Mobile Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;

        try {
          const cleanPhone = normalizePhone(credentials.phone);

          // Search user by normalized phone or email — ONLY select core columns
          // (Fault-tolerant against schema changes — new columns won't break login)
          const userList = await db
            .select({
              id: users.id,
              name: users.name,
              phone: users.phone,
              email: users.email,
              password: users.password,
              role: users.role,
            })
            .from(users)
            .where(or(eq(users.phone, cleanPhone), eq(users.email, cleanPhone)));

          const user = userList[0];
          if (!user || !user.password) return null;

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;

          return {
            id: String(user.id),
            email: user.email || "",
            name: user.name,
            phone: user.phone,
            role: user.role,
          };
        } catch (error) {
          console.error("NextAuth authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.phone = (user as any).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        (session.user as any).phone = token.phone as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
