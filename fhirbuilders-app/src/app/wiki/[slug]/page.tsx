import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Link2 } from "lucide-react";
import {
  CATEGORY_META,
  STATUS_META,
  WIKI,
  getNode,
  getRelated,
} from "@/lib/wiki/graph";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return WIKI.nodes.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const node = getNode(slug);
  if (!node) return { title: "Topic not found" };
  return {
    title: `${node.title} · Wiki`,
    description: node.summary,
  };
}

export default async function WikiNodePage({ params }: PageProps) {
  const { slug } = await params;
  const node = getNode(slug);
  if (!node) notFound();

  const cat = CATEGORY_META[node.category];
  const status = STATUS_META[node.status];
  const related = getRelated(slug);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 lg:px-8 lg:py-14">
      {/* BREADCRUMB */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-3 text-slate-600">
          <Link href="/wiki">
            <ArrowLeft className="mr-2 h-3.5 w-3.5" /> All topics
          </Link>
        </Button>
      </div>

      {/* HEADER */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cat.accentClass}>
            {cat.label}
          </Badge>
          <Badge variant="outline" className={status.className}>
            {status.label}
          </Badge>
          {node.lastReviewed && (
            <span className="font-mono text-xs text-slate-400">
              reviewed {node.lastReviewed}
            </span>
          )}
          {node.source && (
            <span className="font-mono text-xs text-slate-400">
              source: {node.source}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {node.title}
        </h1>
        <p className="mt-3 text-lg text-slate-600">{node.summary}</p>
      </div>

      {/* BODY */}
      {node.body ? (
        <div className="prose prose-slate prose-sm max-w-none prose-headings:mt-6 prose-headings:font-semibold prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-xs prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-900">
          {node.body.split("\n").map((line, i) => {
            // Lightweight markdown — keeping the renderer tiny so we don't pull in MDX yet.
            // Handles: headings (##/###), inline code (`x`), bold (*x* or **x**), links, paragraphs.
            const trimmed = line.trim();
            if (!trimmed) return <div key={i} className="h-2" />;
            if (trimmed.startsWith("```")) return null; // code-fence open/close (we skip rendering blocks for simplicity)
            if (trimmed.startsWith("### ")) {
              return <h3 key={i} className="text-base">{trimmed.slice(4)}</h3>;
            }
            if (trimmed.startsWith("## ")) {
              return <h2 key={i} className="text-lg">{trimmed.slice(3)}</h2>;
            }
            if (trimmed.startsWith("- ")) {
              return <li key={i} className="ml-4">{renderInline(trimmed.slice(2))}</li>;
            }
            return <p key={i}>{renderInline(trimmed)}</p>;
          })}
        </div>
      ) : (
        <Card className="border-dashed bg-slate-50">
          <CardContent className="p-5 text-sm text-slate-500">
            This topic is a stub. The graph knows it exists and how it connects — the body will
            land in a future commit. See the external links for now.
          </CardContent>
        </Card>
      )}

      {/* EXTERNAL LINKS */}
      {node.externalLinks && node.externalLinks.length > 0 && (
        <Card className="mt-8">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ExternalLink className="h-4 w-4 text-slate-500" /> External links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {node.externalLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-700 hover:text-rose-600 hover:underline"
              >
                <span className="text-slate-400">→</span>
                <span>{l.label}</span>
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {/* RELATED */}
      {related.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Link2 className="h-4 w-4 text-slate-500" /> Related topics
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {related.map((r) => {
              const rcat = CATEGORY_META[r.category];
              return (
                <Link
                  key={r.slug}
                  href={`/wiki/${r.slug}`}
                  className="group flex items-start gap-2 rounded-md border border-slate-200 px-3 py-2 transition hover:border-rose-300 hover:bg-rose-50/30"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-900 group-hover:text-rose-600">
                      {r.title}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">{rcat.label}</div>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* FOOTER */}
      <div className="mt-10 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
        Edit at{" "}
        <a
          href="https://github.com/FHIR-IQ/FHIRBuilders/blob/main/fhirbuilders-app/src/lib/wiki/graph.ts"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-rose-600 hover:underline"
        >
          graph.ts
        </a>
      </div>
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Inline link [label](href)
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  const codeRe = /`([^`]+)`/g;
  const boldRe = /\*\*([^*]+)\*\*/g;

  // We do this lightly — replace links first, then code, then bold.
  // For more involved rendering we'd reach for MDX or react-markdown.
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  const combined = new RegExp(
    `${linkRe.source}|${codeRe.source}|${boldRe.source}`,
    "g",
  );
  while ((match = combined.exec(text)) !== null) {
    if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index));
    if (match[1] && match[2]) {
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-rose-600 hover:underline"
        >
          {match[1]}
        </a>,
      );
    } else if (match[3]) {
      parts.push(
        <code key={match.index} className="rounded bg-slate-100 px-1 font-mono text-xs">
          {match[3]}
        </code>,
      );
    } else if (match[4]) {
      parts.push(<strong key={match.index}>{match[4]}</strong>);
    }
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts.length > 0 ? parts : text;
}
