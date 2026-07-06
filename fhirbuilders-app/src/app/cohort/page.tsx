import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  COHORT_00,
  formatSessionTime,
  getCohortBuilder,
  isCohortMember,
} from "@/lib/cohort/cohort-00";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, CheckCircle2, GitBranch, Lock, Sparkles, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Cohort — FHIRBuilders",
  description:
    "Free, hands-on 6-week sprint building Healthcare AI with Claude Code on real FHIR via Medplum. Cohort 00 starts Mon Jun 8 2026.",
};

export default async function CohortIndexPage() {
  const session = await auth();
  const email = session?.user?.email ?? null;

  // Enrolled cohort members go straight to their cohort home. This is the
  // happy path — most signed-in cohort traffic should land here for one
  // server-side redirect, then never see this landing again.
  if (email && isCohortMember(email)) {
    redirect("/cohort/cohort-00");
  }

  // Otherwise: render the public landing. Two states inside:
  //   (a) signed in but not enrolled — show "you're not in this cohort, here's
  //       the next one" + waitlist CTA
  //   (b) signed out — show "what is this + sign in to check" + waitlist CTA
  const builder = email ? getCohortBuilder(email) : null;
  const signedInNotEnrolled = !!email && !builder;

  const session1 = COHORT_00.sessions.find((s) => s.id === "session-1");

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 lg:px-8 lg:py-16">
      <header className="mb-10">
        <Badge variant="outline" className="mb-3 border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700">
          <Users className="mr-1 h-3 w-3" /> Cohort
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          The 6-week sprint, every quarter.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Free, hands-on, build-in-public. Healthcare AI with Claude Code on real FHIR via Medplum.
          Small pods, weekly demos, public showcase at the end.
        </p>
      </header>

      {/* STATE BANNER */}
      {signedInNotEnrolled && (
        <Card className="mb-8 border-amber-200 bg-amber-50/40">
          <CardContent className="flex items-start gap-3 p-4">
            <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
            <div className="text-sm">
              <strong className="text-slate-900">You&apos;re signed in</strong> as{" "}
              <span className="font-mono">{email}</span> but not enrolled in{" "}
              {COHORT_00.name}. Cohort 00 is full and started Mon Jun 8. Drop your email below
              to be first invited to Cohort 01.
            </div>
          </CardContent>
        </Card>
      )}
      {!email && (
        <Card className="mb-8 border-fuchsia-200 bg-fuchsia-50/40">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-700">
              <strong className="text-slate-900">Already enrolled?</strong>{" "}
              Sign in and you&apos;ll land on your cohort home automatically.
            </div>
            <Link
              href={`/login?callbackUrl=${encodeURIComponent("/cohort")}`}
              className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Sign in <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* COHORT 00 SNAPSHOT */}
      <section className="mb-12">
        <div className="mb-3 flex items-baseline justify-between border-b border-slate-200 pb-2">
          <h2 className="text-xl font-semibold text-slate-900">Current cohort</h2>
          <span className="font-mono text-xs text-slate-400">cohort-00 · running</span>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{COHORT_00.name}</CardTitle>
            <CardDescription className="text-xs">{COHORT_00.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500">Builders</div>
                <div className="mt-0.5 font-mono text-lg text-slate-900">{COHORT_00.signups.length}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500">Pods</div>
                <div className="mt-0.5 font-mono text-lg text-slate-900">{COHORT_00.pods.length}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500">Window</div>
                <div className="mt-0.5 font-mono text-xs text-slate-700">
                  {new Date(COHORT_00.startsAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    timeZone: "America/New_York",
                  })}{" "}
                  →{" "}
                  {new Date(COHORT_00.endsAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    timeZone: "America/New_York",
                  })}
                </div>
              </div>
            </div>
            {session1 && (
              <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-slate-700">
                  <strong>Session 1:</strong> {formatSessionTime(session1)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* WHAT YOU GET */}
      <section className="mb-12">
        <h2 className="mb-3 border-b border-slate-200 pb-2 text-xl font-semibold text-slate-900">
          What you get
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: Sparkles,
              title: "Real FHIR, real Claude Code",
              body:
                "Medplum sandbox + Synthea synthetic patients + Claude Code in your terminal. No toy frameworks.",
            },
            {
              icon: Users,
              title: "A pod of 3–4",
              body:
                "Themed by what you're building — prior auth, EMR workflow, patient tooling, etc. Weekly pod sync.",
            },
            {
              icon: GitBranch,
              title: "5 live sessions",
              body:
                "90 min, Mondays 1pm ET. Setup → first deploy → iteration → polish → Demo Day. Recorded.",
            },
            {
              icon: CheckCircle2,
              title: "Public showcase",
              body:
                "Demo Day in front of senior leaders + future Cohort 01 builders. Your shipped project lives on your profile.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <Card key={title} className="border-slate-200">
              <CardContent className="p-4">
                <Icon className="mb-2 h-5 w-5 text-fuchsia-600" />
                <div className="font-semibold text-slate-900">{title}</div>
                <p className="mt-1 text-sm text-slate-600">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* WAITLIST CTA */}
      <section className="mb-8">
        <Card className="border-fuchsia-200 bg-gradient-to-br from-fuchsia-50/60 to-violet-50/40">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <h2 className="text-xl font-bold text-slate-900">Cohort 01 applications are open.</h2>
            <p className="max-w-md text-sm text-slate-600">
              The FHIR + AI masterclass. Six weeks, 20 seats, application only. Starts late
              August.
            </p>
            <Link
              href="/cohort-01"
              className="mt-2 inline-flex items-center gap-1 rounded-md bg-fuchsia-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-fuchsia-700"
            >
              See the program + apply <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <p className="mt-1 text-[11px] text-slate-500">
              Rolling review. Payment only after acceptance.
            </p>
          </CardContent>
        </Card>
      </section>

      <footer className="mt-12 border-t border-slate-200 pt-6 text-xs text-slate-500">
        Cohort runs free — funded by FHIR IQ + the Healthcare AI Builders community.
        Questions? <a className="underline" href="mailto:eugene.vestel@gmail.com">eugene.vestel@gmail.com</a>
      </footer>
    </div>
  );
}
