import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock } from "lucide-react";
import { WIKI, getNode } from "@/lib/wiki/graph";

export const metadata: Metadata = {
  title: "Wiki Log",
  description: "Chronological record of every change to the Healthcare AI Builders Wiki.",
};

export default function WikiLogPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 lg:px-8 lg:py-14">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-3 text-slate-600">
          <Link href="/wiki">
            <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Wiki
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <Badge variant="outline" className="mb-2 border-slate-400 bg-slate-50">
          <Clock className="mr-1 h-3 w-3" /> Log
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          What was added, when, and why
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Karpathy&apos;s wiki has both an <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">index.md</code>{" "}
          (the catalog) and a <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">log.md</code>{" "}
          (the chronological record). This is the log — every meaningful change to the graph lands
          here so future contributors can see what was added when and why.
        </p>
      </div>

      <div className="space-y-4">
        {WIKI.log
          .slice()
          .reverse()
          .map((entry, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <CardTitle className="text-base">{entry.summary}</CardTitle>
                  <span className="font-mono text-xs text-slate-500">{entry.date}</span>
                </div>
                <CardDescription className="text-xs">by {entry.by}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-1">
                <div className="text-xs font-mono uppercase tracking-widest text-slate-500">
                  {entry.changes.length} topic{entry.changes.length === 1 ? "" : "s"}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {entry.changes.map((slug) => {
                    const node = getNode(slug);
                    if (!node) return null;
                    return (
                      <Link
                        key={slug}
                        href={`/wiki/${slug}`}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                      >
                        {node.title}
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
