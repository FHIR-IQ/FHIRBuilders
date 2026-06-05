// Wiki Slack digest — daily cron that ingests recent Slack messages from
// configured channels into the WikiSignal table for the /wiki "Live signal"
// card. Vercel Cron fires this at the schedule declared in vercel.json:
//
//   {"crons":[{"path":"/api/cron/wiki-slack-digest","schedule":"0 14 * * *"}]}
//
// Auth: Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. We require
// that header to match the env var on production; in dev we accept anything
// so you can curl-test locally.
//
// Scope: only ingests from Slack workspaces we have a bot token for.
// Right now that's the FHIRBuilders workspace (SLACK_BOT_TOKEN). External
// workspaces (CMS Health Tech Ecosystem, Health Tech Nerds) come in via the
// manual /api/admin/wiki-signal endpoint instead — Eugene's a member of
// those workspaces, not an admin, so a bot can't auto-pull.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type SlackMessage = {
  type: string;
  subtype?: string;
  ts: string;
  user?: string;
  bot_id?: string;
  username?: string;
  text?: string;
  reactions?: Array<{ name: string; count: number }>;
  permalink?: string;
};

type IngestionTarget = {
  /** Slack channel id (C09…) or name without `#` */
  channel: string;
  /** Stable source key persisted to WikiSignal.source */
  source: string;
  /** Wiki topic slugs to auto-tag onto every signal from this channel */
  topicSlugs: string[];
  /** Minimum total reaction count for a message to be ingested */
  minReactions?: number;
};

// Initial config — extend as more cohort channels accumulate signal worth
// surfacing. Anything posted in #announcements or #help-build with 1+ reaction
// counts. Pin/star-only filtering can come later.
const TARGETS: IngestionTarget[] = [
  {
    channel: "announcements",
    source: "slack:fhirbuilders:announcements",
    topicSlugs: ["fhirbuilders", "claude-code-fhir"],
    minReactions: 0,
  },
  {
    channel: "help-build",
    source: "slack:fhirbuilders:help-build",
    topicSlugs: ["fhirbuilders", "fhir-overview", "claude-code-fhir"],
    minReactions: 1,
  },
  {
    channel: "fhir-questions",
    source: "slack:fhirbuilders:fhir-questions",
    topicSlugs: ["fhir-overview", "us-core"],
    minReactions: 1,
  },
];

const SLACK_API = "https://slack.com/api";

async function slack<T = unknown>(method: string, params: Record<string, string>): Promise<T> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error("SLACK_BOT_TOKEN not set");
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${SLACK_API}/${method}?${q}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return (await res.json()) as T;
}

async function resolveChannelId(channel: string): Promise<string | null> {
  if (channel.startsWith("C") || channel.startsWith("G")) return channel;
  type ListResp = {
    ok: boolean;
    channels?: Array<{ id: string; name: string }>;
    response_metadata?: { next_cursor?: string };
  };
  let cursor = "";
  for (let i = 0; i < 5; i++) {
    const r = await slack<ListResp>("conversations.list", {
      exclude_archived: "true",
      limit: "200",
      ...(cursor ? { cursor } : {}),
    });
    if (!r.ok) return null;
    const match = r.channels?.find((c) => c.name === channel);
    if (match) return match.id;
    cursor = r.response_metadata?.next_cursor ?? "";
    if (!cursor) break;
  }
  return null;
}

async function fetchRecentMessages(channelId: string, oldestTs: number): Promise<SlackMessage[]> {
  type HistResp = { ok: boolean; messages?: SlackMessage[]; error?: string };
  const r = await slack<HistResp>("conversations.history", {
    channel: channelId,
    oldest: String(oldestTs),
    limit: "50",
    inclusive: "false",
  });
  if (!r.ok || !r.messages) return [];
  return r.messages.filter((m) => m.type === "message" && !m.subtype && m.text);
}

async function getPermalink(channelId: string, ts: string): Promise<string | null> {
  type Resp = { ok: boolean; permalink?: string };
  const r = await slack<Resp>("chat.getPermalink", { channel: channelId, message_ts: ts });
  return r.ok ? (r.permalink ?? null) : null;
}

