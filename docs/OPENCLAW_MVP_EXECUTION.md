# OpenClaw MVP Execution Plan

## Part 1: Assumption Testing

### Critical Assumptions Review

| # | Assumption | Risk Level | Test Method | Verdict |
|---|------------|------------|-------------|---------|
| 1 | AI can generate valid FHIR resources | Medium | Build prototype, validate against US Core | **Testable** |
| 2 | Developers want "Learn Mode" explanations | High | User interviews before building | **Unvalidated** |
| 3 | Clinicians prefer CDS Hooks over apps | High | Requires clinical informatics interviews | **Unvalidated** |
| 4 | Patients will complete granular consent | Medium | A/B test with simplified vs granular | **Testable** |
| 5 | Investors will use marketplace for deal sourcing | High | 3 VC interviews required | **Unvalidated** |
| 6 | Medplum is production-ready for multi-tenant | Low | Already proven at scale | **Validated** |
| 7 | fhir-community-search provides useful context | Low | Test queries against Jira/Zulip | **Testable** |
| 8 | EHR vendors won't block integrations | High | Requires partnership discussions | **Unknown** |

### Assumptions That Should NOT Block MVP

These can be validated after v0 launch:
- Learn Mode vs Build Mode preference (start with one, add second based on feedback)
- Investor deal flow features (nice-to-have for v0)
- Multi-language support (English-only for v0)
- CDS Hooks (start with standalone apps, add CDS later)

### Assumptions That MUST Be Validated Before Building

1. **"AI can generate valid FHIR code"** - Build a prototype that generates 5 common FHIR resources
2. **"Developers will use this over manual coding"** - Get 3 developers to try prototype
3. **"Medplum sandbox deployment works"** - Test automated project creation

---

## Part 2: What Claude Code Can Actually Build

### Realistic Scope Assessment

| Task | Claude Code Capability | Notes |
|------|------------------------|-------|
| Next.js scaffolding | ✅ Excellent | Standard project setup |
| React components | ✅ Excellent | UI generation is strong |
| API routes | ✅ Excellent | CRUD operations, auth |
| Prisma schema | ✅ Excellent | Database modeling |
| FHIR resource generation | ⚠️ Moderate | Needs validation layer |
| Medplum integration | ⚠️ Moderate | SDK usage, not custom |
| SMART on FHIR OAuth | ⚠️ Moderate | Template-based, needs testing |
| CDS Hooks service | ⚠️ Moderate | Spec is well-documented |
| Docker compose | ✅ Good | Standard configurations |
| CI/CD pipelines | ✅ Good | GitHub Actions |
| AI agent orchestration | ❌ Limited | Complex multi-agent is hard |
| Real-time FHIR subscriptions | ⚠️ Moderate | Medplum handles this |

### What Claude Code Should NOT Attempt in v0

1. **Multi-agent orchestration** - Too complex, defer to OpenClaw integration later
2. **Voice interface** - Requires specialized libraries, not MVP
3. **Live Canvas visual builder** - Complex frontend, not MVP
4. **Automated EHR registration** - Requires vendor partnerships
5. **FDA compliance automation** - Needs legal review, manual for now

---

## Part 3: v0 MVP Specification

### v0 Goal

**"Generate a working FHIR app scaffold from a natural language description, deploy to sandbox, and list on FHIRBuilders"**

### v0 Feature Set

