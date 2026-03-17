"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  GitFork,
  Github,
  Lightbulb,
  MessageSquare,
  Plus,
  Search,
  TrendingUp,
  Users,
  Bot,
  Wrench,
  Sparkles,
  BarChart3,
  FileCode2,
  Layers,
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  repoUrl: string | null;
  demoUrl: string | null;
  tags: string[];
  artifactType?: string | null;
  status?: string | null;
  lookingFor?: string[];
  authorName: string;
  upvoteCount: number;
  forkCount?: number;
  trendingScore?: number;
  verified?: boolean;
  makerComment?: string | null;
  createdAt: string;
}

const ARTIFACT_TYPES = ["All", "Agent", "MCP Tool", "OpenClaw Skill", "App", "CQL Measure", "FHIR IG"];

const ARTIFACT_COLORS: Record<string, string> = {
  "Agent":          "bg-violet-100 text-violet-800 border-violet-200",
  "MCP Tool":       "bg-blue-100 text-blue-800 border-blue-200",
  "OpenClaw Skill": "bg-amber-100 text-amber-800 border-amber-200",
  "App":            "bg-green-100 text-green-800 border-green-200",
  "CQL Measure":    "bg-teal-100 text-teal-800 border-teal-200",
  "FHIR IG":        "bg-pink-100 text-pink-800 border-pink-200",
};

const ARTIFACT_ICONS: Record<string, React.ElementType> = {
  "Agent":          Bot,
  "MCP Tool":       Wrench,
  "OpenClaw Skill": Sparkles,
  "App":            Layers,
  "CQL Measure":    FileCode2,
  "FHIR IG":        BarChart3,
};

const STATUS_COLORS: Record<string, string> = {
  "live":        "bg-green-100 text-green-700",
  "in-progress": "bg-yellow-100 text-yellow-700",
  "concept":     "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  "live":        "Live",
  "in-progress": "In Progress",
  "concept":     "Concept",
};

