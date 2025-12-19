"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowLeft,
  Code2,
  Stethoscope,
  TrendingUp,
  GraduationCap,
  Sparkles,
  Check,
} from "lucide-react";

interface Persona {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  nextSteps: {
    title: string;
    description: string;
    href: string;
    primary?: boolean;
  }[];
  lookingFor: string[];
}

const PERSONAS: Persona[] = [
  {
    id: "developer",
    title: "Developer",
    subtitle: "I build things",
    description: "You write code and want to integrate FHIR into your applications. You're comfortable with APIs and JSON.",
    icon: Code2,
    nextSteps: [
      {
        title: "Create a Sandbox",
        description: "Get 100 synthetic patients instantly",
        href: "/sandbox/demo",
        primary: true,
      },
      {
        title: "Browse Projects",
        description: "See what others are building",
        href: "/projects",
      },
      {
        title: "Learn FHIR Basics",
        description: "Quick intro to FHIR data model",
        href: "/learn",
      },
    ],
    lookingFor: ["Technical co-founder", "Healthcare domain expert", "Pilot sites"],
  },
  {
    id: "healthcare",
    title: "Healthcare Professional",
    subtitle: "I solve clinical problems",
    description: "You work in healthcare and have ideas for improving care delivery. You may not code but you understand the clinical workflow.",
    icon: Stethoscope,
    nextSteps: [
      {
        title: "Learn What FHIR Can Solve",
        description: "See real problems being addressed with FHIR",
        href: "/learn",
        primary: true,
      },
      {
        title: "Browse Use Cases",
        description: "Explore what's being built",
        href: "/projects",
      },
      {
        title: "Join Early Access",
        description: "Connect with builders and get personalized help",
        href: "/early-access",
      },
    ],
    lookingFor: ["Technical co-founder", "Funding", "Collaborators"],
  },
  {
    id: "investor",
    title: "Investor / Advisor",
    subtitle: "I back promising ideas",
    description: "You're looking for investment opportunities in healthcare technology or want to advise promising builders.",
    icon: TrendingUp,
    nextSteps: [
      {
        title: "See What's Being Built",
        description: "Explore trending projects and ideas",
        href: "/projects",
        primary: true,
      },
      {
        title: "Understand the Market",
        description: "Learn why FHIR matters",
        href: "/learn",
      },
      {
        title: "Connect with Builders",
        description: "Get on our list to meet promising teams",
        href: "/early-access",
      },
    ],
    lookingFor: ["Deal flow", "Market insights", "Founder introductions"],
  },
  {
    id: "learner",
    title: "Student / Learner",
    subtitle: "I'm exploring",
    description: "You're curious about healthcare data and FHIR. Maybe you're a student, career switcher, or just exploring.",
    icon: GraduationCap,
    nextSteps: [
      {
        title: "Start Learning",
        description: "Beginner-friendly guide to FHIR",
        href: "/learn",
        primary: true,
      },
      {
        title: "Try the Sandbox",
        description: "Hands-on exploration with real data",
        href: "/sandbox/demo",
      },
      {
        title: "Join the Community",
        description: "Connect with mentors and fellow learners",
        href: "/early-access",
      },
    ],
    lookingFor: ["Mentorship", "Learning resources", "Community"],
  },
];

export default function GetStartedPage() {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  if (selectedPersona) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-2xl">
          {/* Back button */}
          <button
            onClick={() => setSelectedPersona(null)}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Choose a different role
          </button>

          {/* Selected persona header */}
          <div className="text-center mb-12">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <selectedPersona.icon className="h-8 w-8 text-primary" />
            </div>
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-1 h-3 w-3" />
              Personalized for you
            </Badge>
            <h1 className="text-3xl font-bold mb-2">
              Welcome, {selectedPersona.title}!
            </h1>
            <p className="text-muted-foreground">
              Here's your recommended path to get started
            </p>
          </div>

          {/* Next steps */}
          <div className="space-y-4 mb-12">
            {selectedPersona.nextSteps.map((step, index) => (
              <Card
                key={step.title}
                className={step.primary ? "border-primary/50 bg-primary/5" : ""}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={step.primary ? "default" : "outline"}
                      size="sm"
                      asChild
                    >
                      <Link href={step.href}>
                        {step.primary ? "Start here" : "Go"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* What you might be looking for */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                People like you are often looking for...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedPersona.lookingFor.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Tell us more about what you need in{" "}
                <Link href="/early-access" className="text-primary hover:underline">
                  Early Access signup
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="mr-1 h-3 w-3" />
            Get Started
          </Badge>
          <h1 className="text-3xl font-bold mb-4">
            What brings you here?
          </h1>
          <p className="text-lg text-muted-foreground">
            We'll personalize your experience based on your goals
          </p>
        </div>

        {/* Persona selection */}
        <div className="grid gap-4 md:grid-cols-2">
          {PERSONAS.map((persona) => (
            <Card
              key={persona.id}
              className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
              onClick={() => setSelectedPersona(persona)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <persona.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{persona.title}</CardTitle>
                    <CardDescription>{persona.subtitle}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {persona.description}
                </p>
                <Button variant="outline" className="w-full">
                  This is me
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skip option */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Just want to explore?{" "}
            <Link href="/sandbox/demo" className="text-primary hover:underline">
              Jump to the sandbox
            </Link>
            {" "}or{" "}
            <Link href="/learn" className="text-primary hover:underline">
              start learning
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
