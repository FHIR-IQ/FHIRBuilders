"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Database,
  FileJson,
  Stethoscope,
  Zap,
  CheckCircle,
  Clock,
  Users,
  Pill,
  Activity,
  FileText,
  Building2,
  Lightbulb,
} from "lucide-react";

const FHIR_BASICS = [
  {
    title: "What is FHIR?",
    description: "FHIR (Fast Healthcare Interoperability Resources) is the modern standard for exchanging healthcare data. Think of it as a common language that lets different healthcare systems talk to each other.",
    icon: Database,
    forWho: "Everyone",
  },
  {
    title: "Why FHIR Matters",
    description: "Before FHIR, getting patient data from one system to another was like translating ancient languages. FHIR standardizes this, making healthcare apps possible.",
    icon: Zap,
    forWho: "Healthcare Leaders",
  },
  {
    title: "FHIR Resources",
    description: "Everything in FHIR is a 'Resource' - Patient, Observation, Medication, Condition. Each resource has a standard structure that all systems understand.",
    icon: FileJson,
    forWho: "Developers",
  },
];

const COMMON_RESOURCES = [
  {
    name: "Patient",
    description: "Demographics, identifiers, contact info",
    icon: Users,
    example: "Name, DOB, address, phone number",
    useCases: ["Patient portals", "Registration systems", "Identity matching"],
  },
  {
    name: "Observation",
    description: "Measurements and findings",
    icon: Activity,
    example: "Blood pressure, heart rate, lab results, vital signs",
    useCases: ["Clinical dashboards", "Remote monitoring", "Analytics"],
  },
  {
    name: "Condition",
    description: "Diagnoses and problems",
    icon: Stethoscope,
    example: "Diabetes, hypertension, allergies",
    useCases: ["Problem lists", "Risk scoring", "Care planning"],
  },
  {
    name: "MedicationRequest",
    description: "Prescriptions and orders",
    icon: Pill,
    example: "Metformin 500mg twice daily",
    useCases: ["E-prescribing", "Medication reconciliation", "Drug interactions"],
  },
  {
    name: "Encounter",
    description: "Healthcare visits and interactions",
    icon: Building2,
    example: "Office visit, ER admission, telehealth call",
    useCases: ["Scheduling", "Billing", "Care coordination"],
  },
  {
    name: "DocumentReference",
    description: "Clinical documents and notes",
    icon: FileText,
    example: "Discharge summary, lab report PDF, consent form",
    useCases: ["Document management", "Clinical notes", "Attachments"],
  },
];

const USE_CASES = [
  {
    problem: "Clinicians waste 20+ minutes per patient gathering scattered data",
    solution: "Patient Dashboard",
    description: "Unified view pulling Patient, Observations, Conditions, and Medications into one screen",
    resources: ["Patient", "Observation", "Condition", "MedicationRequest"],
    difficulty: "Beginner",
  },
  {
    problem: "Medication errors from incomplete med lists",
    solution: "Medication Reconciliation",
    description: "AI-powered tool that compares meds from different sources and flags conflicts",
    resources: ["MedicationRequest", "MedicationStatement", "Patient"],
    difficulty: "Intermediate",
  },
  {
    problem: "Patients can't access their own health records easily",
    solution: "Patient Portal",
    description: "Self-service app for patients to view results, schedule visits, message providers",
    resources: ["Patient", "Observation", "Appointment", "Communication"],
    difficulty: "Intermediate",
  },
  {
    problem: "Care teams don't know when high-risk patients are admitted",
    solution: "ADT Notifications",
    description: "Real-time alerts when patients are admitted, discharged, or transferred",
    resources: ["Encounter", "Patient", "Subscription"],
    difficulty: "Advanced",
  },
];

const LEARNING_PATH = [
  {
    step: 1,
    title: "Understand the Basics",
    time: "15 min",
    description: "Learn what FHIR is and why it matters for healthcare",
    action: "Read this page",
    completed: true,
  },
  {
    step: 2,
    title: "Explore Sample Data",
    time: "10 min",
    description: "See real FHIR resources with synthetic patient data",
    action: "Try the sandbox",
    href: "/sandbox/demo",
  },
  {
    step: 3,
    title: "Pick a Use Case",
    time: "5 min",
    description: "Choose a problem you want to solve",
    action: "Browse projects",
    href: "/projects",
  },
  {
    step: 4,
    title: "Connect with Builders",
    time: "2 min",
    description: "Find collaborators or get expert guidance",
    action: "Join early access",
    href: "/early-access",
  },
];

