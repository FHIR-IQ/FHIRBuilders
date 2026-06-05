// Live signal — renders recent WikiSignal rows on the /wiki index.
// Server component; safe to fail to empty state if the table doesn't exist
// (first deploy before `prisma db push`).

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio } from "lucide-react";
import { describeSource, getRecentSignals } from "@/lib/wiki/signal";
import { getNode } from "@/lib/wiki/graph";

function timeAgo(d: Date): string {
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  return `${mo}mo ago`;
}

export async function LiveSignalCard() {
  const signals = await getRecentSignals(6);

  return (
    <Card className="border-rose-200 bg-rose-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
          </span>
          Live signal
          <Radio className="ml-auto h-4 w-4 text-rose-400" />
        </CardTitle>
        <CardDescription className="text-xs">
          Recent activity from connected channels — automatically ingested from the FHIRBuilders
          Slack via cron, plus manually-curated digests from the CMS Health Tech Ecosystem and
          Health Tech Nerds workspaces.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {signals.length === 0 ? (
          <div className="rounded-md border border-dashed border-rose-300 bg-white px-4 py-6 text-center text-xs text-slate-500">
            No signals yet. The cron fires daily at 14:00 UTC — first run lands tomorrow morning
            ET.
          </div>
        ) : (
          <ul className="space-y-3">
            {signals.map((sig) => {
              const src = describeSource(sig.source, sig.sourceType);
              const linkedTopics = sig.topicSlugs
                .map((s) => getNode(s))
                .filter((n): n is NonNullable<typeof n> => !!n);
              return (
                <li
                  key={sig.id}
                  className="rounded-md border border-rose-100 bg-white p-3 transition hover:border-rose-300"
                >
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] ${src.className}`}>
                      {src.label}
                    </Badge>
                    <span className="text-[11px] text-slate-400">{timeAgo(sig.postedAt)}</span>
                    {sig.author && (
                      <span className="text-[11px] text-slate-400">· {sig.author}</span>
                    )}
                    {sig.reactions > 0 && (
                      <span className="text-[11px] text-slate-400">· {sig.reactions} 👍</span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-slate-900">
                    {sig.url ? (
                      <a
                        href={sig.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-rose-600 hover:underline"
                      >
                        {sig.title}
                      </a>
                    ) : (
                      sig.title
                    )}
                  </div>
                  {sig.summary && sig.summary !== sig.title && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">{sig.summary}</p>
                  )}
                  {linkedTopics.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {linkedTopics.map((t) => (
                        <Link
                          key={t.slug}
                          href={`/wiki/${t.slug}`}
                          className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                        >
                          {t.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
