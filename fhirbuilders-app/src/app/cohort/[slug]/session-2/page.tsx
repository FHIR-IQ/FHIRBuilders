import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCohortBySlug, formatSessionTime } from "@/lib/cohort/cohort-00";
import {
  BookOpen,
  BrainCircuit,
  Calendar,
  Database,
  ExternalLink,
  GitBranch,
  Network,
  Server,
  Shield,
  Sparkles,
  Terminal,
  Video,
  Waypoints,
} from "lucide-react";

type Step = {
  n: number;
  icon: React.ElementType;
  title: string;
  duration: string;
  points: string[];
  tools?: string[];
};

const STEPS: Step[] = [
  {
    n: 1,
    icon: Server,
    title: "MCP protocol — how it works",
    duration: "~10 min",
    points: [
      "MCP lets CC call services live mid-conversation — no fetch() code, no deploy cycle",
      "stdio transport: CC spawns a local subprocess. SSE: CC connects to a remote URL",
      "Each tool has a name, description, and JSON Schema — the description is what CC uses to decide when to call it",
      "`claude mcp list` shows everything connected; `claude mcp add <name>` installs from the registry",
    ],
    tools: ["MCP spec", "claude mcp add"],
  },
  {
    n: 2,
    icon: Terminal,
    title: "Build your first MCP server",
    duration: "~20 min",
    points: [
      "Python: FastMCP — decorator syntax, one function = one tool, runs in under 15 lines",
      "TypeScript: @modelcontextprotocol/sdk — StdioServerTransport, setRequestHandler pattern",
      "Register with CC: `claude mcp add fhir -- python server.py` (stdio, local)",
      "Test it: open a CC session and ask 'search for patient Smith' — CC calls your server live",
    ],
    tools: ["FastMCP", "@modelcontextprotocol/sdk", "Medplum JS client"],
  },
  {
    n: 3,
    icon: Waypoints,
    title: "FHIR as live tools — Medplum MCP",
    duration: "~15 min",
    points: [
      "Expose Patient, Observation, Condition, MedicationRequest, DocumentReference as MCP tools",
      "Start small: one search tool + one read tool — a focused toolset outperforms a complete but noisy one",
      "Store credentials in env vars, not hardcoded — CC reads .env.local when it spawns subprocesses",
      "Demo: ask CC a clinical question, watch it call your tools, get an answer grounded in real FHIR data",
    ],
    tools: ["Medplum FHIR R4", "LOINC", "SMART on FHIR"],
  },
  {
    n: 4,
    icon: Sparkles,
    title: "Vector databases — the 3-minute concept",
    duration: "~5 min",
    points: [
      "Embeddings are arrays of numbers that encode meaning — similar text → similar vectors",
      "Why clinical text needs this: 'SOB', 'shortness of breath', 'dyspnea' are one keyword search miss away",
      "Three operations: embed (text → vector), store (vector + metadata), search (query vector → nearest K)",
      "Model: OpenAI text-embedding-3-small ($0.02/1M tokens) or nomic-embed-text (local, no PHI leaves machine)",
    ],
    tools: ["text-embedding-3-small", "nomic-embed-text", "Ollama"],
  },
  {
    n: 5,
    icon: Database,
    title: "pgvector + Supabase — semantic FHIR search",
    duration: "~20 min",
    points: [
      "Enable pgvector in Supabase SQL editor: `create extension if not exists vector`",
      "Create clinical_embeddings table with a vector(1536) column and HNSW index",
      "Insert: embed the note → store {patient_id, resource_id, content, embedding}",
      "Search: embed the query → cosine distance `<=>` → top-K results with similarity score",
    ],
    tools: ["pgvector", "Supabase", "HNSW index"],
  },
  {
    n: 6,
    icon: GitBranch,
    title: "Graphiti — temporal knowledge graphs",
    duration: "~20 min",
    points: [
      "Graphiti (Zep) builds knowledge graphs with time-aware edges — valid_at / invalid_at on every relationship",
      "Healthcare use case: HTN diagnosed 2019 → beta-blocker added 2021 → switched to CCB 2024, all queryable as a timeline",
      "Setup: Docker Neo4j (`docker run neo4j:latest`) + `pip install graphiti-core`",
      "Add episodes from FHIR encounters — Graphiti extracts entities and edges automatically via LLM",
    ],
    tools: ["Graphiti", "Neo4j", "Zep"],
  },
  {
    n: 7,
    icon: Network,
    title: "Karpathy wiki pattern — LLM-extracted graphs",
    duration: "~15 min",
    points: [
      "Feed unstructured clinical text to Claude → extract entities and edges → build a navigable knowledge graph",
      "The FHIRBuilders wiki (/wiki/graph) uses this exact pattern: WikiNode + WikiEdge + cron extraction",
      "Adapt for patient population: nodes = conditions/medications/labs, edges = treated_by/co_occurs_with/indicates",
      "claude-haiku-4-5-20251001 is fast and cheap for high-volume extraction (graph-building over 1,000+ notes)",
    ],
    tools: ["claude-haiku-4-5-20251001", "Neo4j", "FHIRBuilders wiki"],
  },
  {
    n: 8,
    icon: BrainCircuit,
    title: "Synthea — realistic synthetic patients",
    duration: "~15 min",
    points: [
      "Synthea generates complete longitudinal FHIR R4 bundles — not stub data, real clinical trajectories",
      "Modules: heart_disease, diabetes, chronic_kidney_disease — choose what your app reasons about",
      "Load into Medplum: `medplum bulk-upload --format bundle ./output/fhir/`",
      "Then seed pgvector: embed each DocumentReference note → index → your semantic search is live",
    ],
    tools: ["Synthea", "Medplum CLI", "FHIR R4 Bundle"],
  },
  {
    n: 9,
    icon: Database,
    title: "RAG for clinical text — the full pipeline",
    duration: "~20 min",
    points: [
      "Ingest: chunk FHIR notes by section → embed each chunk → store in pgvector with resource_id pointer",
      "Query: embed the question → cosine search → retrieve top-K chunks → build context string",
      "Generate: pass context + question to Claude → cited, grounded answer (not hallucinated)",
      "Wrap the whole pipeline as an MCP tool → CC can answer clinical questions conversationally in any session",
    ],
    tools: ["pgvector", "Anthropic SDK", "FastMCP"],
  },
  {
    n: 10,
    icon: Shield,
    title: "PHI before the vector store — production patterns",
    duration: "~10 min",
    points: [
      "Two-tier model: raw FHIR in Medplum (source of truth) → redacted embeddings in pgvector (never raw PHI)",
      "Redact before embedding: HealthClawGuardrails r6/redaction.py strips names, IDs, addresses, DOBs",
      "Presidio (Microsoft) alternative: `presidio-analyzer` + `presidio-anonymizer` in Python",
      "Clinician view: retrieve the redacted chunk to find the FHIR resource_id, then fetch the raw note from Medplum",
    ],
    tools: ["HealthClawGuardrails", "Presidio", "HIPAA safe harbor"],
  },
];

