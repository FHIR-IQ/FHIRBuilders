"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmailCapture } from "@/app/_components/email-capture";
import {
  Sparkles, Copy, Check, Download, ExternalLink, ChevronDown, ChevronUp,
  Github, Search, ArrowRight, MessageCircle, Smartphone, Terminal,
  Clock, Brain, Zap, FlaskConical, Bot, Wrench, BarChart3, Stethoscope,
  AlertCircle, Loader2, Plus, X,
} from "lucide-react";

// ── Seed skills ──────────────────────────────────────────────────────────────

const SEED_SKILLS = [
  {
    id: "fhir-patient-query",
    name: "FHIR Patient Query",
    description: "Query any FHIR R4 endpoint for patient demographics, conditions, medications, and recent labs from a single natural language request",
    category: "Data Access",
    fhirResources: ["Patient", "Condition", "MedicationRequest", "Observation"],
    fhirVersion: "R4",
    author: "FHIRBuilders Community",
    installCmd: "clawhub install fhirbuilders/fhir-patient-query",
    downloadPath: "/skills/fhir-patient-query/SKILL.md",
    installCount: 0,
    isOfficial: true,
  },
  {
    id: "fhir-care-gap-monitor",
    name: "Care Gap Monitor",
    description: "Identify patients with open quality care gaps — missing preventive screenings, overdue labs, or unfulfilled care plan goals",
    category: "Clinical Workflows",
    fhirResources: ["Patient", "Observation", "Condition", "Procedure", "Goal"],
    fhirVersion: "R4",
    author: "FHIRBuilders Community",
    installCmd: "clawhub install fhirbuilders/fhir-care-gap-monitor",
    downloadPath: "/skills/fhir-care-gap-monitor/SKILL.md",
    installCount: 0,
    isOfficial: true,
  },
  {
    id: "fhir-adt-alerts",
    name: "ADT Alerts",
    description: "Monitor FHIR Subscription resources for ADT events and send proactive alerts when patients are admitted, discharged, or transferred",
    category: "Alerts & Monitoring",
    fhirResources: ["Encounter", "Patient", "Subscription"],
    fhirVersion: "R4",
    author: "FHIRBuilders Community",
    installCmd: "clawhub install fhirbuilders/fhir-adt-alerts",
    downloadPath: "/skills/fhir-adt-alerts/SKILL.md",
    installCount: 0,
    isOfficial: true,
  },
  {
    id: "cql-measure-runner",
    name: "CQL Measure Runner",
    description: "Run a CQL quality measure against your FHIR endpoint and return population results — initial population, denominator, numerator, and performance rate",
    category: "Quality Measures",
    fhirResources: ["MeasureReport", "Measure"],
    fhirVersion: "R4",
    author: "FHIRBuilders Community",
    installCmd: "clawhub install fhirbuilders/cql-measure-runner",
    downloadPath: "/skills/cql-measure-runner/SKILL.md",
    installCount: 0,
    isOfficial: true,
  },
  {
    id: "fhir-medication-reconciliation",
    name: "Medication Reconciliation",
    description: "Compare medication lists from multiple sources, flag duplicates and drug interactions, and produce a reconciliation summary for clinical review",
    category: "Clinical Workflows",
    fhirResources: ["MedicationRequest", "MedicationStatement", "Patient"],
    fhirVersion: "R4",
    author: "FHIRBuilders Community",
    installCmd: "clawhub install fhirbuilders/fhir-medication-reconciliation",
    downloadPath: "/skills/fhir-medication-reconciliation/SKILL.md",
    installCount: 0,
    isOfficial: true,
  },
  {
    id: "fhirbuilders-digest",
    name: "FHIRBuilders Digest",
    description: "Daily digest of new projects and trending artifacts on FHIRBuilders.com — delivered to your chat app every morning",
    category: "Productivity",
    fhirResources: [],
    fhirVersion: "—",
    author: "FHIRBuilders Community",
    installCmd: "clawhub install fhirbuilders/fhirbuilders-digest",
    downloadPath: "/skills/fhirbuilders-digest/SKILL.md",
    installCount: 0,
    isOfficial: true,
  },
  {
    id: "fhir-agent-coordinator",
    name: "Agent Coordinator",
    description: "Coordinate multi-agent FHIR workflows — delegate tasks to specialized sub-agents using A2A messaging over FHIR Task resources",
    category: "Agent Coordination",
    fhirResources: ["Task", "Patient", "Communication"],
    fhirVersion: "R4",
    author: "FHIRBuilders Community",
    installCmd: "clawhub install fhirbuilders/fhir-agent-coordinator",
    downloadPath: "/skills/fhir-agent-coordinator/SKILL.md",
    installCount: 0,
    isOfficial: true,
  },
  {
    id: "smart-fhir-launcher",
    name: "SMART on FHIR Launcher",
    description: "Initiate SMART on FHIR authorization flows and manage access tokens for multiple endpoints from your agent — no manual browser auth required",
    category: "Data Access",
    fhirResources: [],
    fhirVersion: "R4",
    author: "FHIRBuilders Community",
    installCmd: "clawhub install fhirbuilders/smart-fhir-launcher",
    downloadPath: "/skills/smart-fhir-launcher/SKILL.md",
    installCount: 0,
    isOfficial: true,
  },
];

