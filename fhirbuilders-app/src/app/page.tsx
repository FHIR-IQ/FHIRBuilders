"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FlaskConical,
  Zap,
  Clock,
  Code2,
  ArrowRight,
  Loader2,
  Database,
  Users,
  Sparkles,
  Lightbulb,
  CheckCircle,
  Stethoscope,
  Pill,
  Activity,
  Building2,
  BookOpen,
  Wand2,
  Bot,
  Wrench,
  Globe,
  MessageCircle,
  Rss,
  Linkedin,
  ArrowUp,
  ExternalLink,
  FolderOpen,
} from "lucide-react";

// ── Vega-inspired categorical palette (section-level color coding) ──────────
// Build with AI → violet  |  Sandbox → blue  |  Projects → teal  |  Learn → amber
const SECTION_COLORS = {
  openclaw: {
    badge: "bg-violet-100 text-violet-700 border-violet-200",
    accent: "text-violet-600",
    border: "border-violet-200",
    bg: "bg-violet-50",
    icon: "text-violet-500",
  },
  sandbox: {
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    accent: "text-blue-600",
    border: "border-blue-200",
    bg: "bg-blue-50",
    icon: "text-blue-500",
  },
  projects: {
    badge: "bg-teal-100 text-teal-700 border-teal-200",
    accent: "text-teal-600",
    border: "border-teal-200",
    bg: "bg-teal-50",
    icon: "text-teal-500",
  },
  learn: {
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    accent: "text-amber-600",
    border: "border-amber-200",
    bg: "bg-amber-50",
    icon: "text-amber-500",
  },
};

const sampleQueries = [
  { label: "Get all patients", query: "GET /Patient" },
  { label: "Search by name", query: "GET /Patient?name=Smith" },
  { label: "Recent observations", query: "GET /Observation?_sort=-date&_count=10" },
  { label: "Active medications", query: "GET /MedicationRequest?status=active" },
];

const stats = [
  { value: "100", label: "Synthetic Patients", icon: Users },
  { value: "R4", label: "FHIR Version", icon: Database },
  { value: "30s", label: "Time to First Query", icon: Clock },
];

const USE_CASES = [
  {
    problem: "Clinicians waste 20+ minutes per patient gathering scattered data",
    solution: "Patient Dashboard",
    description: "Unified view pulling Patient, Observations, Conditions, and Medications into one screen",
    icon: Activity,
    resources: ["Patient", "Observation", "Condition", "MedicationRequest"],
    difficulty: "Beginner",
  },
  {
    problem: "Medication errors from incomplete med lists cost $42B/year",
    solution: "Medication Reconciliation",
    description: "AI-powered tool that compares meds from different sources and flags conflicts",
    icon: Pill,
    resources: ["MedicationRequest", "MedicationStatement", "Patient"],
    difficulty: "Intermediate",
  },
  {
    problem: "Patients can't access their own health records easily",
    solution: "Patient Portal",
    description: "Self-service app for patients to view results, schedule visits, message providers",
    icon: Users,
    resources: ["Patient", "Observation", "Appointment", "Communication"],
    difficulty: "Intermediate",
  },
  {
    problem: "Care teams don't know when high-risk patients are admitted",
    solution: "ADT Notifications",
    description: "Real-time alerts when patients are admitted, discharged, or transferred",
    icon: Building2,
    resources: ["Encounter", "Patient", "Subscription"],
    difficulty: "Advanced",
  },
];

const PERSONAS = [
  {
    title: "Healthcare Leader",
    description: "Validate your idea with real FHIR data before committing resources",
    cta: "Learn what FHIR can solve",
    href: "/learn",
    icon: Stethoscope,
    color: SECTION_COLORS.learn,
  },
  {
    title: "Developer",
    description: "Skip infrastructure setup and start building your integration today",
    cta: "Create sandbox",
    href: "/sandbox/demo",
    icon: Code2,
    color: SECTION_COLORS.sandbox,
  },
  {
    title: "AI Builder",
    description: "Generate complete FHIR apps from a prompt, then connect to any messaging channel",
    cta: "Build with AI",
    href: "/openclaw",
    icon: Wand2,
    color: SECTION_COLORS.openclaw,
  },
];

