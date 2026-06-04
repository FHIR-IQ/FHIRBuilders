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
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Code2,
  Database,
  ExternalLink,
  GraduationCap,
  Hash,
  Lock,
  MessageSquare,
  Newspaper,
  PartyPopper,
  Sparkles,
  Trophy,
  Users,
  Video,
} from "lucide-react";

const SLACK_INVITE =
  "https://join.slack.com/t/fhirbuilders/shared_invite/zt-405j5tykg-T9v8~nNaX9tFZZgzaj37Ow";

type Channel = {
  name: string;
  purpose: string;
  rule: string;
  icon: React.ComponentType<{ className?: string }>;
  visibility: "public" | "admin-post" | "private" | "pod";
  mirrors?: { label: string; href: string };
};

const COHORT_WIDE: Channel[] = [
  {
    name: "announcements",
    purpose: "Eugene-only posts: session recaps, schedule changes, pinned reminders.",
    rule: "Read-only. Mirrors the Bulletin tab.",
    icon: Bell,
    visibility: "admin-post",
    mirrors: { label: "/bulletin", href: "/cohort/cohort-00/bulletin" },
  },
  {
    name: "general",
    purpose: "Open chat — intros, FYIs, water-cooler stuff that isn't pod-specific.",
    rule: "Default-public. Threads encouraged.",
    icon: Hash,
    visibility: "public",
  },
  {
    name: "wins",
    purpose: "Small celebrations — first deploy, first FHIR read, first commit your mentor approves.",
    rule: "Quick, public, low-bar. React don't moderate.",
    icon: Trophy,
    visibility: "public",
  },
  {
    name: "ship-log",
    purpose: "Your written Friday report-outs cross-posted from /reflect.",
    rule: "Auto-posted when you submit a reflection. Comments encouraged.",
    icon: Newspaper,
    visibility: "public",
    mirrors: { label: "/reflect", href: "/cohort/cohort-00/reflect" },
  },
  {
    name: "demos",
    purpose: "Friday live demo prep + recordings + post-demo discussion.",
    rule: "Recording link drops here within 24h of each Friday call.",
    icon: Video,
    visibility: "public",
    mirrors: { label: "/meeting", href: "/cohort/cohort-00/meeting" },
  },
  {
    name: "workshops",
    purpose: "Coordination + recordings for the drop-in Wed workshops.",
    rule: "Each scheduled workshop gets a pinned thread.",
    icon: GraduationCap,
    visibility: "public",
    mirrors: { label: "/workshops", href: "/cohort/cohort-00/workshops" },
  },
  {
    name: "random",
    purpose: "Off-topic. Memes, side-projects, healthcare news that doesn't fit elsewhere.",
    rule: "Don't ask program questions here — they get lost.",
    icon: PartyPopper,
    visibility: "public",
  },
];

const HELP: Channel[] = [
  {
    name: "help-build",
    purpose: "Claude Code, agent loops, MCP, Git, GitHub, Vercel, env vars, build errors.",
    rule: "Default-public. Code blocks for errors. No DMs for these.",
    icon: Code2,
    visibility: "public",
  },
  {
    name: "help-fhir",
    purpose: "FHIR resources, Medplum, HAPI, terminology, SMART on FHIR, search params.",
    rule: "Mention the FHIR version (R4 vs R5/R6) and the server in your first message.",
    icon: Database,
    visibility: "public",
  },
];

const PODS: Channel[] = [
  {
    name: "pod-1",
    purpose: "Pod 1 working channel — daily standups, code links, problem-specific discussion.",
    rule: "Private to your 4 pod-mates + your mentor + Eugene.",
    icon: Users,
    visibility: "pod",
  },
  {
    name: "pod-2",
    purpose: "Pod 2 working channel.",
    rule: "Private to your 4 pod-mates + your mentor + Eugene.",
    icon: Users,
    visibility: "pod",
  },
  {
    name: "pod-3",
    purpose: "Pod 3 working channel.",
    rule: "Private to your 4 pod-mates + your mentor + Eugene.",
    icon: Users,
    visibility: "pod",
  },
  {
    name: "pod-4",
    purpose: "Pod 4 working channel.",
    rule: "Private to your 4 pod-mates + your mentor + Eugene.",
    icon: Users,
    visibility: "pod",
  },
  {
    name: "pod-5",
    purpose: "Pod 5 working channel.",
    rule: "Private to your 4 pod-mates + your mentor + Eugene.",
    icon: Users,
    visibility: "pod",
  },
];

const ADMIN: Channel[] = [
  {
    name: "mentors",
    purpose: "Mentor-only coordination, calibration, calibration questions.",
    rule: "Private to mentors + Eugene.",
    icon: Lock,
    visibility: "private",
  },
];

const SURFACE_RULES = [
  {
    surface: "Slack",
    rule: "Working comms · default-public · no DMs for program questions",
  },
  {
    surface: "WhatsApp",
    rule: "Signal only — if it can wait 4 hours, it goes in Slack",
  },
  {
    surface: "Weekly cohort call · Fri",
    rule: "Mandatory live · 3 misses removes you from the cohort",
  },
  {
    surface: "1:1 with Eugene",
    rule: "Two per builder · reply to any cohort email and Eugene sends a Meet invite",
  },
];

