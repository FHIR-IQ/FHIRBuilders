import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import Resend from "next-auth/providers/resend";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    // Declare OAuth providers directly (not filtered from authConfig) to ensure
    // allowDangerousEmailAccountLinking is preserved through PrismaAdapter
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    // Magic link via Resend — passwordless. The Resend provider uses Resend's
    // REST API directly (no `resend` npm pkg needed). Requires RESEND_API_KEY
    // in env + a `from:` address on a Resend-verified domain
    // (notifications@fhirbuilders.com is verified).
    // Writes a row to VerificationToken on send; consumes it on callback hit.
    // Works alongside session.strategy:"jwt" — after click, a JWT session is
    // issued (no DB session table needed).
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: "FHIRBuilders <notifications@fhirbuilders.com>",
    }),
    // Email/password login
    Credentials({
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: { id: true, name: true, email: true, image: true, password: true },
        });
        if (!user?.password) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;
        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
    // Sign in with chat.fhir.org (Zulip) account
    Credentials({
      id: "zulip-fhir",
      name: "FHIR Zulip Chat",
      credentials: {
        email: { label: "chat.fhir.org Email", type: "email" },
        password: { label: "Password or API Key", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          // Verify against chat.fhir.org Zulip API
          const auth = Buffer.from(`${credentials.email}:${credentials.password}`).toString("base64");
          const res = await fetch("https://chat.fhir.org/api/v1/users/me", {
            headers: { Authorization: `Basic ${auth}` },
          });
          if (!res.ok) return null;
          const zulipUser = await res.json() as { email: string; full_name: string; avatar_url?: string };
          if (!zulipUser?.email) return null;

          // Upsert user in our database
          const email = zulipUser.email.toLowerCase();
          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                name: zulipUser.full_name,
                email,
                image: zulipUser.avatar_url ?? null,
              },
            });
          }
          return { id: user.id, name: user.name, email: user.email, image: user.image };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
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
