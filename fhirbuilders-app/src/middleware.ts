import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Use Edge-compatible auth config (no Prisma) for middleware.
// Prisma Client cannot run in the Vercel Edge runtime — importing the full
// auth.ts (which includes PrismaAdapter) here causes JWTSessionError on
// every protected route request.
// Next.js 16 requires a default export (named const export is not recognized).
const { auth } = NextAuth(authConfig);
export default auth;

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/admin/:path*"],
};