const CATEGORIES = [
  "All",
  "Clinical Workflows",
  "Quality Measures",
  "Data Access",
  "Alerts & Monitoring",
  "Agent Coordination",
  "Productivity",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Clinical Workflows":  "bg-teal-100 text-teal-800 border-teal-200",
  "Quality Measures":    "bg-green-100 text-green-800 border-green-200",
  "Data Access":         "bg-blue-100 text-blue-800 border-blue-200",
  "Alerts & Monitoring": "bg-amber-100 text-amber-800 border-amber-200",
  "Agent Coordination":  "bg-purple-100 text-purple-800 border-purple-200",
  "Productivity":        "bg-gray-100 text-gray-700 border-gray-200",
};

const FHIR_RESOURCE_CHIPS = [
  "Patient", "Observation", "Condition", "MedicationRequest", "MedicationStatement",
  "Encounter", "Procedure", "Goal", "Task", "Communication", "Subscription",
  "MeasureReport", "Measure", "DiagnosticReport", "AllergyIntolerance",
];

// ── Skill card ────────────────────────────────────────────────────────────────

function SkillCard({ skill }: { skill: typeof SEED_SKILLS[0] }) {
  const [copied, setCopied] = useState(false);
  const [installCount, setInstallCount] = useState(skill.installCount);

  const handleCopy = () => {
    navigator.clipboard.writeText(skill.installCmd);
    setCopied(true);
    setInstallCount((c) => c + 1);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="flex flex-col hover:border-violet-200 transition-colors">
      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-base">{skill.name}</h3>
              {skill.isOfficial && (
                <Badge variant="outline" className="text-xs bg-violet-50 text-violet-700 border-violet-200">
                  Official
                </Badge>
              )}
            </div>
            <Badge variant="outline" className={`text-xs ${CATEGORY_COLORS[skill.category] ?? ""}`}>
              {skill.category}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground ml-2 shrink-0">
            {installCount > 0 ? `${installCount} installs` : "Be first"}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3 flex-1">{skill.description}</p>

        {/* FHIR resources */}
        {skill.fhirResources.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {skill.fhirResources.map((r) => (
              <Badge key={r} variant="secondary" className="text-xs">
                {r}
              </Badge>
            ))}
          </div>
        )}

        {/* Install command */}
        <div className="bg-zinc-900 rounded-lg px-3 py-2 flex items-center justify-between gap-2 mb-3">
          <code className="text-xs text-green-400 font-mono truncate flex-1">
            {skill.installCmd}
          </code>
          <button
            onClick={handleCopy}
            className="text-zinc-400 hover:text-white transition-colors shrink-0"
            title="Copy install command"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{skill.author}</span>
          <div className="flex gap-2">
            <a
              href={skill.downloadPath}
              download
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Download className="h-3 w-3" />
              SKILL.md
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Community skill card ──────────────────────────────────────────────────────

interface CommunitySkill {
  id: string;
  title: string;
  description: string;
  artifactType: string | null;
  upvoteCount: number;
  authorName: string;
  repoUrl: string | null;
  tags: string[];
}

function CommunitySkillCard({ skill }: { skill: CommunitySkill }) {
  const [copied, setCopied] = useState(false);
  const installCmd = skill.repoUrl
    ? `# Download from GitHub:\ncurl -L ${skill.repoUrl}/raw/main/SKILL.md > SKILL.md`
    : "# Contact the author for install instructions";

  return (
    <Card className="flex flex-col hover:border-teal-200 transition-colors">
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-base flex-1">{skill.title}</h3>
          <span className="text-xs text-muted-foreground ml-2">{skill.upvoteCount} ↑</span>
        </div>
        <p className="text-sm text-muted-foreground mb-3 flex-1">{skill.description}</p>
        {skill.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {skill.tags.slice(0, 4).map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{skill.authorName}</span>
          <div className="flex gap-2">
            {skill.repoUrl && (
              <a href={skill.repoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground flex items-center gap-1">
                <Github className="h-3 w-3" />
                Code
              </a>
            )}
            <button
              onClick={() => { navigator.clipboard.writeText(installCmd); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="flex items-center gap-1 hover:text-foreground"
            >
              {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              Copy
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Skill builder ─────────────────────────────────────────────────────────────

function SkillBuilder() {
  const [step, setStep] = useState(1);
  const [taskDescription, setTaskDescription] = useState("");
  const [fhirEndpoint, setFhirEndpoint] = useState("");
  const [authMethod, setAuthMethod] = useState("bearer");
  const [fhirVersion, setFhirVersion] = useState("R4");
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [isProactive, setIsProactive] = useState(false);
  const [schedule, setSchedule] = useState("every morning at 7am");
  const [userApiKey, setUserApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSkill, setGeneratedSkill] = useState("");
  const [error, setError] = useState("");
  const outputRef = useRef<HTMLPreElement>(null);

  const toggleResource = (r: string) => {
    setSelectedResources((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const handleGenerate = async () => {
    if (!taskDescription.trim()) {
      setError("Please describe what you want your agent to do.");
      return;
    }
    setError("");
    setGeneratedSkill("");
    setIsGenerating(true);

    try {
      const res = await fetch("/api/openclaw/generate-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskDescription,
          fhirEndpoint,
          authMethod,
          fhirVersion,
          fhirResources: selectedResources,
          isProactive,
          schedule: isProactive ? schedule : undefined,
          userApiKey: userApiKey || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Generation failed. Please try again.");
        setIsGenerating(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        setError("Stream unavailable.");
        setIsGenerating(false);
        return;
      }

      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setGeneratedSkill(accumulated);
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedSkill], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SKILL.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Step 1 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Step 1 — What should your agent do? <span className="text-red-500">*</span>
        </label>
        <textarea
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          placeholder="Describe the task in plain English. What should your agent do when you ask it? What FHIR data does it need?&#10;&#10;Example: Every morning, tell me which patients in my panel have an HbA1c older than 12 months and send me their contact info"
          className="w-full min-h-[120px] px-3 py-2 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Step 2 */}
      <div className="space-y-4 border rounded-xl p-4 bg-muted/20">
        <h4 className="text-sm font-medium">Step 2 — Configure it</h4>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">FHIR Endpoint URL</label>
            <Input
              placeholder="https://api.medplum.com/fhir/R4"
              value={fhirEndpoint}
              onChange={(e) => setFhirEndpoint(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">FHIR Version</label>
            <div className="flex gap-2">
              {["R4", "R4B", "R5"].map((v) => (
                <button
                  key={v}
                  onClick={() => setFhirVersion(v)}
                  className={`px-3 py-1.5 rounded text-sm border transition-colors ${fhirVersion === v ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-muted"}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Auth Method</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "bearer", label: "Bearer Token" },
              { value: "smart", label: "SMART on FHIR" },
              { value: "basic", label: "Basic Auth" },
              { value: "none", label: "None (public)" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAuthMethod(opt.value)}
                className={`px-3 py-1.5 rounded text-sm border transition-colors ${authMethod === opt.value ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-muted"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Primary FHIR Resources</label>
          <div className="flex flex-wrap gap-1.5">
            {FHIR_RESOURCE_CHIPS.map((r) => (
              <button
                key={r}
                onClick={() => toggleResource(r)}
                className={`px-2 py-1 rounded text-xs border transition-colors ${selectedResources.includes(r) ? "bg-blue-100 text-blue-800 border-blue-300" : "border-input hover:bg-muted"}`}
              >
                {selectedResources.includes(r) && <Check className="inline h-3 w-3 mr-0.5" />}
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Execution Mode</label>
          <div className="flex gap-3">
            {[
              { value: false, label: "Reactive", desc: "Runs when you message your agent" },
              { value: true, label: "Proactive", desc: "Runs on a schedule (heartbeat)" },
            ].map((opt) => (
              <label key={String(opt.value)} className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  checked={isProactive === opt.value}
                  onChange={() => setIsProactive(opt.value)}
                  className="mt-0.5 accent-primary"
                />
                <div>
                  <span className="text-sm font-medium">{opt.label}</span>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
          {isProactive && (
            <Input
              placeholder='Schedule: e.g., "every morning at 7am" or "every 30 minutes"'
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="text-sm mt-2"
            />
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Anthropic API Key <span className="font-normal">(optional — uses server key if blank)</span>
          </label>
          <Input
            type="password"
            placeholder="sk-ant-..."
            value={userApiKey}
            onChange={(e) => setUserApiKey(e.target.value)}
            className="text-sm font-mono"
          />
        </div>
      </div>

      {/* Step 3 — Generate */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !taskDescription.trim()}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white"
        size="lg"
      >
        {isGenerating ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating SKILL.md...</>
        ) : (
          <><Sparkles className="mr-2 h-4 w-4" />Generate SKILL.md</>
        )}
      </Button>

      {/* Generated output */}
      {(generatedSkill || isGenerating) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Generated SKILL.md</h4>
            {generatedSkill && !isGenerating && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(generatedSkill); }}>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </Button>
                <Button size="sm" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Download SKILL.md
                </Button>
              </div>
            )}
          </div>

          <div className="relative rounded-xl overflow-hidden border bg-zinc-950">
            <div className="bg-zinc-800 px-4 py-2 flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs text-zinc-400 font-mono">SKILL.md</span>
            </div>
            <pre
              ref={outputRef}
              className="text-xs text-zinc-300 font-mono p-4 overflow-auto max-h-96 whitespace-pre-wrap"
            >
              {generatedSkill || "Generating..."}
              {isGenerating && <span className="animate-pulse">▊</span>}
            </pre>
          </div>

          {generatedSkill && !isGenerating && (
            <div className="bg-muted/30 rounded-lg p-4 text-sm space-y-2">
              <p className="font-medium">Install instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Download SKILL.md and save it to <code className="text-xs bg-muted px-1 rounded">~/.openclaw/skills/your-skill-name/SKILL.md</code></li>
                <li>Restart your OpenClaw gateway: <code className="text-xs bg-muted px-1 rounded">openclaw restart</code></li>
                <li>Test it: message your agent and describe the task</li>
              </ol>
              <Button variant="outline" size="sm" asChild className="mt-2">
                <a href="#share-skill">Share with community →</a>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Skill submission form ─────────────────────────────────────────────────────

function SkillSubmissionForm() {
  const [formData, setFormData] = useState({
    skillName: "",
    displayName: "",
    description: "",
    category: "",
    fhirVersion: "R4",
    githubUrl: "",
    authorName: "",
    authorEmail: "",
  });
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [formState, setFormState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const toggleResource = (r: string) => {
    setSelectedResources((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.githubUrl.startsWith("https://github.com/")) {
      setErrorMsg("Please provide a valid GitHub URL.");
      return;
    }

    setFormState("loading");

    // Validate that the GitHub URL contains a SKILL.md
    try {
      const rawBase = formData.githubUrl
        .replace("https://github.com/", "https://raw.githubusercontent.com/")
        .replace(/\/$/, "");
      const skillMdUrl = `${rawBase}/main/SKILL.md`;
      const checkRes = await fetch(skillMdUrl, { method: "HEAD" });
      if (!checkRes.ok) {
        setErrorMsg("Could not find a SKILL.md at this GitHub URL. Make sure SKILL.md is at the root of the default branch.");
        setFormState("error");
        return;
      }
    } catch {
      setErrorMsg("Could not verify the GitHub URL. Please check the URL and try again.");
      setFormState("error");
      return;
    }

    // Submit to projects API as an OpenClaw Skill artifact
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.displayName,
        description: formData.description,
        repoUrl: formData.githubUrl,
        tags: selectedResources.slice(0, 5),
        authorName: formData.authorName,
        authorEmail: formData.authorEmail,
        artifactType: "OpenClaw Skill",
        status: "live",
        lookingFor: [],
      }),
    });

    if (res.ok) {
      setFormState("success");
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error || "Submission failed. Please try again.");
      setFormState("error");
    }
  };

  if (formState === "success") {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Skill Submitted!</h3>
        <p className="text-muted-foreground text-sm">
          Your skill is now visible in the community gallery below.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Skill slug <span className="text-red-500">*</span></label>
          <Input
            placeholder="fhir-care-gaps"
            value={formData.skillName}
            onChange={(e) => setFormData({ ...formData, skillName: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
            required
          />
          <p className="text-xs text-muted-foreground">Lowercase, hyphens only</p>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Display name <span className="text-red-500">*</span></label>
          <Input
            placeholder="FHIR Care Gaps"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Description <span className="text-red-500">*</span> <span className="text-muted-foreground font-normal">(max 100 chars)</span></label>
        <Input
          placeholder="One-line description of what this skill does"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 100) })}
          required
        />
        <p className="text-xs text-muted-foreground">{formData.description.length}/100</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Category <span className="text-red-500">*</span></label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Select category</option>
            {CATEGORIES.filter((c) => c !== "All").map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">FHIR Version <span className="text-red-500">*</span></label>
          <div className="flex gap-2 mt-1">
            {["R4", "R4B", "R5"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setFormData({ ...formData, fhirVersion: v })}
                className={`px-3 py-1.5 rounded text-sm border transition-colors ${formData.fhirVersion === v ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-muted"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">FHIR Resources Used</label>
        <div className="flex flex-wrap gap-1.5">
          {FHIR_RESOURCE_CHIPS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => toggleResource(r)}
              className={`px-2 py-1 rounded text-xs border transition-colors ${selectedResources.includes(r) ? "bg-blue-100 text-blue-800 border-blue-300" : "border-input hover:bg-muted"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">GitHub Repository URL <span className="text-red-500">*</span></label>
        <Input
          placeholder="https://github.com/username/fhir-care-gaps"
          value={formData.githubUrl}
          onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
          required
        />
        <p className="text-xs text-muted-foreground">Must contain a SKILL.md at the root of the main branch</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Your Name <span className="text-red-500">*</span></label>
          <Input
            placeholder="Jane Doe"
            value={formData.authorName}
            onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Email <span className="text-muted-foreground font-normal">(not public)</span></label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={formData.authorEmail}
            onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
          />
        </div>
      </div>

      {(formState === "error" || errorMsg) && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={formState === "loading"}>
        {formState === "loading" ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying & Submitting...</>
        ) : (
          <>Share Skill with Community</>
        )}
      </Button>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OpenClawSkillsPage() {
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [communitySkills, setCommunitySkills] = useState<CommunitySkill[]>([]);
  const [communityCount, setCommunityCount] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/projects?sort=popular")
      .then((r) => r.json())
      .then((data) => {
        const skills = (data.projects ?? []).filter(
          (p: CommunitySkill & { artifactType?: string }) =>
            p.artifactType === "OpenClaw Skill"
        );
        setCommunitySkills(skills);
        setCommunityCount(skills.length);
      })
      .catch(() => {});
  }, []);

  const filteredSeed = SEED_SKILLS.filter((s) => {
    if (filterCategory !== "All" && s.category !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.fhirResources.some((r) => r.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredCommunity = communitySkills.filter((s) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-violet-50 via-background to-blue-50">
        <div className="container py-16 md:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-5 bg-violet-100 text-violet-700 border-violet-200">
              <Sparkles className="mr-1 h-3 w-3" />
              OpenClaw × FHIRBuilders
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl leading-tight mb-5">
              FHIR superpowers for your{" "}
              <span className="text-violet-600">OpenClaw</span> agent
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Install community-built skills that give your local AI agent the ability to query
              FHIR endpoints, monitor care gaps, run quality measures, and coordinate clinical
              workflows — all from WhatsApp or Telegram.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Button
                size="lg"
                className="bg-violet-600 hover:bg-violet-700 text-white"
                onClick={() => galleryRef.current?.scrollIntoView({ behavior: "smooth" })}
              >
                Browse FHIR Skills
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setExplainerOpen(!explainerOpen)}
              >
                What is OpenClaw?
                {explainerOpen ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Don&apos;t have OpenClaw yet?{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                npm i -g openclaw && openclaw onboard
              </code>
              {" "}·{" "}
              <a
                href="https://docs.openclaw.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 hover:underline inline-flex items-center gap-1"
              >
                OpenClaw docs <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      </section>

      {/* ── EXPLAINER (collapsible) ────────────────────────────────────── */}
      {explainerOpen && (
        <section className="border-b bg-violet-50/40">
          <div className="container py-12">
            <div className="mx-auto max-w-5xl grid gap-10 lg:grid-cols-2">
              {/* Left */}
              <div>
                <h2 className="text-xl font-bold mb-4">OpenClaw in plain English</h2>
                <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                  <p>
                    OpenClaw is an open-source AI agent that runs on your machine and lives in your
                    chat apps. You message it like a coworker — on WhatsApp, Telegram, Discord, or
                    Slack — and it <em>actually does things</em>.
                  </p>
                  <p>
                    It has persistent memory (Markdown files on your disk), browser control, file
                    system access, shell execution, and a <strong>heartbeat</strong> that wakes it up
                    to run proactive tasks without you asking.
                  </p>
                  <p>
                    <strong>Skills</strong> are what give it new capabilities. A skill is a SKILL.md
                    file that teaches your agent how to do something specific — query a FHIR endpoint,
                    run a care gap check, send clinical alerts. Install one command, gain a superpower.
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  {[
                    { icon: Smartphone, label: "WhatsApp & Telegram" },
                    { icon: Brain, label: "Persistent memory" },
                    { icon: Clock, label: "Heartbeat scheduler" },
                    { icon: Terminal, label: "Shell + file access" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-sm bg-white border rounded-full px-3 py-1.5">
                      <item.icon className="h-3.5 w-3.5 text-violet-500" />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — Examples */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">Healthcare examples</h2>
                {[
                  {
                    channel: "WhatsApp",
                    icon: MessageCircle,
                    color: "text-green-600",
                    trigger: "Run today's care gap summary for Dr. Chen's panel",
                    action: "Queries FHIR endpoint, counts open gaps by type",
                    result: "Sends formatted summary with 8 patients needing HbA1c",
                  },
                  {
                    channel: "Telegram",
                    icon: Bot,
                    color: "text-blue-500",
                    trigger: "Which diabetic patients haven't had an HbA1c in 12 months?",
                    action: "Queries Condition + Observation resources",
                    result: "Returns patient list with dates and days overdue",
                  },
                  {
                    channel: "Heartbeat — 6am weekdays",
                    icon: Zap,
                    color: "text-amber-500",
                    trigger: "(no message needed)",
                    action: "Checks FHIR Subscription for new ADT notifications",
                    result: "Sends morning briefing to Slack: 2 new admissions overnight",
                  },
                ].map((ex) => (
                  <div key={ex.channel} className="bg-white border rounded-xl p-4 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <ex.icon className={`h-4 w-4 ${ex.color}`} />
                      <span className="font-medium text-xs text-muted-foreground">{ex.channel}</span>
                    </div>
                    <p className="font-mono text-xs bg-muted rounded px-2 py-1 mb-2">
                      &quot;{ex.trigger}&quot;
                    </p>
                    <p className="text-xs text-muted-foreground">→ {ex.action}</p>
                    <p className="text-xs text-muted-foreground">→ {ex.result}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── COMMUNITY STRIP (I2) ──────────────────────────────────────── */}
      {communityCount > 0 && (
        <div className="border-b bg-teal-50/40 py-3">
          <div className="container">
            <p className="text-sm text-center text-teal-700">
              <span className="font-medium">{communityCount} OpenClaw skill{communityCount !== 1 ? "s" : ""}</span> shared by the community on FHIRBuilders
              {" · "}
              <Link href="/projects?type=OpenClaw+Skill" className="underline hover:no-underline">
                Browse all community skills →
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* ── SKILL GALLERY ─────────────────────────────────────────────── */}
      <section ref={galleryRef} className="container py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold">FHIR Skill Library</h2>
              <p className="text-muted-foreground text-sm mt-1">
                {SEED_SKILLS.length} official skills · {communityCount} community skills
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search skills, resources, capabilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  variant={filterCategory === cat ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFilterCategory(cat)}
                  className="h-8 text-xs"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Official skills grid */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-4 w-1 rounded-full bg-violet-500" />
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Official FHIRBuilders Skills
              </h3>
            </div>
            {filteredSeed.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredSeed.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No skills match your filters.</p>
            )}
          </div>

          {/* Community skills */}
          {filteredCommunity.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-4 w-1 rounded-full bg-teal-500" />
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Community Skills
                </h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCommunity.map((skill) => (
                  <CommunitySkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            </div>
          )}

          {/* Below gallery CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t text-sm text-muted-foreground">
            <span>Don&apos;t see what you need?</span>
            <a href="#build-skill" className="text-violet-600 hover:underline font-medium">
              Build a skill →
            </a>
            <span>·</span>
            <a href="#share-skill" className="text-teal-600 hover:underline font-medium">
              Share a skill you&apos;ve built →
            </a>
          </div>
        </div>
      </section>

      {/* ── SKILL BUILDER ─────────────────────────────────────────────── */}
      <section id="build-skill" className="border-t bg-muted/20 py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-8">
              <Badge className="mb-3 bg-violet-100 text-violet-700 border-violet-200">
                <Sparkles className="mr-1 h-3 w-3" />
                AI-Powered
              </Badge>
              <h2 className="text-2xl font-bold mb-2">Build a FHIR skill</h2>
              <p className="text-muted-foreground">
                Describe what you want your agent to do. We&apos;ll generate a complete,
                ready-to-install SKILL.md file.
              </p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <SkillBuilder />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── SKILL SUBMISSION ──────────────────────────────────────────── */}
      <section id="share-skill" className="border-t py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Share a skill you&apos;ve built</h2>
              <p className="text-muted-foreground">
                Your skill goes live in the community gallery immediately after submission.
                You need a GitHub repo with a SKILL.md at the root.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Skill Submission</CardTitle>
                <CardDescription>All fields marked with * are required</CardDescription>
              </CardHeader>
              <CardContent>
                <SkillSubmissionForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <EmailCapture source="openclaw" />
    </div>
  );
}
