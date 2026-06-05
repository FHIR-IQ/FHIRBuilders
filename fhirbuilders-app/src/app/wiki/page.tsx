import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpenCheck,
  Clock,
  ExternalLink,
  GitBranch,
  Sparkles,
} from "lucide-react";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  STATUS_META,
  WIKI,
  getNodesByCategory,
  type WikiNode,
} from "@/lib/wiki/graph";

export const metadata: Metadata = {
  title: "Healthcare AI Builders Wiki",
  description:
    "An LLM-curated wiki for healthcare AI builders — FHIR core, IGs, terminology, data quality, US regulation, AI patterns, CMS initiatives, and the Slack communities where it's all discussed.",
};

export default function WikiIndexPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 lg:px-8 lg:py-14">
      {/* HEADER */}
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline" className="border-slate-400 bg-slate-50">
              <BookOpenCheck className="mr-1 h-3 w-3" /> Wiki · v{WIKI.version}
            </Badge>
            <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800">
              {WIKI.nodes.length} topics
            </Badge>
            <Badge variant="outline" className="border-violet-300 bg-violet-50 text-violet-800">
              {WIKI.edges.length} edges
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Healthcare AI Builders Wiki
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            A living, LLM-curated map of what every healthcare AI builder should know — FHIR core,
            implementation guides, terminology, US regulation, AI patterns, and the active CMS
            initiatives + Slack communities where the work is happening. Inspired by{" "}
            <a
              href="https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-600 hover:underline"
            >
              Karpathy&apos;s LLM-wiki concept
            </a>{" "}
            — an evolving graph, not a static encyclopedia.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/wiki/log">
              <Clock className="mr-2 h-3.5 w-3.5" /> Log
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://github.com/FHIR-IQ/FHIRBuilders/blob/main/fhirbuilders-app/src/lib/wiki/graph.ts"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitBranch className="mr-2 h-3.5 w-3.5" /> Source
            </a>
          </Button>
        </div>
      </div>

      {/* CALLOUT — Karpathy framing */}
      <Card className="mb-10 border-dashed border-slate-300 bg-slate-50/50">
        <CardContent className="flex items-start gap-3 p-5 text-sm">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" />
          <div className="text-slate-700">
            <strong>How this wiki works.</strong> Topics are <em>nodes</em> with summaries +
            external links + status (seed → draft → stable). Edges encode dependencies (US Core
            depends-on FHIR R4), production relationships (CMS-0057 → DaVinci PAS), and discussion
            channels (CMS Health Tech Slack discusses NPD). The graph is meant to grow — every
            change lands in the <Link href="/wiki/log" className="text-rose-600 hover:underline">log</Link>{" "}
            so future you (or a forking team) can see what was added when and why. Fork the
            <code className="mx-1 rounded bg-slate-200 px-1 py-0.5 font-mono text-xs">
              graph.ts
            </code>
            file in the repo to build your own.
          </div>
        </CardContent>
      </Card>

      {/* CATEGORIES */}
      <div className="space-y-10">
        {CATEGORY_ORDER.map((cat) => {
          const nodes = getNodesByCategory(cat);
          const meta = CATEGORY_META[cat];
          return (
            <section key={cat}>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                    {meta.label}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{meta.description}</p>
                </div>
                <span className="font-mono text-xs text-slate-400">
                  {nodes.length} {nodes.length === 1 ? "topic" : "topics"}
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {nodes.map((node) => (
                  <NodeCard key={node.slug} node={node} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
        Wiki v{WIKI.version} · last updated {WIKI.updatedAt} · curated for{" "}
        <a href="https://fhirbuilders.com" className="text-rose-600 hover:underline">
          FHIRBuilders
        </a>{" "}
        + Cohort 00.
      </div>
    </div>
  );
}

function NodeCard({ node }: { node: WikiNode }) {
  const status = STATUS_META[node.status];
  return (
    <Link href={`/wiki/${node.slug}`} className="group block">
      <Card className="h-full transition hover:border-rose-300 hover:shadow-sm">
        <CardHeader className="pb-2">
          <div className="mb-1 flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-tight group-hover:text-rose-600">
              {node.title}
            </CardTitle>
            <Badge variant="outline" className={`flex-shrink-0 text-[10px] ${status.className}`}>
              {status.label}
            </Badge>
          </div>
          <CardDescription className="text-xs text-slate-600">{node.summary}</CardDescription>
        </CardHeader>
        <CardContent className="pb-4 pt-1">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            {node.externalLinks && node.externalLinks.length > 0 && (
              <span className="flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                {node.externalLinks.length} link{node.externalLinks.length === 1 ? "" : "s"}
              </span>
            )}
            <span className="ml-auto inline-flex items-center text-rose-500 opacity-0 transition group-hover:opacity-100">
              Open <ArrowRight className="ml-1 h-3 w-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
