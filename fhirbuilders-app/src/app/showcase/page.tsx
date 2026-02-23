"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowUp,
  ExternalLink,
  Github,
  Plus,
  Trophy,
  Search,
  Sparkles,
  Loader2,
} from "lucide-react";

interface ShowcaseApp {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  category: string;
  appType: string | null;
  fhirResources: string[];
  repoUrl: string | null;
  demoUrl: string | null;
  icon: string | null;
  videoUrl: string | null;
  status: string;
  featured: boolean;
  upvoteCount: number;
  builtWith: string[];
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    persona: string;
  };
}

const SAMPLE_APPS: ShowcaseApp[] = [
  {
    id: "sample-1",
    name: "SMART Patient Viewer",
    slug: "smart-patient-viewer",
    tagline: "SMART on FHIR app that displays patient data in any EHR context",
    category: "CLINICAL",
    appType: "SMART on FHIR",
    fhirResources: ["Patient", "Observation", "Condition"],
    repoUrl: "https://github.com/example/smart-viewer",
    demoUrl: "https://smart-viewer.vercel.app",
    icon: null,
    videoUrl: null,
    status: "FEATURED",
    featured: true,
    upvoteCount: 42,
    builtWith: ["Claude Code", "Medplum"],
    createdAt: "2025-01-20T10:00:00Z",
    author: { id: "1", name: "Sarah Chen", image: null, persona: "BUILDER" },
  },
  {
    id: "sample-2",
    name: "MedRec AI Agent",
    slug: "medrec-ai-agent",
    tagline: "AI agent that reconciles medication lists across care transitions",
    category: "AI_AGENT",
    appType: "AI Agent",
    fhirResources: ["MedicationRequest", "Patient", "AllergyIntolerance"],
    repoUrl: null,
    demoUrl: "https://medrec-ai.vercel.app",
    icon: null,
    videoUrl: null,
    status: "APPROVED",
    featured: false,
    upvoteCount: 28,
    builtWith: ["Claude Code", "Lovable"],
    createdAt: "2025-01-18T14:00:00Z",
    author: { id: "2", name: "Dr. James Rodriguez", image: null, persona: "BUILDER" },
  },
  {
    id: "sample-3",
    name: "FHIR MCP Server",
    slug: "fhir-mcp-server",
    tagline: "Model Context Protocol server exposing FHIR data as AI tools",
    category: "INTEGRATION",
    appType: "MCP App",
    fhirResources: ["Patient", "Observation", "Encounter", "Condition"],
    repoUrl: "https://github.com/example/fhir-mcp",
    demoUrl: null,
    icon: null,
    videoUrl: null,
    status: "APPROVED",
    featured: false,
    upvoteCount: 19,
    builtWith: ["Claude Code", "Cursor"],
    createdAt: "2025-01-15T09:00:00Z",
    author: { id: "3", name: "Marcus Johnson", image: null, persona: "BUILDER" },
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  AI_AGENT: "AI Agent",
  CLINICAL: "Clinical",
  PATIENT_ENGAGEMENT: "Patient Engagement",
  ANALYTICS: "Analytics",
  INTEGRATION: "Integration",
  TEMPLATE: "Template",
};

const CATEGORY_COLORS: Record<string, string> = {
  AI_AGENT: "bg-purple-100 text-purple-800",
  CLINICAL: "bg-blue-100 text-blue-800",
  PATIENT_ENGAGEMENT: "bg-green-100 text-green-800",
  ANALYTICS: "bg-amber-100 text-amber-800",
  INTEGRATION: "bg-teal-100 text-teal-800",
  TEMPLATE: "bg-gray-100 text-gray-800",
};

export default function ShowcasePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [apps, setApps] = useState<ShowcaseApp[]>([]);
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "featured">("popular");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchApps = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ sort: sortBy });
        if (categoryFilter) params.set("category", categoryFilter);
        if (searchQuery.trim()) params.set("search", searchQuery.trim());

        const response = await fetch(`/api/apps?${params}`);
        if (response.ok) {
          const data = await response.json();
          if (data.apps && data.apps.length > 0) {
            setApps(data.apps);
          } else {
            setApps(SAMPLE_APPS);
          }
        }
      } catch {
        setApps(SAMPLE_APPS);
      }
      setIsLoading(false);
    };
    fetchApps();
  }, [sortBy, categoryFilter, searchQuery]);

  const handleUpvote = async (appId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      router.push("/login?callbackUrl=/showcase");
      return;
    }

    // Optimistic update
    const wasUpvoted = upvotedIds.has(appId);
    setUpvotedIds(prev => {
      const next = new Set(prev);
      if (wasUpvoted) next.delete(appId);
      else next.add(appId);
      return next;
    });
    setApps(prev =>
      prev.map(app =>
        app.id === appId
          ? { ...app, upvoteCount: app.upvoteCount + (wasUpvoted ? -1 : 1) }
          : app
      )
    );

    try {
      const res = await fetch(`/api/apps/${appId}/upvote`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setApps(prev =>
          prev.map(app =>
            app.id === appId ? { ...app, upvoteCount: data.upvoteCount } : app
          )
        );
        setUpvotedIds(prev => {
          const next = new Set(prev);
          if (data.upvoted) next.add(appId);
          else next.delete(appId);
          return next;
        });
      }
    } catch {
      // Revert on failure
      setUpvotedIds(prev => {
        const next = new Set(prev);
        if (wasUpvoted) next.add(appId);
        else next.delete(appId);
        return next;
      });
    }
  };

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold">FHIR Showcase</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Discover and share FHIR apps, skills, and MCP servers. Vote for your favorites.
          </p>
        </div>
        <Button asChild>
          <Link href="/showcase/submit">
            <Plus className="mr-2 h-4 w-4" />
            Submit Your App
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Sort */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(["popular", "newest", "featured"] as const).map(sort => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors capitalize ${
                sortBy === sort
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {sort === "featured" && <Sparkles className="inline h-3 w-3 mr-1" />}
              {sort}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              !categoryFilter
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategoryFilter(categoryFilter === key ? null : key)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                categoryFilter === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-md bg-background"
          />
        </div>
      </div>

      {/* App List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : apps.length === 0 ? (
        <Card className="p-12 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No apps yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to share your FHIR app with the community!
          </p>
          <Button asChild>
            <Link href="/showcase/submit">Submit Your App</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {apps.map((app, index) => (
            <Link key={app.id} href={`/showcase/${app.slug}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-4 py-4">
                  {/* Rank */}
                  <span className="text-lg font-bold text-muted-foreground w-6 text-right shrink-0">
                    {index + 1}
                  </span>

                  {/* Upvote */}
                  <button
                    onClick={e => handleUpvote(app.id, e)}
                    className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg border transition-colors shrink-0 ${
                      upvotedIds.has(app.id)
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-muted/50 border-transparent hover:border-primary/30"
                    }`}
                  >
                    <ArrowUp className="h-4 w-4" />
                    <span className="text-xs font-semibold">{app.upvoteCount}</span>
                  </button>

                  {/* Icon */}
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                    {app.icon ? (
                      <img src={app.icon} alt="" className="h-8 w-8 rounded" />
                    ) : (
                      <span className="text-lg font-bold text-primary">
                        {app.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold truncate">{app.name}</h3>
                      {app.featured && (
                        <Badge variant="default" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {app.tagline}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${CATEGORY_COLORS[app.category] || ""}`}
                      >
                        {CATEGORY_LABELS[app.category] || app.category}
                      </Badge>
                      {app.appType && (
                        <Badge variant="outline" className="text-xs">
                          {app.appType}
                        </Badge>
                      )}
                      {app.fhirResources.slice(0, 3).map(r => (
                        <Badge key={r} variant="outline" className="text-xs">
                          {r}
                        </Badge>
                      ))}
                      {app.fhirResources.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{app.fhirResources.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Author & Links */}
                  <div className="hidden md:flex items-center gap-3 shrink-0">
                    {app.demoUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        onClick={e => e.stopPropagation()}
                      >
                        <a href={app.demoUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Demo
                        </a>
                      </Button>
                    )}
                    {app.repoUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        onClick={e => e.stopPropagation()}
                      >
                        <a href={app.repoUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Link
                      href={`/u/${app.author.id}`}
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1.5"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={app.author.image || ""} />
                        <AvatarFallback className="text-xs">
                          {app.author.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {app.author.name}
                      </span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <Card className="mt-12 p-8 text-center bg-gradient-to-br from-primary/5 to-primary/10">
        <h3 className="text-xl font-semibold mb-2">Built something with FHIR?</h3>
        <p className="text-muted-foreground mb-4">
          Share your SMART on FHIR app, MCP server, AI agent, or any FHIR project.
          Get feedback from the community and connect with investors and clinicians.
        </p>
        <Button asChild size="lg">
          <Link href="/showcase/submit">
            <Plus className="mr-2 h-4 w-4" />
            Submit to Showcase
          </Link>
        </Button>
      </Card>
    </div>
  );
}
