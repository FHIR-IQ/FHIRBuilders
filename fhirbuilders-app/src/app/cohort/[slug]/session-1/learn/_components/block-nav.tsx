"use client";

import { useEffect, useState } from "react";
import type { CurriculumBlock } from "../_data/curriculum";

type NavBlock = Pick<CurriculumBlock, "id" | "n" | "title">;

const STORAGE_KEY = (slug: string, blockId: string) =>
  `cohort:${slug}:learn:session1:${blockId}`;

type Props = { blocks: NavBlock[]; cohortSlug: string };

export function BlockNav({ blocks, cohortSlug }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [doneCount, setDoneCount] = useState(0);

  // IntersectionObserver — track which block is in view
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    blocks.forEach((b) => {
      const el = document.getElementById(`block-${b.n}`);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(b.id);
        },
        { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [blocks]);

  // Read try-it state from localStorage to compute progress
  useEffect(() => {
    function countDone() {
      let count = 0;
      try {
        blocks.forEach((b) => {
          if (localStorage.getItem(STORAGE_KEY(cohortSlug, b.id)) === "true") count++;
        });
      } catch {}
      setDoneCount(count);
    }

    countDone();

    // Poll every 2s for same-tab updates (storage event doesn't fire in same tab)
    const interval = setInterval(countDone, 2000);
    window.addEventListener("storage", countDone);
    return () => {
      window.removeEventListener("storage", countDone);
      clearInterval(interval);
    };
  }, [blocks, cohortSlug]);

  return (
    <nav className="flex flex-col gap-1">
      {/* Progress */}
      <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Try-its completed
        </div>
        <div className="mt-0.5 text-lg font-semibold text-slate-900">
          {doneCount}
          <span className="text-slate-400"> / {blocks.length}</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-rose-500 transition-all duration-500"
            style={{ width: `${Math.round((doneCount / blocks.length) * 100)}%` }}
          />
        </div>
      </div>

      {/* Block links */}
      {blocks.map((b) => {
        const isActive = activeId === b.id;
        return (
          <a
            key={b.id}
            href={`#block-${b.n}`}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${
              isActive
                ? "bg-slate-100 font-medium text-slate-900 ring-1 ring-inset ring-slate-200"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold ${
                isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {String(b.n).padStart(2, "0")}
            </span>
            <span className="truncate">{b.title}</span>
          </a>
        );
      })}
    </nav>
  );
}
