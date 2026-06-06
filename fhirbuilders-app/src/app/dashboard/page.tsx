"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Wand2,
  FolderOpen,
  FlaskConical,
  MessageSquare,
  Plus,
  ExternalLink,
  Code,
  ArrowRight,
  User,
  Sparkles,
  Trophy,
  ArrowUp,
  Activity,
  Users,
} from "lucide-react";
import {
  COHORT_00,
  formatSessionTime,
  getCohortBuilder,
  getPodForEmail,
  nextSession,
} from "@/lib/cohort/cohort-00";

// Type definitions based on API response
interface GeneratedApp {
  id: string;
  prompt: string;
  status: string;
  fhirResources: string[];
  githubRepoUrl: string | null;
  sandboxUrl: string | null;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  visibility: string;
  role: string;
  createdAt: string;
}

interface Sandbox {
  id: string;
  name: string;
  description: string | null;
  status: string;
  patientCount: number;
  dataModules: string[];
  createdAt: string;
}

interface Channel {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface ActivityItem {
  type: "upvote" | "comment";
  id: string;
  user: { id: string; name: string | null; image: string | null };
  app: { id: string; name: string; slug: string };
  content?: string;
  createdAt: string;
}

interface DashboardData {
  stats: {
    generatedApps: number;
    completedApps: number;
    projects: number;
    sandboxes: number;
    activeChannels: number;
    showcaseApps: number;
  };
  generatedApps: GeneratedApp[];
  projects: Project[];
  sandboxes: Sandbox[];
  channels: Channel[];
  activity: ActivityItem[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  ANALYZING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  GENERATING: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  DEPLOYING: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  PROVISIONING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  // Redirect if not authenticated, fetch data when authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      const loadDashboard = async () => {
        try {
          const response = await fetch("/api/dashboard");
          if (response.ok) {
            const result = await response.json();
            setData(result);
          }
        } catch (error) {
          console.error("Failed to fetch dashboard:", error);
        }
        setIsLoading(false);
      };
      loadDashboard();
    }
  }, [status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback>
              {session?.user?.name?.charAt(0) ||
                session?.user?.email?.charAt(0) ||
                "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {session?.user?.name?.split(" ")[0] || "Builder"}!
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your projects
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
          </Button>
      </div>

      {/* Cohort-member banner — only renders if this account is linked to a
          cohort signup. Surfaces "you're in Cohort 00" + the next session +
          the pod assignment, with a one-click jump back to /cohort. */}
      {(() => {
        const builder = getCohortBuilder(session?.user?.email);
        if (!builder) return null;
        const pod = getPodForEmail(session?.user?.email);
        const next = nextSession(COHORT_00);
        return (
          <Card className="mb-8 border-fuchsia-200 bg-gradient-to-r from-fuchsia-50/60 to-violet-50/40">
            <CardContent className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-fuchsia-100 p-2 text-fuchsia-700">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{COHORT_00.name}</span>
                    {pod && (
                      <Badge variant="outline" className="border-fuchsia-300 bg-white text-[10px] text-fuchsia-700">
                        {pod.id} · {pod.name}
                      </Badge>
                    )}
                  </div>
                  {next ? (
                    <p className="mt-0.5 text-xs text-slate-600">
                      Next up: <strong>{next.title}</strong> · {formatSessionTime(next)}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-slate-600">
                      All scheduled sessions complete. Demo Day artifacts on the cohort home.
                    </p>
                  )}
                </div>
              </div>
              <Button asChild size="sm" className="bg-fuchsia-600 hover:bg-fuchsia-700">
                <Link href="/cohort/cohort-00">
                  Open cohort <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })()}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5 mb-8">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-2xl font-bold">
                {data?.stats.showcaseApps || 0}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Showcase Apps</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">
                {data?.stats.generatedApps || 0}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Generated Apps</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">
                {data?.stats.projects || 0}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">
                {data?.stats.sandboxes || 0}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Sandboxes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              <span className="text-2xl font-bold">
                {data?.stats.activeChannels || 0}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Active Channels</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/openclaw">
                <Wand2 className="mr-2 h-4 w-4" />
                Generate New App
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/sandbox/demo">
                <FlaskConical className="mr-2 h-4 w-4" />
                Open Sandbox
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/showcase/submit">
                <Trophy className="mr-2 h-4 w-4" />
                Submit to Showcase
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="apps">Generated Apps</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="sandboxes">Sandboxes</TabsTrigger>
        </TabsList>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          {!data?.activity?.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No activity yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  When people upvote or comment on your showcase apps, you&apos;ll see it here.
                </p>
                <Button asChild>
                  <Link href="/showcase/submit">
                    Submit to Showcase
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            data.activity.map((item) => (
              <Card key={`${item.type}-${item.id}`}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-full p-1.5 ${
                      item.type === "upvote"
                        ? "bg-primary/10 text-primary"
                        : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                    }`}>
                      {item.type === "upvote" ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                      ) : (
                        <MessageSquare className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <Link href={`/u/${item.user.id}`} className="font-medium hover:underline">
                          {item.user.name || "Someone"}
                        </Link>
                        {" "}
                        {item.type === "upvote" ? "upvoted" : "commented on"}
                        {" "}
                        <Link href={`/showcase/${item.app.slug}`} className="font-medium hover:underline">
                          {item.app.name}
                        </Link>
                      </p>
                      {item.type === "comment" && item.content && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          &ldquo;{item.content}&rdquo;
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarImage src={item.user.image || ""} />
                      <AvatarFallback className="text-xs">
                        {item.user.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Generated Apps Tab */}
        <TabsContent value="apps" className="space-y-4">
          {!data?.generatedApps.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Wand2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No apps generated yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Use OpenClaw to generate your first healthcare app with AI
                </p>
                <Button asChild>
                  <Link href="/openclaw">
                    Generate Your First App
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            data.generatedApps.map((app) => (
              <Card key={app.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <CardTitle className="text-base line-clamp-1">
                        {app.prompt.length > 60
                          ? `${app.prompt.slice(0, 60)}...`
                          : app.prompt}
                      </CardTitle>
                      <CardDescription>
                        {new Date(app.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={STATUS_COLORS[app.status] || ""}>
                      {app.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {app.fhirResources.slice(0, 5).map((resource) => (
                      <Badge
                        key={resource}
                        variant="outline"
                        className="text-xs"
                      >
                        {resource}
                      </Badge>
                    ))}
                    {app.fhirResources.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{app.fhirResources.length - 5} more
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {app.sandboxUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={app.sandboxUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Sandbox
                        </a>
                      </Button>
                    )}
                    {app.githubRepoUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={app.githubRepoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Code className="mr-1 h-3 w-3" />
                          Code
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          {!data?.projects.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create a project to collaborate with others
                </p>
                <Button asChild>
                  <Link href="/projects/new">
                    Create Your First Project
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            data.projects.map((project) => (
              <Card key={project.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{project.name}</CardTitle>
                      <CardDescription>
                        {project.role} &middot;{" "}
                        {project.visibility.toLowerCase()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {project.description}
                  </p>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/projects/${project.slug}`}>
                      View Project
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Sandboxes Tab */}
        <TabsContent value="sandboxes" className="space-y-4">
          {!data?.sandboxes.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No sandboxes yet</h3>
                <p className="text-muted-foreground mb-4">
                  Try the demo sandbox to explore FHIR data
                </p>
                <Button asChild>
                  <Link href="/sandbox/demo">
                    Try Demo Sandbox
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            data.sandboxes.map((sandbox) => (
              <Card key={sandbox.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{sandbox.name}</CardTitle>
                      <CardDescription>
                        {sandbox.patientCount} patients &middot;{" "}
                        {sandbox.dataModules.slice(0, 3).join(", ")}
                        {sandbox.dataModules.length > 3 &&
                          ` +${sandbox.dataModules.length - 3} more`}
                      </CardDescription>
                    </div>
                    <Badge className={STATUS_COLORS[sandbox.status] || ""}>
                      {sandbox.status}
                    </Badge>
                  </div>
                </CardHeader>
                {sandbox.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {sandbox.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
