import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import { getCohortBySlug } from "@/lib/cohort/cohort-00";
import { CURRICULUM } from "./_data/curriculum";
import { LearnBlock } from "./_components/learn-block";
import { BlockNav } from "./_components/block-nav";

type PageProps = { params: Promise<{ slug: string }> };

export default async function Session2LearnPage({ params }: PageProps) {
  const { slug } = await params;
  const cohort = getCohortBySlug(slug);
  if (!cohort) notFound();

  const navBlocks = CURRICULUM.map(({ id, n, title }) => ({ id, n, title }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-slate-600">
              <Link href={`/cohort/${slug}/session-2`}>
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Session 2
              </Link>
            </Button>
            <span className="text-slate-300">/</span>
            <Badge variant="outline" className="border-teal-300 bg-teal-50 text-teal-700">
              <BookOpen className="mr-1 h-3 w-3" /> Study Guide
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Session 2 · Study Guide
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            MCP servers, vector databases, and knowledge graphs — from concept to working code.
            Ten blocks with objectives, FAQ, examples, and one thing to try for each.
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sticky block nav — hidden on mobile */}
          <aside className="hidden w-52 flex-shrink-0 lg:block">
            <div className="sticky top-6">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Blocks
              </div>
              <BlockNav blocks={navBlocks} cohortSlug={slug} />
            </div>
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1 space-y-8">
            {/* Mobile block nav — horizontal scroll strip */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
              {navBlocks.map((b) => (
                <a
                  key={b.id}
                  href={`#block-${b.n}`}
                  className="flex flex-shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                >
                  <span className="font-mono text-[10px] font-bold text-slate-400">
                    {String(b.n).padStart(2, "0")}
                  </span>
                  {b.title}
                </a>
              ))}
            </div>

            {CURRICULUM.map((block) => (
              <LearnBlock key={block.id} block={block} cohortSlug={slug} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
