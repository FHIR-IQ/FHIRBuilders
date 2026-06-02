"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Flame, Pencil, X } from "lucide-react";

// Phase 1 — localStorage-backed weekly commitments. Lets the widget feel
// real on the Wed/Thu intro calls without a Prisma migration. Phase 2 moves
// this to a server route hitting WeeklyCommitment + computes the streak
// from completed weeks server-side.

type Commitment = {
  text: string;
  completed: boolean;
};

const SLOT_COUNT = 3;
const EMPTY: Commitment[] = Array.from({ length: SLOT_COUNT }, () => ({
  text: "",
  completed: false,
}));

function storageKey(cohortSlug: string): string {
  // ISO week-of-year so commitments roll over each Monday.
  // YYYY-Www format (e.g. 2026-W23) is stable per browser.
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  const week = String(Math.ceil((dayOfYear + start.getDay() + 1) / 7)).padStart(2, "0");
  return `cohort:${cohortSlug}:commitments:${now.getFullYear()}-W${week}`;
}

function streakKey(cohortSlug: string): string {
  return `cohort:${cohortSlug}:streak`;
}

export function CommitmentsWidget({ cohortSlug }: { cohortSlug: string }) {
  const [items, setItems] = useState<Commitment[]>(EMPTY);
  const [streak, setStreak] = useState<number>(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);

  // One-time client hydration from localStorage. Setting state inside an
  // effect is intentional here — we cannot read localStorage during SSR, so
  // the initial render is the empty state and we hydrate after mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(cohortSlug));
      if (raw) {
        const parsed = JSON.parse(raw) as Commitment[];
        if (Array.isArray(parsed) && parsed.length === SLOT_COUNT) {
          setItems(parsed);
        }
      }
      const s = localStorage.getItem(streakKey(cohortSlug));
      if (s) setStreak(Number.parseInt(s, 10) || 0);
    } catch {
      // localStorage unavailable — render the empty state silently
    }
    setHydrated(true);
  }, [cohortSlug]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function persist(next: Commitment[]) {
    setItems(next);
    try {
      localStorage.setItem(storageKey(cohortSlug), JSON.stringify(next));
      // Bump streak whenever all 3 are completed for the first time this week
      const allDone = next.every((c) => c.text.trim().length > 0 && c.completed);
      const someDone = next.some((c) => c.completed);
      if (allDone && streak === 0) {
        const nextStreak = 1;
        setStreak(nextStreak);
        localStorage.setItem(streakKey(cohortSlug), String(nextStreak));
      } else if (!someDone && streak > 0) {
        // intentionally don't decay streak in Phase 1 — server handles weekly rollover
      }
    } catch {}
  }

  function startEdit(i: number) {
    setEditingIndex(i);
    setDraft(items[i].text);
  }

  function saveEdit() {
    if (editingIndex === null) return;
    const next = items.map((c, i) =>
      i === editingIndex ? { ...c, text: draft.trim() } : c
    );
    persist(next);
    setEditingIndex(null);
    setDraft("");
  }

  function cancelEdit() {
    setEditingIndex(null);
    setDraft("");
  }

  function toggle(i: number) {
    const next = items.map((c, j) => (j === i ? { ...c, completed: !c.completed } : c));
    persist(next);
  }

  function clearSlot(i: number) {
    const next = items.map((c, j) => (j === i ? { text: "", completed: false } : c));
    persist(next);
  }

  const filled = items.filter((c) => c.text.trim().length > 0).length;
  const done = items.filter((c) => c.completed).length;

  return (
    <Card className="border-2 border-dashed border-rose-200 bg-gradient-to-br from-rose-50/60 to-amber-50/40">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight">
              Ready to lock in this week&apos;s commitments?
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Three things you&apos;ll ship this week. Public-by-default. Your pod sees them on Monday.
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900">
            <Flame className="h-3.5 w-3.5" aria-hidden />
            <span>{streak}</span>
            <span className="text-amber-700">{streak === 1 ? "week" : "weeks"} streak</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((c, i) => {
          const slotNum = String(i + 1).padStart(2, "0");
          const isEditing = editingIndex === i;
          const isEmpty = c.text.trim().length === 0;

          if (isEditing) {
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-md border border-rose-300 bg-white px-3 py-2.5 shadow-sm"
              >
                <span className="font-mono text-sm font-semibold text-rose-600">{slotNum}</span>
                <input
                  autoFocus
                  type="text"
                  value={draft}
                  maxLength={140}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  placeholder="e.g. Ship FHIR Observation read with auth on Vercel"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                />
                <button
                  type="button"
                  onClick={saveEdit}
                  className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          }

          return (
            <div
              key={i}
              className={`group flex items-center gap-3 rounded-md border px-3 py-2.5 transition ${
                isEmpty
                  ? "border-dashed border-rose-200 bg-transparent hover:border-rose-400 hover:bg-white/60"
                  : c.completed
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-rose-200 bg-white"
              }`}
            >
              <span className="font-mono text-sm font-semibold text-rose-600">{slotNum}</span>

              {isEmpty ? (
                <button
                  type="button"
                  onClick={() => startEdit(i)}
                  className="flex-1 text-left text-sm text-muted-foreground hover:text-foreground"
                  disabled={!hydrated}
                >
                  + Add commitment
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-label={c.completed ? "Mark incomplete" : "Mark complete"}
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                      c.completed
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-muted-foreground/30 bg-white hover:border-rose-400"
                    }`}
                  >
                    {c.completed && <Check className="h-3 w-3" strokeWidth={3} />}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      c.completed ? "text-emerald-900 line-through opacity-70" : "text-foreground"
                    }`}
                  >
                    {c.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => startEdit(i)}
                    className="opacity-0 transition group-hover:opacity-100"
                    aria-label="Edit commitment"
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                  <button
                    type="button"
                    onClick={() => clearSlot(i)}
                    className="opacity-0 transition group-hover:opacity-100"
                    aria-label="Remove commitment"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-rose-600" />
                  </button>
                </>
              )}
            </div>
          );
        })}

        {hydrated && filled > 0 && (
          <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
            <span>
              {done} / {filled} shipped this week
            </span>
            <Button
              variant="link"
              size="sm"
              className="h-auto px-0 text-xs text-rose-600 hover:text-rose-700"
              asChild
            >
              <a href="#friday-reflect">Friday reflection →</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
