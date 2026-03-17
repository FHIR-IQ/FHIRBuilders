"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, Wrench, CheckCircle2, ArrowRight, Lightbulb } from "lucide-react";

interface ClinicalProblem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  affectedRoles: string[];
  frequency: string | null;
  postedByRole: string;
  willingToAdvise: boolean;
  supportCount: number;
  linkedProjects: string[];
  createdAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Care Coordination": "bg-blue-100 text-blue-800 border-blue-200",
  "Medication Safety": "bg-red-100 text-red-800 border-red-200",
  "Patient Access": "bg-teal-100 text-teal-800 border-teal-200",
  "Quality Measurement": "bg-purple-100 text-purple-800 border-purple-200",
  "Data Access": "bg-amber-100 text-amber-800 border-amber-200",
  "Workflow Automation": "bg-orange-100 text-orange-800 border-orange-200",
  "Diagnostics": "bg-pink-100 text-pink-800 border-pink-200",
  "Other": "bg-gray-100 text-gray-800 border-gray-200",
};

const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  "unclaimed": { label: "Unclaimed", color: "bg-gray-100 text-gray-600 border-gray-200" },
  "being-built": { label: "Being Built", color: "bg-green-100 text-green-700 border-green-200" },
  "solved": { label: "Solved", color: "bg-teal-100 text-teal-700 border-teal-200" },
};

export default function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [problem, setProblem] = useState<ClinicalProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    fetch(`/api/problems/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.problem) setProblem(data.problem);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSupport = async () => {
    if (supported || !problem) return;
    setSupported(true);
    setProblem((prev) => prev ? { ...prev, supportCount: prev.supportCount + 1 } : prev);
    await fetch(`/api/problems/${id}/support`, { method: "POST" });
  };

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent mx-auto" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground mb-4">Problem not found.</p>
        <Button asChild variant="outline">
          <Link href="/problems">Back to problems</Link>
        </Button>
      </div>
    );
  }

  const statusInfo = STATUS_DISPLAY[problem.status] ?? STATUS_DISPLAY["unclaimed"];
  const categoryColor = CATEGORY_COLORS[problem.category] ?? CATEGORY_COLORS["Other"];

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/problems"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to problems
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="outline" className={`text-xs ${categoryColor}`}>
              {problem.category}
            </Badge>
            <Badge variant="outline" className={`text-xs ${statusInfo.color}`}>
              {statusInfo.label}
            </Badge>
            {problem.frequency && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {problem.frequency}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-3 leading-snug">{problem.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Lightbulb className="h-4 w-4 text-rose-400" />
              {problem.postedByRole}
            </span>
            {problem.willingToAdvise && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Open to advising
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">The problem</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                  {problem.description}
                </p>
              </CardContent>
            </Card>

            {/* Builders working on this */}
            {problem.status === "being-built" && problem.linkedProjects.length > 0 && (
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-green-700">
                    <Wrench className="h-4 w-4" />
                    Builders working on this ({problem.linkedProjects.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    A builder has claimed this problem and is working on a solution.
                  </p>
                  <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50" asChild>
                    <Link href="/projects">
                      View their project
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Support */}
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground mb-3 text-center">
                  Do you have this problem too?
                </p>
                <button
                  onClick={handleSupport}
                  disabled={supported}
                  className={`w-full flex flex-col items-center gap-1 py-3 rounded-lg border-2 transition-all ${
                    supported
                      ? "border-rose-300 bg-rose-50 text-rose-600"
                      : "border-border hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                  }`}
                >
                  <Heart className={`h-6 w-6 ${supported ? "fill-rose-400 text-rose-400" : ""}`} />
                  <span className="text-2xl font-bold">{problem.supportCount}</span>
                  <span className="text-xs">
                    {supported ? "You agree with this" : "I have this problem too"}
                  </span>
                </button>
              </CardContent>
            </Card>

            {/* Who's affected */}
            {problem.affectedRoles.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Affects
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {problem.affectedRoles.map((role) => (
                      <Badge key={role} variant="secondary" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Build CTA */}
            <Card className="border-violet-200">
              <CardContent className="pt-4 space-y-3">
                <p className="text-sm font-medium">Building a solution?</p>
                <p className="text-xs text-muted-foreground">
                  Let the community know and link your project here.
                </p>
                <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white" asChild>
                  <Link href={`/projects/new?problem_id=${problem.id}`}>
                    <Wrench className="mr-2 h-4 w-4" />
                    I&apos;m building this
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/build">
                    Generate starter code →
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
