import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FlaskConical, Github, Lightbulb, Sparkles } from "lucide-react";

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
    </div>
  );
}
