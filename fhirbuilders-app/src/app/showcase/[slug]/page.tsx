"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  ArrowUp,
  ExternalLink,
  Github,
  BookOpen,
  Calendar,
  Loader2,
  MessageSquare,
  Star,
  Play,
} from "lucide-react";

interface AppDetail {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  appType: string | null;
  fhirResources: string[];
  fhirVersion: string;
  repoUrl: string | null;
  demoUrl: string | null;
  docsUrl: string | null;
  videoUrl: string | null;
  icon: string | null;
  screenshots: string[];
  status: string;
  featured: boolean;
  upvoteCount: number;
  builtWith: string[];
  createdAt: string;
  hasUpvoted: boolean;
  averageRating: number;
  ratingCount: number;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    persona: string;
    bio: string | null;
    githubUsername: string | null;
  };
  _count: {
    comments: number;
    ratings: number;
    upvotes: number;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  AI_AGENT: "AI Agent",
  CLINICAL: "Clinical",
  PATIENT_ENGAGEMENT: "Patient Engagement",
  ANALYTICS: "Analytics",
  INTEGRATION: "Integration",
  TEMPLATE: "Template",
};

const PERSONA_LABELS: Record<string, string> = {
  BUILDER: "Builder",
  INVESTOR: "Investor",
  SUPPORTER: "Supporter",
  USER: "User",
};

function getVideoEmbed(url: string): string | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`;
  return null;
}

export default function ShowcaseDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [app, setApp] = useState<AppDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await fetch(`/api/apps/${params.slug}`);
        if (!res.ok) {
          setError("App not found");
          setIsLoading(false);
          return;
        }
        const data = await res.json();
        setApp(data.app);
        setHasUpvoted(data.app.hasUpvoted);
        setUpvoteCount(data.app.upvoteCount);
      } catch {
        setError("Failed to load app");
      }
      setIsLoading(false);
    };
    if (params.slug) fetchApp();
  }, [params.slug]);

  const handleUpvote = async () => {
    if (!session?.user) {
      window.location.href = `/login?callbackUrl=/showcase/${params.slug}`;
      return;
    }
    if (!app) return;

    // Optimistic
    const wasUpvoted = hasUpvoted;
    setHasUpvoted(!wasUpvoted);
    setUpvoteCount(prev => prev + (wasUpvoted ? -1 : 1));

    try {
      const res = await fetch(`/api/apps/${app.id}/upvote`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setHasUpvoted(data.upvoted);
        setUpvoteCount(data.upvoteCount);
      }
    } catch {
      setHasUpvoted(wasUpvoted);
      setUpvoteCount(prev => prev + (wasUpvoted ? 1 : -1));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold mb-2">App not found</h2>
        <p className="text-muted-foreground mb-4">
          This app may have been removed or does not exist.
        </p>
        <Button asChild>
          <Link href="/showcase">Back to Showcase</Link>
        </Button>
      </div>
    );
  }

  const embedUrl = app.videoUrl ? getVideoEmbed(app.videoUrl) : null;

  return (
    <div className="container py-12 max-w-4xl">
      <Link
        href="/showcase"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Showcase
      </Link>

      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Icon */}
        <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
          {app.icon ? (
            <img src={app.icon} alt="" className="h-14 w-14 rounded-lg" />
          ) : (
            <span className="text-3xl font-bold text-primary">
              {app.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold">{app.name}</h1>
          <p className="text-lg text-muted-foreground mt-1">{app.tagline}</p>

          {/* Author */}
          <Link
            href={`/u/${app.author.id}`}
            className="inline-flex items-center gap-2 mt-3 hover:opacity-80"
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={app.author.image || ""} />
              <AvatarFallback className="text-xs">
                {app.author.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{app.author.name}</span>
            <Badge variant="outline" className="text-xs">
              {PERSONA_LABELS[app.author.persona] || app.author.persona}
            </Badge>
          </Link>
        </div>

        {/* Upvote + Actions */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <button
            onClick={handleUpvote}
            className={`flex flex-col items-center gap-1 px-6 py-3 rounded-xl border-2 transition-colors ${
              hasUpvoted
                ? "bg-primary/10 border-primary text-primary"
                : "bg-muted/50 border-muted hover:border-primary/30"
            }`}
          >
            <ArrowUp className="h-5 w-5" />
            <span className="text-lg font-bold">{upvoteCount}</span>
            <span className="text-xs uppercase tracking-wide">
              {hasUpvoted ? "Upvoted" : "Upvote"}
            </span>
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-2 mb-8">
        {app.demoUrl && (
          <Button asChild>
            <a href={app.demoUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Live Demo
            </a>
          </Button>
        )}
        {app.repoUrl && (
          <Button variant="outline" asChild>
            <a href={app.repoUrl} target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" />
              Source Code
            </a>
          </Button>
        )}
        {app.docsUrl && (
          <Button variant="outline" asChild>
            <a href={app.docsUrl} target="_blank" rel="noopener noreferrer">
              <BookOpen className="mr-2 h-4 w-4" />
              Docs
            </a>
          </Button>
        )}
        {app.videoUrl && !embedUrl && (
          <Button variant="outline" asChild>
            <a href={app.videoUrl} target="_blank" rel="noopener noreferrer">
              <Play className="mr-2 h-4 w-4" />
              Watch Demo
            </a>
          </Button>
        )}
      </div>

      {/* Video Embed */}
      {embedUrl && (
        <div className="mb-8 rounded-xl overflow-hidden border">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={embedUrl}
              title={`${app.name} demo video`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Description */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-3">About</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground">
                {app.description}
              </div>
            </CardContent>
          </Card>

          {/* Comments placeholder */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5" />
                <h2 className="text-lg font-semibold">
                  Discussion ({app._count.comments})
                </h2>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Comments coming soon</p>
                <p className="text-xs mt-1">Share your thoughts on this app</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Metadata */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Category
                </p>
                <Badge variant="secondary">
                  {CATEGORY_LABELS[app.category] || app.category}
                </Badge>
              </div>

              {app.appType && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    App Type
                  </p>
                  <Badge variant="outline">{app.appType}</Badge>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  FHIR Version
                </p>
                <span className="text-sm">{app.fhirVersion}</span>
              </div>

              {app.fhirResources.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    FHIR Resources
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {app.fhirResources.map(r => (
                      <Badge key={r} variant="outline" className="text-xs">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {app.builtWith.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Built With
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {app.builtWith.map(t => (
                      <Badge key={t} variant="secondary" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Created
                </p>
                <span className="text-sm flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(app.createdAt).toLocaleDateString()}
                </span>
              </div>

              {app.ratingCount > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Rating
                  </p>
                  <span className="text-sm flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {app.averageRating.toFixed(1)} ({app.ratingCount})
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Author Card */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
                Author
              </p>
              <Link
                href={`/u/${app.author.id}`}
                className="flex items-center gap-3 hover:opacity-80"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={app.author.image || ""} />
                  <AvatarFallback>
                    {app.author.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{app.author.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {PERSONA_LABELS[app.author.persona] || app.author.persona}
                  </p>
                </div>
              </Link>
              {app.author.bio && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                  {app.author.bio}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
