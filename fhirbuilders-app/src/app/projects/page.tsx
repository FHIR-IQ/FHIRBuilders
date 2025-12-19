"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  ExternalLink,
  Github,
  Plus,
  Users,
  Clock,
  Lightbulb,
  CheckCircle,
  Search,
  MessageSquare,
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  problem: string;
  solution: string;
  repoUrl: string | null;
  demoUrl: string | null;
  fhirResources: string[];
  tags: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  lookingFor: string[];
  authorName: string;
  upvoteCount: number;
  commentCount: number;
  createdAt: string;
}

// Sample projects with problem-first format
const SAMPLE_PROJECTS: Project[] = [
  {
    id: "1",
    title: "FHIR Patient Dashboard",
    problem: "Clinicians waste 20+ minutes per patient reviewing scattered data across multiple systems",
    solution: "Unified dashboard pulling Patient, Observations, Conditions, and Medications into one view with smart visualizations",
    repoUrl: "https://github.com/example/fhir-dashboard",
    demoUrl: null,
    fhirResources: ["Patient", "Observation", "Condition", "MedicationRequest"],
    tags: ["React", "Visualization", "Clinical"],
    difficulty: "Beginner",
    lookingFor: ["Clinical advisors", "Pilot sites"],
    authorName: "Sarah Chen",
    upvoteCount: 12,
    commentCount: 4,
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "2",
    title: "AI Clinical Summary Agent",
    problem: "Providers spend hours writing and updating clinical documentation, leading to burnout and incomplete records",
    solution: "AI agent that auto-generates clinical summaries from FHIR resources, keeping notes current with minimal provider input",
    repoUrl: "https://github.com/example/fhir-ai-summary",
    demoUrl: "https://fhir-summary.vercel.app",
    fhirResources: ["Condition", "Observation", "MedicationRequest", "Encounter"],
    tags: ["AI", "Claude", "NLP", "Documentation"],
    difficulty: "Intermediate",
    lookingFor: ["Healthcare domain expert", "Funding"],
    authorName: "Marcus Johnson",
    upvoteCount: 28,
    commentCount: 12,
    createdAt: "2025-01-10T14:00:00Z",
  },
  {
    id: "3",
    title: "FHIR to HL7v2 Converter",
    problem: "Legacy systems still speak HL7v2, making FHIR adoption painful for organizations with existing infrastructure",
    solution: "Bidirectional converter that translates between FHIR R4 and HL7 v2.x messages, enabling gradual migration",
    repoUrl: "https://github.com/example/fhir-hl7-converter",
    demoUrl: null,
    fhirResources: ["Patient", "Encounter", "DiagnosticReport"],
    tags: ["Integration", "HL7", "Interoperability"],
    difficulty: "Advanced",
    lookingFor: ["Technical co-founder", "Pilot sites"],
    authorName: "Lisa Park",
    upvoteCount: 8,
    commentCount: 2,
    createdAt: "2025-01-12T09:00:00Z",
  },
  {
    id: "4",
    title: "Medication Reconciliation AI",
    problem: "Medication errors from incomplete med lists cost lives and $42B annually in the US alone",
    solution: "AI-powered tool comparing medications from different sources, flagging conflicts and duplicates automatically",
    repoUrl: null,
    demoUrl: null,
    fhirResources: ["MedicationRequest", "MedicationStatement", "Patient"],
    tags: ["AI", "Patient Safety", "Pharmacy"],
    difficulty: "Intermediate",
    lookingFor: ["Technical co-founder", "Clinical advisors", "Funding"],
    authorName: "Dr. James Rodriguez",
    upvoteCount: 34,
    commentCount: 8,
    createdAt: "2025-01-08T11:00:00Z",
  },
];

const DIFFICULTY_COLORS = {
  Beginner: "bg-green-100 text-green-800 border-green-200",
  Intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Advanced: "bg-red-100 text-red-800 border-red-200",
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
  const [sortBy, setSortBy] = useState<"newest" | "popular">("popular");
  const [filterLookingFor, setFilterLookingFor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/projects?sort=${sortBy}`);
        if (response.ok) {
          const data = await response.json();
          // Use API data if available, otherwise fall back to samples
          if (data.projects && data.projects.length > 0) {
            setProjects(data.projects);
          } else {
            // Use sample data for demo
            let sorted = [...SAMPLE_PROJECTS].sort((a, b) => {
              if (sortBy === "popular") {
                return b.upvoteCount - a.upvoteCount;
              }
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            if (filterLookingFor) {
              sorted = sorted.filter(p => p.lookingFor.includes(filterLookingFor));
            }
            setProjects(sorted);
          }
        }
      } catch {
        // Fallback to sample data
        setProjects(SAMPLE_PROJECTS);
      }
      setIsLoading(false);
    };
    fetchProjects();
  }, [sortBy, filterLookingFor]);

  const allLookingFor = Array.from(new Set(SAMPLE_PROJECTS.flatMap(p => p.lookingFor)));

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

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex gap-2">
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

        {/* Looking For Filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Search className="h-3 w-3" />
            Looking for:
          </span>
          <Button
            variant={filterLookingFor === null ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterLookingFor(null)}
          >
            All
          </Button>
          {allLookingFor.map(item => (
            <Button
              key={item}
              variant={filterLookingFor === item ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilterLookingFor(filterLookingFor === item ? null : item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>

      {/* Projects grid - Problem-first cards */}
      <div className="space-y-6">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Main content */}
                <div className="flex-1">
                  {/* Header with title, upvotes, comments */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <Badge variant="outline" className={DIFFICULTY_COLORS[project.difficulty]}>
                        {project.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <ArrowUp className="h-4 w-4 mr-1" />
                        {project.upvoteCount}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {project.commentCount}
                      </Button>
                    </div>
                  </div>

                  {/* Problem statement */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-600">Problem</span>
                    </div>
                    <p className="text-muted-foreground">{project.problem}</p>
                  </div>

                  {/* Solution */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">Solution</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{project.solution}</p>
                  </div>

                  {/* FHIR Resources */}
                  <div className="mb-4">
                    <span className="text-xs text-muted-foreground font-medium">FHIR Resources:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.fhirResources.map(resource => (
                        <Badge key={resource} variant="secondary" className="text-xs">
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  </div>

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
                      <Button size="sm">
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Looking For sidebar */}
                <div className="lg:w-48 lg:border-l lg:pl-6">
                  <span className="text-xs text-muted-foreground font-medium">Looking for:</span>
                  <div className="flex flex-wrap lg:flex-col gap-2 mt-2">
                    {project.lookingFor.map(item => (
                      <Badge
                        key={item}
                        variant="secondary"
                        className={`text-xs ${LOOKING_FOR_COLORS[item] || ''}`}
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state / CTA */}
      {projects.length === 0 && (
        <Card className="py-12 text-center">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No projects yet. Be the first to share what you're building!
            </p>
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Share Your Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Call to action */}
      <Card className="mt-12 border-primary/20 bg-primary/5">
        <CardContent className="py-8 text-center">
          <h2 className="text-xl font-bold mb-2">Built something with FHIR?</h2>
          <p className="text-muted-foreground mb-4">
            Share your project with the community. Get feedback, find collaborators, and inspire others.
          </p>
          <Button asChild>
            <Link href="/projects/new">
              Share Your Project
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
