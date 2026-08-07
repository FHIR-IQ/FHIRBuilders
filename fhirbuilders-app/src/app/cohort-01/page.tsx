import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { isCohortMember } from "@/lib/cohort/cohort-00";
import { COHORT_01_PRICING } from "@/lib/stripe";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bot,
  Building2,
  CalendarDays,
  KeyRound,
  MessagesSquare,
  Rocket,
  Video,
} from "lucide-react";
import { EnrollButtons } from "./_components/enroll-buttons";

export const metadata: Metadata = {
  title: "Cohort 01 — The FHIR + AI Build Cohort · Healthcare AI Builders",
  description:
    "Twelve weeks, paid, build-in-public. Ship healthcare AI on real FHIR with your own agents. Weekly Friday demos. Starts late August.",
};

// Organizations represented in Cohort 00 — social proof about who builds here.
const COHORT_00_ORGS = [
  "Bayada Home Health Care",
  "Centric Healthcare",
  "HitPeak Advisors",
  "Indicina",
  "Lanyard Health",
  "LivMor",
  "Myriad Genetics",
  "Velox Metadata",
  "Virginia Medicaid (DMAS)",
];

const HOW = [
  {
    icon: Video,
    title: "Friday demos, every week",
    body: "The spine of the cohort. You show what you built this week — solo or with your team — live and on camera. Recorded, and the best clips go on LinkedIn with your name on them.",
  },
  {
    icon: Bot,
    title: "You + your agents",
    body: "Come with an agent setup, or build one in week one. Claude Code, Codex, your own MCP servers — whatever you drive. We build with agents, not despite them.",
  },
  {
    icon: Rocket,
    title: "Problems solved live",
    body: "Free-form working sessions, not lectures. Bring what's blocking you and we unblock it in the room. Stuck is a feature of the format, not a failure.",
  },
  {
    icon: MessagesSquare,
    title: "The room stays on between Fridays",
    body: "The cohort lives on Buzz — Block's new team chat — where you share progress, trade fixes, and get unstuck without waiting for the call.",
  },
];

export default async function Cohort01Page() {
  const session = await auth();
  const repeat = isCohortMember(session?.user?.email);

  const full = repeat ? COHORT_01_PRICING.full.repeat : COHORT_01_PRICING.full.standard;
  const weekly = repeat ? COHORT_01_PRICING.weekly.repeat : COHORT_01_PRICING.weekly.standard;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 lg:px-8 lg:py-16">
      {/* Hero */}
      <header className="mb-12">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="outline" className="border-rose-300 bg-rose-50 text-rose-700">
            <Rocket className="mr-1 h-3 w-3" /> Cohort 01 · enrolling now
          </Badge>
          <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-600">
            12 weeks · paid · starts late August
          </Badge>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          The FHIR + AI build cohort.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Twelve weeks. Real patient data. Your own agents. You ship healthcare AI in public,
          demo it live every Friday, and walk out with deployed work and a reel of it. Solo or
          bring your team.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-slate-500">
          Cohort 00 was free, and free meant optional. This one is paid on purpose: you put money
          down, you do the work, you ship. Nobody drifts.
        </p>
      </header>

      {/* Proof bar */}
      <section className="mb-12">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
          <Building2 className="h-3.5 w-3.5" /> Cohort 00 builders came from
        </div>
        <div className="flex flex-wrap gap-2">
          {COHORT_00_ORGS.map((org) => (
            <span
              key={org}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700"
            >
              {org}
            </span>
          ))}
        </div>
      </section>

      {/* How it runs */}
      <section className="mb-12">
        <h2 className="mb-4 border-b border-slate-200 pb-2 text-xl font-semibold text-slate-900">
          How it runs
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {HOW.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="border-slate-200">
              <CardContent className="p-4">
                <Icon className="mb-2 h-5 w-5 text-rose-600" />
                <div className="font-semibold text-slate-900">{title}</div>
                <p className="mt-1 text-sm text-slate-600">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Live Friday demos, recorded. Free-form working structure — no fixed lecture track. Expect
          a few focused hours a week; you get out what you put in.
        </p>
      </section>

      {/* What you bring */}
      <section className="mb-12">
        <h2 className="mb-4 border-b border-slate-200 pb-2 text-xl font-semibold text-slate-900">
          What you bring
        </h2>
        <Card className="border-slate-200">
          <CardContent className="flex items-start gap-3 p-5">
            <KeyRound className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
            <div>
              <div className="font-semibold text-slate-900">Your own LLM account</div>
              <p className="mt-1 text-sm text-slate-600">
                Bring your own Claude, ChatGPT, or other LLM subscription and API access — this is
                a build cohort, and you drive your own tools. We&apos;ll help you get set up in
                week one if you&apos;re starting fresh, but the accounts are yours. The shared FHIR
                sandbox and curriculum are included.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Pricing */}
      <section id="enroll" className="mb-12">
        <h2 className="mb-1 text-xl font-semibold text-slate-900">Enroll</h2>
        <p className="mb-5 text-sm text-slate-600">
          Pay once for the full twelve weeks, or pay week to week. No application, no waiting list —
          paying is how you claim your seat.
        </p>

        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <Card className="border-rose-200 bg-rose-50/50">
            <CardContent className="p-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-rose-700">
                Full 12 weeks
              </div>
              <div className="mt-1 text-3xl font-bold text-slate-900">
                ${full.toLocaleString()}
              </div>
              <p className="mt-1 text-sm text-slate-600">
                One payment, whole cohort. Best value — works out under $
                {Math.round(full / 12)}/week.
                {repeat && (
                  <>
                    {" "}
                    <span className="font-medium text-emerald-700">
                      Returning-builder rate applied.
                    </span>
                  </>
                )}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Pay weekly
              </div>
              <div className="mt-1 text-3xl font-bold text-slate-900">
                ${weekly}
                <span className="text-base font-normal text-slate-500">/week</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Cancel anytime. If a week isn&apos;t worth it, don&apos;t pay for the next one —
                that keeps me honest.
                {repeat && (
                  <>
                    {" "}
                    <span className="font-medium text-emerald-700">Returning-builder rate.</span>
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        <EnrollButtons repeat={repeat} />

        {!repeat && (
          <p className="mt-4 text-sm text-slate-600">
            <strong className="text-slate-900">Cohort 00 builder or returning?</strong> Sign in
            with your cohort email before enrolling and your discounted rate applies automatically
            (${COHORT_01_PRICING.full.repeat.toLocaleString()} full / $
            {COHORT_01_PRICING.weekly.repeat}/week).
          </p>
        )}
      </section>

      {/* Calendar note */}
      <section className="mb-12">
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="flex items-start gap-3 p-5">
            <CalendarDays className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-500" />
            <div>
              <div className="font-semibold text-slate-900">Dates &amp; format</div>
              <p className="mt-1 text-sm text-slate-600">
                Twelve weeks starting late August, weekly Friday demo sessions (time confirmed to
                enrolled builders, recorded either way). Once you enroll you get the Buzz invite,
                the async materials, and the FHIR sandbox the same day.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="mt-12 border-t border-slate-200 pt-6 text-xs text-slate-500">
        Run by FHIR IQ · Healthcare AI Builders. Questions before you enroll?{" "}
        <a className="underline" href="mailto:eugene.vestel@gmail.com">
          eugene.vestel@gmail.com
        </a>
      </footer>
    </div>
  );
}
