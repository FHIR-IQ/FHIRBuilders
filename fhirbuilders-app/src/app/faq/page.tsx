"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Code2,
  HelpCircle,
  Lightbulb,
  Terminal,
  Wand2,
  Zap,
  FileJson,
  Stethoscope,
  Activity,
  CheckCircle,
  ExternalLink,
  Copy,
} from "lucide-react";
import { useState } from "react";

// FAQ Categories with questions and answers
const FAQ_CATEGORIES = [
  {
    id: "general",
    title: "General",
    icon: HelpCircle,
    description: "What is the FHIR Developer Skill and how does it work?",
    questions: [
      {
        q: "What is the FHIR Developer Agent Skill?",
        a: `The FHIR Developer Agent Skill is an official Claude Code plugin that provides specialized knowledge of the HL7 FHIR R4 standard for healthcare data exchange. It equips Claude with expertise in:

• **Resource structures** - Required vs optional fields (cardinality rules) for Patient, Observation, Condition, MedicationRequest, Encounter, and more
• **Coding systems** - LOINC, SNOMED CT, RxNorm, ICD-10 with correct system URIs
• **RESTful API patterns** - Proper HTTP status codes, search parameters, pagination
• **Validation patterns** - OperationOutcome error responses, value set bindings

This skill transforms Claude into a FHIR-aware assistant that generates compliant healthcare code.`,
      },
      {
        q: "Who is the FHIR Developer Skill for?",
        a: `The skill is designed for:

• **Healthcare software developers** building FHIR-compliant REST APIs
• **Integration engineers** converting healthcare data to FHIR format
• **Clinical informaticists** implementing data validation
• **Startup teams** building health apps without deep FHIR expertise

If you're working with electronic health records, patient portals, clinical decision support, or any healthcare data exchange, this skill accelerates your development.`,
      },
      {
        q: "Is the FHIR Developer Skill free?",
        a: `The skill itself is free to install. You need:

1. **Claude Code CLI** - The official Anthropic CLI tool
2. **Claude Pro, Max, or API access** - For the underlying Claude model
3. **Plugin access** - Currently available through Claude Code's plugin system

Installation is done via two simple commands in Claude Code.`,
      },
    ],
  },
  {
    id: "installation",
    title: "Installation",
    icon: Terminal,
    description: "How to install and configure the skill",
    questions: [
      {
        q: "How do I install the FHIR Developer Skill?",
        a: `**Step 1: Install Claude Code CLI**

For Windows PowerShell:
\`\`\`powershell
irm https://claude.ai/install.ps1 | iex
\`\`\`

For macOS/Linux:
\`\`\`bash
curl -fsSL https://claude.ai/install.sh | bash
\`\`\`

**Step 2: Install the FHIR Skill**

Open Claude Code and run:
\`\`\`
/plugin marketplace add anthropics/healthcare
/plugin install fhir-developer@healthcare
\`\`\`

That's it! The skill is now available in all future Claude Code sessions.`,
      },
      {
        q: "How do I verify the skill is installed?",
        a: `After installation, start a new Claude Code session and look for the skill in the system context. You can also test it by asking a FHIR-specific question:

\`\`\`
What are the required fields for a FHIR R4 MedicationRequest?
\`\`\`

Claude should respond with authoritative information:
- status (required)
- intent (required)
- medication[x] (required)
- subject (required)

If you get generic information instead of specific R4 requirements, the skill may not be active.`,
      },
      {
        q: "Does the skill work in VS Code?",
        a: `Yes! The FHIR Developer Skill works in both:

• **Claude Code CLI** - Terminal-based interface
• **Claude Code VS Code Extension** - Integrated IDE experience

Once installed via the CLI, the skill is available in both environments. Just start a new session after installation.`,
      },
    ],
  },
  {
    id: "usage",
    title: "Usage & Examples",
    icon: Code2,
    description: "Practical examples and demos",
    questions: [
      {
        q: "How do I use the skill to create a FHIR API endpoint?",
        a: `Ask Claude to generate a FHIR-compliant endpoint. The skill provides the correct patterns automatically.

**Example prompt:**
\`\`\`
Create a POST /Patient endpoint in Express.js that validates required fields and returns proper FHIR error responses.
\`\`\`

**Claude will generate code with:**
• Proper resourceType validation
• OperationOutcome for errors
• HTTP 422 for validation failures (not 400)
• Correct Content-Type headers (application/fhir+json)

The skill ensures generated code follows FHIR R4 conventions, not generic REST patterns.`,
      },
      {
        q: "Can you show a medication reconciliation example?",
        a: `Here's how to use the skill for medication conflict detection:

**Prompt:**
\`\`\`
Generate TypeScript code that checks a list of MedicationRequest resources for duplicate statin therapy using RxNorm codes.
\`\`\`

**The skill knows:**
• MedicationRequest.medicationCodeableConcept structure
• RxNorm system URI: http://www.nlm.nih.gov/research/umls/rxnorm
• Common statin RxNorm codes (atorvastatin, simvastatin, etc.)
• FHIR DetectedIssue resource for conflicts

This produces clinically-aware code, not just string matching on drug names.`,
      },
      {
        q: "What LOINC codes does the skill know?",
        a: `The skill has knowledge of common LOINC codes for:

**Vital Signs:**
• 8867-4 - Heart Rate
• 8480-6 - Systolic Blood Pressure
• 8462-4 - Diastolic Blood Pressure
• 55284-4 - Blood Pressure Panel
• 8310-5 - Body Temperature
• 2708-6 - Oxygen Saturation (SpO2)
• 29463-7 - Body Weight
• 8302-2 - Body Height

**Lab Results:**
• 4548-4 - Hemoglobin A1c (HbA1c)
• 2089-1 - LDL Cholesterol
• 2345-7 - Glucose
• 33914-3 - eGFR

Ask Claude to look up any LOINC code and it will provide the correct system URI and usage context.`,
      },
      {
        q: "How does the skill help with FHIR validation?",
        a: `The skill knows the correct validation patterns:

**Required Fields by Resource:**
• Patient: None required (all optional)
• Observation: status, code
• Condition: subject
• MedicationRequest: status, intent, medication[x], subject
• Encounter: status, class (Coding, not CodeableConcept!)

**Value Sets:**
• MedicationRequest.status: active | on-hold | cancelled | completed | entered-in-error | stopped | draft | unknown
• Observation.status: registered | preliminary | final | amended | corrected | cancelled | entered-in-error | unknown

**Error Responses:**
• HTTP 422 for validation errors (missing required fields, invalid enums)
• HTTP 412 for ETag mismatch
• OperationOutcome with severity, code, and diagnostics`,
      },
    ],
  },
  {
    id: "technical",
    title: "Technical Details",
    icon: FileJson,
    description: "Deep dive into FHIR R4 specifics",
    questions: [
      {
        q: "What FHIR resources does the skill cover?",
        a: `The skill has deep knowledge of core clinical resources:

**Administrative:**
• Patient, Practitioner, PractitionerRole, Organization
• Encounter, Appointment, Schedule, Slot

**Clinical:**
• Observation, Condition, Procedure
• MedicationRequest, MedicationStatement, Medication
• AllergyIntolerance, Immunization

**Diagnostics:**
• DiagnosticReport, Specimen

**Documents:**
• DocumentReference, Bundle

For each resource, the skill knows required fields, value set bindings, search parameters, and common implementation patterns.`,
      },
      {
        q: "What coding systems does the skill support?",
        a: `The skill knows authoritative URIs for major coding systems:

| System | URI |
|--------|-----|
| LOINC | http://loinc.org |
| SNOMED CT | http://snomed.info/sct |
| RxNorm | http://www.nlm.nih.gov/research/umls/rxnorm |
| ICD-10 | http://hl7.org/fhir/sid/icd-10 |
| UCUM (units) | http://unitsofmeasure.org |
| Condition Clinical | http://terminology.hl7.org/CodeSystem/condition-clinical |
| Observation Category | http://terminology.hl7.org/CodeSystem/observation-category |
| v3-ActCode | http://terminology.hl7.org/CodeSystem/v3-ActCode |

These URIs are critical for interoperability - using the wrong URI breaks data exchange.`,
      },
      {
        q: "Does the skill support SMART on FHIR?",
        a: `Yes! The skill covers SMART on FHIR authorization:

**OAuth Scopes:**
• patient/*.read - Read all resources for a patient
• patient/Observation.read - Read observations only
• user/*.* - All access for a user
• system/*.read - Backend service read access

**Authorization Flows:**
• Standalone launch
• EHR launch
• Backend services (client credentials)

**Common Patterns:**
• Access token validation
• Scope enforcement in API routes
• Refresh token handling

Ask Claude about SMART scopes and it will provide v1 and v2 syntax with proper formatting.`,
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: Lightbulb,
    description: "Common issues and solutions",
    questions: [
      {
        q: "The skill doesn't seem to be active. What should I check?",
        a: `Try these steps:

1. **Verify installation:**
   Run \`/plugin list\` in Claude Code to see installed plugins

2. **Start a new session:**
   The skill activates at session start, not mid-conversation

3. **Check the prompt:**
   Skills activate for relevant queries. Ask something FHIR-specific:
   "What's the difference between Encounter.class and Encounter.type?"

4. **Re-install if needed:**
   \`\`\`
   /plugin uninstall fhir-developer@healthcare
   /plugin install fhir-developer@healthcare
   \`\`\`

5. **Update Claude Code:**
   Run \`claude update\` to ensure you have the latest version`,
      },
      {
        q: "Claude generated code with the wrong HTTP status code. Why?",
        a: `This is a common issue the skill specifically addresses:

**Common mistakes:**
• Using 400 for validation errors → Should be **422 Unprocessable Entity**
• Using 400 for ETag mismatch → Should be **412 Precondition Failed**
• Using 404 for deleted resources → Could be 410 Gone in some cases

**With the skill active, Claude knows:**
| Situation | Correct Status |
|-----------|----------------|
| Malformed JSON | 400 Bad Request |
| Missing required field | 422 Unprocessable Entity |
| Invalid enum value | 422 Unprocessable Entity |
| If-Match ETag mismatch | 412 Precondition Failed |
| Resource not found | 404 Not Found |
| Successful create | 201 Created + Location header |

If you're still getting wrong codes, double-check the skill is active and rephrase your question to explicitly mention "FHIR R4 compliant".`,
      },
      {
        q: "The generated code uses CodeableConcept for Encounter.class. Is that wrong?",
        a: `Yes, that's a common mistake the skill catches!

**Encounter.class uses Coding directly, NOT CodeableConcept:**

❌ Wrong:
\`\`\`json
"class": {
  "coding": [{"system": "...", "code": "AMB"}]
}
\`\`\`

✅ Correct:
\`\`\`json
"class": {
  "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
  "code": "AMB"
}
\`\`\`

This is one of the subtle FHIR R4 details that the skill knows. If Claude generates the wrong pattern, it may be using generic patterns - try being more explicit: "Generate an Encounter resource with the correct class structure (Coding, not CodeableConcept)".`,
      },
    ],
  },
];

// Sample demo code snippets
const DEMO_SNIPPETS = [
  {
    title: "Validate MedicationRequest",
    language: "typescript",
    code: `import { MedicationRequest } from '@medplum/fhirtypes';

// FHIR R4 required fields for MedicationRequest
const REQUIRED_FIELDS = ['status', 'intent', 'subject'];
const VALID_STATUS = ['active', 'on-hold', 'cancelled', 'completed',
  'entered-in-error', 'stopped', 'draft', 'unknown'];
const VALID_INTENT = ['proposal', 'plan', 'order', 'original-order',
  'reflex-order', 'filler-order', 'instance-order', 'option'];

function validateMedicationRequest(med: Partial<MedicationRequest>) {
  const errors: string[] = [];

  // Check required fields
  if (!med.status) errors.push('status is required');
  if (!med.intent) errors.push('intent is required');
  if (!med.subject) errors.push('subject is required');
  if (!med.medicationCodeableConcept && !med.medicationReference) {
    errors.push('medication[x] is required');
  }

  // Validate value sets
  if (med.status && !VALID_STATUS.includes(med.status)) {
    errors.push(\`Invalid status: \${med.status}\`);
  }
  if (med.intent && !VALID_INTENT.includes(med.intent)) {
    errors.push(\`Invalid intent: \${med.intent}\`);
  }

  return { valid: errors.length === 0, errors };
}`,
  },
  {
    title: "Create Observation with LOINC",
    language: "typescript",
    code: `import { Observation } from '@medplum/fhirtypes';

// Blood pressure observation with proper LOINC coding
const bloodPressure: Observation = {
  resourceType: 'Observation',
  status: 'final', // required
  code: { // required
    coding: [{
      system: 'http://loinc.org',
      code: '55284-4',
      display: 'Blood pressure systolic and diastolic'
    }]
  },
  subject: {
    reference: 'Patient/123'
  },
  effectiveDateTime: new Date().toISOString(),
  component: [
    {
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: '8480-6',
          display: 'Systolic blood pressure'
        }]
      },
      valueQuantity: {
        value: 120,
        unit: 'mmHg',
        system: 'http://unitsofmeasure.org',
        code: 'mm[Hg]'
      }
    },
    {
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: '8462-4',
          display: 'Diastolic blood pressure'
        }]
      },
      valueQuantity: {
        value: 80,
        unit: 'mmHg',
        system: 'http://unitsofmeasure.org',
        code: 'mm[Hg]'
      }
    }
  ]
};`,
  },
  {
    title: "OperationOutcome Error Response",
    language: "typescript",
    code: `import { OperationOutcome } from '@medplum/fhirtypes';
import { NextResponse } from 'next/server';

function operationOutcome(
  severity: 'error' | 'warning' | 'information',
  code: string,
  diagnostics: string
): OperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    issue: [{
      severity,
      code,
      diagnostics
    }]
  };
}

// Usage in API route
export async function POST(req: Request) {
  const body = await req.json();

  // Validation error → 422 (not 400!)
  if (!body.status) {
    return NextResponse.json(
      operationOutcome('error', 'required', 'MedicationRequest.status is required'),
      {
        status: 422,
        headers: { 'Content-Type': 'application/fhir+json' }
      }
    );
  }

  // Invalid enum → 422
  if (!['active', 'completed'].includes(body.status)) {
    return NextResponse.json(
      operationOutcome('error', 'value', \`Invalid status: \${body.status}\`),
      { status: 422 }
    );
  }

  // Success → 201 with Location header
  const created = await createResource(body);
  return NextResponse.json(created, {
    status: 201,
    headers: {
      'Location': \`/MedicationRequest/\${created.id}\`,
      'ETag': \`W/"\${created.meta?.versionId}"\`
    }
  });
}`,
  },
];

export default function FAQPage() {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = async (code: string, title: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedSnippet(title);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        {/* Back Link */}
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Learn
        </Link>

        {/* Header */}
        <div className="mb-12">
          <Badge className="mb-4" variant="secondary">
            <Wand2 className="h-3 w-3 mr-1" />
            Claude Code Plugin
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            FHIR Developer Skill FAQ
          </h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about the FHIR Developer Agent Skill for Claude Code.
            Build FHIR-compliant healthcare applications faster with AI assistance.
          </p>
        </div>

        {/* Quick Install Section */}
        <Card className="mb-12 border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Quick Install
            </CardTitle>
            <CardDescription>
              Get started in 30 seconds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-zinc-950 rounded-lg p-4 font-mono text-sm text-zinc-100">
              <div className="text-zinc-500 mb-2"># In Claude Code CLI</div>
              <div className="text-green-400">/plugin marketplace add anthropics/healthcare</div>
              <div className="text-green-400">/plugin install fhir-developer@healthcare</div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Requires Claude Code CLI. <Link href="https://claude.ai/code" className="text-primary hover:underline" target="_blank">Install Claude Code →</Link>
            </p>
          </CardContent>
        </Card>

        {/* FAQ Categories */}
        <div className="space-y-8 mb-12">
          {FAQ_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    {category.title}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((item, index) => (
                      <AccordionItem key={index} value={`${category.id}-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <div className="whitespace-pre-wrap text-muted-foreground">
                              {item.a.split('```').map((part, i) => {
                                if (i % 2 === 1) {
                                  // Code block - first line is language hint, rest is code
                                  const code = part.split('\n').slice(1).join('\n');
                                  return (
                                    <pre key={i} className="bg-zinc-950 rounded-lg p-4 my-3 overflow-x-auto">
                                      <code className="text-sm text-zinc-100">{code}</code>
                                    </pre>
                                  );
                                }
                                // Regular text - handle markdown-style formatting
                                return (
                                  <span key={i}>
                                    {part.split('\n').map((line, j) => {
                                      // Handle bold text
                                      const formattedLine = line.replace(
                                        /\*\*(.*?)\*\*/g,
                                        '<strong>$1</strong>'
                                      );
                                      // Handle bullet points
                                      if (line.trim().startsWith('•')) {
                                        return (
                                          <div key={j} className="ml-4" dangerouslySetInnerHTML={{ __html: formattedLine }} />
                                        );
                                      }
                                      // Handle table-like content
                                      if (line.includes('|') && !line.startsWith('|--')) {
                                        return (
                                          <div key={j} className="font-mono text-xs" dangerouslySetInnerHTML={{ __html: formattedLine }} />
                                        );
                                      }
                                      return (
                                        <span key={j}>
                                          <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
                                          {j < part.split('\n').length - 1 && <br />}
                                        </span>
                                      );
                                    })}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Demo Code Snippets */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Code2 className="h-6 w-6" />
            Sample Code Snippets
          </h2>
          <p className="text-muted-foreground mb-6">
            These examples show the patterns the FHIR Developer Skill helps generate.
            Copy and adapt for your projects.
          </p>

          <div className="space-y-6">
            {DEMO_SNIPPETS.map((snippet) => (
              <Card key={snippet.title}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{snippet.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(snippet.code, snippet.title)}
                    >
                      {copiedSnippet === snippet.title ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {snippet.language}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <pre className="bg-zinc-950 rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-zinc-100">{snippet.code}</code>
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Try It Section */}
        <Card className="mb-12 border-green-500/30 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-500" />
                  Try the Demo
                </h3>
                <p className="text-muted-foreground">
                  See FHIR R4 knowledge in action with our Medication Management demo.
                  No sign-in required.
                </p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline">
                  <Link href="/sandbox/demo?useCase=medrec">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Try Demo
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/openclaw?template=medication-tracker">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate App
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <a
                  href="https://www.hl7.org/fhir/R4/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-primary transition-colors"
                >
                  <FileJson className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-semibold flex items-center gap-1">
                      FHIR R4 Specification
                      <ExternalLink className="h-3 w-3" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Official HL7 documentation
                    </div>
                  </div>
                </a>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <a
                  href="https://www.medplum.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-primary transition-colors"
                >
                  <Activity className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-semibold flex items-center gap-1">
                      Medplum Documentation
                      <ExternalLink className="h-3 w-3" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      FHIR platform and SDK
                    </div>
                  </div>
                </a>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Link
                  href="/learn"
                  className="flex items-center gap-3 hover:text-primary transition-colors"
                >
                  <BookOpen className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-semibold">Learn FHIR Basics</div>
                    <div className="text-sm text-muted-foreground">
                      Start here if you are new to FHIR
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <a
                  href="https://claude.ai/code"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-primary transition-colors"
                >
                  <Terminal className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-semibold flex items-center gap-1">
                      Claude Code
                      <ExternalLink className="h-3 w-3" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      AI-powered development tool
                    </div>
                  </div>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Have more questions? Join our community or reach out.
          </p>
          <Button asChild>
            <Link href="/early-access">
              Join Early Access
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