export default function ChannelsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="mb-8">
        <Badge variant="outline" className="mb-2 border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700">
          <MessageSquare className="mr-1 h-3 w-3" /> Channels
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Where to post what.
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          The Slack workspace is your daily home for the next 6 weeks. Each channel has one
          job. Bookmark this page until the names are in your head.
        </p>
      </div>

      {/* Big join CTA */}
      <Card className="mb-10 overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-rose-900 text-white shadow-md">
        <CardContent className="flex flex-wrap items-center justify-between gap-6 p-6 sm:p-8">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest opacity-80">
              Workspace
            </div>
            <div className="mt-1 text-2xl font-bold">fhirbuilders.slack.com</div>
            <p className="mt-2 max-w-xl text-sm text-white/90">
              One invite link, 14 builders so far. The link works for the rest of the cohort
              too — share with the people I assign you to in your pod.
            </p>
          </div>
          <Button size="lg" asChild className="bg-white text-slate-900 hover:bg-white/90">
            <a href={SLACK_INVITE} target="_blank" rel="noopener noreferrer">
              <MessageSquare className="mr-2 h-4 w-4" /> Join Slack
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <Section title="Cohort-wide channels" description="Open to everyone in Cohort 00. Default-public.">
        <Grid>
          {COHORT_WIDE.map((c) => (
            <ChannelCard key={c.name} c={c} />
          ))}
        </Grid>
      </Section>

      <Section
        title="Help channels"
        description="Ask-by-topic. Public so the answer helps the next builder."
      >
        <Grid>
          {HELP.map((c) => (
            <ChannelCard key={c.name} c={c} />
          ))}
        </Grid>
      </Section>

      <Section
        title="Pod channels"
        description="Created Fri Jun 5 EOD after pod assignments. Private to your pod + mentor + Eugene."
      >
        <Grid>
          {PODS.map((c) => (
            <ChannelCard key={c.name} c={c} />
          ))}
        </Grid>
      </Section>

      <Section title="Admin" description="Private — listed for transparency only.">
        <Grid>
          {ADMIN.map((c) => (
            <ChannelCard key={c.name} c={c} />
          ))}
        </Grid>
      </Section>

      <Section
        title="Rules across all channels"
        description="Same rules from the workshop agenda — every channel has one job."
      >
        <Card>
          <CardContent className="divide-y divide-slate-100 p-0">
            {SURFACE_RULES.map((r) => (
              <div
                key={r.surface}
                className="grid grid-cols-1 gap-2 px-5 py-3 sm:grid-cols-3 sm:gap-4"
              >
                <div className="font-semibold text-slate-900">{r.surface}</div>
                <div className="font-mono text-xs uppercase tracking-wider text-slate-500 sm:col-span-2">
                  {r.rule}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </Section>

      <Card className="mt-10 border-dashed border-amber-300 bg-amber-50/40">
        <CardContent className="flex items-start gap-3 p-5 text-sm text-slate-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700" />
          <div>
            <div className="font-medium text-slate-900">No #-help-DMing Eugene</div>
            <p className="mt-1">
              When you DM me a program question, you rob the rest of the cohort of the
              answer. Post in #help-build or #help-fhir even when you&apos;re embarrassed
              — somebody else has the same question.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 border-b border-slate-200 pb-3">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2">{children}</div>;
}

function ChannelCard({ c }: { c: Channel }) {
  const Icon = c.icon;
  const visibilityStyle: Record<Channel["visibility"], string> = {
    public: "border-slate-200",
    "admin-post": "border-rose-200 bg-rose-50/30",
    private: "border-slate-300 bg-slate-50/50",
    pod: "border-teal-200 bg-teal-50/30",
  };
  return (
    <Card className={`transition hover:shadow-sm ${visibilityStyle[c.visibility]}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="h-4 w-4 text-slate-500" />
            <span className="font-mono">#{c.name}</span>
          </CardTitle>
          {c.visibility === "admin-post" && (
            <Badge variant="outline" className="border-rose-300 text-xs text-rose-700">
              Eugene posts
            </Badge>
          )}
          {c.visibility === "private" && (
            <Badge variant="outline" className="text-xs">
              <Lock className="mr-1 h-2.5 w-2.5" /> Private
            </Badge>
          )}
          {c.visibility === "pod" && (
            <Badge variant="outline" className="border-teal-300 text-xs text-teal-700">
              <Users className="mr-1 h-2.5 w-2.5" /> Pod-only
            </Badge>
          )}
        </div>
        <CardDescription className="pt-0.5">{c.purpose}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pb-4">
        <div className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
          {c.rule}
        </div>
        {c.mirrors && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Sparkles className="h-3 w-3 text-rose-400" />
            Mirrors{" "}
            <Link
              href={c.mirrors.href}
              className="font-mono text-rose-600 hover:underline"
            >
              {c.mirrors.label}
            </Link>{" "}
            on FHIRBuilders
            <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