```
┌─────────────────────────────────────────────────────────────────────┐
│                        OpenClaw v0 MVP                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  INPUT: Natural language app description                            │
│  ─────────────────────────────────────────────────────────────────  │
│  "Build a medication reminder app that shows patients their         │
│   prescriptions and lets them mark when they've taken doses"        │
│                                                                      │
│  PROCESS:                                                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐  │
│  │ 1. Parse    │───▶│ 2. Select   │───▶│ 3. Generate scaffold    │  │
│  │    intent   │    │    FHIR     │    │    with Medplum         │  │
│  │             │    │    resources│    │                         │  │
│  └─────────────┘    └─────────────┘    └─────────────────────────┘  │
│                                                │                     │
│                                                ▼                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐  │
│  │ 6. List on  │◀───│ 5. Deploy   │◀───│ 4. Add synthetic        │  │
│  │ FHIRBuilders│    │    sandbox  │    │    patient data         │  │
│  └─────────────┘    └─────────────┘    └─────────────────────────┘  │
│                                                                      │
│  OUTPUT:                                                            │
│  • GitHub repo with Next.js + Medplum app                          │
│  • Deployed sandbox URL with test patients                          │
│  • FHIRBuilders marketplace listing                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### v0 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         v0 Architecture                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    FHIRBuilders App (Existing)                │   │
│  │                                                               │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌────────────────┐    │   │
│  │  │ /openclaw   │    │ /api/       │    │ /apps          │    │   │
│  │  │ (new page)  │    │ openclaw/*  │    │ (marketplace)  │    │   │
│  │  │             │    │ (new APIs)  │    │                │    │   │
│  │  │ • Prompt UI │    │ • generate  │    │ • List apps    │    │   │
│  │  │ • Progress  │    │ • status    │    │ • Ratings      │    │   │
│  │  │ • Results   │    │ • deploy    │    │ • Details      │    │   │
│  │  └─────────────┘    └─────────────┘    └────────────────┘    │   │
│  │                           │                                   │   │
│  └───────────────────────────┼───────────────────────────────────┘   │
│                              │                                        │
│                              ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Generation Service                         │   │
│  │                                                               │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌────────────────┐    │   │
│  │  │ Claude API  │    │ FHIR        │    │ Template       │    │   │
│  │  │ (Prompt →   │    │ Validator   │    │ Engine         │    │   │
│  │  │  Code)      │    │ (HAPI/lib)  │    │ (Handlebars)   │    │   │
│  │  └─────────────┘    └─────────────┘    └────────────────┘    │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                        │
│                              ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Deployment Targets                         │   │
│  │                                                               │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌────────────────┐    │   │
│  │  │ GitHub      │    │ Vercel      │    │ Medplum        │    │   │
│  │  │ (repo)      │    │ (frontend)  │    │ (FHIR server)  │    │   │
│  │  └─────────────┘    └─────────────┘    └────────────────┘    │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Part 4: v0 Implementation Plan (Claude Code Executable)

### Sprint 0: Foundation (2-3 days)

#### Task 0.1: Database Schema Updates

```prisma
// Add to prisma/schema.prisma