const COMMUNITY_LINKS = [
  {
    title: "FHIR Zulip Chat",
    description: "The official FHIR community chat — 6,000+ implementers",
    href: "https://chat.fhir.org",
    icon: MessageCircle,
    color: "text-blue-500",
  },
  {
    title: "FHIR Goats on LinkedIn",
    description: "LinkedIn group for FHIR practitioners and builders",
    href: "https://www.linkedin.com/groups/12698335/",
    icon: Linkedin,
    color: "text-sky-600",
  },
  {
    title: "FHIR Podcast",
    description: "Weekly conversations with FHIR builders and healthcare innovators",
    href: "https://fhircast.org/podcast",
    icon: Rss,
    color: "text-orange-500",
  },
  {
    title: "FHIRBuilders Substack",
    description: "Deep dives, patterns, and lessons from building on FHIR",
    href: "https://fhirbuilders.substack.com",
    icon: Globe,
    color: "text-green-600",
  },
];

interface FeaturedProject {
  id: string;
  title: string;
  description: string;
  artifactType?: string | null;
  upvoteCount: number;
  authorName: string;
}

const ARTIFACT_COLORS: Record<string, string> = {
  "Agent":        "bg-violet-100 text-violet-800",
  "MCP Tool":     "bg-blue-100 text-blue-800",
  "OpenClaw Skill": "bg-amber-100 text-amber-800",
  "App":          "bg-green-100 text-green-800",
  "CQL Measure":  "bg-teal-100 text-teal-800",
  "FHIR IG":      "bg-pink-100 text-pink-800",
};

// ── OpenClaw mock screenshot (inline SVG-style terminal UI) ──────────────────
function OpenClawScreenshot() {
  return (
    <div className="rounded-xl border shadow-lg overflow-hidden text-left">
      {/* Window chrome */}
      <div className="bg-zinc-800 px-4 py-2.5 flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-red-500/80" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <div className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-3 text-xs text-zinc-400 font-mono">Build with AI — FHIRBuilders</span>
      </div>
      {/* Prompt area */}
      <div className="bg-zinc-900 px-5 py-4 border-b border-zinc-700">
        <div className="text-xs text-zinc-500 mb-2 font-mono">Prompt</div>
        <div className="text-sm text-violet-300 font-mono">
          &quot;Build a medication reconciliation dashboard that flags drug interactions using FHIR MedicationRequest resources&quot;
        </div>
      </div>
      {/* Output area */}
      <div className="bg-zinc-950 px-5 py-4 space-y-2.5">
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <span className="text-green-400">✓</span>
          <span>Detected FHIR resources:</span>
          <span className="text-blue-300">MedicationRequest, Patient, AllergyIntolerance</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <span className="text-green-400">✓</span>
          <span>Generating Next.js app with Medplum SDK...</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <span className="text-green-400">✓</span>
          <span>Claude analyzed 847 medication interaction patterns</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <span className="text-amber-400">→</span>
          <span className="text-zinc-300">Generated 12 files · TypeScript + React · Ready to deploy</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-mono">
          {["pages/index.tsx", "lib/fhir.ts", "components/MedCard.tsx", "lib/interactions.ts", "api/analyze.ts", "package.json"].map((f) => (
            <div key={f} className="text-zinc-500 flex items-center gap-1">
              <span className="text-zinc-600">📄</span> {f}
            </div>
          ))}
        </div>
      </div>
      {/* Action bar */}
      <div className="bg-zinc-900 px-5 py-3 flex items-center gap-3 border-t border-zinc-700">
        <div className="h-6 px-3 rounded bg-violet-600 text-xs text-white font-medium flex items-center">Download .zip</div>
        <div className="h-6 px-3 rounded bg-zinc-700 text-xs text-zinc-300 font-medium flex items-center">View Code</div>
        <div className="h-6 px-3 rounded bg-zinc-700 text-xs text-zinc-300 font-medium flex items-center">Deploy to Vercel</div>
      </div>
    </div>
  );
}

