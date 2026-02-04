"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Code,
  ExternalLink,
  Pill,
  User,
  Activity,
  Calendar,
  ArrowRight,
  FileCode,
  FolderTree,
  Copy,
  Check,
  Wand2,
  LayoutTemplate,
  Zap,
  MessageSquare,
  Download,
  ChevronRight,
  TestTube,
  Home,
} from "lucide-react"
import { ChannelsPanel } from "@/components/openclaw/channels-panel"

// Template definitions matching the backend
const TEMPLATES = [
  {
    id: "medication-tracker",
    name: "Medication Tracker",
    description: "Track and manage patient medications with reminders",
    icon: Pill,
    resources: ["Patient", "MedicationRequest"],
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "patient-portal",
    name: "Patient Portal",
    description: "A comprehensive patient health portal",
    icon: User,
    resources: ["Patient"],
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    id: "observation-dashboard",
    name: "Vitals Dashboard",
    description: "View and track patient health observations and vitals",
    icon: Activity,
    resources: ["Patient", "Observation"],
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "appointment-scheduler",
    name: "Appointment Scheduler",
    description: "Schedule and manage patient appointments",
    icon: Calendar,
    resources: ["Patient", "Appointment"],
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
]

const EXAMPLE_PROMPTS = [
  "Build a medication reminder app that shows patients their prescriptions and lets them mark doses as taken",
  "Create an appointment scheduling app for a small clinic with patient and provider views",
  "Build a lab results viewer that shows trends over time with charts",
  "Create a patient portal showing conditions, allergies, and care team members",
]

const GENERATION_STEPS = [
  { key: "PENDING", label: "Queued", description: "Waiting to start" },
  { key: "ANALYZING", label: "Analyzing", description: "Understanding your requirements" },
  { key: "GENERATING", label: "Generating", description: "Creating code with AI" },
  { key: "DEPLOYING", label: "Deploying", description: "Setting up sandbox" },
  { key: "COMPLETED", label: "Complete", description: "Ready to use" },
]

type GenerationStatus = "idle" | "generating" | "success" | "error"

interface GeneratedFile {
  name: string
  path: string
  code: string
}

interface GenerationResult {
  id: string
  status: string
  fhirResources: string[]
  sandboxUrl?: string | null
  githubRepoUrl?: string | null
  errorMessage?: string | null
  generatedCode?: {
    appName: string
    description: string
    components: GeneratedFile[]
    pages: GeneratedFile[]
    apiRoutes: GeneratedFile[]
  }
}

function OpenClawContent() {
  const searchParams = useSearchParams()
  const [prompt, setPrompt] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [status, setStatus] = useState<GenerationStatus>("idle")
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [detectedResources, setDetectedResources] = useState<string[]>([])
  const [copiedFile, setCopiedFile] = useState<string | null>(null)
  const [activeCodeTab, setActiveCodeTab] = useState<string>("components")
  const [isDownloading, setIsDownloading] = useState(false)

  // Handle ?template= URL param
  useEffect(() => {
    const templateParam = searchParams.get("template")
    if (templateParam) {
      const template = TEMPLATES.find(t => t.id === templateParam)
      if (template) {
        setSelectedTemplate(templateParam)
        if (!prompt) {
          setPrompt(`Build a ${template.name.toLowerCase()} app that ${template.description.toLowerCase()}`)
        }
      }
    }
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  // Client-side resource detection for preview
  useEffect(() => {
    const keywords: Record<string, string[]> = {
      MedicationRequest: ["medication", "prescription", "drug", "dose", "pill", "medicine"],
      Appointment: ["appointment", "schedule", "booking", "visit", "calendar"],
      Observation: ["lab", "test", "result", "vital", "blood pressure", "observation"],
      Condition: ["condition", "diagnosis", "disease", "problem"],
      CareTeam: ["care team", "provider", "doctor", "nurse"],
      Immunization: ["vaccine", "immunization", "shot"],
      AllergyIntolerance: ["allergy", "allergies", "intolerance"],
      Practitioner: ["practitioner", "doctor", "physician", "nurse"],
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

    // Add resources from selected template
    if (selectedTemplate) {
      const template = TEMPLATES.find(t => t.id === selectedTemplate)
      template?.resources.forEach(r => detected.add(r))
    }

    setDetectedResources(Array.from(detected))
  }, [prompt, selectedTemplate])

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
        body: JSON.stringify({
          prompt,
          templateId: selectedTemplate
        }),
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

  function getCurrentStepIndex(statusKey: string): number {
    return GENERATION_STEPS.findIndex(s => s.key === statusKey)
  }

  function copyToClipboard(code: string, fileName: string) {
    navigator.clipboard.writeText(code)
    setCopiedFile(fileName)
    setTimeout(() => setCopiedFile(null), 2000)
  }

  function selectTemplate(templateId: string) {
    if (selectedTemplate === templateId) {
      setSelectedTemplate(null)
    } else {
      setSelectedTemplate(templateId)
      const template = TEMPLATES.find(t => t.id === templateId)
      if (template && !prompt) {
        // Set a starter prompt based on template
        setPrompt(`Build a ${template.name.toLowerCase()} app that ${template.description.toLowerCase()}`)
      }
    }
  }

  async function handleDownload() {
    if (!result?.generatedCode) return
    setIsDownloading(true)

    try {
      const [JSZip, { scaffoldProject }] = await Promise.all([
        import("jszip").then(m => m.default),
        import("@/lib/openclaw/scaffold"),
      ])

      const files = scaffoldProject(result.generatedCode)
      const zip = new JSZip()

      for (const [path, content] of Object.entries(files)) {
        zip.file(path, content)
      }

      const blob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${result.generatedCode.appName || "fhir-app"}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Download failed:", err)
    } finally {
      setIsDownloading(false)
    }
  }

  function startOver() {
    setStatus("idle")
    setResult(null)
    setError(null)
    setPrompt("")
    setSelectedTemplate(null)
  }

  // Get all generated files for display
  const allFiles = result?.generatedCode ? [
    ...result.generatedCode.components.map(f => ({ ...f, type: "component" })),
    ...result.generatedCode.pages.map(f => ({ ...f, type: "page" })),
    ...result.generatedCode.apiRoutes.map(f => ({ ...f, type: "api" })),
  ] : []

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/openclaw" className="hover:text-foreground">OpenClaw</Link>
        {selectedTemplate && (
          <>
            <ChevronRight className="h-4 w-4" />
            <span>{TEMPLATES.find(t => t.id === selectedTemplate)?.name}</span>
          </>
        )}
      </div>

      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Wand2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">OpenClaw</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Describe your healthcare app idea and watch AI build it for you.
          Connect it to Slack, Discord, WhatsApp, and more.
          Powered by Claude + Medplum + FHIR.
        </p>
      </div>

      {status === "idle" && (
        <>
          {/* Template Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutTemplate className="h-5 w-5" />
                Choose a Template (Optional)
              </CardTitle>
              <CardDescription>
                Start with a pre-built template or describe your app from scratch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TEMPLATES.map((template) => {
                  const Icon = template.icon
                  const isSelected = selectedTemplate === template.id
                  return (
                    <button
                      key={template.id}
                      onClick={() => selectTemplate(template.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${template.bgColor}`}>
                          <Icon className={`h-5 w-5 ${template.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{template.name}</h3>
                            {isSelected && (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {template.resources.map((r) => (
                              <Badge key={r} variant="secondary" className="text-xs">
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Prompt Input Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Describe Your App
              </CardTitle>
              <CardDescription>
                Tell us what you want to build in plain English
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Build a medication reminder app that shows patients their prescriptions and lets them mark when they've taken doses..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="mb-4 text-base"
              />

              {/* Example Prompts */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Try an example:</p>
                <div className="flex gap-2 flex-wrap">
                  {EXAMPLE_PROMPTS.map((example, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent text-xs py-1"
                      onClick={() => setPrompt(example)}
                    >
                      {example.slice(0, 40)}...
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Detected Resources Preview */}
              {(prompt.length > 10 || selectedTemplate) && (
                <div className="mb-4 p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <p className="text-sm font-medium">Detected FHIR Resources:</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {detectedResources.map((resource) => (
                      <Badge key={resource} className="bg-primary/10 text-primary hover:bg-primary/20">
                        {resource}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={prompt.length < 20}
                className="w-full"
                size="lg"
              >
                <Wand2 className="mr-2 h-5 w-5" />
                Generate App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {prompt.length > 0 && prompt.length < 20 && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {20 - prompt.length} more characters needed
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Generation In Progress */}
      {status === "generating" && result && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Building Your App
            </CardTitle>
            <CardDescription>
              {result.generatedCode?.appName || "AI is generating your healthcare application"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress Steps */}
            <div className="relative mb-6">
              <div className="flex justify-between">
                {GENERATION_STEPS.map((step, index) => {
                  const currentIndex = getCurrentStepIndex(result.status)
                  const isComplete = index < currentIndex
                  const isCurrent = index === currentIndex

                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          isComplete
                            ? "bg-green-500 border-green-500 text-white"
                            : isCurrent
                            ? "bg-primary border-primary text-white animate-pulse"
                            : "bg-muted border-muted-foreground/30 text-muted-foreground"
                        }`}
                      >
                        {isComplete ? (
                          <Check className="h-5 w-5" />
                        ) : isCurrent ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <span className="text-sm">{index + 1}</span>
                        )}
                      </div>
                      <p className={`text-xs mt-2 text-center ${isCurrent ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                    </div>
                  )
                })}
              </div>
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-10 mx-12">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{
                    width: `${(getCurrentStepIndex(result.status) / (GENERATION_STEPS.length - 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Resources being used */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">FHIR Resources:</p>
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
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={startOver}>
                Start Over
              </Button>
              <Button
                onClick={() => {
                  setStatus("idle")
                  setError(null)
                }}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Display */}
      {status === "success" && result && (
        <>
          {/* Success Header */}
          <Card className="mb-6 border-green-500/50 bg-green-500/5">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6" />
                    {result.generatedCode?.appName || "App"} Generated Successfully!
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {result.generatedCode?.description || "Your healthcare app is ready"}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={startOver}>
                  Build Another
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {/* Stats */}
                <div className="flex items-center gap-2 text-sm">
                  <FileCode className="h-4 w-4 text-muted-foreground" />
                  <span>{allFiles.length} files generated</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FolderTree className="h-4 w-4 text-muted-foreground" />
                  <span>{result.fhirResources?.length || 0} FHIR resources</span>
                </div>
              </div>

              {/* Resource Badges */}
              <div className="flex gap-2 flex-wrap mt-4">
                {result.fhirResources?.map((resource) => (
                  <Badge key={resource} className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
                    {resource}
                  </Badge>
                ))}
              </div>

              {/* Action Links */}
              <div className="flex gap-4 mt-6 flex-wrap">
                {result.generatedCode && (
                  <Button onClick={handleDownload} disabled={isDownloading}>
                    {isDownloading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Download Project
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link href="/sandbox/demo?useCase=medrec">
                    <TestTube className="mr-2 h-4 w-4" />
                    Try in Sandbox
                  </Link>
                </Button>
                {result.sandboxUrl && (
                  <Button variant="outline" asChild>
                    <a href={result.sandboxUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in Sandbox
                    </a>
                  </Button>
                )}
                {result.githubRepoUrl && (
                  <Button variant="outline" asChild>
                    <a href={result.githubRepoUrl} target="_blank" rel="noopener noreferrer">
                      <Code className="mr-2 h-4 w-4" />
                      View on GitHub
                    </a>
                  </Button>
                )}
                <Button variant="ghost" asChild>
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Code Preview */}
          {result.generatedCode && allFiles.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Generated Code
                </CardTitle>
                <CardDescription>
                  Browse the generated files for your app
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeCodeTab} onValueChange={setActiveCodeTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="components">
                      Components ({result.generatedCode.components.length})
                    </TabsTrigger>
                    <TabsTrigger value="pages">
                      Pages ({result.generatedCode.pages.length})
                    </TabsTrigger>
                    <TabsTrigger value="api">
                      API Routes ({result.generatedCode.apiRoutes.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="components" className="space-y-4">
                    {result.generatedCode.components.map((file) => (
                      <CodeFileCard
                        key={file.path}
                        file={file}
                        onCopy={copyToClipboard}
                        isCopied={copiedFile === file.path}
                      />
                    ))}
                    {result.generatedCode.components.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">No components generated</p>
                    )}
                  </TabsContent>

                  <TabsContent value="pages" className="space-y-4">
                    {result.generatedCode.pages.map((file) => (
                      <CodeFileCard
                        key={file.path}
                        file={file}
                        onCopy={copyToClipboard}
                        isCopied={copiedFile === file.path}
                      />
                    ))}
                    {result.generatedCode.pages.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">No pages generated</p>
                    )}
                  </TabsContent>

                  <TabsContent value="api" className="space-y-4">
                    {result.generatedCode.apiRoutes.map((file) => (
                      <CodeFileCard
                        key={file.path}
                        file={file}
                        onCopy={copyToClipboard}
                        isCopied={copiedFile === file.path}
                      />
                    ))}
                    {result.generatedCode.apiRoutes.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">No API routes generated</p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Messaging Channels Integration */}
          <div className="mb-6">
            <ChannelsPanel generatedAppId={result.id} />
          </div>
        </>
      )}

      {/* How It Works - Only show when idle */}
      {status === "idle" && (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>How OpenClaw Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {[
                { icon: Sparkles, label: "Describe", text: "Tell us your app idea" },
                { icon: Zap, label: "Analyze", text: "We detect FHIR resources" },
                { icon: Wand2, label: "Generate", text: "AI creates your code" },
                { icon: ExternalLink, label: "Deploy", text: "Launch to sandbox" },
                { icon: MessageSquare, label: "Connect", text: "Link messaging apps" },
                { icon: ArrowRight, label: "Iterate", text: "Refine with feedback" },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium text-sm">{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function OpenClawPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-10 max-w-5xl"><p>Loading...</p></div>}>
      <OpenClawContent />
    </Suspense>
  )
}

// Code File Card Component
function CodeFileCard({
  file,
  onCopy,
  isCopied,
}: {
  file: GeneratedFile
  onCopy: (code: string, path: string) => void
  isCopied: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer hover:bg-muted"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{file.path}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onCopy(file.code, file.path)
            }}
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <span className="text-xs text-muted-foreground">
            {isExpanded ? "Collapse" : "Expand"}
          </span>
        </div>
      </div>
      {isExpanded && (
        <div className="relative">
          <pre className="p-4 text-sm overflow-x-auto bg-zinc-950 text-zinc-100 max-h-96">
            <code>{file.code}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
