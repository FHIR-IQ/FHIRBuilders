"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

const SUGGESTED_TAGS = [
  "Patient",
  "Observation",
  "Condition",
  "MedicationRequest",
  "Encounter",
  "AI",
  "React",
  "Python",
  "Integration",
  "Clinical",
  "Analytics",
];

export default function NewProjectPage() {
  const router = useRouter();
  const [formState, setFormState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    repoUrl: "",
    demoUrl: "",
    tags: [] as string[],
    authorName: "",
    authorEmail: "",
  });
  const [tagInput, setTagInput] = useState("");

  const addTag = (tag: string) => {
    const normalizedTag = tag.trim();
    if (normalizedTag && !formData.tags.includes(normalizedTag) && formData.tags.length < 5) {
      setFormData({ ...formData, tags: [...formData.tags, normalizedTag] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormState("success");
        setTimeout(() => {
          router.push("/projects");
        }, 1500);
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
          <h1 className="text-2xl font-bold mb-4">Project Submitted!</h1>
          <p className="text-muted-foreground mb-8">
            Thanks for sharing. Redirecting to projects page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
        {/* Back link */}
        <Link
          href="/projects"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to projects
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Share Your Project</h1>
          <p className="text-muted-foreground">
            Tell the community what you've built with FHIR
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              All fields except GitHub repo are optional
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
                  placeholder="What does your project do? What FHIR resources does it use?"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[120px] px-3 py-2 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
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
                  Demo URL (optional)
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
                <label className="text-sm font-medium">
                  Tags (up to 5)
                </label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="pl-2 pr-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
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
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                    disabled={formData.tags.length >= 5}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addTag(tagInput)}
                    disabled={formData.tags.length >= 5 || !tagInput.trim()}
                  >
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
                  <label htmlFor="authorEmail" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="authorEmail"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.authorEmail}
                    onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Not displayed publicly. For follow-ups only.
                  </p>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={formState === "loading"}
              >
                {formState === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Share Project"
                )}
              </Button>

              {formState === "error" && (
                <p className="text-sm text-red-500 text-center">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
