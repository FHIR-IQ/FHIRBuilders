"use client";

import { useState } from "react";
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

export default function HomePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSandbox = async () => {
    setIsCreating(true);
    analytics.trackSandboxCreate();
    analytics.trackCTA("create_sandbox", "homepage");
    // For now, redirect to sandbox page - will implement actual creation
    setTimeout(() => {
      router.push("/sandbox/demo");
    }, 1500);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section - Single Focus */}
      <section className="relative overflow-hidden border-b">
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6">
              <Sparkles className="mr-1 h-3 w-3" />
              No signup required
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              FHIR Data in{" "}
              <span className="text-primary">30 Seconds</span>
            </h1>

            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              Stop setting up infrastructure. Start building.
              Get a sandbox with 100 synthetic patients instantly.
            </p>

            {/* Primary CTA - The ONE thing */}
            <div className="mt-10">
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
              <p className="mt-3 text-sm text-muted-foreground">
                No credit card. No signup. Just FHIR.
              </p>
            </div>

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

      {/* What You Get */}
      <section className="container py-20">
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

      {/* Who is this for - Persona Cards */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-center mb-4">
              Who is this for?
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Whether you're building, learning, or leading - we've got you covered
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

      {/* Use Cases - Problem First */}
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

      {/* Use Cases - Keep it Simple */}
      <section className="container py-20">
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
      </section>

      {/* Community Section - Minimal */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold mb-4">
              Building something cool?
            </h2>
            <p className="text-muted-foreground mb-8">
              Sign up to save your sandbox and share what you're building with the FHIR community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link href="/projects">
                  See community projects
                </Link>
              </Button>
              <Button asChild>
                <Link href="/login">
                  Sign in
                </Link>
              </Button>
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
