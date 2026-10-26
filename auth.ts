import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { allowRequest, clientAddress } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(6).max(72),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, request) => {
        try {
          const { email, password } = loginSchema.parse(credentials);
          if (!await allowRequest("login-email", email, 10, 15 * 60 * 1000) || !await allowRequest("login-ip", clientAddress(request), 100, 15 * 60 * 1000)) return null;

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            return null;
          }

          return user;
        } catch {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/account",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "USER";
        token.sessionVersion = user.sessionVersion || 0;
      }
      if (token.id) {
        const current = await prisma.user.findUnique({ where: { id: token.id as string }, select: { role: true, sessionVersion: true } });
        if (!current || current.sessionVersion !== (token.sessionVersion ?? 0)) return null;
        token.role = current.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
