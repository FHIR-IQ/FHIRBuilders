import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCohortBySlug, formatSessionTime } from "@/lib/cohort/cohort-00";
import { Session1Verify } from "./_components/session-1-verify";
import {
  BookOpen,
  Calendar,
  Database,
  ExternalLink,
  Github,
  Globe,
  Key,
  Layers,
  Palette,
  Shield,
  Sparkles,
  Terminal,
  Video,
  Zap,
} from "lucide-react";

type Step = {
  n: number;
  icon: React.ElementType;
  title: string;
  duration: string;
  points: string[];
  tools?: string[];
};

const STEPS: Step[] = [
  {
    n: 1,
    icon: Terminal,
    title: "Claude Code basics",
    duration: "~15 min",
    points: [
      "Verify `claude --version` and log in once",
      "Run CC in a real project directory — it reads your file tree and CLAUDE.md",
      "The permission model: what it asks before, what it asks never",
      "Key commands: how to interrupt, how to undo, how to start fresh",
    ],
  },
  {
    n: 2,
    icon: Sparkles,
    title: "Claude Code starter skills",
    duration: "~10 min",
    points: [
      "Skills are reusable slash commands — think macros with full CC context",
      "Install the FHIR IQ skill pack: security-review, run, code-review, and more",
      "Invoke a skill: `/security-review` or `/run` in any project",
      "Skills live in `.claude/skills/` — you can write your own",
    ],
    tools: ["FHIR IQ skill pack", "skills registry"],
  },
  {
    n: 3,
    icon: Zap,
    title: "Managing usage — credits and models",
    duration: "~5 min",
    points: [
      "Pro ($20/mo): ~200 msgs per 5-hour window · Claude Sonnet 4.5 default",
      "Max ($100/mo): ~2000 msgs per 5-hour window · Opus 4.8 available",
      "Use `/fast` to switch to Opus fast mode (same intelligence, lower latency)",
      "API key (BYOK) comes Week 3 — not needed for Sessions 1 or 2",
    ],
  },
  {
    n: 4,
    icon: Layers,
    title: "Auto mode",
    duration: "~5 min",
    points: [
      "Auto mode = CC acts without asking permission on each tool call",
      "Enable: `claude --auto` flag or toggle `/auto` inside a session",
      "Great for: long refactors, migrations, green-field builds you've reviewed",
      "Avoid on: first run on an unknown repo, destructive ops, production changes",
    ],
  },
  {
    n: 5,
    icon: Github,
    title: "Projects + GitHub repos",
    duration: "~15 min",
    points: [
      "One GitHub repo per project — CC uses it as the source of truth",
      "`git init` → `gh repo create` → first commit with CLAUDE.md in root",
      "CLAUDE.md tells future CC instances what the project is, how to run it, what not to touch",
      "Commit AI changes the same as human changes — CC writes the commit message",
    ],
  },
  {
    n: 6,
    icon: Globe,
    title: "Connect Vercel",
    duration: "~10 min",
    points: [
      "Import GitHub repo → Vercel detects the framework (Next.js, Vite, etc.)",
      "Every push to `main` triggers a deploy — preview URLs for every PR",
      "Env vars live in Vercel dashboard and in your `.env.local` — CC reads `.env.local`",
      "Demo Day expects a live Vercel URL — wire this up now, not the night before",
    ],
    tools: ["Vercel", "vercel CLI"],
  },
  {
    n: 7,
    icon: Database,
    title: "Agentic dev stack",
    duration: "~10 min",
    points: [
      "Supabase — Postgres + auth + edge functions. MCP server available; CC connects in one command",
      "Railway — deploy any server (FastAPI, Express, Go) from a Dockerfile in 2 min. No YAML",
      "Wispr Flow — voice → typed text anywhere, including the terminal while CC is running",
      "Google Cloud — BigQuery for FHIR flat tables, Cloud Run for containers, Vertex AI optional",
      "Resend — transactional email API. Node and Python SDKs. CC wires it in under 10 lines",
    ],
    tools: ["Supabase", "Railway", "Wispr Flow", "BigQuery", "Resend"],
  },
  {
    n: 8,
    icon: Key,
    title: "Claude API · MCP · CLI principles",
    duration: "~10 min",
    points: [
      "Claude Code can connect to any service that exposes an API, CLI, or MCP server",
      "The pattern: you handle auth (API key / OAuth token) — CC handles the rest",
      "`claude mcp add` wires an MCP server; `npx @modelcontextprotocol/server-*` starts one",
      "CC reads your terminal output — paste an error from any CLI and it debugs it in place",
    ],
    tools: ["MCP", "Claude API", "Anthropic SDK"],
  },
  {
    n: 9,
    icon: Shield,
    title: "Security zone",
    duration: "~5 min",
    points: [
      "Run `/security-review` after every commit — catches secrets, keys, and PII before they land",
      "AI cruft (planning docs, critique outputs, beta simulation files) belongs in `.gitignore`",
      "Public repos: curate CLAUDE.md — no internal URLs, personal emails, or client names",
      "Never commit `.env*` files; never let CC generate mock credentials that look real",
    ],
  },
  {
    n: 10,
    icon: Palette,
    title: "Claude Design + special tools",
    duration: "~10 min",
    points: [
      "claude.ai/design → describe a UI component → get HTML/CSS/JS → paste screenshot into CC",
      "Attach reference images: competitor screenshots, Figma exports, or a napkin sketch",
      "Special tools: Excalidraw MCP (architecture diagrams), Playwright MCP (visual testing)",
      "The pattern: design in Claude → hand mockup + screenshot to CC → CC builds it in your stack",
    ],
    tools: ["Claude Design", "Excalidraw MCP", "Playwright MCP"],
  },
];

