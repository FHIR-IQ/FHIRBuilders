import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, GraduationCap, MessageSquare, Video } from "lucide-react";

type Workshop = {
  id: string;
  title: string;
  presenter: string;
  presenterRole: string;
  initials: string;
  date: string;
  status: "scheduled" | "tentative" | "request";
  description: string;
  /** Tailwind gradient utility chain. */
  gradient: string;
};

// Phase 1: hardcoded slate. When the public "Featured Workshops" calendar
// goes live (Cohort 01+), these move to a CohortWorkshop Prisma model.
const WORKSHOPS: Workshop[] = [
  {
    id: "claude-code-r6",
    title: "Claude Code + FHIR R6",
    presenter: "Eugene Vestel",
    presenterRole: "Founder, FHIR IQ",
    initials: "EV",
    date: "Wed Jun 17 · 12:00 PM ET",
    status: "scheduled",
    description:
      "What changed between R4 and R6, what to teach your agent first, and the four MCP tools that get you the new resources without rewriting your code.",
    gradient: "from-violet-600 via-fuchsia-500 to-rose-500",
  },
  {
    id: "cql-to-sql",
    title: "CQL → SQL on FHIR",
    presenter: "Eugene Vestel",
    presenterRole: "Founder, FHIR IQ",
    initials: "EV",
    date: "Wed Jun 24 · 12:00 PM ET",
    status: "scheduled",
    description:
      "Compiling HEDIS and quality measures from CQL to native SQL on flat FHIR tables. The talk that opened Analytics on FHIR, now hands-on for cohort builders.",
    gradient: "from-teal-600 via-emerald-500 to-lime-500",
  },
  {
    id: "voice-agents",
    title: "Voice agents on real FHIR",
    presenter: "Guest TBD",
    presenterRole: "LiveKit + Anthropic patterns",
    initials: "?",
    date: "Wed Jul 1 · 12:00 PM ET",
    status: "tentative",
    description:
      "Patient-facing voice intake + clinical scribe workflows. We'll wire a Vapi or LiveKit agent to your Medplum sandbox and see what breaks first.",
    gradient: "from-amber-500 via-orange-500 to-rose-600",
  },
  {
    id: "prior-auth",
    title: "Prior-auth deep dive",
    presenter: "Guest TBD",
    presenterRole: "Payer interop + DTR / CRD",
    initials: "?",
    date: "Date TBD",
    status: "request",
    description:
      "From eligibility checks to FHIR-based DTR / CRD bundles. If your pod is building anything prior-auth adjacent, this one's for you.",
    gradient: "from-sky-600 via-blue-500 to-indigo-600",
  },
];

type PageProps = { params: Promise<{ slug: string }> };

export default async function WorkshopsPage({ params }: PageProps) {
  await params; // for symmetry with sibling routes
  const scheduled = WORKSHOPS.filter((w) => w.status === "scheduled");
  const tentative = WORKSHOPS.filter((w) => w.status === "tentative");
  const requested = WORKSHOPS.filter((w) => w.status === "request");

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-2 border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700">
            <GraduationCap className="mr-1 h-3 w-3" /> Workshops
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Featured drop-in workshops
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            One-hour hands-on sessions on Wednesdays between the main cohort sessions.
            Optional — drop in if the topic helps your pod ship.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="mailto:gene@fhiriq.com?subject=Workshop%20suggestion">
            <MessageSquare className="mr-2 h-4 w-4" /> Suggest a workshop
          </a>
        </Button>
      </div>

      <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-slate-500">
        Scheduled
      </h2>
      <div className="mb-10 grid gap-4 md:grid-cols-2">
        {scheduled.map((w) => (
          <WorkshopCard key={w.id} w={w} />
        ))}
      </div>

      {tentative.length > 0 && (
        <>
          <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-slate-500">
            Tentative
          </h2>
          <div className="mb-10 grid gap-4 md:grid-cols-2">
            {tentative.map((w) => (
              <WorkshopCard key={w.id} w={w} />
            ))}
          </div>
        </>
      )}

      {requested.length > 0 && (
        <>
          <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-slate-500">
            Requested · TBD
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {requested.map((w) => (
              <WorkshopCard key={w.id} w={w} />
            ))}
          </div>
        </>
      )}

      <Card className="mt-10 border-dashed bg-slate-50">
        <CardContent className="flex items-start gap-3 p-5 text-sm">
          <GraduationCap className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-500" />
          <div>
            <div className="font-medium text-slate-900">Want to teach a workshop?</div>
            <p className="mt-1 text-slate-600">
              If you&apos;re a builder, clinician, or operator with a tactical
              45-minute thing to teach Cohort 00 — payer interop, terminology services,
              SMART on FHIR auth, anything — drop a note.{" "}
              <a
                href="mailto:gene@fhiriq.com?subject=Teach%20a%20Cohort%2000%20workshop"
                className="font-medium text-rose-600 hover:underline"
              >
                Email Eugene
              </a>{" "}
              with a one-line topic.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WorkshopCard({ w }: { w: Workshop }) {
  return (
    <Card className="group overflow-hidden border-0 shadow-sm transition hover:shadow-md">
      <div className={`relative h-32 bg-gradient-to-br ${w.gradient} px-5 py-4`}>
        <div className="absolute inset-0 opacity-10 mix-blend-overlay [background-image:radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_60%,white,transparent_40%)]" />
        <div className="relative flex h-full flex-col justify-between text-white">
          <Badge className="w-fit border-0 bg-white/20 text-white hover:bg-white/30">
            WORKSHOP
          </Badge>
          <div>
            <h3 className="text-xl font-bold tracking-tight">{w.title}</h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-white/90">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 font-mono text-[10px] font-semibold">
                {w.initials}
              </div>
              <span>{w.presenter}</span>
            </div>
          </div>
        </div>
      </div>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5" />
          <span>{w.date}</span>
        </div>
        <p className="text-sm text-slate-600">{w.description}</p>
        <div className="text-xs text-slate-500">
          <span className="font-medium text-slate-700">{w.presenterRole}</span>
        </div>
        <div className="flex gap-2 pt-1">
          {w.status === "scheduled" ? (
            <>
              <Button size="sm" variant="outline" className="text-xs" disabled>
                <Video className="mr-1.5 h-3 w-3" /> Join (sent 24h before)
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-rose-600 hover:text-rose-700"
                asChild
              >
                <a
                  href={`mailto:gene@fhiriq.com?subject=Add%20to%20calendar%3A%20${encodeURIComponent(
                    w.title,
                  )}`}
                >
                  + Cal <ArrowRight className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </>
          ) : (
            <Badge variant="outline" className="text-xs">
              {w.status === "tentative" ? "Holding the date" : "Vote / request"}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
