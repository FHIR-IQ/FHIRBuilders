import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCohortBySlug, formatSessionTime } from "@/lib/cohort/cohort-00";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Hammer,
  Rocket,
  Target,
  Video,
} from "lucide-react";

type PrepItem = {
  n: number;
  title: string;
  detail: string;
  done?: string;
};

const PREP: PrepItem[] = [
  {
    n: 1,
    title: "Write your project scope",
    detail:
      "One sentence: who uses it, what FHIR resource it reads, what it outputs. Post it in #all-fhir-builders before Jul 1.",
    done: "Block 1 of the Project Playbook",
  },
  {
    n: 2,
    title: "Create CLAUDE.md in your repo",
    detail:
      "Tells Claude Code what you're building, your stack, and your commands. CC reads it on every startup.",
    done: "Block 2 of the Project Playbook",
  },
  {
    n: 3,
    title: "Get one FHIR read working",
    detail:
      "Read one resource type from the shared Medplum sandbox (100 patients, US Core data). Even raw JSON in a <pre> counts.",
    done: "Block 3 of the Project Playbook",
  },
  {
    n: 4,
    title: "Deploy to Vercel",
    detail:
      "Push to GitHub, link to Vercel, add Medplum env vars. You need a public URL for Session 4 — do this before Jul 1.",
    done: "Block 5 of the Project Playbook",
  },
];

type AgendaItem = { time: string; what: string };

const AGENDA: AgendaItem[] = [
  { time: "6:30 PM", what: "Welcome + quick scope check-in — everyone states their one sentence" },
  { time: "6:45 PM", what: "Live build: get unstuck together — Gene pairs with anyone blocked" },
  { time: "7:30 PM", what: "Session 4 target-setting — what are you shipping Jul 8?" },
  { time: "7:50 PM", what: "Q&A + pod check-in" },
  { time: "8:00 PM", what: "Close" },
];

type PageProps = { params: Promise<{ slug: string }> };

export default async function Session3Page({ params }: PageProps) {
  const { slug } = await params;
  const cohort = getCohortBySlug(slug);
  if (!cohort) notFound();

  const session = cohort.sessions.find((s) => s.id === "session-3");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-700">
            <BookOpen className="mr-1 h-3 w-3" /> Session 3
          </Badge>
          <Badge variant="outline" className="border-rose-300 bg-rose-50 text-rose-700">
            Mandatory live
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Catch up + project kick-off
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          No new theory — pure hands-on. Get unstuck, open Claude Code, and push your project
          forward. If you haven't started yet, this is the session that changes that. Come with
          your project idea. Leave with a deployed URL.
        </p>

        {session && (
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              {formatSessionTime(session)}
            </span>
            {session.meetUrl && (
              <Button size="sm" asChild>
                <a href={session.meetUrl} target="_blank" rel="noopener noreferrer">
                  <Video className="mr-2 h-3.5 w-3.5" /> Join on Google Meet
                </a>
              </Button>
            )}
            <Button size="sm" variant="outline" asChild>
              <Link href={`/cohort/${slug}/session-3/learn`}>
                <BookOpen className="mr-2 h-3.5 w-3.5" /> Project Playbook →
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column — main content */}
        <div className="space-y-8 lg:col-span-2">
          {/* The plan */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Hammer className="h-5 w-5 text-slate-400" />
                <h2 className="text-base font-semibold text-slate-900">What's happening</h2>
              </div>
              <p className="mb-4 text-sm text-slate-600">
                Sessions 1 and 2 covered the full stack: CC setup, MCP, vector search, FHIR
                wiring. Session 3 is different — it's open build time. Come with whatever state
                you're in.
              </p>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                  <span>
                    <strong>If you're stuck:</strong> show Eugene live — he'll unblock you in real
                    time. Bring your error message, your terminal, your question.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                  <span>
                    <strong>If you're moving:</strong> push it forward. Eugene will review your
                    scope and give feedback on what to cut for Session 4.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                  <span>
                    <strong>If you haven't started:</strong> that changes today. Session 3 is
                    exactly for this — pick a project, scaffold it with CC, get your first FHIR
                    read working.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agenda */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-slate-400" />
                <h2 className="text-base font-semibold text-slate-900">Agenda — Wed Jul 1, 6:30–8:00 PM ET</h2>
              </div>
              <div className="space-y-0 divide-y divide-slate-100">
                {AGENDA.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 py-3 first:pt-0 last:pb-0">
                    <span className="w-14 flex-shrink-0 font-mono text-xs text-slate-400">
                      {item.time}
                    </span>
                    <span className="text-sm text-slate-700">{item.what}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prep checklist */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-slate-400" />
                <h2 className="text-base font-semibold text-slate-900">
                  Prep before Jul 1 — four things
                </h2>
              </div>
              <div className="space-y-4">
                {PREP.map((item) => (
                  <div key={item.n} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-mono text-xs font-semibold text-white">
                      {item.n}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{item.detail}</div>
                      {item.done && (
                        <div className="mt-1 text-[11px] font-medium text-slate-400">
                          → {item.done}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4">
                <Button asChild className="w-full sm:w-auto">
                  <Link href={`/cohort/${slug}/session-3/learn`}>
                    <BookOpen className="mr-2 h-4 w-4" /> Open the Project Playbook
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column — sidebar */}
        <div className="space-y-6">
          {/* Session 4 target */}
          <Card className="border-rose-200 bg-rose-50">
            <CardContent className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <Rocket className="h-4 w-4 text-rose-600" />
                <span className="text-xs font-semibold uppercase tracking-widest text-rose-700">
                  Session 4 — Jul 8
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                You ship one real slice.
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Deployed URL, real FHIR data, one complete user action. That's the bar. Block 6
                of the playbook has the scope template.
              </p>
              <div className="mt-3">
                <Link
                  href={`/cohort/${slug}/session-3/learn#block-6`}
                  className="text-xs font-medium text-rose-700 underline underline-offset-2 hover:text-rose-900"
                >
                  See the Session 4 target checklist →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Key links */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Key links
              </h3>
              <div className="space-y-2">
                {[
                  {
                    label: "Shared Medplum sandbox",
                    href: "https://app.medplum.com",
                    detail: "100 patients · US Core · seeded by Michael C.",
                  },
                  {
                    label: "Ribbon Health API",
                    href: "https://ribbonhealth.com/docs",
                    detail: "Provider network matching — free dev tier",
                  },
                  {
                    label: "NPPES NPI Registry",
                    href: "https://npiregistry.cms.hhs.gov/search",
                    detail: "Free provider identity lookup",
                  },
                  {
                    label: "Vercel — add env vars",
                    href: "https://vercel.com/docs/projects/environment-variables",
                    detail: "Add MEDPLUM_* before deploying",
                  },
                  {
                    label: "FHIRBuilders playground",
                    href: "https://github.com/fhirbuilders/playground",
                    detail: "Next.js + Medplum starter",
                  },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50"
                  >
                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-300 group-hover:text-slate-500" />
                    <div>
                      <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                        {link.label}
                      </div>
                      <div className="text-xs text-slate-400">{link.detail}</div>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FHIR sandbox note */}
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-emerald-800">
                Shared sandbox ready
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Michael Campbell pushed 100 bot patients with US Core resources to the shared
                Medplum project. You can query real FHIR data without seeding anything.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
