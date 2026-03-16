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
  Check,
  Loader2,
  Terminal,
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
  TestTube,
  Bot,
  Wrench,
  Globe,
  MessageCircle,
  Rss,
  Linkedin,
  ArrowUp,
  ExternalLink,
} from "lucide-react";

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
    problem: "Medication errors from incomplete med lists",
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
  },
  {
    title: "Developer",
    description: "Skip infrastructure setup and start building your integration today",
    cta: "Create sandbox",
    href: "/sandbox/demo",
    icon: Code2,
  },
  {
    title: "Learner",
    description: "Understand FHIR with hands-on exploration and beginner-friendly guides",
    cta: "Start learning",
    href: "/learn",
    icon: BookOpen,
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
  "Claude Skill": "bg-amber-100 text-amber-800",
  "App":          "bg-green-100 text-green-800",
  "CQL Measure":  "bg-teal-100 text-teal-800",
  "FHIR IG":      "bg-pink-100 text-pink-800",
};

export default function HomePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);

  useEffect(() => {
    fetch("/api/projects?sort=popular")
      .then((r) => r.json())
      .then((data) => {
        if (data.projects) {
          setFeaturedProjects(data.projects.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateSandbox = async () => {
    setIsCreating(true);
    analytics.trackSandboxCreate();
    analytics.trackCTA("create_sandbox", "homepage");
    setTimeout(() => {
      router.push("/sandbox/demo");
    }, 1500);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6">
              <Sparkles className="mr-1 h-3 w-3" />
              Agents on FHIR — building the agentic health stack
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              The home for{" "}
              <span className="text-primary">FHIR builders</span>
            </h1>

            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              Build, share, and collaborate on AI-powered FHIR apps.
              Get a sandbox with 100 synthetic patients in 30 seconds.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="h-14 px-8 text-lg"
                onClick={handleCreateSandbox}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating your sandbox...
                  </>
                ) : (
                  <>
                    <FlaskConical className="mr-2 h-5 w-5" />
                    Create Free Sandbox
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg" asChild>
                <Link href="/projects">
                  <Users className="mr-2 h-5 w-5" />
                  See Community Projects
                </Link>
              </Button>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              No credit card. No signup. Just FHIR.
            </p>

            {/* Quick Stats */}
            <div className="mt-12 flex justify-center gap-8 md:gap-12">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <stat.icon className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{stat.value}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Background pattern */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      </section>

      {/* Agentic Callout */}
      <section className="border-b bg-gradient-to-r from-violet-50 via-blue-50 to-teal-50 dark:from-violet-950/20 dark:via-blue-950/20 dark:to-teal-950/20 py-12">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <Badge className="mb-3 bg-violet-100 text-violet-800 border-violet-200">
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
              <div className="flex items-start gap-3 p-4 rounded-lg bg-white/60 dark:bg-black/20 border">
                <Bot className="h-6 w-6 text-violet-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">AI Agents</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Autonomous agents that query FHIR APIs, execute CQL measures, and coordinate multi-step clinical workflows
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-white/60 dark:bg-black/20 border">
                <Wrench className="h-6 w-6 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">MCP Tools</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Model Context Protocol tools that give Claude direct access to FHIR sandboxes, EHRs, and healthcare APIs
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-white/60 dark:bg-black/20 border">
                <Sparkles className="h-6 w-6 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">Claude Skills</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reusable Claude skills for clinical summarization, FHIR resource generation, and quality measure evaluation
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center mt-6">
              <Button variant="outline" asChild>
                <Link href="/projects?filter=Agent">
                  Browse agentic projects
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured This Week */}
      {featuredProjects.length > 0 && (
        <section className="container py-12">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Featured this week</h2>
                <p className="text-sm text-muted-foreground">Most upvoted community projects</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/projects">
                  See all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {featuredProjects.map((project) => (
                <Card key={project.id} className="hover:border-primary/40 transition-colors">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {project.artifactType && (
                          <Badge
                            variant="secondary"
                            className={`text-xs ${ARTIFACT_COLORS[project.artifactType] ?? ""}`}
                          >
                            {project.artifactType}
                          </Badge>
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <ArrowUp className="h-3.5 w-3.5" />
                        {project.upvoteCount}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">{project.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{project.authorName}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* What You Get */}
      <section className="container py-20 border-t">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-12">
            What you get, instantly
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Database className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">100 Patients</CardTitle>
                <CardDescription>
                  Realistic Synthea-generated data with conditions, medications, and encounters
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Terminal className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">API Explorer</CardTitle>
                <CardDescription>
                  Interactive query builder. Test requests, see responses. No setup needed.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Code2 className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Your Endpoint</CardTitle>
                <CardDescription>
                  A real FHIR R4 URL you can use in your app immediately
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Who is this for */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-center mb-4">
              Who is this for?
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Whether you're building, learning, or leading — we've got you covered
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              {PERSONAS.map((persona) => (
                <Card key={persona.title} className="relative overflow-hidden">
                  <CardHeader>
                    <persona.icon className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">{persona.title}</CardTitle>
                    <CardDescription>{persona.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" asChild>
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

      {/* Use Cases */}
      <section className="container py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-4">
            What can you build with FHIR?
          </h2>
          <p className="text-center text-muted-foreground mb-12">
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

                    <div className="md:w-48 space-y-2">
                      <Badge variant="outline">{useCase.difficulty}</Badge>
                      <div className="text-xs text-muted-foreground">
                        <strong>FHIR Resources:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {useCase.resources.map((r) => (
                            <Badge key={r} variant="secondary" className="text-xs">
                              {r}
                            </Badge>
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
            <Button variant="outline" asChild>
              <Link href="/projects">
                See all community projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured: Medication Management Showcase */}
      <section className="border-t bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                <Sparkles className="mr-1 h-3 w-3" />
                Featured Use Case
              </Badge>
              <h2 className="text-3xl font-bold mb-4">
                Medication Management
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See how FHIRBuilders handles medication reconciliation end-to-end:
                AI-powered conflict detection, code generation, and downloadable apps.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <TestTube className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Try the Demo</CardTitle>
                      <CardDescription>
                        Explore sample patients and run AI-powered medication audits
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      5 sample patients with real medication data
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      AI conflict detection (drug interactions, duplicates)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Clinical evidence citations
                    </li>
                  </ul>
                  <Button className="w-full" asChild>
                    <Link href="/sandbox/demo?useCase=medrec">
                      <TestTube className="mr-2 h-4 w-4" />
                      Try Demo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Wand2 className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Generate an App</CardTitle>
                      <CardDescription>
                        AI generates a complete FHIR medication tracker you can download
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Full Next.js + Medplum app generated by AI
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Download as a zip, ready to run
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Connect to Slack, Discord, WhatsApp
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/openclaw?template=medication-tracker">
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate App
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Queries Preview */}
      <section className="border-y bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-center mb-4">
              Start querying immediately
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Your sandbox comes with sample queries ready to run
            </p>

            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-zinc-900 text-zinc-100 p-4 font-mono text-sm">
                  <div className="flex items-center gap-2 text-zinc-500 mb-4">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="ml-2">FHIR API Explorer</span>
                  </div>

                  <div className="space-y-3">
                    {sampleQueries.map((q, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-green-400">$</span>
                        <span className="text-zinc-400">{q.query}</span>
                        <span className="text-zinc-600 text-xs ml-auto">{q.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800">
                    <div className="text-zinc-500 text-xs mb-2">Response (200 OK)</div>
                    <pre className="text-xs text-zinc-400 overflow-x-auto">
{`{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 100,
  "entry": [
    { "resource": { "resourceType": "Patient", "id": "..." } }
  ]
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <Button size="lg" onClick={handleCreateSandbox} disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                Try it now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Links */}
      <section className="container py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-4">
            Join the FHIR community
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Connect with thousands of FHIR builders worldwide
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {COMMUNITY_LINKS.map((link) => (
              <a
                key={link.title}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:border-primary/40 hover:bg-muted/30 transition-colors group"
              >
                <link.icon className={`h-6 w-6 mt-0.5 shrink-0 ${link.color}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{link.title}</h3>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Perfect For */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-center mb-12">
              Perfect for
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                { title: "Learning FHIR", desc: "Explore the data model without infrastructure headaches" },
                { title: "Prototyping Apps", desc: "Build your MVP against real FHIR data" },
                { title: "Testing Integrations", desc: "Validate your FHIR client before production" },
                { title: "Hackathons", desc: "Get your team started in seconds, not hours" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t bg-primary text-primary-foreground py-16">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to build?
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Your FHIR sandbox is one click away.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={handleCreateSandbox}
            disabled={isCreating}
          >
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FlaskConical className="mr-2 h-4 w-4" />
            )}
            Create Free Sandbox
          </Button>
        </div>
      </section>
    </div>
  );
}
