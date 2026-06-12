import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FlaskConical, Github, Lightbulb, Sparkles, Shield, ExternalLink, BookOpen, Info } from "lucide-react";

const REFERENCE_SERVICES = [
  {
    name: "HealthClawGuardrails",
    what: "Open-source guardrail proxy — PHI redaction, audit trails, human-in-the-loop between AI and FHIR",
    href: "https://github.com/aks129/HealthClawGuardrails",
    tag: "open source",
  },
  {
    name: "Fasten Connect",
    what: "TEFCA/QHIN access — nationwide health records via CLEAR/ID.me identity verification",
    href: "https://fasten.health",
    tag: "personal agreement",
  },
  {
    name: "HealthEx",
    what: "Lab & clinical data aggregator with MCP integration (see The Lab tools)",
    href: "https://healthex.ai",
    tag: "personal agreement",
  },
  {
    name: "Health Bank One",
    what: "Patient-owned verified record vault with insurance context",
    href: "https://healthbankone.com",
    tag: "personal agreement",
  },
  {
    name: "Flexpa",
    what: "Access 200+ payers/insurers via CMS-9115 mandate (SmartHealthConnect)",
    href: "https://flexpa.com",
    tag: "personal agreement",
  },
  {
    name: "MEDENT",
    what: "Small-practice EHR with direct SMART on FHIR patient standalone launch",
    href: "https://medent.com",
    tag: "personal agreement",
  },
  {
    name: "CLEAR",
    what: "Identity verification required for TEFCA/QHIN nationwide record access",
    href: "https://clearme.com",
    tag: "personal agreement",
  },
  {
    name: "Railway",
    what: "Hosts the OAuth callback broker for SMART on FHIR redirect URIs",
    href: "https://railway.app",
    tag: "public",
  },
];

const TILES = [
  {
    title: "Problem Board",
    href: "/problems",
    icon: Lightbulb,
    description:
      "Clinical and operational problems sourced from the FHIRBuilders community. Your pod picks one at kickoff and links your project back to it.",
    accent: "from-rose-500 to-rose-700",
  },
  {
    title: "Sandbox",
    href: "/sandbox/demo",
    icon: FlaskConical,
    description:
      "Medplum-backed FHIR R4 sandbox with synthetic patients via Synthea. Read, write, break things — it's yours for the cohort.",
    accent: "from-teal-500 to-teal-700",
  },
  {
    title: "Agent Skills (OpenClaw)",
    href: "/openclaw",
    icon: Sparkles,
    description:
      "BYOK code-generation scaffolds for Anthropic and OpenAI. The four agent skills that hook your IDE to real FHIR.",
    accent: "from-amber-500 to-amber-700",
  },
];

export default function LabPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="mb-8">
        <Badge variant="outline" className="mb-2 border-teal-300 bg-teal-50 text-teal-700">
          <FlaskConical className="mr-1 h-3 w-3" /> The Lab
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Where the work happens.
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          The three FHIRBuilders surfaces your pod will live in for the next 6 weeks.
          Open these in tabs and keep them open.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {TILES.map((t) => {
          const Icon = t.icon;
          return (
            <Link key={t.href} href={t.href} className="group">
              <Card className="h-full overflow-hidden transition hover:shadow-md">
                <div
                  className={`flex h-24 items-center justify-center bg-gradient-to-br ${t.accent}`}
                >
                  <Icon className="h-10 w-10 text-white" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    {t.title}
                    <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-rose-500" />
                  </CardTitle>
                  <CardDescription className="text-xs">{t.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="mt-6 border-dashed">
        <CardContent className="flex items-start gap-3 p-4">
          <Github className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" />
          <div className="text-sm text-slate-700">
            All FHIRBuilders code is on GitHub at{" "}
            <a
              href="https://github.com/aks129"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-rose-600 hover:underline"
            >
              github.com/aks129
            </a>{" "}
            and{" "}
            <a
              href="https://github.com/FHIR-IQ"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-rose-600 hover:underline"
            >
              github.com/FHIR-IQ
            </a>
            . Fork what helps. PRs welcome.
          </div>
        </CardContent>
      </Card>

      {/* Gene's PHR Reference Stack */}
      <div className="mt-12">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <Badge variant="outline" className="mb-2 border-violet-300 bg-violet-50 text-violet-700">
              <Shield className="mr-1 h-3 w-3" /> Reference Workflow
            </Badge>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Gene&rsquo;s Connected Health Records Stack
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              A real-world PHR pipeline: three record sources → HealthClawGuardrails (PHI redaction + audit) → AI analysis.
              Read the full write-up and study the open-source guardrail code — both are fair game as inspiration for your build.
            </p>
          </div>
          <a
            href="https://evestel.substack.com/p/i-connected-my-own-health-records"
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-100"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Substack article
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </div>

        {/* Personal agreements disclaimer */}
        <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <strong>Personal agreements only.</strong> Gene&rsquo;s access to Fasten Connect, HealthEx, Health Bank One,
            Flexpa, and MEDENT is under his own agreements — not available to cohort members yet.
            He&rsquo;s negotiating packages for future cohorts. Use this stack as a reference architecture;
            sign up for free tiers or request your own access directly with each vendor.
          </div>
        </div>

        {/* PHI Redaction script callout */}
        <a
          href="https://github.com/aks129/HealthClawGuardrails/blob/main/r6/redaction.py"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5 hover:bg-slate-100"
        >
          <div className="flex items-center gap-2.5">
            <Shield className="h-4 w-4 text-slate-500" />
            <div>
              <div className="text-sm font-medium text-slate-800">PHI Redaction script</div>
              <div className="text-xs text-slate-500">
                r6/redaction.py — names → initials, identifiers masked, addresses stripped, birthdates → year only
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-rose-600 font-medium">
            <Github className="h-3.5 w-3.5" />
            View on GitHub
            <ExternalLink className="h-3 w-3 opacity-60" />
          </div>
        </a>

        {/* Services grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {REFERENCE_SERVICES.map((svc) => (
            <a
              key={svc.name}
              href={svc.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-lg border border-slate-200 bg-white p-3.5 transition hover:border-slate-300 hover:shadow-sm"
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800 group-hover:text-rose-600">
                  {svc.name}
                </span>
                <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-slate-400" />
              </div>
              <p className="mb-2 flex-1 text-xs leading-relaxed text-slate-500">{svc.what}</p>
              <span
                className={`self-start rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  svc.tag === "open source"
                    ? "bg-emerald-100 text-emerald-700"
                    : svc.tag === "public"
                    ? "bg-sky-100 text-sky-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {svc.tag}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