function reactionTotal(msg: SlackMessage) {
  return (msg.reactions ?? []).reduce((sum, r) => sum + r.count, 0);
}

function titleFor(text: string): string {
  // First line, trimmed, max 120 chars. Strip Slack mention/link markup.
  const first = text.split("\n")[0] ?? text;
  const clean = first
    .replace(/<@[A-Z0-9]+(\|[^>]+)?>/g, "@user")
    .replace(/<#[A-Z0-9]+\|([^>]+)>/g, "#$1")
    .replace(/<(https?:\/\/[^|>]+)\|([^>]+)>/g, "$2")
    .replace(/<(https?:\/\/[^>]+)>/g, "$1")
    .trim();
  return clean.length > 120 ? clean.slice(0, 117) + "…" : clean;
}

function summaryFor(text: string): string {
  // Strip Slack markup, keep newlines, cap at 600 chars.
  const clean = text
    .replace(/<@[A-Z0-9]+(\|[^>]+)?>/g, "@user")
    .replace(/<#[A-Z0-9]+\|([^>]+)>/g, "#$1")
    .replace(/<(https?:\/\/[^|>]+)\|([^>]+)>/g, "$2")
    .replace(/<(https?:\/\/[^>]+)>/g, "$1")
    .trim();
  return clean.length > 600 ? clean.slice(0, 597) + "…" : clean;
}

export async function GET(req: Request) {
  // Cron auth: Vercel sends Authorization: Bearer $CRON_SECRET. In dev (no
  // CRON_SECRET set), allow any caller so curl-testing works locally.
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  if (!process.env.SLACK_BOT_TOKEN) {
    return NextResponse.json(
      { error: "SLACK_BOT_TOKEN not set — set it in Vercel env to enable ingestion" },
      { status: 503 },
    );
  }

  // Pull messages from the last 26 hours (24h cron + 2h overlap so we don't
  // drop posts that arrive while the cron is running).
  const since = Math.floor((Date.now() - 26 * 60 * 60 * 1000) / 1000);

  const result = {
    ingested: 0,
    skippedLowEngagement: 0,
    perTarget: [] as Array<{ source: string; ingested: number; skipped: number; error?: string }>,
  };

  for (const target of TARGETS) {
    const targetResult = { source: target.source, ingested: 0, skipped: 0, error: undefined as string | undefined };
    try {
      const channelId = await resolveChannelId(target.channel);
      if (!channelId) {
        targetResult.error = `channel ${target.channel} not found`;
        result.perTarget.push(targetResult);
        continue;
      }

      const messages = await fetchRecentMessages(channelId, since);
      for (const msg of messages) {
        const reactions = reactionTotal(msg);
        if (reactions < (target.minReactions ?? 0)) {
          targetResult.skipped++;
          result.skippedLowEngagement++;
          continue;
        }
        const permalink = await getPermalink(channelId, msg.ts);
        const postedAt = new Date(Number(msg.ts.split(".")[0]) * 1000);

        // Idempotent: source + ts uniquely identifies a Slack message.
        const externalId = `${target.source}:${msg.ts}`;
        await prisma.wikiSignal.upsert({
          where: { id: externalId },
          create: {
            id: externalId,
            source: target.source,
            sourceType: "slack",
            title: titleFor(msg.text ?? ""),
            summary: summaryFor(msg.text ?? ""),
            url: permalink,
            author: msg.username ?? msg.user ?? null,
            postedAt,
            topicSlugs: target.topicSlugs,
            reactions,
          },
          update: {
            // Update only mutable fields — reactions move, text + permalink shouldn't
            reactions,
            summary: summaryFor(msg.text ?? ""),
          },
        });
        targetResult.ingested++;
        result.ingested++;
      }
    } catch (e) {
      targetResult.error = (e as Error).message;
    }
    result.perTarget.push(targetResult);
  }

  return NextResponse.json({
    ok: true,
    ranAt: new Date().toISOString(),
    ...result,
  });
}
