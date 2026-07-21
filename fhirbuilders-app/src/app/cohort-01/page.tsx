import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BadgeCheck,
  Building2,
  CalendarClock,
  FlaskConical,
  Rocket,
  ShieldCheck,
  Users,
} from "lucide-react";
import { ApplyForm } from "./_components/apply-form";

export const metadata: Metadata = {
  title: "Cohort 01 — The FHIR + AI Masterclass · Healthcare AI Builders",
  description:
    "Six weeks, 20 seats, application only. Build and deploy a real healthcare AI app on FHIR with Claude Code. Starts late August.",
};

// Organizations represented in Cohort 00. Names only, alphabetical — this is
// social proof about who builds here, not an endorsement claim.
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

const WEEKS = [
  {
    n: 1,
    title: "Setup + first real commit",
    body: "Claude Code fluent in your terminal. FHIR sandbox connected. Your first read of real patient data, deployed by end of week.",
  },
  {
    n: 2,
    title: "MCP servers + retrieval",
    body: "Give your agent live FHIR hands. Build an MCP server against Medplum, wire semantic search over clinical notes.",
  },
  {
    n: 3,
    title: "Your project, scaffolded",
    body: "Scope locked to one sentence. Repo, CLAUDE.md, first working feature. This is where your app becomes real.",
  },
  {
    n: 4,
    title: "Ship one real slice",
    body: "Deployed URL, real data, one complete user action. Reviewed live, unblocked live.",
  },
  {
    n: 5,
    title: "Harden + polish",
    body: "Auth, error states, the parts that make it credible to show your CEO or your customers.",
  },
  {
    n: 6,
    title: "Demo Day",
    body: "Public demo in front of the healthcare AI community, Cohort 00 alumni, and the next cohort's waitlist.",
  },
];

export default function Cohort01Page() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 lg:px-8 lg:py-16">
      {/* Hero */}
      <header className="mb-12">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="outline" className="border-rose-300 bg-rose-50 text-rose-700">
            <Rocket className="mr-1 h-3 w-3" /> Cohort 01 · applications open
          </Badge>
          <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-600">
            20 seats · starts late August
          </Badge>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          The FHIR + AI masterclass.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Six weeks. Real patient data. A deployed healthcare AI app with your name on it. You
          build with Claude Code on live FHIR from day one, alongside people who run informatics,
          data, and product inside real health organizations.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-slate-500">
          Nobody else teaches this. AI courses skip healthcare data. FHIR courses skip AI. This is
          the room where both get built at once.
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

      {/* The six weeks */}
      <section className="mb-12">
        <h2 className="mb-4 border-b border-slate-200 pb-2 text-xl font-semibold text-slate-900">
          The six weeks
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {WEEKS.map((w) => (
            <Card key={w.n} className="border-slate-200">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 font-mono text-xs font-bold text-white">
                    {w.n}
                  </span>
                  <span className="font-semibold text-slate-900">{w.title}</span>
                </div>
                <p className="text-sm text-slate-600">{w.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Live sessions Wednesdays 6:30–8:00 PM ET, recorded. Expect 3–5 hours a week total.
          Curriculum refined from Cohort 00 — same arc, sharper edges.
        </p>
      </section>

      {/* Pricing + guarantee */}
      <section className="mb-12 grid gap-4 sm:grid-cols-2">
        <Card className="border-rose-200 bg-rose-50/50">
          <CardContent className="p-5">
            <div className="mb-2 flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-rose-600" />
              <span className="text-xs font-semibold uppercase tracking-widest text-rose-700">
                Founding rate
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900">
              $399{" "}
              <span className="text-base font-normal text-slate-500">until Aug 1 · $599 after</span>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
              <li>Employer invoice available — most builders expense it</li>
              <li>Payment only after acceptance</li>
              <li>Cost a concern? Apply anyway. We&apos;ll figure something out.</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-5">
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
                The ship guarantee
              </span>
            </div>
            <p className="text-sm text-slate-700">
              Attend all six sessions and don&apos;t ship a working app by Demo Day, and we refund
              every dollar. Everyone in Cohort 00 who kept showing up shipped. That&apos;s not a
              slogan, it&apos;s why we can offer this.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Free door */}
      <section className="mb-12">
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-slate-500" />
                <span className="font-semibold text-slate-900">
                  Not sure? Try the stack for free first.
                </span>
              </div>
              <p className="text-sm text-slate-600">
                HealthClaw Guardrails — the open-source layer this community builds on — has a
                hosted demo you can test in 60 seconds, no install.{" "}
                <a
                  href="https://github.com/aks129/HealthClawGuardrails/issues/184"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-slate-900"
                >
                  Take the community test drive
                </a>
                , or check the box in the application to get the weekly ship log while you
                decide.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Who it's for */}
      <section className="mb-12">
        <h2 className="mb-4 border-b border-slate-200 pb-2 text-xl font-semibold text-slate-900">
          Who this is for
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <Users className="mb-2 h-5 w-5 text-rose-600" />
              <div className="font-semibold text-slate-900">Healthcare people who want to build</div>
              <p className="mt-1 text-sm text-slate-600">
                Clinicians, informaticists, ops and product leaders. You don&apos;t need to be a
                developer — Cohort 00 proved that. You need an idea and the will to show up.
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <FlaskConical className="mb-2 h-5 w-5 text-rose-600" />
              <div className="font-semibold text-slate-900">Builders who want healthcare depth</div>
              <p className="mt-1 text-sm text-slate-600">
                Engineers and data folks who can code but haven&apos;t touched FHIR, US Core, or
                clinical data. Six weeks here beats six months of reading specs.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Application */}
      <section id="apply" className="mb-8">
        <h2 className="mb-1 text-xl font-semibold text-slate-900">Apply</h2>
        <p className="mb-5 text-sm text-slate-600">
          20 seats, reviewed on a rolling basis — the earlier you apply, the better your odds.
          Specific project ideas get priority. So do referrals from Cohort 00 builders.
        </p>
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <ApplyForm />
          </CardContent>
        </Card>
      </section>

      <footer className="mt-12 border-t border-slate-200 pt-6 text-xs text-slate-500">
        Run by FHIR IQ · Healthcare AI Builders. Questions?{" "}
        <a className="underline" href="mailto:eugene.vestel@gmail.com">
          eugene.vestel@gmail.com
        </a>
      </footer>
    </div>
  );
}
