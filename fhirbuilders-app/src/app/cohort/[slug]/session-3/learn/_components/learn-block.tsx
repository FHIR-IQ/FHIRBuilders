"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, Check, HelpCircle, Lightbulb, Target, Terminal } from "lucide-react";
import type { CurriculumBlock } from "../_data/curriculum";

const STORAGE_KEY = (slug: string, blockId: string) =>
  `cohort:${slug}:learn:session3:${blockId}`;

type Props = { block: CurriculumBlock; cohortSlug: string };

export function LearnBlock({ block, cohortSlug }: Props) {
  const [done, setDone] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(cohortSlug, block.id));
      setDone(raw === "true");
    } catch {}
    setHydrated(true);
  }, [cohortSlug, block.id]);

  function toggle() {
    const next = !done;
    setDone(next);
    try {
      localStorage.setItem(STORAGE_KEY(cohortSlug, block.id), String(next));
    } catch {}
  }

  return (
    <section
      id={`block-${block.n}`}
      className="scroll-mt-6 rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Block header */}
      <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-900 font-mono text-sm font-semibold text-white">
          {String(block.n).padStart(2, "0")}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-slate-900">{block.title}</h2>
        </div>
        {hydrated && (
          <Button
            variant={done ? "default" : "outline"}
            size="sm"
            onClick={toggle}
            className={`flex-shrink-0 gap-1.5 ${done ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
          >
            {done ? (
              <><Check className="h-3.5 w-3.5" /> Done</>
            ) : (
              "Mark done"
            )}
          </Button>
        )}
      </div>

      <div className="px-6 py-5 space-y-6">
        {/* Objectives */}
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <Target className="h-3 w-3" /> Objectives
          </div>
          <ul className="space-y-1.5">
            {block.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 font-mono text-[9px] font-bold text-slate-500">
                  {i + 1}
                </span>
                {obj}
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ accordion */}
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <HelpCircle className="h-3 w-3" /> FAQ
          </div>
          <Accordion type="multiple" className="space-y-1">
            {block.faq.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${block.n}-${i}`}
                className="rounded-lg border border-slate-100 bg-slate-50 px-4"
              >
                <AccordionTrigger className="py-3 text-sm font-medium text-slate-800 hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-3 text-sm text-slate-600">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Examples */}
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <Terminal className="h-3 w-3" /> Examples
          </div>
          <div className="space-y-3">
            {block.examples.map((ex, i) => (
              <Card key={i} className="border-slate-100">
                <CardContent className="p-0">
                  <div className="border-b border-slate-100 px-4 py-2.5">
                    <span className="text-xs font-medium text-slate-700">{ex.title}</span>
                    <Badge variant="outline" className="ml-2 border-slate-200 px-1.5 py-0 font-mono text-[10px] text-slate-400">
                      {ex.lang}
                    </Badge>
                  </div>
                  <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-slate-700">
                    <code>{ex.code}</code>
                  </pre>
                  {ex.note && (
                    <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
                      {ex.note}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Try it */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-amber-700">
            <Lightbulb className="h-3 w-3" /> Try it
          </div>
          <p className="text-sm text-amber-900">{block.tryIt}</p>
        </div>

        {/* Docs */}
        {block.docs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {block.docs.map((doc) => (
              <a
                key={doc.href}
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-slate-400 hover:text-slate-900 transition"
              >
                {doc.label}
                <ArrowUpRight className="h-3 w-3" />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