model GeneratedApp {
  id              String   @id @default(cuid())

  // Link to marketplace
  appId           String?  @unique
  app             App?     @relation(fields: [appId], references: [id])

  // Generation input
  prompt          String   @db.Text
  userId          String
  user            User     @relation(fields: [userId], references: [id])

  // Generation output
  status          GenerationStatus @default(PENDING)
  fhirResources   String[]  // ["Patient", "MedicationRequest", "MedicationStatement"]
  generatedCode   Json?     // Stored code snippets

  // Deployment
  githubRepoUrl   String?
  sandboxUrl      String?
  medplumProjectId String?

  // Errors
  errorMessage    String?  @db.Text

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum GenerationStatus {
  PENDING
  ANALYZING
  GENERATING
  DEPLOYING
  COMPLETED
  FAILED
}
```

#### Task 0.2: FHIR Resource Mapping

```typescript
// src/lib/openclaw/fhir-resources.ts

export const FHIR_USE_CASES = {
  "medication": {
    keywords: ["medication", "prescription", "drug", "dose", "pill", "medicine", "pharmacy"],
    resources: ["MedicationRequest", "MedicationStatement", "Medication"],
    description: "Track prescriptions and medication adherence"
  },
  "appointments": {
    keywords: ["appointment", "schedule", "booking", "visit", "calendar"],
    resources: ["Appointment", "Schedule", "Slot", "Patient"],
    description: "Manage patient appointments"
  },
  "lab-results": {
    keywords: ["lab", "test", "result", "blood", "diagnostic", "observation"],
    resources: ["Observation", "DiagnosticReport", "Specimen"],
    description: "View and track laboratory results"
  },
  "conditions": {
    keywords: ["condition", "diagnosis", "disease", "problem", "health issue"],
    resources: ["Condition", "Patient"],
    description: "Track patient health conditions"
  },
  "care-team": {
    keywords: ["care team", "provider", "doctor", "nurse", "caregiver"],
    resources: ["CareTeam", "Practitioner", "PractitionerRole", "Organization"],
    description: "Manage care team members"
  },
  "immunization": {
    keywords: ["vaccine", "immunization", "shot", "vaccination"],
    resources: ["Immunization", "ImmunizationRecommendation"],
    description: "Track immunization records"
  },
  "vitals": {
    keywords: ["vital", "blood pressure", "heart rate", "temperature", "weight", "height"],
    resources: ["Observation"],
    description: "Record and view vital signs"
  },
  "allergies": {
    keywords: ["allergy", "allergies", "reaction", "intolerance"],
    resources: ["AllergyIntolerance"],
    description: "Track patient allergies"
  }
} as const;

export function detectFhirResources(prompt: string): string[] {
  const lowercasePrompt = prompt.toLowerCase();
  const detectedResources = new Set<string>();

  // Always include Patient
  detectedResources.add("Patient");

  for (const [useCase, config] of Object.entries(FHIR_USE_CASES)) {
    for (const keyword of config.keywords) {
      if (lowercasePrompt.includes(keyword)) {
        config.resources.forEach(r => detectedResources.add(r));
        break;
      }
    }
  }

  return Array.from(detectedResources);
}
```

### Sprint 1: Generation Engine (3-4 days)

#### Task 1.1: API Route for Generation

```typescript
// src/app/api/openclaw/generate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectFhirResources } from "@/lib/openclaw/fhir-resources";
import { generateAppCode } from "@/lib/openclaw/generator";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt } = await request.json();

  if (!prompt || prompt.length < 20) {
    return NextResponse.json(
      { error: "Please provide a more detailed app description (at least 20 characters)" },
      { status: 400 }
    );
  }

  // Create generation record
  const generatedApp = await prisma.generatedApp.create({
    data: {
      prompt,
      userId: session.user.id,
      status: "ANALYZING",
      fhirResources: detectFhirResources(prompt)
    }
  });

  // Start async generation (don't await)
  generateAppCode(generatedApp.id).catch(console.error);

  return NextResponse.json({
    id: generatedApp.id,
    status: generatedApp.status,
    fhirResources: generatedApp.fhirResources
  });
}
```

#### Task 1.2: Code Generation with Claude

```typescript
// src/lib/openclaw/generator.ts

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { FHIR_COMPONENT_TEMPLATES } from "./templates";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

export async function generateAppCode(generatedAppId: string) {
  const generatedApp = await prisma.generatedApp.findUnique({
    where: { id: generatedAppId }
  });

  if (!generatedApp) throw new Error("Generated app not found");

  try {
    await prisma.generatedApp.update({
      where: { id: generatedAppId },
      data: { status: "GENERATING" }
    });

    const systemPrompt = `You are an expert FHIR healthcare application developer.
You generate React components and API routes for Next.js apps using Medplum.

FHIR Resources to use: ${generatedApp.fhirResources.join(", ")}

Guidelines:
1. Use @medplum/react components where possible
2. Use TypeScript with proper FHIR types from @medplum/fhirtypes
3. Handle loading and error states
4. Use Tailwind CSS for styling
5. Include proper FHIR resource validation

Output JSON with this structure:
{
  "appName": "kebab-case-name",
  "description": "One sentence description",
  "components": [
    { "name": "ComponentName", "path": "src/components/ComponentName.tsx", "code": "..." }
  ],
  "pages": [
    { "name": "page", "path": "src/app/page.tsx", "code": "..." }
  ],
  "apiRoutes": [
    { "name": "route", "path": "src/app/api/fhir/[resource]/route.ts", "code": "..." }
  ]
}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Generate a FHIR healthcare application based on this description:\n\n${generatedApp.prompt}\n\nReturn only valid JSON.`
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    // Parse and validate JSON
    const generatedCode = JSON.parse(content.text);

    await prisma.generatedApp.update({
      where: { id: generatedAppId },
      data: {
        status: "DEPLOYING",
        generatedCode
      }
    });

    // Deploy to sandbox (next step)
    await deployToSandbox(generatedAppId, generatedCode);

  } catch (error) {
    await prisma.generatedApp.update({
      where: { id: generatedAppId },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error"
      }
    });
  }
}
```

#### Task 1.3: Status Polling API

```typescript
// src/app/api/openclaw/status/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const generatedApp = await prisma.generatedApp.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      status: true,
      fhirResources: true,
      sandboxUrl: true,
      githubRepoUrl: true,
      errorMessage: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!generatedApp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(generatedApp);
}
```

### Sprint 2: Frontend UI (2-3 days)

#### Task 2.1: OpenClaw Page

```typescript
// src/app/openclaw/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, CheckCircle, AlertCircle } from "lucide-react";