const LOOKING_FOR_COLORS: Record<string, string> = {
  "Technical co-founder": "bg-purple-100 text-purple-800",
  "Healthcare domain expert": "bg-blue-100 text-blue-800",
  "Clinical advisors": "bg-teal-100 text-teal-800",
  "Funding": "bg-amber-100 text-amber-800",
  "Pilot sites": "bg-pink-100 text-pink-800",
  "Collaborators": "bg-indigo-100 text-indigo-800",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sortBy, setSortBy] = useState<"trending" | "popular" | "newest">("trending");
  const [filterType, setFilterType] = useState<string>("All");
  const [filterLookingFor, setFilterLookingFor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects?sort=${sortBy}`);
      if (response.ok) {
        const data = await response.json();
        if (data.projects && data.projects.length > 0) {
          setProjects(data.projects);
        }
      }
    } catch {
      // silently fail
    }
    setIsLoading(false);
  }, [sortBy]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleUpvote = async (projectId: string) => {
    if (upvotedIds.has(projectId)) return;
    setUpvotedIds((prev) => new Set([...prev, projectId]));
    setAnimatingIds((prev) => new Set([...prev, projectId]));
    setTimeout(() => setAnimatingIds((prev) => { const s = new Set(prev); s.delete(projectId); return s; }), 300);
    setProjects((prev) =>
      prev.map((p) => p.id === projectId ? { ...p, upvoteCount: p.upvoteCount + 1 } : p)
    );
    try {
      await fetch(`/api/projects/${projectId}/upvote`, { method: "POST" });
    } catch {
      setUpvotedIds((prev) => { const s = new Set(prev); s.delete(projectId); return s; });
      setProjects((prev) =>
        prev.map((p) => p.id === projectId ? { ...p, upvoteCount: p.upvoteCount - 1 } : p)
      );
    }
  };

  const allLookingFor = Array.from(
    new Set(projects.flatMap((p) => p.lookingFor ?? []))
  );

  const filtered = projects.filter((p) => {
    if (filterType !== "All" && p.artifactType !== filterType) return false;
    if (filterLookingFor && !(p.lookingFor ?? []).includes(filterLookingFor)) return false;
    return true;
  });

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Community Projects</h1>
          <p className="text-muted-foreground mt-1">
            Real problems being solved with FHIR. Find collaborators or get inspired.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            Share Your Project
          </Link>
        </Button>
      </div>

      {/* I2 — OpenClaw Skills banner when filtered */}
      {filterType === "OpenClaw Skill" && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm">
          <span className="text-violet-700">
            Looking for curated FHIR skills with one-click installs and a skill builder?
          </span>
          <Link href="/openclaw" className="ml-3 shrink-0 font-medium text-violet-700 hover:underline flex items-center gap-1">
            Visit the Skills Hub <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Sort + Artifact Type */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2">
            <Button
              variant={sortBy === "trending" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("trending")}
            >
              <TrendingUp className="mr-1 h-3 w-3" />
              Trending
            </Button>
            <Button
              variant={sortBy === "popular" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("popular")}
            >
              <ArrowUp className="mr-1 h-3 w-3" />
              Most Upvoted
            </Button>
            <Button
              variant={sortBy === "newest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("newest")}
            >
              <Clock className="mr-1 h-3 w-3" />
              Newest
            </Button>
          </div>

          {/* Artifact Type Filter */}
          <div className="flex flex-wrap gap-1.5">
            {ARTIFACT_TYPES.map((type) => {
              const Icon = type !== "All" ? ARTIFACT_ICONS[type] : null;
              return (
                <Button
                  key={type}
                  variant={filterType === type ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className="h-7 text-xs"
                >
                  {Icon && <Icon className="mr-1 h-3 w-3" />}
                  {type}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Looking For Filter */}
        {allLookingFor.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Search className="h-3 w-3" />
              Looking for:
            </span>
            <Button
              variant={filterLookingFor === null ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilterLookingFor(null)}
              className="h-7 text-xs"
            >
              All
            </Button>
            {allLookingFor.map((item) => (
              <Button
                key={item}
                variant={filterLookingFor === item ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilterLookingFor(filterLookingFor === item ? null : item)}
                className="h-7 text-xs"
              >
                {item}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Projects */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-lg border bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((project) => {
            const ArtifactIcon = project.artifactType ? ARTIFACT_ICONS[project.artifactType] : null;
            const hasUpvoted = upvotedIds.has(project.id);
            const isAnimating = animatingIds.has(project.id);
            const makerPreview = project.makerComment
              ? project.makerComment.slice(0, 120) + (project.makerComment.length > 120 ? "…" : "")
              : null;
            return (
              <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main content */}
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/projects/${project.id}`} className="hover:underline">
                            <CardTitle className="text-xl">{project.title}</CardTitle>
                          </Link>
                          {project.artifactType && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${ARTIFACT_COLORS[project.artifactType] ?? ""}`}
                            >
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
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <Button
                            variant={hasUpvoted ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => handleUpvote(project.id)}
                            disabled={hasUpvoted}
                            className={`h-8 transition-transform ${isAnimating ? "scale-125" : ""} ${hasUpvoted ? "text-teal-600" : ""}`}
                          >
                            <ArrowUp className={`h-4 w-4 mr-1 ${hasUpvoted ? "fill-teal-600 text-teal-600" : ""}`} />
                            {project.upvoteCount}
                          </Button>
                          {(project.forkCount ?? 0) > 0 && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground px-2">
                              <GitFork className="h-3.5 w-3.5" />
                              {project.forkCount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Problem / Description */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Lightbulb className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-medium text-amber-600">Problem</span>
                        </div>
                        <p className="text-muted-foreground">{project.description}</p>
                      </div>

                      {/* Maker comment preview (C1) */}
                      {makerPreview && (
                        <div className="mb-3 flex items-start gap-2 text-sm text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                          <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 text-teal-500" />
                          <span className="italic">&ldquo;{makerPreview}&rdquo;</span>
                          <Badge variant="outline" className="text-xs shrink-0 bg-teal-50 text-teal-700 border-teal-200">Builder</Badge>
                        </div>
                      )}

                      {/* OpenClaw Skill install chip */}
                      {project.artifactType === "OpenClaw Skill" && (
                        <div className="mb-4 bg-zinc-900 rounded-lg px-3 py-2 flex items-center gap-2 text-xs">
                          <code className="text-green-400 font-mono flex-1">
                            clawhub install fhirbuilders/{project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(`clawhub install fhirbuilders/${project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`)}
                            className="text-zinc-400 hover:text-white transition-colors"
                            title="Copy install command"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Tags */}
                      {project.tags.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-1">
                          {project.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {project.tags.length > 4 && (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              +{project.tags.length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Author and links */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-4 w-4 mr-2" />
                          {project.authorName}
                        </div>
                        <div className="flex gap-2">
                          {project.repoUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                                <Github className="h-4 w-4 mr-1" />
                                Code
                              </a>
                            </Button>
                          )}
                          {project.demoUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Demo
                              </a>
                            </Button>
                          )}
                          <Button size="sm" asChild>
                            <Link href={`/projects/${project.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Looking For sidebar */}
                    {(project.lookingFor ?? []).length > 0 && (
                      <div className="lg:w-48 lg:border-l lg:pl-6">
                        <span className="text-xs text-muted-foreground font-medium">Looking for:</span>
                        <div className="flex flex-wrap lg:flex-col gap-2 mt-2">
                          {(project.lookingFor ?? []).map((item) => (
                            <Badge
                              key={item}
                              variant="secondary"
                              className={`text-xs ${LOOKING_FOR_COLORS[item] ?? ""}`}
                            >
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <Card className="py-12 text-center">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {projects.length === 0
                ? "No projects yet. Be the first to share what you're building!"
                : "No projects match your filters."}
            </p>
            {projects.length === 0 && (
              <Button asChild>
                <Link href="/projects/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Share Your Project
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <Card className="mt-12 border-primary/20 bg-primary/5">
        <CardContent className="py-8 text-center">
          <h2 className="text-xl font-bold mb-2">Built something with FHIR?</h2>
          <p className="text-muted-foreground mb-4">
            Share your project with the community. Get feedback, find collaborators, and inspire others.
          </p>
          <Button asChild>
            <Link href="/projects/new">Share Your Project</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
