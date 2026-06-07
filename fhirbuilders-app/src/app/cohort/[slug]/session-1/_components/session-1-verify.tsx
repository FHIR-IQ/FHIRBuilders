"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Check, ListChecks } from "lucide-react";

export type VerifyItem = {
  id: string;
  label: string;
  detail: string;
  links?: { label: string; href: string; internal?: boolean }[];
};

export const VERIFY_ITEMS: VerifyItem[] = [
  {
    id: "cc-version",
    label: "`claude --version` returns a version",
    detail: "Run it in your terminal. If it errors, reinstall from the Claude Code docs.",
    links: [{ label: "Install docs", href: "https://docs.anthropic.com/en/docs/claude-code/setup" }],
  },
  {
    id: "skills-installed",
    label: "FHIR IQ skill pack installed",
    detail: "Run `/security-review` in any project — if it fires, your skills are live.",
    links: [{ label: "Skills docs", href: "https://docs.anthropic.com/en/docs/claude-code/skills" }],
  },
  {
    id: "plan-known",
    label: "I know which Claude plan I'm on (Pro / Max)",
    detail: "Check claude.ai/settings → Billing. Pro = ~200 msgs / 5h window. Max = ~2000.",
    links: [{ label: "Upgrade", href: "https://claude.com/upgrade" }],
  },
  {
    id: "auto-mode",
    label: "Auto mode understood and tested",
    detail: "Run `claude --auto` on a safe task (ask it to list files). Know when NOT to use it.",
    links: [{ label: "Auto mode docs", href: "https://docs.anthropic.com/en/docs/claude-code/settings" }],
  },
  {
    id: "github-repo",
    label: "GitHub repo created for my project + CLAUDE.md added",
    detail: "One repo per project. CLAUDE.md in root. Pushed to GitHub.",
    links: [{ label: "GitHub", href: "https://github.com/new" }],
  },
  {
    id: "vercel-connected",
    label: "Vercel project connected to my GitHub repo",
    detail: "Import your repo on Vercel. A push to main should trigger a deploy.",
    links: [{ label: "Vercel import", href: "https://vercel.com/new" }],
  },
  {
    id: "stack-account",
    label: "At least one stack tool account set up (Supabase / Railway / Resend)",
    detail: "Pick the one your project needs first. You don't need all of them today.",
    links: [
      { label: "Supabase", href: "https://supabase.com/dashboard" },
      { label: "Railway", href: "https://railway.app" },
      { label: "Resend", href: "https://resend.com/signup" },
    ],
  },
  {
    id: "mcp-wired",
    label: "Connected one service via MCP or CLI",
    detail: "Even `claude mcp add` with a simple server counts. Auth was the only manual step.",
    links: [{ label: "MCP registry", href: "https://github.com/modelcontextprotocol/servers" }],
  },
  {
    id: "security-ran",
    label: "Ran `/security-review` on my project",
    detail: "No secrets, keys, or PII committed. AI planning docs are in .gitignore or private.",
  },
  {
    id: "design-tried",
    label: "Tried Claude Design for my project UI",
    detail: "Paste a screenshot, describe the component, get back HTML/CSS. Hand off to Claude Code.",
    links: [{ label: "Claude Design", href: "https://claude.ai/design" }],
  },
];

const STORAGE_KEY = (slug: string) => `cohort:${slug}:session-1-verify`;

export function Session1Verify({ cohortSlug }: { cohortSlug: string }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

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

  function toggle(id: string) {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    try {
      localStorage.setItem(STORAGE_KEY(cohortSlug), JSON.stringify(next));
    } catch {}
  }

  const done = VERIFY_ITEMS.filter((i) => checked[i.id]).length;
  const allDone = done === VERIFY_ITEMS.length;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <Card
        className={`overflow-hidden border-0 shadow-sm ${
          allDone
            ? "bg-gradient-to-r from-emerald-500 to-teal-600"
            : "bg-gradient-to-r from-slate-800 to-slate-900"
        } text-white`}
      >
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
            <ListChecks className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-mono text-[10px] uppercase tracking-widest opacity-80">
              Session 1 · Setup Verify
            </div>
            <div className="text-lg font-semibold">
              {allDone ? "Session 1 setup complete." : `${done} / ${VERIFY_ITEMS.length} verified`}
            </div>
          </div>
          {hydrated && !allDone && (
            <div className="text-xs opacity-70">Check off as you go</div>
          )}
        </CardContent>
        <div className="h-1 bg-white/10">
          <div
            className="h-full bg-white/60 transition-all duration-500"
            style={{ width: `${Math.round((done / VERIFY_ITEMS.length) * 100)}%` }}
          />
        </div>
      </Card>

      {/* Items */}
      {VERIFY_ITEMS.map((item) => {
        const isChecked = !!checked[item.id];
        return (
          <Card
            key={item.id}
            className={`transition ${
              isChecked
                ? "border-emerald-200 bg-emerald-50/50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <CardContent className="flex items-start gap-4 p-4">
              <button
                type="button"
                onClick={() => toggle(item.id)}
                disabled={!hydrated}
                aria-label={isChecked ? `Uncheck: ${item.label}` : `Check off: ${item.label}`}
                className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition ${
                  isChecked
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-300 bg-white hover:border-rose-400"
                }`}
              >
                {isChecked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    isChecked ? "text-emerald-900" : "text-slate-900"
                  }`}
                >
                  {item.label}
                </p>
                <p className={`mt-0.5 text-xs ${isChecked ? "text-emerald-800/70" : "text-slate-500"}`}>
                  {item.detail}
                </p>
                {item.links && item.links.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.links.map((link) =>
                      link.internal ? (
                        <Button key={link.href} variant="outline" size="sm" asChild className="h-6 px-2 text-[11px]">
                          <Link href={link.href}>{link.label}</Link>
                        </Button>
                      ) : (
                        <Button key={link.href} variant="outline" size="sm" asChild className="h-6 px-2 text-[11px]">
                          <a href={link.href} target="_blank" rel="noopener noreferrer">
                            {link.label}
                            <ArrowUpRight className="ml-1 h-2.5 w-2.5 text-slate-400" />
                          </a>
                        </Button>
                      )
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function Session1VerifySummary({ cohortSlug }: { cohortSlug: string }) {
  const [done, setDone] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(cohortSlug));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setDone(Object.values(parsed).filter(Boolean).length);
        }
      }
    } catch {}
    setHydrated(true);
  }, [cohortSlug]);

  if (!hydrated) return null;

  return (
    <Badge
      variant="outline"
      className={
        done === VERIFY_ITEMS.length
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-slate-200 text-slate-600"
      }
    >
      {done}/{VERIFY_ITEMS.length} verified
    </Badge>
  );
}