const EXAMPLE_PROMPTS = [
  "Build a medication reminder app that shows patients their prescriptions and lets them mark doses as taken",
  "Create an appointment scheduling app for a small clinic with patient and provider views",
  "Build a lab results viewer that shows trends over time with charts"
];

export default function OpenClawPage() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "success" | "error">("idle");
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!prompt.trim()) return;

    setStatus("generating");
    setError(null);

    try {
      const response = await fetch("/api/openclaw/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Generation failed");
      }

      const data = await response.json();
      setGenerationId(data.id);

      // Poll for status
      pollStatus(data.id);

    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async function pollStatus(id: string) {
    const poll = async () => {
      const response = await fetch(`/api/openclaw/status/${id}`);
      const data = await response.json();

      if (data.status === "COMPLETED") {
        setStatus("success");
        setResult(data);
      } else if (data.status === "FAILED") {
        setStatus("error");
        setError(data.errorMessage || "Generation failed");
      } else {
        // Keep polling
        setTimeout(poll, 2000);
      }
    };

    poll();
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">
          <Sparkles className="inline mr-2" />
          OpenClaw
        </h1>
        <p className="text-xl text-muted-foreground">
          Describe your healthcare app idea and we'll build it for you
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What do you want to build?</CardTitle>
          <CardDescription>
            Describe your FHIR healthcare application in plain English
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Build a medication reminder app that..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="mb-4"
          />

          <div className="flex gap-2 mb-4 flex-wrap">
            {EXAMPLE_PROMPTS.map((example, i) => (
              <Badge
                key={i}
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => setPrompt(example)}
              >
                {example.slice(0, 40)}...
              </Badge>
            ))}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={status === "generating" || !prompt.trim()}
            className="w-full"
          >
            {status === "generating" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating your app...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate App
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Status display */}
      {status === "success" && result && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="text-green-600">
              <CheckCircle className="inline mr-2" />
              App Generated Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>FHIR Resources:</strong>
                <div className="flex gap-2 mt-2">
                  {result.fhirResources?.map((r: string) => (
                    <Badge key={r}>{r}</Badge>
                  ))}
                </div>
              </div>

              {result.sandboxUrl && (
                <div>
                  <strong>Sandbox URL:</strong>
                  <a href={result.sandboxUrl} className="text-blue-600 ml-2" target="_blank">
                    {result.sandboxUrl}
                  </a>
                </div>
              )}

              {result.githubRepoUrl && (
                <div>
                  <strong>GitHub Repo:</strong>
                  <a href={result.githubRepoUrl} className="text-blue-600 ml-2" target="_blank">
                    {result.githubRepoUrl}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {status === "error" && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">
              <AlertCircle className="inline mr-2" />
              Generation Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### Sprint 3: Deployment Pipeline (3-4 days)

#### Task 3.1: Sandbox Deployment

```typescript
// src/lib/openclaw/deploy.ts

import { Octokit } from "@octokit/rest";
import { MedplumClient } from "@medplum/core";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function deployToSandbox(
  generatedAppId: string,
  generatedCode: GeneratedCode
) {
  // 1. Create GitHub repository
  const repo = await createGitHubRepo(generatedCode.appName);

  // 2. Push generated code to repo
  await pushCodeToRepo(repo.full_name, generatedCode);

  // 3. Create Medplum project with synthetic data
  const medplumProject = await createMedplumSandbox(generatedCode.appName);

  // 4. Deploy to Vercel (or alternative)
  const deploymentUrl = await deployToVercel(repo.full_name);

  // 5. Update database record
  await prisma.generatedApp.update({
    where: { id: generatedAppId },
    data: {
      status: "COMPLETED",
      githubRepoUrl: repo.html_url,
      sandboxUrl: deploymentUrl,
      medplumProjectId: medplumProject.id
    }
  });

  // 6. Create marketplace listing
  await createMarketplaceListing(generatedAppId);
}

async function createGitHubRepo(appName: string) {
  const { data: repo } = await octokit.repos.createForAuthenticatedUser({
    name: `openclaw-${appName}`,
    description: "Generated by OpenClaw - AI-powered FHIR app builder",
    private: false,
    auto_init: true
  });

  return repo;
}

async function createMedplumSandbox(appName: string) {
  const medplum = new MedplumClient({
    baseUrl: process.env.MEDPLUM_BASE_URL!,
    clientId: process.env.MEDPLUM_CLIENT_ID!,
    clientSecret: process.env.MEDPLUM_CLIENT_SECRET!
  });

  await medplum.startClientLogin(
    process.env.MEDPLUM_CLIENT_ID!,
    process.env.MEDPLUM_CLIENT_SECRET!
  );

  // Create project and add synthetic patients
  // (Medplum API for project creation)

  return { id: "project-id" };
}
```

---

## Part 5: Deployment Strategy Comparison

### Option 1: Vercel + Medplum Cloud (Recommended for v0)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Vercel + Medplum Cloud                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐         ┌─────────────────────────────────┐    │
│  │  Vercel         │         │  Medplum Cloud                  │    │
│  │  (Frontend +    │◀───────▶│  (FHIR Server)                  │    │
│  │   API Routes)   │         │                                  │    │
│  │                 │         │  • Managed infrastructure        │    │
│  │  • Auto-deploy  │         │  • Free tier for sandbox         │    │
│  │  • Edge network │         │  • SOC 2 Type II                 │    │
│  │  • HIPAA BAA    │         │  • HIPAA compliant               │    │
│  │    (Pro plan)   │         │                                  │    │
│  └─────────────────┘         └─────────────────────────────────┘    │
│                                                                      │
│  Pros:                                                              │
│  ✅ Fastest time to deploy                                          │
│  ✅ No infrastructure management                                    │
│  ✅ HIPAA BAA available on Vercel Pro                               │
│  ✅ Medplum handles FHIR complexity                                 │
│  ✅ Free tiers for both (good for MVP)                              │
│                                                                      │
│  Cons:                                                              │
│  ⚠️ Limited control over FHIR server                                │
│  ⚠️ Medplum Cloud free tier has limits                              │
│  ⚠️ Vendor lock-in                                                  │
│                                                                      │
│  Cost: ~$20/mo (Vercel Pro) + Medplum usage                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Option 2: Docker + Self-Hosted Medplum (For Control)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Docker + Self-Hosted Medplum                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    Docker Compose Stack                          ││
│  │                                                                  ││
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ ││
│  │  │ Next.js  │  │ Medplum      │  │ PostgreSQL   │  │ Redis    │ ││
│  │  │ App      │  │ Server       │  │              │  │          │ ││
│  │  │ :3000    │  │ :8103        │  │ :5432        │  │ :6379    │ ││
│  │  └──────────┘  └──────────────┘  └──────────────┘  └──────────┘ ││
│  │                                                                  ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  Deployment Options:                                                │
│  • Railway.app ($5/mo starter)                                      │
│  • Render.com ($7/mo starter)                                       │
│  • Fly.io ($5/mo starter)                                           │
│  • DigitalOcean App Platform ($12/mo)                               │
│  • AWS ECS / GCP Cloud Run (variable)                               │
│                                                                      │
│  Pros:                                                              │
│  ✅ Full control over infrastructure                                │
│  ✅ Can customize Medplum server                                    │
│  ✅ Multi-cloud/hybrid options                                      │
│  ✅ Better for enterprise/on-prem                                   │
│                                                                      │
│  Cons:                                                              │
│  ⚠️ More DevOps overhead                                            │
│  ⚠️ Need to manage backups, monitoring                              │
│  ⚠️ HIPAA compliance is your responsibility                         │
│  ⚠️ Medplum 4.0 Docker issues (fixed in 4.1)                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Option 3: Hybrid (Best of Both)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Hybrid Architecture                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  DEVELOPMENT/SANDBOX                    PRODUCTION                   │
│  ─────────────────────                  ────────────                 │
│                                                                      │
│  ┌─────────────────────┐               ┌─────────────────────┐      │
│  │ Docker Compose      │               │ Vercel              │      │
│  │ (Local Development) │               │ (Frontend)          │      │
│  │                     │               │                     │      │
│  │ • Medplum Server    │               │ + HIPAA BAA         │      │
│  │ • PostgreSQL        │               │ + Edge Network      │      │
│  │ • Next.js           │               │                     │      │
│  │ • Hot reload        │               └──────────┬──────────┘      │
│  └─────────────────────┘                          │                  │
│                                                   ▼                  │
│                                        ┌─────────────────────┐      │
│  ┌─────────────────────┐               │ Medplum Cloud       │      │
│  │ SMART Dev Sandbox   │               │ (FHIR Server)       │      │
│  │ (Testing OAuth)     │               │                     │      │
│  │                     │               │ OR                  │      │
│  │ github.com/smart-on-│               │                     │      │
│  │ fhir/smart-dev-     │               │ Self-hosted on      │      │
│  │ sandbox             │               │ AWS/GCP/Azure       │      │
│  └─────────────────────┘               └─────────────────────┘      │
│                                                                      │
│  This is the recommended approach:                                  │
│  • Docker for local dev (fast iteration)                            │
│  • Vercel for frontend (easy deploys, HIPAA-ready)                  │
│  • Medplum Cloud for MVP, self-host when scaling                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Deployment Recommendation Matrix

| Criteria | Vercel + Medplum Cloud | Docker Self-Hosted | Hybrid |
|----------|------------------------|-------------------|--------|
| **Time to deploy** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Cost (MVP)** | ⭐⭐⭐⭐ ($20/mo) | ⭐⭐⭐ ($50/mo) | ⭐⭐⭐⭐ ($20/mo) |
| **HIPAA ready** | ⭐⭐⭐⭐ (BAA avail) | ⭐⭐ (DIY) | ⭐⭐⭐⭐ |
| **Control** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Scalability** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **DevOps burden** | ⭐⭐⭐⭐⭐ (none) | ⭐⭐ (high) | ⭐⭐⭐ |

**v0 Recommendation: Hybrid**
- Local development: Docker Compose with Medplum
- Generated app sandbox: Vercel + Medplum Cloud
- FHIRBuilders platform: Vercel + existing setup

---

## Part 6: Docker Compose for Local Development

```yaml
# docker-compose.yml (for OpenClaw local development)
version: '3.8'

services:
  # Next.js application
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/fhirbuilders
      - MEDPLUM_BASE_URL=http://medplum:8103
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db
      - medplum
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev

  # PostgreSQL for FHIRBuilders
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: fhirbuilders
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  # Medplum FHIR Server
  medplum:
    image: medplum/medplum-server:4.0
    ports:
      - "8103:8103"
    environment:
      - NODE_ENV=development
      - PORT=8103
      - DATABASE_URL=postgresql://postgres:postgres@medplum-db:5432/medplum
      - REDIS_URL=redis://redis:6379
    depends_on:
      - medplum-db
      - redis

  # PostgreSQL for Medplum
  medplum-db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: medplum
    volumes:
      - medplum-pgdata:/var/lib/postgresql/data

  # Redis for Medplum
  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  pgdata:
  medplum-pgdata:
```

---

## Part 7: v0 Test Plan

### Manual Testing Checklist

```markdown
## v0 Acceptance Criteria

### Generation Flow
- [ ] User can enter app description
- [ ] System detects relevant FHIR resources
- [ ] Claude generates valid TypeScript/React code
- [ ] Status updates in real-time

### Code Quality
- [ ] Generated code compiles without errors
- [ ] Generated code uses correct Medplum SDK methods
- [ ] FHIR resources are valid (test with HAPI validator)
- [ ] UI components render correctly

### Deployment
- [ ] GitHub repo is created successfully
- [ ] Code is pushed to repo
- [ ] Vercel deployment succeeds
- [ ] Medplum sandbox has synthetic data

### Integration
- [ ] Generated app connects to Medplum
- [ ] FHIR queries return data
- [ ] App is listed on FHIRBuilders marketplace

### Error Handling
- [ ] Invalid prompts show helpful errors
- [ ] API failures are handled gracefully
- [ ] Status polling handles timeouts
```

### Automated Tests

```typescript
// tests/openclaw/generation.test.ts

import { detectFhirResources } from "@/lib/openclaw/fhir-resources";

describe("FHIR Resource Detection", () => {
  test("detects medication resources", () => {
    const resources = detectFhirResources(
      "Build a medication reminder app"
    );
    expect(resources).toContain("MedicationRequest");
    expect(resources).toContain("MedicationStatement");
    expect(resources).toContain("Patient");
  });

  test("detects appointment resources", () => {
    const resources = detectFhirResources(
      "Create an appointment scheduling system"
    );
    expect(resources).toContain("Appointment");
    expect(resources).toContain("Schedule");
  });

  test("always includes Patient", () => {
    const resources = detectFhirResources("Build something");
    expect(resources).toContain("Patient");
  });
});
```

---

## Part 8: Risk Mitigation for v0

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Claude generates invalid FHIR | High | High | Add FHIR validator before deployment |
| Medplum API changes | Medium | Medium | Pin to specific version, test regularly |
| Vercel deployment fails | Low | Medium | Have fallback to Netlify/Railway |
| Rate limiting on Claude API | Medium | Low | Implement queue with retries |
| GitHub repo creation fails | Low | Low | Manual fallback, notify user |
| Generated code has security issues | Medium | High | Add basic security scanning |

---

## Part 9: Success Criteria for v0 Launch

### Minimum Viable v0

1. **3 successful generations** from different prompts
2. **1 deployed sandbox** that actually works
3. **1 marketplace listing** visible to users
4. **0 critical security issues** in generated code

### Stretch Goals

1. 10 different app types supported
2. Automatic Synthea data loading
3. Basic SMART on FHIR launch template
4. User can iterate on generated app

---

## Sources

- [Medplum Docker Deployment](https://www.medplum.com/docs/self-hosting/running-full-medplum-stack-in-docker)
- [Medplum Self-Hosting Guide](https://www.medplum.com/docs/self-hosting)
- [Vercel HIPAA Compliance](https://vercel.com/blog/vercel-supports-hipaa-compliance)
- [Vercel HIPAA Guide](https://vercel.com/kb/guide/hipaa-compliance-guide-vercel)
- [SMART on FHIR Documentation](https://docs.smarthealthit.org/)
- [SMART Dev Sandbox](https://github.com/smart-on-fhir/smart-dev-sandbox)
- [SMART on FHIR Best Practices](https://edenlab.io/blog/smart-on-fhir-app-integration-tips)