type PageProps = { params: Promise<{ slug: string }> };

export default async function Session2Page({ params }: PageProps) {
  const { slug } = await params;
  const cohort = getCohortBySlug(slug);
  if (!cohort) notFound();

  const session = cohort.sessions.find((s) => s.id === "session-2");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-violet-300 bg-violet-50 text-violet-700">
            <BookOpen className="mr-1 h-3 w-3" /> Session 2
          </Badge>
          <Badge variant="outline" className="border-rose-300 bg-rose-50 text-rose-700">
            Mandatory live
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          MCP servers + vector DB
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Live FHIR hands for your agent. Build an MCP server that reads real patient data,
          wire up semantic search over clinical notes, and understand when a knowledge graph
          beats a vector store. Ten blocks, ~150 minutes, one agent that talks to FHIR.
        </p>

        {session && (
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              {formatSessionTime(session)}
            </span>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/cohort/${slug}/session-2/learn`}>
                <BookOpen className="mr-2 h-3.5 w-3.5" />
                Study Guide
              </Link>
            </Button>
            {session.recordingUrl && (
              <Button size="sm" asChild>
                <a href={session.recordingUrl} target="_blank" rel="noopener noreferrer">
                  <Video className="mr-2 h-3.5 w-3.5" />
                  Watch Recording
                </a>
              </Button>
            )}
            {!session.recordingUrl && session.meetUrl && (
              <Button size="sm" asChild>
                <a href={session.meetUrl} target="_blank" rel="noopener noreferrer">
                  <Video className="mr-2 h-3.5 w-3.5" />
                  Join on Google Meet
                </a>
              </Button>
            )}
            {session.chatTranscriptUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={session.chatTranscriptUrl} target="_blank" rel="noopener noreferrer">
                  Chat transcript
                  <ExternalLink className="ml-1.5 h-3 w-3" />
                </a>
              </Button>
            )}
            {session.notebookLmUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={session.notebookLmUrl} target="_blank" rel="noopener noreferrer">
                  NotebookLM
                  <ExternalLink className="ml-1.5 h-3 w-3" />
                </a>
              </Button>
            )}
            {session.driveFolderUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={session.driveFolderUrl} target="_blank" rel="noopener noreferrer">
                  Drive folder
                  <ExternalLink className="ml-1.5 h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Stack overview callout */}
      <div className="mb-8 rounded-xl border border-violet-200 bg-violet-50 px-5 py-4">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-violet-600">
          What you&apos;ll wire up this session
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            "Medplum FHIR",
            "FastMCP / MCP SDK",
            "pgvector + Supabase",
            "Graphiti (Neo4j)",
            "Synthea",
            "OpenAI Embeddings",
            "Claude Haiku",
            "HealthClawGuardrails",
          ].map((t) => (
            <Badge key={t} variant="outline" className="border-violet-200 bg-white text-violet-700">
              {t}
            </Badge>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="mb-2 font-mono text-xs uppercase tracking-widest text-slate-500">
        Session workflow · 10 blocks
      </div>
      <div className="space-y-4">
        {STEPS.map((step) => (
          <StepCard key={step.n} step={step} />
        ))}
      </div>
    </div>
  );
}

function StepCard({ step }: { step: Step }) {
  const Icon = step.icon;
  return (
    <Card className="overflow-hidden border-0 shadow-sm transition hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          <div className="flex w-14 flex-col items-center justify-start gap-1 border-r border-slate-100 bg-slate-50 px-3 py-4 text-center">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {String(step.n).padStart(2, "0")}
            </span>
            <Icon className="h-4 w-4 text-slate-500" />
          </div>
          <div className="flex-1 px-5 py-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-slate-900">{step.title}</h3>
              <span className="font-mono text-xs text-slate-400">{step.duration}</span>
            </div>
            <ul className="space-y-1">
              {step.points.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-300" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
            {step.tools && step.tools.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {step.tools.map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="border-slate-200 bg-slate-50 text-[10px] text-slate-600"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
