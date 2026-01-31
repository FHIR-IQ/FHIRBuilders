"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, CheckCircle, AlertCircle, Code, ExternalLink } from "lucide-react"

const EXAMPLE_PROMPTS = [
  "Build a medication reminder app that shows patients their prescriptions and lets them mark doses as taken",
  "Create an appointment scheduling app for a small clinic with patient and provider views",
  "Build a lab results viewer that shows trends over time with charts",
  "Create a patient portal showing conditions, allergies, and care team members",
]

type GenerationStatus =
  | "idle"
  | "generating"
  | "success"
  | "error"

interface GenerationResult {
  id: string
  status: string
  fhirResources: string[]
  sandboxUrl?: string | null
  githubRepoUrl?: string | null
  errorMessage?: string | null
}

export default function OpenClawPage() {
  const [prompt, setPrompt] = useState("")
  const [status, setStatus] = useState<GenerationStatus>("idle")
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [detectedResources, setDetectedResources] = useState<string[]>([])

  // Simple client-side resource detection for preview
  useEffect(() => {
    const keywords: Record<string, string[]> = {
      MedicationRequest: ["medication", "prescription", "drug", "dose", "pill"],
      Appointment: ["appointment", "schedule", "booking", "visit"],
      Observation: ["lab", "test", "result", "vital", "blood pressure"],
      Condition: ["condition", "diagnosis", "disease", "problem"],
      CareTeam: ["care team", "provider", "doctor", "nurse"],
      Immunization: ["vaccine", "immunization", "shot"],
      AllergyIntolerance: ["allergy", "allergies", "intolerance"],
    }

    const detected = new Set<string>(["Patient"])
    const lowerPrompt = prompt.toLowerCase()

    for (const [resource, kws] of Object.entries(keywords)) {
      for (const kw of kws) {
        if (lowerPrompt.includes(kw)) {
          detected.add(resource)
          break
        }
      }
    }

    setDetectedResources(Array.from(detected))
  }, [prompt])

  async function handleGenerate() {
    if (!prompt.trim() || prompt.length < 20) {
      setError("Please provide a more detailed description (at least 20 characters)")
      return
    }

    setStatus("generating")
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/openclaw/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Generation failed")
      }

      setResult({
        id: data.id,
        status: data.status,
        fhirResources: data.fhirResources,
      })

      // Start polling for status updates
      pollStatus(data.id)
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  async function pollStatus(id: string) {
    const poll = async () => {
      try {
        const response = await fetch(`/api/openclaw/status/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to get status")
        }

        setResult(data)

        if (data.status === "COMPLETED") {
          setStatus("success")
        } else if (data.status === "FAILED") {
          setStatus("error")
          setError(data.errorMessage || "Generation failed")
        } else {
          // Keep polling
          setTimeout(poll, 2000)
        }
      } catch (err) {
        setStatus("error")
        setError(err instanceof Error ? err.message : "Polling failed")
      }
    }

    poll()
  }

  function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: "Queued",
      ANALYZING: "Analyzing prompt...",
      GENERATING: "Generating code...",
      DEPLOYING: "Deploying to sandbox...",
      COMPLETED: "Completed",
      FAILED: "Failed",
    }
    return labels[status] || status
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          OpenClaw
        </h1>
        <p className="text-xl text-muted-foreground">
          Describe your healthcare app idea and we&apos;ll build it for you
        </p>
      </div>

      {/* Main Input Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What do you want to build?</CardTitle>
          <CardDescription>
            Describe your FHIR healthcare application in plain English
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Build a medication reminder app that shows patients their prescriptions and lets them mark when they've taken doses..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="mb-4"
            disabled={status === "generating"}
          />

          {/* Example Prompts */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Try an example:</p>
            <div className="flex gap-2 flex-wrap">
              {EXAMPLE_PROMPTS.map((example, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent text-xs"
                  onClick={() => setPrompt(example)}
                >
                  {example.slice(0, 50)}...
                </Badge>
              ))}
            </div>
          </div>

          {/* Detected Resources Preview */}
          {prompt.length > 10 && (
            <div className="mb-4 p-3 bg-muted rounded-md">
              <p className="text-sm font-medium mb-2">Detected FHIR Resources:</p>
              <div className="flex gap-2 flex-wrap">
                {detectedResources.map((resource) => (
                  <Badge key={resource} variant="secondary">
                    {resource}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={status === "generating" || prompt.length < 20}
            className="w-full"
            size="lg"
          >
            {status === "generating" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {result?.status ? getStatusLabel(result.status) : "Starting..."}
              </>
            ) : (
              <>
                <Code className="mr-2 h-4 w-4" />
                Generate App
              </>
            )}
          </Button>

          {prompt.length > 0 && prompt.length < 20 && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {20 - prompt.length} more characters needed
            </p>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {status === "error" && error && (
        <Card className="mb-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Generation Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setStatus("idle")
                setError(null)
              }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Success Display */}
      {status === "success" && result && (
        <Card className="mb-6 border-green-500">
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              App Generated Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* FHIR Resources */}
            <div>
              <p className="font-medium mb-2">FHIR Resources Used:</p>
              <div className="flex gap-2 flex-wrap">
                {result.fhirResources?.map((resource) => (
                  <Badge key={resource}>{resource}</Badge>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="flex gap-4 flex-wrap">
              {result.sandboxUrl && (
                <a
                  href={result.sandboxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Sandbox
                </a>
              )}
              {result.githubRepoUrl && (
                <a
                  href={result.githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <Code className="h-4 w-4" />
                  View Code
                </a>
              )}
            </div>

            {/* Note about MVP */}
            <div className="p-3 bg-muted rounded-md text-sm">
              <p className="font-medium">MVP Note:</p>
              <p className="text-muted-foreground">
                This is the v0 MVP. Full code generation and deployment coming soon.
                Currently, this creates a generation record with detected FHIR resources.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation in Progress */}
      {status === "generating" && result && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Generation in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Status: {getStatusLabel(result.status)}
              </p>
              <div className="flex gap-2 flex-wrap">
                {result.fhirResources?.map((resource) => (
                  <Badge key={resource} variant="outline">
                    {resource}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How OpenClaw Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>
              <strong className="text-foreground">Describe</strong> - Tell us what healthcare app you want to build
            </li>
            <li>
              <strong className="text-foreground">Analyze</strong> - We detect the FHIR resources you need
            </li>
            <li>
              <strong className="text-foreground">Generate</strong> - AI generates a complete Next.js + Medplum app
            </li>
            <li>
              <strong className="text-foreground">Deploy</strong> - Your app is deployed to a sandbox with test data
            </li>
            <li>
              <strong className="text-foreground">Iterate</strong> - Refine with natural language feedback
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
