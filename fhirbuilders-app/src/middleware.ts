import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Use Edge-compatible auth config (no Prisma) for middleware.
// Prisma Client cannot run in the Vercel Edge runtime — importing the full
// auth.ts (which includes PrismaAdapter) here causes JWTSessionError on
// every protected route request.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/admin/:path*"],
};
