import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            persona: true,
            role: true,
            skills: true,
            interests: true,
            githubUsername: true,
          },
        });
        if (dbUser) {
          (session.user as ExtendedUser).persona = dbUser.persona;
          (session.user as ExtendedUser).role = dbUser.role;
          (session.user as ExtendedUser).skills = dbUser.skills;
          (session.user as ExtendedUser).interests = dbUser.interests;
          (session.user as ExtendedUser).githubUsername = dbUser.githubUsername;
        }
      }
      return session;
    },
  },
});

// Extended user type
interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  persona?: string;
  role?: string;
  skills?: string[];
  interests?: string[];
  githubUsername?: string | null;
}
