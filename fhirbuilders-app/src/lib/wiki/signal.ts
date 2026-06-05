// Wiki Live Signal — runtime helpers for the WikiSignal table.
//
// Sources we have bot-token access to (FHIRBuilders Slack workspace) are
// ingested by /api/cron/wiki-slack-digest on a schedule. External workspaces
// (CMS Health Tech Ecosystem, Health Tech Nerds) — where Eugene is a member,
// not a workspace admin — get manually-entered signals via
// /api/admin/wiki-signal. Either path lands rows in the same WikiSignal table
// rendered by the LiveSignalCard.

import { prisma } from "@/lib/prisma";

export type SignalListItem = {
  id: string;
  source: string;
  sourceType: string;
  title: string;
  summary: string;
  url: string | null;
  author: string | null;
  postedAt: Date;
  topicSlugs: string[];
  reactions: number;
};

const SIGNAL_FIELDS = {
  id: true,
  source: true,
  sourceType: true,
  title: true,
  summary: true,
  url: true,
  author: true,
  postedAt: true,
  topicSlugs: true,
  reactions: true,
} as const;

export async function getRecentSignals(limit = 6): Promise<SignalListItem[]> {
  try {
    return await prisma.wikiSignal.findMany({
      where: { hidden: false },
      orderBy: { postedAt: "desc" },
      take: limit,
      select: SIGNAL_FIELDS,
    });
  } catch {
    // Table may not exist yet (first deploy before `prisma db push`). Render
    // the card with an empty state rather than 500-ing the whole index page.
    return [];
  }
}

export async function getSignalsForTopic(slug: string, limit = 4): Promise<SignalListItem[]> {
  try {
    return await prisma.wikiSignal.findMany({
      where: { hidden: false, topicSlugs: { has: slug } },
      orderBy: { postedAt: "desc" },
      take: limit,
      select: SIGNAL_FIELDS,
    });
  } catch {
    return [];
  }
}

/**
 * Source labels for the badge on a signal card. Maps the opaque source key
 * (`slack:fhirbuilders:announcements`) to a human-readable name + accent class.
 */
export function describeSource(source: string, sourceType: string) {
  if (sourceType === "manual") {
    if (source.includes("cms-health-tech")) {
      return { label: "CMS HT Slack", className: "border-teal-300 bg-teal-50 text-teal-800" };
    }
    if (source.includes("health-tech-nerds") || source.includes("htn")) {
      return { label: "HTN Slack", className: "border-indigo-300 bg-indigo-50 text-indigo-800" };
    }
    return { label: "Manual", className: "border-slate-300 bg-slate-50 text-slate-700" };
  }
  if (sourceType === "slack") {
    if (source.includes("fhirbuilders")) {
      return {
        label: "FHIRBuilders Slack",
        className: "border-rose-300 bg-rose-50 text-rose-800",
      };
    }
    return { label: "Slack", className: "border-violet-300 bg-violet-50 text-violet-800" };
  }
  if (sourceType === "rss") {
    return { label: "RSS", className: "border-amber-300 bg-amber-50 text-amber-800" };
  }
  return { label: sourceType, className: "border-slate-300 bg-slate-50 text-slate-700" };
}
