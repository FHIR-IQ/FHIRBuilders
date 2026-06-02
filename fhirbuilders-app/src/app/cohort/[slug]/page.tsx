import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Calendar,
  Circle,
  Clock,
  ExternalLink,
  Github,
  MessageSquare,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import {
  formatSessionTime,
  getCohortBySlug,
  initialsFromName,
  nextSession,
  type CohortSession,
} from "@/lib/cohort/cohort-00";
import { CommitmentsWidget } from "./_components/commitments-widget";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cohort = getCohortBySlug(slug);
  if (!cohort) return { title: "Cohort not found" };
  return {
    title: `${cohort.name} · FHIRBuilders`,
    description: cohort.description,
  };
}

export default async function CohortPage({ params }: PageProps) {
  const { slug } = await params;
  const cohort = getCohortBySlug(slug);
  if (!cohort) notFound();

  // Capture "now" once at the page level so SessionRow stays pure during render.
  // Server component re-renders on each request, so freshness is preserved.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const upcoming = nextSession(cohort, new Date(now));
  const otherEvents = cohort.sessions.filter((s) => s.id !== upcoming?.id);
  const seatsLeft = cohort.cap - cohort.signups.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Accent stripe — signals this is a cohort surface, not the marketplace */}
      <div className="h-1 w-full bg-gradient-to-r from-rose-500 via-amber-400 to-teal-500" />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline" className="border-rose-300 bg-rose-50 text-rose-700">
                <Sparkles className="mr-1 h-3 w-3" /> Cohort
              </Badge>
              <Badge
                variant="secondary"
                className={
                  cohort.status === "active"
                    ? "bg-emerald-100 text-emerald-800"
                    : cohort.status === "upcoming"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-700"
                }
              >
                {cohort.status === "upcoming"
                  ? "Starts Mon Jun 8"
                  : cohort.status === "active"
                    ? "Active"
                    : "Complete"}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {cohort.name}
            </h1>
            <p className="mt-2 max-w-2xl text-base text-slate-600">{cohort.description}</p>
          </div>
          <div className="flex flex-col items-end gap-1 text-right text-sm">
            <div className="font-mono text-xs uppercase tracking-widest text-slate-500">Seats</div>
            <div className="text-2xl font-semibold text-slate-900">
              {cohort.signups.length}
              <span className="text-slate-400"> / {cohort.cap}</span>
            </div>
            <div className="text-xs text-slate-500">{seatsLeft} remaining</div>
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* MAIN COLUMN */}
          <div className="space-y-6 lg:col-span-2">
            {/* NEXT UP HERO */}
            {upcoming && <NextUpCard session={upcoming} />}

            {/* COMMITMENTS */}
            <CommitmentsWidget cohortSlug={cohort.slug} />

            {/* YOUR POD */}
            <YourPodCard />

            {/* THE ARC */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">The 6-week arc</CardTitle>
                    <CardDescription>Five sessions. One demo day.</CardDescription>
                  </div>
                  <Button variant="link" size="sm" asChild className="text-rose-600">
                    <a
                      href={cohort.workshopAgendaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Full agenda <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {otherEvents.map((s) => (
                  <SessionRow
                    key={s.id}
                    session={s}
                    isPast={new Date(s.startsAt).getTime() < now}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <ActiveCohortSidebar cohort={cohort} />
            <ResourcesCard />
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────── components ─────────────────────────────

function NextUpCard({ session }: { session: CohortSession }) {
  const isIntro = session.kind === "intro";
  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div
        className={`relative px-6 py-7 ${
          isIntro
            ? "bg-gradient-to-br from-violet-600 via-fuchsia-500 to-rose-500"
            : "bg-gradient-to-br from-teal-600 via-emerald-500 to-lime-500"
        } text-white`}
      >
        <div className="absolute inset-0 opacity-10 mix-blend-overlay [background-image:radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_60%,white,transparent_40%)]" />
        <div className="relative">
          <div className="mb-3 flex items-center gap-2">
            <Badge className="border-0 bg-white/20 text-white hover:bg-white/30">
              {isIntro ? "Intro" : `Week ${session.weekNumber ?? "—"}`}
            </Badge>
            {session.mandatory && (
              <Badge className="border-0 bg-rose-500/90 text-white hover:bg-rose-500">
                Mandatory live
              </Badge>
            )}
          </div>
          <div className="mb-1 font-mono text-xs uppercase tracking-widest opacity-90">
            Up next
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{session.title}</h2>
          <p className="mt-2 max-w-xl text-sm text-white/90">{session.description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 opacity-90" />
              <span>{formatSessionTime(session)}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {session.meetUrl ? (
              <Button
                size="lg"
                asChild
                className="bg-white text-slate-900 hover:bg-white/90"
              >
                <a href={session.meetUrl} target="_blank" rel="noopener noreferrer">
                  <Video className="mr-2 h-4 w-4" />
                  Join on Google Meet
                </a>
              </Button>
            ) : (
              <Button
                size="lg"
                className="border-2 border-white/30 bg-white/10 text-white hover:bg-white/20"
                disabled
              >
                <Clock className="mr-2 h-4 w-4" />
                Meet link sent 24h before
              </Button>
            )}
            <Button
              variant="ghost"
              size="lg"
              asChild
              className="text-white hover:bg-white/10 hover:text-white"
            >
              <a
                href="https://fhiriq.com/workshop-agenda"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read the agenda <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function SessionRow({ session, isPast }: { session: CohortSession; isPast: boolean }) {
  return (
    <div
      className={`flex items-start gap-4 rounded-md border border-transparent px-3 py-3 transition hover:border-slate-200 hover:bg-slate-50 ${
        isPast ? "opacity-60" : ""
      }`}
    >
      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white">
        {session.weekNumber ? (
          <span className="font-mono text-xs font-semibold text-slate-700">
            {session.weekNumber}
          </span>
        ) : (
          <Sparkles className="h-3 w-3 text-rose-500" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-slate-900">{session.title}</h3>
          {session.mandatory && (
            <Badge variant="outline" className="border-rose-200 text-xs text-rose-700">
              Live
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{session.description}</p>
        <div className="mt-1.5 font-mono text-xs text-slate-400">
          {formatSessionTime(session)}
        </div>
      </div>
      {session.meetUrl && (
        <Button variant="ghost" size="sm" asChild>
          <a
            href={session.meetUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Join ${session.title} on Google Meet`}
          >
            <Video className="h-3.5 w-3.5" />
          </a>
        </Button>
      )}
    </div>
  );
}

function YourPodCard() {
  return (
    <Card className="border-dashed border-slate-300 bg-slate-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-4 w-4 text-slate-600" />
              Your pod
            </CardTitle>
            <CardDescription>
              Assigned 72 hours before Session 1. You&apos;ll be one of four.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 rounded-md border border-dashed border-slate-300 bg-white/60 px-3 py-4"
            >
              <Avatar className="h-12 w-12 border-2 border-dashed border-slate-300 bg-transparent">
                <AvatarFallback className="bg-transparent text-slate-400">
                  <Circle className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="text-xs text-slate-400">Pod-mate {i + 1}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Pod composition rule: 1 clinician/SME · 1 senior eng · 1 mid eng · 1 designer/PM.
          One ClinicalProblem from the Problem Board per pod.
        </p>
      </CardContent>
    </Card>
  );
}

function ActiveCohortSidebar({
  cohort,
}: {
  cohort: ReturnType<typeof getCohortBySlug>;
}) {
  if (!cohort) return null;
  const visible = cohort.signups.slice(0, 8);
  const overflow = cohort.signups.length - visible.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-2 w-2 items-center justify-center">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          </div>
          <CardTitle className="font-mono text-xs uppercase tracking-widest text-slate-600">
            In this cohort
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {visible.map((s) => (
          <div key={s.email} className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-100 text-xs font-medium text-slate-700">
                {initialsFromName(s.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-slate-900">{s.name}</div>
              <div className="truncate text-xs text-slate-500">{s.building}</div>
            </div>
          </div>
        ))}
        {overflow > 0 && (
          <div className="pt-1 font-mono text-xs text-slate-400">+ {overflow} more</div>
        )}
        <Separator className="my-3" />
        <div className="font-mono text-xs text-slate-500">
          <span className="text-slate-700">{cohort.signups.length}</span> signed up ·{" "}
          <span className="text-slate-700">{cohort.cap - cohort.signups.length}</span> seats open
        </div>
      </CardContent>
    </Card>
  );
}

function ResourcesCard() {
  const links = [
    {
      label: "Workshop agenda",
      href: "https://fhiriq.com/workshop-agenda",
      icon: ExternalLink,
      external: true,
    },
    { label: "Problem Board", href: "/problems", icon: Sparkles, external: false },
    { label: "FHIR Sandbox", href: "/sandbox", icon: ExternalLink, external: false },
    { label: "Agent Skills (OpenClaw)", href: "/openclaw", icon: Sparkles, external: false },
    {
      label: "GitHub · aks129",
      href: "https://github.com/aks129",
      icon: Github,
      external: true,
    },
    {
      label: "Slack (invite in your email)",
      href: "#",
      icon: MessageSquare,
      external: false,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-mono text-xs uppercase tracking-widest text-slate-600">
          Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {links.map((l) => {
          const Icon = l.icon;
          const inner = (
            <span className="flex items-center justify-between rounded-md px-2 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-rose-600">
              <span className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-slate-400" />
                {l.label}
              </span>
              <ArrowRight className="h-3 w-3 text-slate-300" />
            </span>
          );
          return l.external ? (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer">
              {inner}
            </a>
          ) : l.href === "#" ? (
            <div key={l.label} className="cursor-not-allowed opacity-60">
              {inner}
            </div>
          ) : (
            <Link key={l.label} href={l.href}>
              {inner}
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
