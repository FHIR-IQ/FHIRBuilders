"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowUp,
  Bot,
  BarChart3,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileCode2,
  GitFork,
  Github,
  Layers,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  repoUrl: string | null;
  demoUrl: string | null;
  tags: string[];
  artifactType: string | null;
  status: string | null;
  lookingFor: string[];
  authorName: string;
  upvoteCount: number;
  forkCount: number;
  verified: boolean;
  makerComment: string | null;
  artifactMeta: Record<string, unknown> | null;
  createdAt: string;
}

const ARTIFACT_COLORS: Record<string, string> = {
  Agent:           "bg-violet-100 text-violet-800 border-violet-200",
  "MCP Tool":      "bg-blue-100 text-blue-800 border-blue-200",
  "OpenClaw Skill":"bg-amber-100 text-amber-800 border-amber-200",
  App:             "bg-green-100 text-green-800 border-green-200",
  "CQL Measure":   "bg-teal-100 text-teal-800 border-teal-200",
  "FHIR IG":       "bg-pink-100 text-pink-800 border-pink-200",
};

const ARTIFACT_ICONS: Record<string, React.ElementType> = {
  Agent:           Bot,
  "MCP Tool":      Wrench,
  "OpenClaw Skill":Sparkles,
  App:             Layers,
  "CQL Measure":   FileCode2,
  "FHIR IG":       BarChart3,
};

const STATUS_COLORS: Record<string, string> = {
  live:          "bg-green-100 text-green-700",
  "in-progress": "bg-yellow-100 text-yellow-700",
  concept:       "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  live:          "Live",
  "in-progress": "In Progress",
  concept:       "Concept",
};

