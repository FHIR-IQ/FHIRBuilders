"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Check, Info, ListChecks, Sparkles } from "lucide-react";
import {
  PREREQS,
  getAllVerifyItemIds,
  type PreReqGroup,
  type PreReqItem,
} from "@/lib/cohort/prereqs";

const STORAGE_KEY = (slug: string) => `cohort:${slug}:prereqs`;

type CheckedMap = Record<string, boolean>;

const PRIORITY_STYLE: Record<
  PreReqGroup["priority"],
  { label: string; badge: string; ring: string }
> = {
  required: {
    label: "Required",
    badge: "border-rose-300 bg-rose-50 text-rose-700",
    ring: "ring-rose-200",
  },
  recommended: {
    label: "Recommended",
    badge: "border-amber-300 bg-amber-50 text-amber-800",
    ring: "ring-amber-200",
  },
  cohort: {
    label: "Covered in cohort",
    badge: "border-teal-300 bg-teal-50 text-teal-800",
    ring: "ring-teal-200",
  },
  advanced: {
    label: "Advanced · later",
    badge: "border-violet-300 bg-violet-50 text-violet-800",
    ring: "ring-violet-200",
  },
  publishing: {
    label: "After Demo Day",
    badge: "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-800",
    ring: "ring-fuchsia-200",
  },
};

export function PrereqsChecklist({ cohortSlug }: { cohortSlug: string }) {
  const [checked, setChecked] = useState<CheckedMap>({});
  const [hydrated, setHydrated] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(cohortSlug));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") setChecked(parsed);
      }
    } catch {}
    setHydrated(true);
  }, [cohortSlug]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function persist(next: CheckedMap) {
    setChecked(next);
    try {
      localStorage.setItem(STORAGE_KEY(cohortSlug), JSON.stringify(next));
    } catch {}
  }

  function toggle(itemId: string) {
    persist({ ...checked, [itemId]: !checked[itemId] });
  }

  const verifyIds = useMemo(() => getAllVerifyItemIds(), []);
  const requiredIds = useMemo(
    () =>
      PREREQS.find((g) => g.id === "required")?.items.map((i) => i.id) ?? [],
    [],
  );
  const requiredDone = requiredIds.filter((id) => checked[id]).length;
  const totalDone = verifyIds.filter((id) => checked[id]).length;
  const requiredAll = requiredDone === requiredIds.length;

  return (
    <div className="space-y-8">
      {/* Header progress */}
      <Card
        className={`overflow-hidden border-0 shadow-sm ${
          requiredAll
            ? "bg-gradient-to-r from-emerald-500 to-teal-600"
            : "bg-gradient-to-r from-slate-800 to-slate-900"
        } text-white`}
      >
        <CardContent className="flex flex-wrap items-center justify-between gap-6 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/15">
              <ListChecks className="h-6 w-6" />
            </div>
            <div>
              <div className="font-mono text-xs uppercase tracking-widest opacity-80">
                Pre-flight
              </div>
              <div className="text-xl font-semibold tracking-tight">
                {requiredAll
                  ? "You're cleared for Session 1."
                  : `${requiredDone} / ${requiredIds.length} required complete`}
              </div>
              <div className="mt-0.5 text-xs opacity-80">
                {totalDone} action items checked overall
              </div>
            </div>
          </div>
          {!requiredAll && hydrated && (
            <div className="text-xs opacity-80">
              Goal: green by <strong>Sun Jun 7 EOD</strong>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Groups */}
      {PREREQS.map((group) => (
        <GroupSection
          key={group.id}
          group={group}
          checked={checked}
          hydrated={hydrated}
          onToggle={toggle}
        />
      ))}
    </div>
  );
}

function GroupSection({
  group,
  checked,
  hydrated,
  onToggle,
}: {
  group: PreReqGroup;
  checked: CheckedMap;
  hydrated: boolean;
  onToggle: (id: string) => void;
}) {
  const style = PRIORITY_STYLE[group.priority];
  const verifyItems = group.items.filter((i) => i.kind === "verify");
  const doneInGroup = verifyItems.filter((i) => checked[i.id]).length;
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <Badge variant="outline" className={style.badge}>
              {style.label}
            </Badge>
            {verifyItems.length > 0 && (
              <span className="font-mono text-xs text-slate-500">
                {doneInGroup} / {verifyItems.length} checked
              </span>
            )}
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            {group.title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            {group.description}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {group.items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            isChecked={!!checked[item.id]}
            hydrated={hydrated}
            ringClass={style.ring}
            onToggle={onToggle}
          />
        ))}
      </div>
    </section>
  );
}

function ItemRow({
  item,
  isChecked,
  hydrated,
  ringClass,
  onToggle,
}: {
  item: PreReqItem;
  isChecked: boolean;
  hydrated: boolean;
  ringClass: string;
  onToggle: (id: string) => void;
}) {
  const isVerify = item.kind === "verify";

  return (
    <Card
      className={`transition ${
        isVerify && isChecked
          ? "border-emerald-200 bg-emerald-50/50 shadow-sm"
          : `border-slate-200 ring-1 ring-inset ${ringClass}/40 hover:ring-2`
      }`}
    >
      <CardContent className="flex items-start gap-4 p-5">
        {isVerify ? (
          <button
            type="button"
            onClick={() => onToggle(item.id)}
            disabled={!hydrated}
            aria-label={isChecked ? `Uncheck ${item.title}` : `Check off ${item.title}`}
            className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition ${
              isChecked
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-slate-300 bg-white hover:border-rose-400"
            }`}
          >
            {isChecked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
          </button>
        ) : (
          <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
            <Info className="h-3.5 w-3.5" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3
              className={`font-semibold tracking-tight ${
                isChecked ? "text-emerald-900" : "text-slate-900"
              }`}
            >
              {item.title}
            </h3>
            {item.todo && (
              <Badge
                variant="outline"
                className="border-amber-300 bg-amber-50 text-[10px] uppercase tracking-widest text-amber-800"
              >
                <Sparkles className="mr-0.5 h-2.5 w-2.5" /> Eugene to expand
              </Badge>
            )}
          </div>
          <p
            className={`mt-1 text-sm ${
              isChecked ? "text-emerald-900/80" : "text-slate-600"
            }`}
          >
            {item.description}
          </p>
          {item.notes && (
            <p className="mt-1.5 text-xs italic text-slate-500">{item.notes}</p>
          )}
          {item.code && item.code.length > 0 && (
            <pre className="mt-2.5 overflow-x-auto rounded-md bg-slate-900 px-3 py-2 font-mono text-xs leading-relaxed text-slate-100">
              <code>{item.code.join("\n")}</code>
            </pre>
          )}
          {item.links && item.links.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.links.map((link) =>
                link.internal ? (
                  <Button
                    key={link.href}
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-7 px-2.5 text-xs"
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ) : (
                  <Button
                    key={link.href}
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-7 px-2.5 text-xs"
                  >
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                      <ArrowUpRight className="ml-1 h-3 w-3 text-slate-400" />
                    </a>
                  </Button>
                ),
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