type PageProps = { params: Promise<{ slug: string }> };

export default async function Session1Page({ params }: PageProps) {
  const { slug } = await params;
  const cohort = getCohortBySlug(slug);
  if (!cohort) notFound();

  const session = cohort.sessions.find((s) => s.id === "session-1");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-teal-300 bg-teal-50 text-teal-700">
            <BookOpen className="mr-1 h-3 w-3" /> Session 1
          </Badge>
          <Badge variant="outline" className="border-rose-300 bg-rose-50 text-rose-700">
            Mandatory live
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Setup + first real commit
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          VS Code + Git + Claude Code, fluent. FHIRBuilders sandbox login, one FHIR read deployed.
          Ten blocks, ~90 minutes, one working repo at the end.
        </p>

        {session && (
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              {formatSessionTime(session)}
            </span>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/cohort/${slug}/session-1/learn`}>
                <BookOpen className="mr-2 h-3.5 w-3.5" />
                Study Guide
              </Link>
            </Button>
            {session.meetUrl && (
              <Button size="sm" asChild>
                <a href={session.meetUrl} target="_blank" rel="noopener noreferrer">
                  <Video className="mr-2 h-3.5 w-3.5" />
                  Join on Google Meet
                </a>
              </Button>
            )}
            {session.notebookLmUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={session.notebookLmUrl} target="_blank" rel="noopener noreferrer">
                  NotebookLM
                  <ExternalLink className="ml-1.5 h-3 w-3" />
                </a>
              </Button>
            )}
            {session.driveFolderUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={session.driveFolderUrl} target="_blank" rel="noopener noreferrer">
                  Drive folder
                  <ExternalLink className="ml-1.5 h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Workflow — main column */}
        <div className="space-y-4 lg:col-span-2">
          <div className="mb-2 font-mono text-xs uppercase tracking-widest text-slate-500">
            Session workflow · 10 blocks
          </div>
          {STEPS.map((step) => (
            <StepCard key={step.n} step={step} />
          ))}
        </div>

        {/* Setup verify — sidebar */}
        <div className="space-y-4">
          <div className="mb-2 font-mono text-xs uppercase tracking-widest text-slate-500">
            Setup verification
          </div>
          <Session1Verify cohortSlug={slug} />
        </div>
      </div>
    </div>
  );
}

function StepCard({ step }: { step: Step }) {
  const Icon = step.icon;
  return (
    <Card className="overflow-hidden border-0 shadow-sm transition hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Step number + icon */}
          <div className="flex w-14 flex-col items-center justify-start gap-1 border-r border-slate-100 bg-slate-50 px-3 py-4 text-center">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {String(step.n).padStart(2, "0")}
            </span>
            <Icon className="h-4 w-4 text-slate-500" />
          </div>

          {/* Content */}
          <div className="flex-1 px-5 py-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-slate-900">{step.title}</h3>
              <span className="font-mono text-xs text-slate-400">{step.duration}</span>
            </div>
            <ul className="space-y-1">
              {step.points.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-300" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
            {step.tools && step.tools.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {step.tools.map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="border-slate-200 bg-slate-50 text-[10px] text-slate-600"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
