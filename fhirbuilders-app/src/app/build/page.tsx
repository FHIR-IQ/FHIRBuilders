"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Wand2, Loader2, Download, FolderOpen, ArrowRight, Check } from "lucide-react";

interface GeneratedFile {
  name: string;
  content: string;
  language: string;
}

function parseFiles(raw: string): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  // Match FILE: <name> followed by a code block
  const regex = /FILE:\s*([^\n]+)\n```(\w*)\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    files.push({
      name: match[1].trim(),
      content: match[3],
      language: match[2] || "text",
    });
  }
  return files;
}

function parseMeta(raw: string) {
  const resources = raw.match(/DETECTED_RESOURCES:\s*([^\n]+)/)?.[1]?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const artifactType = raw.match(/ARTIFACT_TYPE:\s*([^\n]+)/)?.[1]?.trim() ?? "App";
  const description = raw.match(/DESCRIPTION:\s*([^\n]+)/)?.[1]?.trim() ?? "";
  return { resources, artifactType, description };
}

async function downloadZip(files: GeneratedFile[], zipName: string) {
  // Use JSZip via CDN dynamically
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file.content);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipName;
  a.click();
  URL.revokeObjectURL(url);
}

const EXAMPLE_PROMPTS = [
  "Medication reconciliation dashboard that flags drug interactions using FHIR MedicationRequest resources",
  "Patient discharge summary viewer using FHIR Encounter, Condition, and MedicationRequest",
  "Care gap dashboard for HbA1c monitoring in diabetic patients using FHIR Observation",
  "SMART on FHIR patient portal showing vitals, labs, and upcoming appointments",
];

const FILE_LANG_COLORS: Record<string, string> = {
  tsx: "text-blue-400",
  ts: "text-blue-300",
  json: "text-yellow-400",
  md: "text-green-400",
  css: "text-pink-400",
};

export default function BuildPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [streamText, setStreamText] = useState("");
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [meta, setMeta] = useState<{ resources: string[]; artifactType: string; description: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const liveFiles = streamText ? parseFiles(streamText) : [];
  const displayFiles = status === "done" ? files : liveFiles;
  const displaySelected = selectedFile ?? displayFiles[0]?.name ?? null;
  const selectedContent = displayFiles.find((f) => f.name === displaySelected);

  const handleGenerate = async () => {
    if (!prompt.trim() || status === "generating") return;
    setStatus("generating");
    setStreamText("");
    setFiles([]);
    setMeta(null);
    setErrorMsg("");
    setSelectedFile(null);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const res = await fetch("/api/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal: abort.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Generation failed");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (!reader) throw new Error("No response stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.text) {
                accumulated += parsed.text;
                setStreamText(accumulated);
              }
            } catch {
              // skip malformed SSE lines
            }
          }
        }
      }

      const parsedFiles = parseFiles(accumulated);
      const parsedMeta = parseMeta(accumulated);
      setFiles(parsedFiles);
      setMeta(parsedMeta);
      setStatus("done");
      if (parsedFiles[0]) setSelectedFile(parsedFiles[0].name);
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setStatus("idle");
        return;
      }
      setErrorMsg(err instanceof Error ? err.message : "Generation failed");
      setStatus("error");
    }
  };

  const handlePublish = () => {
    const params = new URLSearchParams();
    if (meta?.description) params.set("description", meta.description);
    if (meta?.artifactType) params.set("artifactType", meta.artifactType);
    router.push(`/projects/new?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="border-b bg-zinc-950 text-white">
        <div className="container py-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-violet-600">
              <Wand2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">FHIR App Builder</h1>
              <p className="text-xs text-zinc-400">Describe what you want · AI generates the code · Download and deploy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — prompt + controls */}
        <div className="w-full lg:w-[380px] shrink-0 border-r bg-zinc-900 flex flex-col">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Prompt */}
            <div>
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                Describe your FHIR app
              </label>
              <textarea
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none min-h-[120px]"
                placeholder="Describe the FHIR app you want to build..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={status === "generating"}
              />
              <p className="text-xs text-zinc-500 mt-1">
                Be specific about FHIR resources, the clinical use case, and who will use it.
              </p>
            </div>

            {/* Examples */}
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Examples</p>
              <div className="space-y-1.5">
                {EXAMPLE_PROMPTS.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setPrompt(ex)}
                    className="w-full text-left text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-800 rounded px-2 py-1.5 transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Detected resources (live) */}
            {(status === "generating" || status === "done") && streamText && (
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Detected FHIR Resources</p>
                <div className="flex flex-wrap gap-1.5">
                  {parseMeta(streamText).resources.map((r) => (
                    <Badge key={r} variant="secondary" className="bg-blue-900/40 text-blue-300 border-blue-800 text-xs">
                      {r}
                    </Badge>
                  ))}
                  {parseMeta(streamText).resources.length === 0 && (
                    <span className="text-xs text-zinc-500">Detecting...</span>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {status === "error" && errorMsg && (
              <p className="text-sm text-red-400 bg-red-950/30 rounded p-2">{errorMsg}</p>
            )}
          </div>

          {/* Actions */}
          <div className="p-5 border-t border-zinc-800 space-y-2">
            <Button
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
              onClick={handleGenerate}
              disabled={!prompt.trim() || status === "generating"}
            >
              {status === "generating" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  {status === "done" ? "Regenerate" : "Generate App"}
                </>
              )}
            </Button>

            {status === "done" && files.length > 0 && (
              <>
                <Button
                  variant="outline"
                  className="w-full border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                  onClick={() => downloadZip(files, "fhir-app.zip")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download .zip
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-teal-700 text-teal-300 hover:bg-teal-900/30"
                  onClick={handlePublish}
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Publish to FHIRBuilders
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Right panel — code viewer */}
        <div className="flex-1 bg-zinc-950 flex flex-col overflow-hidden">
          {/* File tabs */}
          {displayFiles.length > 0 && (
            <div className="flex items-center gap-0 border-b border-zinc-800 overflow-x-auto shrink-0">
              {displayFiles.map((file) => {
                const ext = file.name.split(".").pop() ?? "";
                const color = FILE_LANG_COLORS[ext] ?? "text-zinc-400";
                return (
                  <button
                    key={file.name}
                    onClick={() => setSelectedFile(file.name)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs border-r border-zinc-800 whitespace-nowrap transition-colors ${
                      displaySelected === file.name
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                    }`}
                  >
                    <span className={color}>📄</span>
                    {file.name}
                  </button>
                );
              })}
              {status === "done" && (
                <div className="ml-auto flex items-center gap-1.5 px-4 text-xs text-green-400">
                  <Check className="h-3 w-3" />
                  {files.length} files generated
                </div>
              )}
            </div>
          )}

          {/* Code content */}
          <div className="flex-1 overflow-auto">
            {status === "idle" && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 rounded-full bg-violet-900/30 flex items-center justify-center mb-4">
                  <Wand2 className="h-8 w-8 text-violet-400" />
                </div>
                <h2 className="text-lg font-semibold text-zinc-200 mb-2">Describe your FHIR app</h2>
                <p className="text-sm text-zinc-500 max-w-sm">
                  Enter a description on the left. Claude will generate a complete,
                  deployable Next.js app using Medplum and FHIR R4.
                </p>
              </div>
            )}

            {status === "generating" && displayFiles.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Loader2 className="h-8 w-8 text-violet-400 animate-spin mb-4" />
                <p className="text-sm text-zinc-400">Generating your FHIR app...</p>
                <p className="text-xs text-zinc-600 mt-1">Analyzing FHIR resources and generating code</p>
              </div>
            )}

            {selectedContent && (
              <pre className="p-5 text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap overflow-auto h-full">
                {selectedContent.content}
                {status === "generating" && displaySelected === displayFiles[displayFiles.length - 1]?.name && (
                  <span className="animate-pulse text-violet-400">▋</span>
                )}
              </pre>
            )}
          </div>

          {/* Bottom bar */}
          {status === "done" && meta && (
            <div className="border-t border-zinc-800 bg-zinc-900 px-5 py-3 flex items-center gap-4 text-xs text-zinc-400 shrink-0">
              <span className="text-green-400 flex items-center gap-1">
                <Check className="h-3 w-3" /> Generated
              </span>
              {meta.artifactType && (
                <Badge variant="secondary" className="bg-violet-900/40 text-violet-300 border-violet-800">
                  {meta.artifactType}
                </Badge>
              )}
              {meta.resources.slice(0, 4).map((r) => (
                <span key={r} className="text-blue-400">{r}</span>
              ))}
              {meta.description && <span className="ml-auto text-zinc-500 truncate max-w-xs">{meta.description}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
