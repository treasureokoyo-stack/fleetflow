import { type DefaultSession } from "next-auth";

/**
 * Augment NextAuth session/JWT types so `role` is available on the session
 * user object throughout the app.
 */
declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}
