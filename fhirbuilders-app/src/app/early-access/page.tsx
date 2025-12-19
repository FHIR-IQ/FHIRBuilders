"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Loader2,
  ArrowLeft,
  Sparkles,
  Users,
  Zap,
  MessageSquare,
  Code2,
  Stethoscope,
  TrendingUp,
  GraduationCap,
} from "lucide-react";

const PERSONAS = [
  { value: "developer", label: "Developer", icon: Code2, desc: "Building FHIR integrations" },
  { value: "healthcare", label: "Healthcare Professional", icon: Stethoscope, desc: "Solving clinical problems" },
  { value: "investor", label: "Investor / Advisor", icon: TrendingUp, desc: "Exploring opportunities" },
  { value: "learner", label: "Student / Learner", icon: GraduationCap, desc: "Learning FHIR" },
];

const LOOKING_FOR = [
  { value: "technical_cofounder", label: "Technical co-founder" },
  { value: "domain_expert", label: "Healthcare domain expert" },
  { value: "funding", label: "Funding / Investment" },
  { value: "pilot_sites", label: "Pilot sites to test" },
  { value: "collaborators", label: "Collaborators" },
  { value: "mentorship", label: "Mentorship / Guidance" },
  { value: "just_exploring", label: "Just exploring" },
];

const PAIN_POINTS = [
  "Setting up a FHIR server takes too long",
  "Finding realistic test data is hard",
  "Testing integrations before production",
  "Learning FHIR data model",
  "I have a problem but don't know if FHIR can solve it",
  "Need help finding collaborators/team",
  "Other",
];

export default function EarlyAccessPage() {
  const [formState, setFormState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    email: "",
    persona: "",
    building: "",
    painPoint: "",
    lookingFor: [] as string[],
    canInterview: false,
  });

  const toggleLookingFor = (value: string) => {
    setFormData(prev => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(value)
        ? prev.lookingFor.filter(v => v !== value)
        : [...prev.lookingFor, value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          lookingFor: formData.lookingFor.join(", "),
        }),
      });

      if (response.ok) {
        setFormState("success");
        analytics.trackEarlyAccessSubmit(formData.painPoint);
      } else {
        setFormState("error");
      }
    } catch {
      setFormState("error");
    }
  };

  if (formState === "success") {
    return (
      <div className="container py-20">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4">You're on the list!</h1>
          <p className="text-muted-foreground mb-8">
            We're onboarding our first 20 builders this week.
            Check your email for next steps.
          </p>
          <div className="space-y-4">
            {formData.persona === "learner" ? (
              <Button asChild variant="outline" className="w-full">
                <Link href="/learn">
                  Start learning FHIR basics
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full">
                <Link href="/sandbox/demo">
                  Try the demo sandbox while you wait
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
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
            Limited Early Access
          </Badge>
          <h1 className="text-3xl font-bold mb-4">
            Join the FHIR Builder Community
          </h1>
          <p className="text-lg text-muted-foreground">
            Whether you're building, investing, or learning - we'll connect you
            with the right resources and people.
          </p>
        </div>

        {/* What you get */}
        <div className="grid gap-4 md:grid-cols-3 mb-12">
          <Card>
            <CardHeader className="pb-2">
              <Zap className="h-6 w-6 text-primary mb-2" />
              <CardTitle className="text-base">Personal Sandbox</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                100 synthetic patients, ready in 24 hours
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Users className="h-6 w-6 text-primary mb-2" />
              <CardTitle className="text-base">Find Your People</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Connect with co-founders, experts, and investors
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <MessageSquare className="h-6 w-6 text-primary mb-2" />
              <CardTitle className="text-base">Direct Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Personal onboarding and feedback channel
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Tell Us About Yourself</CardTitle>
            <CardDescription>
              This helps us connect you with the right resources and people
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Persona Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  I am a... <span className="text-red-500">*</span>
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {PERSONAS.map((persona) => (
                    <label
                      key={persona.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.persona === persona.value
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="persona"
                        value={persona.value}
                        checked={formData.persona === persona.value}
                        onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
                        className="sr-only"
                        required
                      />
                      <persona.icon className={`h-5 w-5 ${
                        formData.persona === persona.value ? "text-primary" : "text-muted-foreground"
                      }`} />
                      <div>
                        <div className="text-sm font-medium">{persona.label}</div>
                        <div className="text-xs text-muted-foreground">{persona.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* What are you building */}
              <div className="space-y-2">
                <label htmlFor="building" className="text-sm font-medium">
                  {formData.persona === "investor"
                    ? "What areas are you interested in?"
                    : formData.persona === "learner"
                    ? "What do you want to learn/build?"
                    : "What are you building or want to build?"
                  } <span className="text-red-500">*</span>
                </label>
                <Input
                  id="building"
                  type="text"
                  placeholder={
                    formData.persona === "investor"
                      ? "e.g., Healthcare AI, Clinical Decision Support, Patient Engagement..."
                      : formData.persona === "learner"
                      ? "e.g., Learn FHIR basics, Build a patient portal, Understand healthcare data..."
                      : "e.g., Medication reconciliation AI, Patient portal, Care coordination..."
                  }
                  required
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Even a rough idea helps us understand how to help
                </p>
              </div>

              {/* Looking For - Multi-select */}
              {formData.persona && formData.persona !== "learner" && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    I'm looking for... (select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LOOKING_FOR.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => toggleLookingFor(item.value)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          formData.lookingFor.includes(item.value)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "hover:border-primary/50"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pain point */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Biggest challenge right now?
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {PAIN_POINTS.map((point) => (
                    <label
                      key={point}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.painPoint === point
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="painPoint"
                        value={point}
                        checked={formData.painPoint === point}
                        onChange={(e) => setFormData({ ...formData, painPoint: e.target.value })}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          formData.painPoint === point
                            ? "border-primary"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {formData.painPoint === point && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-sm">{point}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Interview consent */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <input
                  type="checkbox"
                  id="canInterview"
                  checked={formData.canInterview}
                  onChange={(e) => setFormData({ ...formData, canInterview: e.target.checked })}
                  className="mt-1"
                />
                <label htmlFor="canInterview" className="text-sm">
                  <span className="font-medium">I'm open to a 15-minute call</span>
                  <p className="text-muted-foreground mt-1">
                    Help us build the right thing. Early feedback = priority access + potential introductions.
                  </p>
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={formState === "loading" || !formData.persona}
              >
                {formState === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Early Access"
                )}
              </Button>

              {formState === "error" && (
                <p className="text-sm text-red-500 text-center">
                  Something went wrong. Please try again or email us directly.
                </p>
              )}

              <p className="text-xs text-muted-foreground text-center">
                No spam. We'll only email you about your sandbox and relevant connections.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Social proof */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Join builders, clinicians, and investors from</p>
          <p className="font-medium text-foreground mt-1">
            Epic • Cerner • Health Startups • Research Institutions • Healthcare VCs
          </p>
        </div>
      </div>
    </div>
  );
}
