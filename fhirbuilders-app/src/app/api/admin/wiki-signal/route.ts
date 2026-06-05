// Manual wiki signal entry — for external workspaces (CMS Health Tech
// Ecosystem, Health Tech Nerds) where Eugene is a member, not an admin, so
// the bot can't pull. Paste a digest summary here and it lands in the same
// WikiSignal table the cron writes to, rendered identically on the wiki.
//
// Admin-only: requires the caller's email to be in ADMIN_EMAILS env var
// (comma-separated) and a valid NextAuth session.

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WIKI } from "@/lib/wiki/graph";

const SignalSchema = z.object({
  source: z.string().min(3).max(80), // e.g. "slack:cms-health-tech:general"
  sourceType: z.enum(["manual", "slack", "rss"]).default("manual"),
  title: z.string().min(3).max(200),
  summary: z.string().min(3).max(2000),
  url: z.string().url().optional(),
  author: z.string().max(80).optional(),
  postedAt: z.string().datetime().optional(),
  topicSlugs: z.array(z.string()).max(10).default([]),
});

const validSlugs = new Set(WIKI.nodes.map((n) => n.slug));

function adminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "eugene.vestel@gmail.com")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email || !adminEmails().has(email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const parsed = SignalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad request", details: parsed.error.format() }, { status: 400 });
  }

  // Drop any topic slugs that don't exist in the wiki — never silent-fail on
  // a slug typo; the response surfaces what was rejected.
  const requestedSlugs = parsed.data.topicSlugs;
  const acceptedSlugs = requestedSlugs.filter((s) => validSlugs.has(s));
  const rejectedSlugs = requestedSlugs.filter((s) => !validSlugs.has(s));

  const signal = await prisma.wikiSignal.create({
    data: {
      source: parsed.data.source,
      sourceType: parsed.data.sourceType,
      title: parsed.data.title,
      summary: parsed.data.summary,
      url: parsed.data.url ?? null,
      author: parsed.data.author ?? email,
      postedAt: parsed.data.postedAt ? new Date(parsed.data.postedAt) : new Date(),
      topicSlugs: acceptedSlugs,
      reactions: 0,
    },
  });

  return NextResponse.json({
    ok: true,
    id: signal.id,
    acceptedSlugs,
    rejectedSlugs,
  });
}

export async function DELETE(req: Request) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email || !adminEmails().has(email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.wikiSignal.update({ where: { id }, data: { hidden: true } });
  return NextResponse.json({ ok: true });
}