type Tab = "overview" | "try-it";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasFored, setHasFored] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((d) => setProject(d.project ?? null))
      .catch(() => setProject(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleUpvote = async () => {
    if (!project || hasUpvoted) return;
    setHasUpvoted(true);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    setProject((p) => p ? { ...p, upvoteCount: p.upvoteCount + 1 } : p);
    try {
      await fetch(`/api/projects/${id}/upvote`, { method: "POST" });
    } catch {
      setHasUpvoted(false);
      setProject((p) => p ? { ...p, upvoteCount: p.upvoteCount - 1 } : p);
    }
  };

  const handleFork = async () => {
    if (!project || hasFored) return;
    if (project.repoUrl?.includes("github.com")) {
      window.open(`${project.repoUrl}/fork`, "_blank");
    }
    setHasFored(true);
    setProject((p) => p ? { ...p, forkCount: p.forkCount + 1 } : p);
    try {
      await fetch(`/api/projects/${id}/fork`, { method: "POST" });
    } catch {
      // non-critical
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="h-8 w-32 rounded bg-muted animate-pulse mb-8" />
        <div className="h-64 rounded-lg border bg-muted/30 animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground mb-4">Project not found.</p>
        <Button asChild variant="outline">
          <Link href="/projects"><ArrowLeft className="mr-2 h-4 w-4" />Back to projects</Link>
        </Button>
      </div>
    );
  }

  const ArtifactIcon = project.artifactType ? ARTIFACT_ICONS[project.artifactType] : null;
  const installCmd = project.artifactType === "OpenClaw Skill"
    ? `clawhub install fhirbuilders/${project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
    : null;

  const copyInstall = () => {
    if (installCmd) {
      navigator.clipboard.writeText(installCmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Render "Try It" panel based on artifact type
  const renderTryIt = () => {
    if (project.artifactType === "OpenClaw Skill" && installCmd) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Install this skill into your OpenClaw agent:</p>
          <div className="bg-zinc-900 rounded-lg px-4 py-3 flex items-center gap-3">
            <code className="text-green-400 font-mono text-sm flex-1">{installCmd}</code>
            <button onClick={copyInstall} className="text-zinc-400 hover:text-white transition-colors shrink-0">
              {copied ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Requires <a href="https://openclaw.ai" target="_blank" rel="noopener noreferrer" className="underline">OpenClaw</a> v1.0+.
          </p>
        </div>
      );
    }

    if (project.artifactType === "MCP Tool" || project.artifactType === "Agent") {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Send a FHIR query to this agent:</p>
          <FhirQueryBox projectTitle={project.title} />
          {project.repoUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />View source to run locally
              </a>
            </Button>
          )}
        </div>
      );
    }

    if (project.artifactType === "App" && project.demoUrl) {
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Live demo:</p>
          <iframe
            src={project.demoUrl}
            className="w-full rounded-lg border"
            style={{ height: 480 }}
            title={`${project.title} demo`}
          />
        </div>
      );
    }

    if (project.artifactType === "CQL Measure") {
      const meta = project.artifactMeta as Record<string, string> | null;
      return (
        <div className="space-y-4">
          {meta?.cqlSource ? (
            <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto font-mono whitespace-pre-wrap">
              {String(meta.cqlSource)}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground">No CQL source attached. Add it via the repo.</p>
          )}
          {project.repoUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />View full measure bundle
              </a>
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="text-sm text-muted-foreground py-4">
        {project.demoUrl ? (
          <Button asChild>
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />Open Demo
            </a>
          </Button>
        ) : (
          <p>No interactive demo available. See the repository for setup instructions.</p>
        )}
      </div>
    );
  };

  return (
    <div className="container py-10 max-w-4xl">
      {/* Back */}
      <Link href="/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to projects
      </Link>

      {/* Hero */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {project.artifactType && (
            <Badge variant="outline" className={`text-xs ${ARTIFACT_COLORS[project.artifactType] ?? ""}`}>
              {ArtifactIcon && <ArtifactIcon className="mr-1 h-3 w-3" />}
              {project.artifactType}
            </Badge>
          )}
          {project.status && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[project.status] ?? ""}`}>
              {STATUS_LABELS[project.status] ?? project.status}
            </span>
          )}
          {project.verified && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-teal-100 text-teal-700">
              <CheckCircle2 className="h-3 w-3" />
              Community Verified
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
        <p className="text-muted-foreground text-lg">{project.description}</p>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <Button
            variant={hasUpvoted ? "secondary" : "outline"}
            size="sm"
            onClick={handleUpvote}
            disabled={hasUpvoted}
            className={`transition-transform ${isAnimating ? "scale-125" : ""} ${hasUpvoted ? "text-teal-600" : ""}`}
          >
            <ArrowUp className={`h-4 w-4 mr-1 ${hasUpvoted ? "fill-teal-600 text-teal-600" : ""}`} />
            {project.upvoteCount} upvotes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFork}
            disabled={hasFored}
          >
            <GitFork className="h-4 w-4 mr-1" />
            {project.forkCount} forks
          </Button>
          {project.repoUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-1" />Code
              </a>
            </Button>
          )}
          {project.demoUrl && (
            <Button size="sm" asChild>
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />Live Demo
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6 flex gap-0">
        {(["overview", "try-it"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "try-it" ? "Try It" : "Overview"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Maker comment — pinned first */}
            {project.makerComment && (
              <Card className="border-teal-200 bg-teal-50/40">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="h-4 w-4 text-teal-600" />
                    <span className="text-sm font-medium text-teal-700">{project.authorName}</span>
                    <Badge variant="outline" className="text-xs bg-teal-100 text-teal-700 border-teal-200">Builder</Badge>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{project.makerComment}</p>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {project.tags.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Tags</h2>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Artifact Metadata (C4) */}
            {project.artifactMeta && Object.keys(project.artifactMeta).length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Specifications</h2>
                <dl className="space-y-2">
                  {Object.entries(project.artifactMeta)
                    .filter(([, v]) => v !== null && v !== undefined && v !== "" && typeof v !== "object")
                    .map(([k, v]) => (
                      <div key={k} className="grid grid-cols-2 gap-2 text-sm">
                        <dt className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</dt>
                        <dd className="font-medium">{String(v)}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Builder</h2>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{project.authorName}</span>
              </div>
            </div>

            {/* Problem context */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                Problem
              </h2>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>

            {/* Looking For */}
            {project.lookingFor.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Looking For</h2>
                <div className="flex flex-wrap gap-1.5">
                  {project.lookingFor.map((item) => (
                    <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Stats</h2>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Upvotes</dt>
                  <dd className="font-medium">{project.upvoteCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Forks</dt>
                  <dd className="font-medium">{project.forkCount}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {tab === "try-it" && (
        <div className="max-w-2xl">
          <Card>
            <CardContent className="pt-6 pb-6">
              {renderTryIt()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Simple FHIR query demo box for MCP Tool / Agent artifacts
function FhirQueryBox({ projectTitle }: { projectTitle: string }) {
  const [query, setQuery] = useState("Patient?_count=5&_sort=-birthdate");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const runQuery = async () => {
    setLoading(true);
    setResult("");
    // Simulate a sandboxed query response (no real FHIR call without credentials)
    await new Promise((r) => setTimeout(r, 600));
    setResult(
      JSON.stringify(
        {
          resourceType: "Bundle",
          type: "searchset",
          total: 5,
          entry: [
            { resource: { resourceType: "Patient", id: "demo-1", name: [{ family: "Smith", given: ["John"] }], birthDate: "1975-03-14" } },
            { resource: { resourceType: "Patient", id: "demo-2", name: [{ family: "Johnson", given: ["Mary"] }], birthDate: "1982-07-22" } },
          ],
          _note: `Simulated response — connect ${projectTitle} to a real FHIR endpoint for live data.`,
        },
        null,
        2
      )
    );
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 text-sm rounded-md border bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="FHIR query e.g. Patient?_count=5"
        />
        <Button size="sm" onClick={runQuery} disabled={loading}>
          {loading ? "Running…" : "Run"}
        </Button>
      </div>
      {result && (
        <pre className="bg-zinc-950 text-green-400 rounded-lg p-4 text-xs overflow-x-auto font-mono max-h-64">
          {result}
        </pre>
      )}
    </div>
  );
}