// ── Sandbox mock screenshot ──────────────────────────────────────────────────
function SandboxScreenshot() {
  return (
    <div className="rounded-xl border shadow-md overflow-hidden text-left">
      <div className="bg-zinc-800 px-4 py-2.5 flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-red-500/80" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <div className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-3 text-xs text-zinc-400 font-mono">FHIR Sandbox — API Explorer</span>
      </div>
      <div className="bg-zinc-900 p-4 font-mono text-sm">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-green-400 text-xs">GET</span>
          <span className="text-blue-300 text-xs">https://api.medplum.com/fhir/R4/MedicationRequest?status=active</span>
        </div>
        <div className="text-zinc-600 text-xs mb-2">Response · 200 OK · 47ms</div>
        <pre className="text-xs text-zinc-400 overflow-hidden">
{`{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 8,
  "entry": [{
    "resource": {
      "resourceType": "MedicationRequest",
      "id": "med-101",
      "status": "active",
      "subject": { "reference": "Patient/john-smith" },
      "medicationCodeableConcept": {
        "coding": [{ "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                     "code": "860975", "display": "Metformin 500mg" }]
      }
    }
  }]
}`}</pre>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);

  useEffect(() => {
    fetch("/api/projects?sort=popular")
      .then((r) => r.json())
      .then((data) => {
        if (data.projects) setFeaturedProjects(data.projects.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const handleCreateSandbox = async () => {
    setIsCreating(true);
    analytics.trackSandboxCreate();
    analytics.trackCTA("create_sandbox", "homepage");
    setTimeout(() => router.push("/sandbox/demo"), 1500);
  };

  return (
    <div className="flex flex-col">

      {/* ═══════════════════════════════════════════════════════════════════
          HERO — Lead with OpenClaw (the "wow factor")
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-violet-50 via-background to-blue-50">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              {/* Left — headline + CTAs */}
              <div>
                <Badge className="mb-5 bg-violet-100 text-violet-700 border-violet-200">
                  <Sparkles className="mr-1 h-3 w-3" />
                  The home for FHIR builders
                </Badge>

                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl leading-tight">
                  Make a FHIR app{" "}
                  <span className="text-violet-600">like this</span>{" "}
                  in 3 clicks
                </h1>

                <p className="mt-5 text-lg text-muted-foreground max-w-xl">
                  Describe what you want to build. AI generates a complete,
                  deployable FHIR app with Medplum and Claude. No boilerplate.
                  No setup.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 flex-wrap">
                  <Button size="lg" className="h-12 px-7 bg-violet-600 hover:bg-violet-700 text-white" asChild>
                    <Link href="/openclaw">
                      <Wand2 className="mr-2 h-5 w-5" />
                      Build with AI
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-7"
                    onClick={handleCreateSandbox}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <FlaskConical className="mr-2 h-5 w-5" />
                    )}
                    Explore Sandbox
                  </Button>
                  <Button size="lg" variant="ghost" className="h-12 px-7 text-teal-700 hover:text-teal-800 hover:bg-teal-50" asChild>
                    <Link href="/projects">
                      <FolderOpen className="mr-2 h-5 w-5" />
                      Browse the Community
                    </Link>
                  </Button>
                </div>

                <p className="mt-4 text-sm text-muted-foreground">
                  No credit card. No signup required for sandbox.
                </p>

                {/* Section nav color keys */}
                <div className="mt-8 flex flex-wrap gap-3 text-xs font-medium">
                  {[
                    { label: "Build with AI", color: "bg-violet-100 text-violet-700", href: "/openclaw", icon: Wand2 },
                    { label: "Sandbox", color: "bg-blue-100 text-blue-700", href: "/sandbox/demo", icon: FlaskConical },
                    { label: "Community", color: "bg-teal-100 text-teal-700", href: "/projects", icon: FolderOpen },
                    { label: "Learn", color: "bg-amber-100 text-amber-700", href: "/learn", icon: BookOpen },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${item.color} hover:opacity-80 transition-opacity`}
                    >
                      <item.icon className="h-3 w-3" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right — OpenClaw mock screenshot */}
              <div className="hidden lg:block">
                <OpenClawScreenshot />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          AGENTIC CALLOUT — violet accent
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-b bg-violet-50/50 py-12">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <Badge className="mb-3 bg-violet-100 text-violet-700 border-violet-200">
                <Bot className="mr-1 h-3 w-3" />
                Agentic Healthcare
              </Badge>
              <h2 className="text-2xl font-bold">The agentic health stack is being built here</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                From MCP tools that connect Claude to FHIR APIs, to A2A agents that coordinate care —
                the community is building the infrastructure for AI-native healthcare.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Bot,
                  title: "AI Agents",
                  desc: "Autonomous agents that query FHIR APIs, execute CQL measures, and coordinate multi-step clinical workflows",
                  color: "text-violet-500",
                  bg: "bg-violet-100/60",
                },
                {
                  icon: Wrench,
                  title: "MCP Tools",
                  desc: "Model Context Protocol tools that give Claude direct access to FHIR sandboxes, EHRs, and healthcare APIs",
                  color: "text-blue-500",
                  bg: "bg-blue-100/60",
                },
                {
                  icon: Sparkles,
                  title: "Claude Skills",
                  desc: "Reusable Claude skills for clinical summarization, FHIR resource generation, and quality measure evaluation",
                  color: "text-amber-500",
                  bg: "bg-amber-100/60",
                },
              ].map((item) => (
                <div key={item.title} className={`flex items-start gap-3 p-4 rounded-xl border ${item.bg}`}>
                  <item.icon className={`h-6 w-6 mt-0.5 shrink-0 ${item.color}`} />
                  <div>
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Button variant="outline" className="border-violet-200 text-violet-700 hover:bg-violet-50" asChild>
                <Link href="/projects">
                  Browse agentic projects
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FEATURED THIS WEEK — teal accent
      ══════════════════════════════════════════════════════════════════════ */}
      {featuredProjects.length > 0 && (
        <section className="container py-12 border-b">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-5 w-1 rounded-full bg-teal-500" />
                <div>
                  <h2 className="text-xl font-bold">Featured this week</h2>
                  <p className="text-sm text-muted-foreground">Most upvoted community projects</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700" asChild>
                <Link href="/projects">
                  See all <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {featuredProjects.map((project) => (
                <Card key={project.id} className="hover:border-teal-300 transition-colors">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        {project.artifactType && (
                          <Badge variant="secondary" className={`text-xs ${ARTIFACT_COLORS[project.artifactType] ?? ""}`}>
                            {project.artifactType}
                          </Badge>
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-sm font-medium text-teal-600">
                        <ArrowUp className="h-3.5 w-3.5" />
                        {project.upvoteCount}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 leading-snug">{project.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                    <p className="text-xs text-muted-foreground">{project.authorName}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SANDBOX SECTION — blue accent
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-b py-16">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
                  <FlaskConical className="mr-1 h-3 w-3" />
                  FHIR Sandbox
                </Badge>
                <h2 className="text-3xl font-bold mb-4">
                  FHIR data in{" "}
                  <span className="text-blue-600">30 seconds</span>
                </h2>
                <p className="text-muted-foreground mb-6">
                  Stop setting up infrastructure. Get a sandbox with 100 synthetic patients
                  instantly. A real FHIR R4 endpoint you can query immediately.
                </p>
                <div className="flex flex-wrap gap-4 mb-6">
                  {stats.map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2">
                      <stat.icon className="h-4 w-4 text-blue-500" />
                      <span className="font-bold text-blue-700">{stat.value}</span>
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                    </div>
                  ))}
                </div>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleCreateSandbox}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FlaskConical className="mr-2 h-4 w-4" />
                  )}
                  Create Free Sandbox
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">No credit card · No signup</p>
              </div>
              <div className="hidden lg:block">
                <SandboxScreenshot />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          WHO IS THIS FOR — persona cards
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-muted/20 border-b py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-center mb-2">Who is this for?</h2>
            <p className="text-center text-muted-foreground mb-10">
              Whether you're building, learning, or leading — we've got you covered
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {PERSONAS.map((persona) => (
                <Card key={persona.title} className={`border-2 ${persona.color.border} hover:shadow-md transition-shadow`}>
                  <CardHeader>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${persona.color.bg}`}>
                      <persona.icon className={`h-5 w-5 ${persona.color.icon}`} />
                    </div>
                    <CardTitle className="text-lg">{persona.title}</CardTitle>
                    <CardDescription className="text-sm">{persona.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className={`w-full border ${persona.color.border} ${persona.color.accent} hover:bg-white`} asChild>
                      <Link href={persona.href}>
                        {persona.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          USE CASES — what can you build
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="container py-16 border-b">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-2 justify-center">
            <div className="h-5 w-1 rounded-full bg-violet-500" />
            <h2 className="text-2xl font-bold text-center">What can you build with FHIR?</h2>
          </div>
          <p className="text-center text-muted-foreground mb-10">
            Real problems being solved by our community
          </p>
          <div className="space-y-4">
            {USE_CASES.map((useCase, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-amber-600">Problem</span>
                      </div>
                      <p className="text-muted-foreground mb-4">{useCase.problem}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">Solution: {useCase.solution}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{useCase.description}</p>
                    </div>
                    <div className="md:w-48 space-y-2 shrink-0">
                      <Badge variant="outline">{useCase.difficulty}</Badge>
                      <div className="text-xs text-muted-foreground">
                        <strong>FHIR Resources:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {useCase.resources.map((r) => (
                            <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50" asChild>
              <Link href="/projects">
                See all community projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SAMPLE QUERIES — code preview
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-b bg-zinc-900 py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-center text-white mb-2">
              Start querying immediately
            </h2>
            <p className="text-center text-zinc-400 mb-10">
              Your sandbox comes with sample queries ready to run
            </p>
            <Card className="overflow-hidden bg-zinc-950 border-zinc-800">
              <CardContent className="p-0">
                <div className="p-4 font-mono text-sm">
                  <div className="flex items-center gap-2 text-zinc-500 mb-4">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="ml-2 text-zinc-400">FHIR API Explorer</span>
                  </div>
                  <div className="space-y-3">
                    {sampleQueries.map((q, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-blue-400 text-xs">GET</span>
                        <span className="text-zinc-300 text-xs">{q.query}</span>
                        <span className="text-zinc-600 text-xs ml-auto">{q.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-zinc-800">
                    <div className="text-zinc-500 text-xs mb-2">Response (200 OK)</div>
                    <pre className="text-xs text-zinc-400 overflow-x-auto">{`{"resourceType":"Bundle","type":"searchset","total":100,"entry":[{"resource":{"resourceType":"Patient","id":"..."}}]}`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="mt-8 text-center">
              <Button
                size="lg"
                variant="outline"
                className="border-zinc-600 text-zinc-200 hover:bg-zinc-800"
                onClick={handleCreateSandbox}
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                Try it now — free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          COMMUNITY LINKS — teal accent
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="container py-16 border-b">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-5 w-1 rounded-full bg-teal-500" />
            <h2 className="text-2xl font-bold">Join the FHIR community</h2>
          </div>
          <p className="text-center text-muted-foreground mb-10">
            Connect with thousands of FHIR builders worldwide
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {COMMUNITY_LINKS.map((link) => (
              <a
                key={link.title}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 rounded-xl border hover:border-teal-300 hover:bg-teal-50/30 transition-colors group"
              >
                <link.icon className={`h-6 w-6 mt-0.5 shrink-0 ${link.color}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{link.title}</h3>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{link.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-violet-600 text-white py-16">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to build?</h2>
          <p className="text-violet-200 mb-8 max-w-md mx-auto">
            Generate your first FHIR app in minutes, or explore real patient data in the sandbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-violet-700 hover:bg-violet-50" asChild>
              <Link href="/openclaw">
                <Wand2 className="mr-2 h-5 w-5" />
                Build with AI
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-violet-300 text-white hover:bg-violet-700" onClick={handleCreateSandbox} disabled={isCreating}>
              {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FlaskConical className="mr-2 h-4 w-4" />}
              Free Sandbox
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
