import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/**
 * FleetFlow authentication.
 *
 * Uses Auth.js (NextAuth v5) with a single Credentials provider that
 * validates email + password against the `users` table. The session token
 * carries the user's role so middleware can enforce route-level access.
 */

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });

        if (!user || !user.password_hash) {
          return null;
        }

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.password_hash
        );
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user.role as string) ?? "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as string) ?? "CUSTOMER";
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      // Role-scoped route prefixes.
      const protectedPrefixes = ["/dashboard", "/staff", "/admin"];
      const isProtected = protectedPrefixes.some((p) =>
        path === p || path.startsWith(`${p}/`)
      );

      if (!isProtected) {
        // Logged-in users hitting the auth pages get bounced to their home.
        if (isLoggedIn && (path === "/login" || path === "/register")) {
          const role = (auth.user.role as string) ?? "CUSTOMER";
          return Response.redirect(new URL(roleHome(role), nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        return false; // redirect to /login via middleware
      }

      const role = (auth.user.role as string) ?? "CUSTOMER";
      return canAccessPath(role, path);
    },
  },
});

/**
 * Whether a given role may access a given path. Returns false to trigger a
 * 403-style handling in middleware (PRD section 15: Role Security).
 */
export function canAccessPath(role: string, path: string): boolean {
  // Normalize trailing slash.
  const p = path.endsWith("/") ? path.slice(0, -1) : path;

  if (p.startsWith("/dashboard")) return role === "CUSTOMER";
  if (p.startsWith("/staff")) return role === "STAFF" || role === "ADMIN";
  if (p.startsWith("/admin")) return role === "ADMIN";
  return true;
}

/**
 * The home route for a given role after sign-in.
 */
export function roleHome(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "STAFF":
      return "/staff";
    default:
      return "/dashboard";
  }
}

export type Role = "CUSTOMER" | "STAFF" | "ADMIN";
