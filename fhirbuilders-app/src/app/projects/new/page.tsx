"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Check,
  Loader2,
  X,
  Github,
  ExternalLink,
  Lightbulb,
} from "lucide-react";

const ARTIFACT_TYPES = [
  { value: "App", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "Agent", color: "bg-violet-100 text-violet-800 border-violet-200" },
  { value: "MCP Tool", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "OpenClaw Skill", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "FHIR IG", color: "bg-pink-100 text-pink-800 border-pink-200" },
  { value: "CQL Measure", color: "bg-teal-100 text-teal-800 border-teal-200" },
];

const LOOKING_FOR_OPTIONS = [
  "Technical co-founder",
  "Clinical advisors",
  "Funding",
  "Pilot sites",
  "Collaborators",
  "Healthcare domain expert",
];

const SUGGESTED_TAGS = [
  "Patient", "Observation", "Condition", "MedicationRequest", "Encounter",
  "AI", "React", "Python", "Integration", "Clinical", "Analytics",
];

function NewProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const problemId = searchParams.get("problem_id");
  const prefillDescription = searchParams.get("description") || "";
  const prefillArtifactType = searchParams.get("artifactType") || "";

  const [linkedProblemTitle, setLinkedProblemTitle] = useState<string | null>(null);
  const [formState, setFormState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    title: "",
    description: prefillDescription,
    repoUrl: "",
    demoUrl: "",
    tags: [] as string[],
    authorName: "",
    authorEmail: "",
    artifactType: prefillArtifactType,
    status: "concept" as "concept" | "in-progress" | "live",
    lookingFor: [] as string[],
    makerComment: "",
    problemId: problemId || "",
  });
  const [tagInput, setTagInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!problemId) return;
    fetch(`/api/problems/${problemId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.problem?.title) setLinkedProblemTitle(d.problem.title);
      })
      .catch(() => {});
  }, [problemId]);

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !formData.tags.includes(t) && formData.tags.length < 5) {
      setFormData({ ...formData, tags: [...formData.tags, t] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const toggleLookingFor = (option: string) => {
    setFormData({
      ...formData,
      lookingFor: formData.lookingFor.includes(option)
        ? formData.lookingFor.filter((o) => o !== option)
        : [...formData.lookingFor, option],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!formData.artifactType) {
      setErrorMsg("Please select an artifact type.");
      return;
    }
    setFormState("loading");

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        // Link this project to the problem if problem_id was provided
        if (problemId && data.project?.id) {
          await fetch(`/api/problems/${problemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId: data.project.id }),
          }).catch(() => {}); // non-critical
        }
        setFormState("success");
      } else {
        const data = await response.json().catch(() => ({}));
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setFormState("error");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setFormState("error");
    }
  };

  if (formState === "success") {
    const shareText = `Just shared my FHIR project "${formData.title}" on FHIRBuilders — a community for healthcare AI builders. Check it out!`;
    const shareUrl = "https://fhir-builders.vercel.app/projects";
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`;

    return (
      <div className="container py-20">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Project Submitted!</h1>
          <p className="text-muted-foreground mb-8">
            Your project is live. Help others find it by sharing with your network.
          </p>
          <div className="bg-muted/40 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-muted-foreground italic">&ldquo;{shareText}&rdquo;</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Button asChild className="bg-[#1DA1F2] hover:bg-[#1a8fd1] text-white">
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
                Share on X / Twitter
              </a>
            </Button>
            <Button asChild variant="outline" className="border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50">
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                Share on LinkedIn
              </a>
            </Button>
          </div>
          <Button variant="ghost" onClick={() => router.push("/projects")}>
            Browse community projects →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/projects"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to projects
        </Link>

        {linkedProblemTitle && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <Lightbulb className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-rose-700">Building on a posted problem</p>
              <p className="text-sm text-rose-600 mt-0.5">&ldquo;{linkedProblemTitle}&rdquo;</p>
              <p className="text-xs text-rose-500 mt-1">Your project will be linked to this problem automatically.</p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Share Your Project</h1>
          <p className="text-muted-foreground">
            Tell the community what you've built with FHIR
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Title, description, artifact type, and your name are required
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., FHIR Patient Dashboard"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  placeholder="What problem does it solve? What FHIR resources does it use?"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[120px] px-3 py-2 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Artifact Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Artifact Type <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {ARTIFACT_TYPES.map(({ value, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({ ...formData, artifactType: value })}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        formData.artifactType === value
                          ? `${color} ring-2 ring-offset-1 ring-current`
                          : "bg-muted text-muted-foreground border-transparent hover:border-border"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex gap-3">
                  {(["concept", "in-progress", "live"] as const).map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={s}
                        checked={formData.status === s}
                        onChange={() => setFormData({ ...formData, status: s })}
                        className="accent-primary"
                      />
                      <span className="text-sm capitalize">{s === "in-progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Looking For */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Looking For <span className="text-muted-foreground font-normal">(optional)</span></label>
                <p className="text-xs text-muted-foreground">What kind of collaborators or support are you seeking?</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {LOOKING_FOR_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleLookingFor(option)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        formData.lookingFor.includes(option)
                          ? "bg-teal-100 text-teal-800 border-teal-300"
                          : "bg-muted text-muted-foreground border-transparent hover:border-border"
                      }`}
                    >
                      {formData.lookingFor.includes(option) && (
                        <Check className="inline h-3 w-3 mr-1" />
                      )}
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* GitHub Repo */}
              <div className="space-y-2">
                <label htmlFor="repoUrl" className="text-sm font-medium">
                  <Github className="inline h-4 w-4 mr-1" />
                  GitHub Repository
                </label>
                <Input
                  id="repoUrl"
                  type="url"
                  placeholder="https://github.com/username/repo"
                  value={formData.repoUrl}
                  onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                />
              </div>

              {/* Demo URL */}
              <div className="space-y-2">
                <label htmlFor="demoUrl" className="text-sm font-medium">
                  <ExternalLink className="inline h-4 w-4 mr-1" />
                  Demo URL <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input
                  id="demoUrl"
                  type="url"
                  placeholder="https://your-demo.vercel.app"
                  value={formData.demoUrl}
                  onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags <span className="text-muted-foreground font-normal">(up to 5)</span></label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="pl-2 pr-1">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); }
                    }}
                    disabled={formData.tags.length >= 5}
                  />
                  <Button type="button" variant="outline" onClick={() => addTag(tagInput)} disabled={formData.tags.length >= 5 || !tagInput.trim()}>
                    Add
                  </Button>
                </div>
                <div className="flex gap-1 flex-wrap mt-2">
                  {SUGGESTED_TAGS.filter((t) => !formData.tags.includes(t)).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      disabled={formData.tags.length >= 5}
                      className="text-xs px-2 py-1 rounded border hover:bg-muted disabled:opacity-50"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Author Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="authorName" className="text-sm font-medium">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="authorName"
                    type="text"
                    placeholder="Jane Doe"
                    required
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="authorEmail" className="text-sm font-medium">Email</label>
                  <Input
                    id="authorEmail"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.authorEmail}
                    onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Not displayed publicly.</p>
                </div>
              </div>

              {/* Maker Comment */}
              <div className="space-y-2">
                <label htmlFor="makerComment" className="text-sm font-medium">
                  Maker Comment <span className="text-muted-foreground font-normal">(recommended, min 80 chars)</span>
                </label>
                <p className="text-xs text-muted-foreground">
                  Tell the community why you built this, what makes it unique, and what kind of feedback you&apos;re looking for. This is pinned as your &ldquo;Builder&rdquo; comment on the project page.
                </p>
                <textarea
                  id="makerComment"
                  placeholder="I built this because... The key insight is... Looking for feedback on..."
                  value={formData.makerComment}
                  onChange={(e) => setFormData({ ...formData, makerComment: e.target.value })}
                  className="w-full min-h-[100px] px-3 py-2 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className={`text-xs ${formData.makerComment.length < 80 && formData.makerComment.length > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                  {formData.makerComment.length} / 80 min characters
                </p>
              </div>

              {/* Submit */}
              <Button type="submit" size="lg" className="w-full" disabled={formState === "loading"}>
                {formState === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Share Project"
                )}
              </Button>

              {(formState === "error" || errorMsg) && (
                <p className="text-sm text-red-500 text-center">{errorMsg || "Something went wrong. Please try again."}</p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={<div className="container py-20 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <NewProjectForm />
    </Suspense>
  );
}
