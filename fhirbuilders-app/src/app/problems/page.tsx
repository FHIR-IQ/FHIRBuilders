"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Lightbulb,
  ArrowRight,
  Heart,
  Wrench,
  CheckCircle2,
  Loader2,
} from "lucide-react";

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

const CATEGORIES = [
  "All",
  "Care Coordination",
  "Medication Safety",
  "Patient Access",
  "Quality Measurement",
  "Data Access",
  "Workflow Automation",
  "Diagnostics",
  "Other",
];

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

export default function ProblemsPage() {
  const [problems, setProblems] = useState<ClinicalProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [supported, setSupported] = useState<Set<string>>(new Set());

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sort: sortBy });
    if (category !== "All") params.set("category", category);
    const res = await fetch(`/api/problems?${params}`);
    const data = await res.json();
    setProblems(data.problems || []);
    setLoading(false);
  }, [category, sortBy]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const handleSupport = async (problemId: string) => {
    if (supported.has(problemId)) return;
    setSupported((prev) => new Set([...prev, problemId]));
    setProblems((prev) =>
      prev.map((p) =>
        p.id === problemId ? { ...p, supportCount: p.supportCount + 1 } : p
      )
    );
    await fetch(`/api/problems/${problemId}/support`, { method: "POST" });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <div className="border-b bg-rose-50/50">
        <div className="container py-10">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-rose-500" />
              <Badge className="bg-rose-100 text-rose-700 border-rose-200">Problem Board</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">Healthcare problems waiting to be solved</h1>
            <p className="text-muted-foreground max-w-2xl mb-6">
              Every one of these was described by someone who lives with it.
              Builders: find your next project. Clinicians: describe yours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="bg-rose-600 hover:bg-rose-700 text-white">
                <Link href="/problems/new">
                  Post a Problem
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/projects">
                  Browse what builders are making
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Category filter */}
            <div className="flex-1 flex gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    category === cat
                      ? "bg-rose-600 text-white border-rose-600"
                      : "bg-background text-muted-foreground border-border hover:border-rose-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex gap-1.5 shrink-0">
              {[
                { value: "newest", label: "Newest" },
                { value: "popular", label: "Most Supported" },
              ].map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSortBy(s.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    sortBy === s.value
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-muted-foreground border-border hover:border-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Problems feed */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : problems.length === 0 ? (
            <div className="text-center py-16">
              <Lightbulb className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No problems posted yet in this category.</p>
              <Button asChild variant="outline">
                <Link href="/problems/new">Be the first to post one</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {problems.map((problem) => {
                const statusInfo = STATUS_DISPLAY[problem.status] ?? STATUS_DISPLAY["unclaimed"];
                const categoryColor = CATEGORY_COLORS[problem.category] ?? CATEGORY_COLORS["Other"];
                const hasSupported = supported.has(problem.id);

                return (
                  <Card key={problem.id} className="hover:border-rose-200 transition-colors">
                    <CardContent className="pt-5 pb-5">
                      <div className="flex items-start gap-4">
                        {/* Support button */}
                        <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                          <button
                            onClick={() => handleSupport(problem.id)}
                            disabled={hasSupported}
                            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg border transition-colors ${
                              hasSupported
                                ? "bg-rose-50 border-rose-200 text-rose-600"
                                : "border-border hover:border-rose-300 hover:bg-rose-50 text-muted-foreground hover:text-rose-600"
                            }`}
                            title="I have this problem too"
                          >
                            <Heart className={`h-4 w-4 ${hasSupported ? "fill-rose-400" : ""}`} />
                            <span className="text-xs font-medium">{problem.supportCount}</span>
                          </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant="outline" className={`text-xs ${categoryColor}`}>
                              {problem.category}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${statusInfo.color}`}>
                              {statusInfo.label}
                              {problem.status === "being-built" && problem.linkedProjects.length > 0 && (
                                <> [{problem.linkedProjects.length}]</>
                              )}
                            </Badge>
                            {problem.frequency && (
                              <span className="text-xs text-muted-foreground">
                                {problem.frequency}
                              </span>
                            )}
                          </div>

                          <Link href={`/problems/${problem.id}`}>
                            <h3 className="font-semibold text-base mb-2 hover:text-rose-600 transition-colors leading-snug">
                              {problem.title}
                            </h3>
                          </Link>

                          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                            {problem.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground/70">{problem.postedByRole}</span>
                            {problem.affectedRoles.slice(0, 3).map((role) => (
                              <span key={role} className="bg-muted px-2 py-0.5 rounded-full">
                                {role}
                              </span>
                            ))}
                            {problem.willingToAdvise && (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="h-3 w-3" />
                                Open to advising
                              </span>
                            )}
                          </div>

                          {problem.status === "being-built" && (
                            <div className="mt-3 flex items-center gap-1.5 text-xs text-green-700">
                              <Wrench className="h-3.5 w-3.5" />
                              <span>{problem.linkedProjects.length} builder{problem.linkedProjects.length !== 1 ? "s are" : " is"} working on this</span>
                              <Link href="/projects" className="underline">
                                View projects →
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* Build CTA */}
                        <div className="shrink-0 hidden sm:block">
                          <Button variant="outline" size="sm" className="text-xs border-rose-200 text-rose-600 hover:bg-rose-50" asChild>
                            <Link href={`/projects/new?problem_id=${problem.id}`}>
                              I&apos;m building this
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