export default function LearnPage() {
  return (
    <div className="container py-12">
      {/* Hero */}
      <div className="mx-auto max-w-3xl text-center mb-16">
        <Badge variant="secondary" className="mb-4">
          <BookOpen className="mr-1 h-3 w-3" />
          Learn FHIR
        </Badge>
        <h1 className="text-4xl font-bold mb-4">
          FHIR Explained for Everyone
        </h1>
        <p className="text-xl text-muted-foreground">
          Whether you're a healthcare leader, developer, or just curious -
          understand what FHIR is and how it can solve your problems.
        </p>
      </div>

      {/* Quick Summary for Healthcare Leaders */}
      <Card className="mb-12 border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <CardTitle>For Healthcare Leaders (2-minute summary)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            <strong>The Problem:</strong> Healthcare data is trapped in silos. Your EHR can't talk to the pharmacy system,
            which can't talk to the lab system, which can't talk to the patient's app.
          </p>
          <p className="text-muted-foreground">
            <strong>The Solution:</strong> FHIR is a universal translator. It's an industry standard (mandated by CMS)
            that lets any healthcare system share data in a common format.
          </p>
          <p className="text-muted-foreground">
            <strong>What This Means:</strong> You can build apps that pull data from ANY EHR - Epic, Cerner, Meditech -
            without custom integrations. Patient portals, analytics dashboards, care coordination tools - all possible.
          </p>
          <div className="flex gap-4 pt-4">
            <Button asChild>
              <Link href="/early-access">
                Get a Sandbox to Explore
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="#use-cases">
                See What You Can Build
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FHIR Basics */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">The Basics</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {FHIR_BASICS.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <item.icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <Badge variant="outline" className="w-fit">{item.forWho}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Common Resources */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Common FHIR Resources</h2>
        <p className="text-muted-foreground mb-8">
          These are the building blocks of FHIR applications. Each "resource" represents a type of healthcare data.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {COMMON_RESOURCES.map((resource) => (
            <Card key={resource.name} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <resource.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{resource.name}</CardTitle>
                </div>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Example:</strong> {resource.example}
                </p>
                <div className="flex flex-wrap gap-1">
                  {resource.useCases.map((useCase) => (
                    <Badge key={useCase} variant="secondary" className="text-xs">
                      {useCase}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">What Can You Build?</h2>
        <p className="text-muted-foreground mb-8">
          Real problems being solved with FHIR today.
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
      </section>

      {/* Learning Path */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Your Learning Path</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {LEARNING_PATH.map((step) => (
            <Card key={step.step} className={step.completed ? "border-green-500/50 bg-green-500/5" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant={step.completed ? "default" : "outline"}>
                    Step {step.step}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {step.time}
                  </span>
                </div>
                <CardTitle className="text-base">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                {step.href ? (
                  <Button size="sm" variant="outline" asChild className="w-full">
                    <Link href={step.href}>
                      {step.action}
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" className="w-full" disabled>
                    <CheckCircle className="mr-2 h-3 w-3" />
                    {step.action}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* For Developers Section */}
      <section className="mb-16">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              <CardTitle>For Developers: Quick Start</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Your First FHIR Query</h4>
                <div className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="text-zinc-500 mb-2"># Get all patients</div>
                  <div>curl "https://api.medplum.com/fhir/R4/Patient" \</div>
                  <div className="pl-4">-H "Authorization: Bearer YOUR_TOKEN"</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">What You Get Back</h4>
                <div className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`{
  "resourceType": "Bundle",
  "total": 100,
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "name": [{"family": "Smith"}]
      }
    }
  ]
}`}</pre>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <Button asChild>
                <Link href="/sandbox/demo">
                  Try It in the Sandbox
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://hl7.org/fhir/R4/" target="_blank" rel="noopener noreferrer">
                  Full FHIR Specification
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="text-center py-12 border-t">
        <h2 className="text-2xl font-bold mb-4">Ready to Build?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Get your own FHIR sandbox with 100 synthetic patients.
          Test your ideas, learn the API, connect with builders.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/early-access">
              Get Early Access
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/sandbox/demo">
              Try Demo First
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
