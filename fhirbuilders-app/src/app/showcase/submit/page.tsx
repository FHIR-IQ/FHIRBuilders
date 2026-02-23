"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Plus,
  X,
  Trophy,
} from "lucide-react";

const CATEGORIES = [
  { value: "AI_AGENT", label: "AI Agent" },
  { value: "CLINICAL", label: "Clinical" },
  { value: "PATIENT_ENGAGEMENT", label: "Patient Engagement" },
  { value: "ANALYTICS", label: "Analytics" },
  { value: "INTEGRATION", label: "Integration" },
  { value: "TEMPLATE", label: "Template" },
];

const APP_TYPES = [
  "SMART on FHIR",
  "MCP App",
  "Mobile App",
  "Enterprise App",
  "AI Agent",
  "Other",
];

const SUGGESTED_FHIR_RESOURCES = [
  "Patient",
  "Observation",
  "Condition",
  "MedicationRequest",
  "Encounter",
  "DiagnosticReport",
  "AllergyIntolerance",
  "Procedure",
  "Immunization",
  "CarePlan",
];

const SUGGESTED_BUILT_WITH = [
  "Claude Code",
  "Cursor",
  "Lovable",
  "Windsurf",
  "Medplum",
  "HAPI FHIR",
  "GPT-4",
  "React",
  "Next.js",
  "Python",
];

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedSlug, setSubmittedSlug] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [appType, setAppType] = useState("");
  const [fhirResources, setFhirResources] = useState<string[]>([]);
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [docsUrl, setDocsUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [builtWith, setBuiltWith] = useState<string[]>([]);
  const [customResource, setCustomResource] = useState("");
  const [customTool, setCustomTool] = useState("");

  if (status === "loading") {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container py-12 max-w-2xl text-center">
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sign in to submit</h2>
        <p className="text-muted-foreground mb-6">
          You need to be signed in to submit your app to the showcase.
        </p>
        <Button asChild>
          <Link href="/login?callbackUrl=/showcase/submit">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container py-12 max-w-2xl text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">App Submitted!</h2>
        <p className="text-muted-foreground mb-6">
          Your app has been submitted to the showcase. It will be visible to the community.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href={`/showcase/${submittedSlug}`}>View Your App</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/showcase">Browse Showcase</Link>
          </Button>
        </div>
      </div>
    );
  }

  const toggleTag = (
    tag: string,
    list: string[],
    setList: (v: string[]) => void,
    max: number
  ) => {
    if (list.includes(tag)) {
      setList(list.filter(t => t !== tag));
    } else if (list.length < max) {
      setList([...list, tag]);
    }
  };

  const addCustomTag = (
    value: string,
    list: string[],
    setList: (v: string[]) => void,
    setValue: (v: string) => void,
    max: number
  ) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed) && list.length < max) {
      setList([...list, trimmed]);
      setValue("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          category,
          appType: appType || null,
          fhirResources,
          repoUrl: repoUrl.trim() || null,
          demoUrl: demoUrl.trim() || null,
          docsUrl: docsUrl.trim() || null,
          videoUrl: videoUrl.trim() || null,
          builtWith,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        setIsSubmitting(false);
        return;
      }

      setSubmittedSlug(data.app.slug);
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-12 max-w-2xl">
      <Link
        href="/showcase"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Showcase
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Submit to FHIR Showcase
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Share your FHIR app, MCP server, SMART on FHIR app, or any healthcare project with the community.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                App Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="My FHIR App"
                maxLength={100}
                required
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </div>

            {/* Tagline */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tagline <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="A short description of what your app does"
                maxLength={100}
                required
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
              <p className="text-xs text-muted-foreground text-right">
                {tagline.length}/100
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your app in detail. What problem does it solve? How does it use FHIR?"
                maxLength={5000}
                required
                rows={5}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm resize-y min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/5000
              </p>
            </div>

            {/* Category + App Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">App Type</label>
                <select
                  value={appType}
                  onChange={e => setAppType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                >
                  <option value="">Select type (optional)</option>
                  {APP_TYPES.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* FHIR Resources */}
            <div className="space-y-2">
              <label className="text-sm font-medium">FHIR Resources</label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_FHIR_RESOURCES.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleTag(r, fhirResources, setFhirResources, 20)}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                      fhirResources.includes(r)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={customResource}
                  onChange={e => setCustomResource(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomTag(customResource, fhirResources, setFhirResources, setCustomResource, 20);
                    }
                  }}
                  placeholder="Add custom resource..."
                  className="flex-1 px-3 py-1.5 text-xs border rounded-md bg-background"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addCustomTag(customResource, fhirResources, setFhirResources, setCustomResource, 20)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {fhirResources.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {fhirResources.map(r => (
                    <Badge key={r} variant="secondary" className="text-xs">
                      {r}
                      <button
                        type="button"
                        onClick={() => setFhirResources(fhirResources.filter(t => t !== r))}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* URLs */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Links</label>
              <input
                type="url"
                value={repoUrl}
                onChange={e => setRepoUrl(e.target.value)}
                placeholder="GitHub Repository URL"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
              <input
                type="url"
                value={demoUrl}
                onChange={e => setDemoUrl(e.target.value)}
                placeholder="Live Demo URL"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
              <input
                type="url"
                value={docsUrl}
                onChange={e => setDocsUrl(e.target.value)}
                placeholder="Documentation URL"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
              <input
                type="url"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="Demo Video URL (YouTube, Loom, etc.)"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </div>

            {/* Built With */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Built With</label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_BUILT_WITH.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t, builtWith, setBuiltWith, 10)}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                      builtWith.includes(t)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={customTool}
                  onChange={e => setCustomTool(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomTag(customTool, builtWith, setBuiltWith, setCustomTool, 10);
                    }
                  }}
                  placeholder="Add custom tool..."
                  className="flex-1 px-3 py-1.5 text-xs border rounded-md bg-background"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addCustomTag(customTool, builtWith, setBuiltWith, setCustomTool, 10)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit to Showcase"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
