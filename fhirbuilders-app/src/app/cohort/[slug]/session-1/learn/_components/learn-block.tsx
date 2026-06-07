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
  `cohort:${slug}:learn:session1:${blockId}`;

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
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{block.title}</h2>
        {hydrated && done && (
          <Badge className="ml-auto border-0 bg-emerald-100 text-emerald-800">
            <Check className="mr-1 h-3 w-3" /> Done
          </Badge>
        )}
      </div>

      <div className="space-y-6 px-6 py-6">
        {/* Objectives */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-rose-500" />
            <span className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              After this block you will be able to
            </span>
          </div>
          <ul className="space-y-2">
            {block.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-rose-50 font-mono text-[10px] font-bold text-rose-600">
                  {i + 1}
                </span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              FAQ
            </span>
          </div>
          <Accordion type="single" collapsible className="rounded-lg border border-slate-200">
            {block.faq.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="px-4">
                <AccordionTrigger className="text-sm font-medium text-slate-900 hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-slate-600">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Examples */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-teal-500" />
            <span className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Examples
            </span>
          </div>
          <div className="space-y-4">
            {block.examples.map((ex, i) => (
              <div key={i}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">{ex.title}</span>
                  <Badge
                    variant="outline"
                    className="border-slate-200 font-mono text-[10px] text-slate-500"
                  >
                    {ex.lang}
                  </Badge>
                </div>
                <pre className="overflow-x-auto rounded-lg bg-slate-950 px-4 py-3 text-xs leading-relaxed text-slate-100">
                  <code>{ex.code}</code>
                </pre>
                {ex.note && (
                  <p className="mt-1.5 text-xs italic text-slate-500">{ex.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Try it */}
        <Card
          className={`border transition ${
            done ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/60"
          }`}
        >
          <CardContent className="flex items-start gap-4 p-4">
            <button
              type="button"
              onClick={toggle}
              disabled={!hydrated}
              aria-label={done ? "Mark as not done" : "Mark as done"}
              className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition ${
                done
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-amber-400 bg-white hover:border-amber-600"
              }`}
            >
              {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </button>
            <div>
              <div className="mb-1 flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-800">
                  Try this
                </span>
              </div>
              <p className={`text-sm ${done ? "text-emerald-900" : "text-slate-700"}`}>
                {block.tryIt}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Official docs */}
        {block.docs.length > 0 && (
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Official docs
            </div>
            <div className="flex flex-wrap gap-2">
              {block.docs.map((doc) => (
                <Button
                  key={doc.href}
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-7 px-2.5 text-xs"
                >
                  <a href={doc.href} target="_blank" rel="noopener noreferrer">
                    {doc.label}
                    <ArrowUpRight className="ml-1 h-3 w-3 text-slate-400" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
