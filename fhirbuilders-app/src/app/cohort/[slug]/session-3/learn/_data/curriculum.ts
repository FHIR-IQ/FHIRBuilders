export type DocLink = { label: string; href: string };

export type Example = {
  title: string;
  lang: "bash" | "typescript" | "python" | "markdown" | "json" | "text";
  code: string;
  note?: string;
};

export type FAQ = { q: string; a: string };

export type CurriculumBlock = {
  id: string;
  n: number;
  title: string;
  objectives: [string, string];
  faq: [FAQ, FAQ, FAQ];
  examples: [Example, Example];
  tryIt: string;
  docs: DocLink[];
};

export const CURRICULUM: CurriculumBlock[] = [
  {
    id: "pick-project",
    n: 1,
    title: "Pick Your Project — Scope It Down",
    objectives: [
      "Write one sentence that describes your project: who uses it, what FHIR resource it reads, what it does with that data.",
      "Cut your first version to one screen, one resource type, one user action — and commit to shipping that by Session 4.",
    ],
    faq: [
      {
        q: "My idea is too big. How do I cut it?",
        a: "Find the smallest possible thing that would still be useful to one person. If you're building a care-coordination tool, the v0 isn't the coordination tool — it's 'show me a patient's active problems.' Ship that. Add everything else after Session 4 once the foundation is deployed.",
      },
      {
        q: "What if I don't have a project idea yet?",
        a: "Start with the FHIR resource closest to your day job. If you work in prior auth: Coverage + ClaimResponse. Home health: CarePlan + ServiceRequest. Billing: ExplanationOfBenefit. Patient-facing: Patient + Observation (vitals + labs). The resource you're most annoyed at your current vendor for mangling is usually the right starting point.",
      },
      {
        q: "Should my project use the shared Medplum sandbox or my own?",
        a: "Use the shared sandbox for speed — Michael Campbell seeded it with 100 realistic patients and US Core resources. It's already wired in the cohort MCP server config. Use your own Medplum project only if you need private data, custom bots, or SMART on FHIR app registration. For most Session 3–4 projects, the shared sandbox is the faster path.",
      },
    ],
    examples: [
      {
        title: "One-sentence project scope (before and after)",
        lang: "text",
        code: `BEFORE (too big):
"A platform that lets patients manage their health records,
 share them with providers, get AI summaries, and schedule appointments."

AFTER (shippable by Session 4):
"A Claude Code agent that reads a patient's Observation resources
 from Medplum, spots labs outside normal range, and returns a
 plain-English flag — one API call, no UI yet."

The full platform is still the goal.
The flag tool is the slice that ships Wed Jul 8.`,
      },
      {
        title: "Project decision matrix — pick your first resource",
        lang: "text",
        code: `Your domain          → Start with these FHIR resources
─────────────────────────────────────────────────────
Prior auth / claims  → Coverage, ClaimResponse, Task
Home health          → CarePlan, ServiceRequest, Goal
Patient-facing       → Patient, Observation, Condition
Provider directory   → Practitioner, PractitionerRole, InsurancePlan
EMR / notes          → DocumentReference, Composition
Scheduling           → Appointment, Slot, Schedule
Referrals            → ServiceRequest, ReferralRequest
Medications          → MedicationRequest, MedicationStatement

Rule: one resource per screen in v0.
       Two resources is a stretch. Three is scope creep.`,
      },
    ],
    tryIt:
      "Write your project's one-sentence scope in the Session 3 reflect page or Slack. Format: '[Who] can [do what] with [which FHIR resource] — ships by Jul 8.' Post it — Gene reads every one.",
    docs: [
      { label: "FHIR R4 resource list", href: "https://hl7.org/fhir/R4/resourcelist.html" },
      { label: "US Core profiles", href: "https://www.hl7.org/fhir/us/core/" },
      { label: "Medplum shared sandbox", href: "https://app.medplum.com" },
    ],
  },
  {
    id: "scaffold",
    n: 2,
    title: "Scaffold Your Repo with Claude Code",
    objectives: [
      "Create a CLAUDE.md at the root of your project repo that tells CC exactly what you're building and what stack you're using.",
      "Wire up your .env.local with Medplum credentials and verify CC can read them inside a session.",
    ],
    faq: [
      {
        q: "What goes in CLAUDE.md?",
        a: "CLAUDE.md is your project brief for CC — it reads it on every startup. Include: (1) what the project does in one paragraph, (2) the tech stack, (3) any commands CC should know (npm run dev, npx prisma db push), (4) any conventions to follow, (5) which env vars exist and what they're for. Think of it as onboarding docs for a new dev who happens to be CC.",
      },
      {
        q: "Which template should I start from for a FHIR project?",
        a: "The FHIRBuilders playground repo is the recommended starting point — it has Next.js App Router, Medplum client, Prisma, Tailwind, and auth already wired. Fork it, run `npm install`, copy `.env.example` to `.env.local`, and paste your Medplum credentials. You'll be reading live FHIR data within 10 minutes. The alternative — starting from `create-next-app` — means re-wiring Medplum yourself, which costs 2–3 hours.",
      },
      {
        q: "Do I need Prisma / a database for Session 4?",
        a: "Not necessarily. If your v0 is read-only (query FHIR, display data, run a rule), you don't need a local database at all — Medplum is the database. Add Prisma only when you need to store things that don't belong in FHIR: user preferences, session state, AI outputs that reference multiple FHIR resources. Most Session 4 demos ship without Prisma.",
      },
    ],
    examples: [
      {
        title: "CLAUDE.md starter for a FHIR project",
        lang: "markdown",
        code: `# CLAUDE.md

## Project
Lab Flag — reads a patient's Observations from Medplum, runs
reference-range checks, returns plain-English flags. No UI in v0.

## Stack
- Next.js 16 App Router, TypeScript, Tailwind CSS 4
- Medplum (@medplum/core) for FHIR R4 reads
- No database in v0 — Medplum is the source of truth

## Commands
\`\`\`
npm run dev     # start dev server (localhost:3000)
npm run build   # build for production
npm run lint    # ESLint check
\`\`\`

## Env vars (.env.local)
MEDPLUM_BASE_URL     — https://api.medplum.com/
MEDPLUM_CLIENT_ID    — from Medplum project settings
MEDPLUM_CLIENT_SECRET — from Medplum project settings

## Conventions
- API routes live in src/app/api/
- FHIR helper functions live in src/lib/fhir.ts
- Never log PHI — use patient IDs only in console output`,
      },
      {
        title: "Fork the FHIRBuilders playground and wire Medplum",
        lang: "bash",
        code: `# 1. Fork https://github.com/fhirbuilders/playground (or create-next-app)
gh repo clone your-username/playground my-fhir-project
cd my-fhir-project

# 2. Install dependencies
npm install

# 3. Set up env vars
cp .env.example .env.local
# Edit .env.local — paste your Medplum client ID + secret

# 4. Verify Medplum connection
npx tsx scripts/check-medplum.ts
# Expected: "Connected — 100 patients in sandbox"

# 5. Wire to Claude Code
# Start a CC session, ask:
# "Read one Patient resource from Medplum and show me the JSON"
# CC will use your env vars automatically`,
        note: "Medplum credentials: app.medplum.com → Project → Client Applications → your app → Client ID + Secret",
      },
    ],
    tryIt:
      "Create CLAUDE.md in your project repo using the template above. Then open a CC session and ask: 'What am I building and what is the tech stack?' CC should answer correctly from CLAUDE.md. If it doesn't, add more detail.",
    docs: [
      { label: "FHIRBuilders playground repo", href: "https://github.com/fhirbuilders/playground" },
      { label: "CLAUDE.md reference", href: "https://docs.anthropic.com/en/docs/claude-code/settings#claude-md" },
      { label: "Medplum app registration", href: "https://www.medplum.com/docs/auth/client-credentials" },
    ],
  },
  {
    id: "first-fhir-read",
    n: 3,
    title: "Your First FHIR Read in the Project",
    objectives: [
      "Write an API route that reads one FHIR resource type from Medplum using the server-side client and returns it as JSON.",
      "Display that data on a page — even just raw JSON in a `<pre>` tag counts. The discipline is: data flows from FHIR to browser.",
    ],
    faq: [
      {
        q: "Server-side or client-side Medplum client?",
        a: "Always server-side first. Your Medplum client secret must never reach the browser — put FHIR reads in API routes (`app/api/`) or Server Components. The client-side Medplum client (with PKCE / SMART on FHIR) comes later if you need patient-launched apps. For Cohort 00 projects, server-side is simpler and safer.",
      },
      {
        q: "What's the fastest way to query a specific resource type?",
        a: "Use `medplum.searchResources('Patient', { name: 'Smith' })` — it returns a typed array of Patient objects, no manual bundle parsing. Or `medplum.readResource('Observation', '123abc')` for a single resource by ID. Both are fully typed against FHIR R4. The Medplum JS client handles auth token refresh automatically.",
      },
      {
        q: "The shared sandbox has 100 patients. How do I find a good test patient?",
        a: "In the Medplum console (app.medplum.com), search for Patients and pick one with multiple Observations — those have richer data. Copy the patient ID. In your code, hard-code that ID for your first test, then add a search endpoint once the basic read works. Michael Campbell seeded the sandbox with US Core resources, so you'll find Observations, Conditions, MedicationRequests, and more.",
      },
    ],
    examples: [
      {
        title: "Next.js API route: read patient labs from Medplum",
        lang: "typescript",
        code: `// src/app/api/labs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MedplumClient } from "@medplum/core";

const medplum = new MedplumClient({ baseUrl: process.env.MEDPLUM_BASE_URL! });

async function getClient() {
  await medplum.startClientLogin(
    process.env.MEDPLUM_CLIENT_ID!,
    process.env.MEDPLUM_CLIENT_SECRET!
  );
  return medplum;
}

export async function GET(req: NextRequest) {
  const patientId = req.nextUrl.searchParams.get("patientId");
  if (!patientId) return NextResponse.json({ error: "patientId required" }, { status: 400 });

  const client = await getClient();

  // Search for all Observations for this patient
  const observations = await client.searchResources("Observation", {
    patient: patientId,
    _sort: "-date",
    _count: "50",
  });

  return NextResponse.json({ observations });
}`,
        note: "Test it: curl 'localhost:3000/api/labs?patientId=YOUR_PATIENT_ID'",
      },
      {
        title: "Display labs in a Server Component",
        lang: "typescript",
        code: `// src/app/patient/[id]/labs/page.tsx
import { MedplumClient } from "@medplum/core";

async function getLabs(patientId: string) {
  const medplum = new MedplumClient({ baseUrl: process.env.MEDPLUM_BASE_URL! });
  await medplum.startClientLogin(
    process.env.MEDPLUM_CLIENT_ID!,
    process.env.MEDPLUM_CLIENT_SECRET!
  );
  return medplum.searchResources("Observation", { patient: patientId, _sort: "-date" });
}

type Props = { params: Promise<{ id: string }> };

export default async function LabsPage({ params }: Props) {
  const { id } = await params;
  const labs = await getLabs(id);

  return (
    <div>
      <h1>Labs for patient {id}</h1>
      <pre className="text-xs">{JSON.stringify(labs, null, 2)}</pre>
    </div>
  );
}`,
        note: "Start here — a <pre> dump is fine. Replace with real UI after Session 4.",
      },
    ],
    tryIt:
      "Get one FHIR resource type displaying in your app — even raw JSON. Once it renders, ask CC: 'Now show me the top 5 abnormal values highlighted in red.' Let CC write the display logic.",
    docs: [
      { label: "Medplum JS client docs", href: "https://www.medplum.com/docs/sdk/overview" },
      { label: "FHIR R4 Observation resource", href: "https://hl7.org/fhir/R4/observation.html" },
      { label: "US Core Vital Signs", href: "https://www.hl7.org/fhir/us/core/StructureDefinition-us-core-vital-signs.html" },
    ],
  },
  {
    id: "cc-workflow",
    n: 4,
    title: "Claude Code Daily Workflow",
    objectives: [
      "Run at least one productive CC session on your project — not a tutorial, your actual repo with your actual goal.",
      "Learn when to interrupt CC (Ctrl+C), when to start a new session vs. continue, and how to write prompts that produce good code.",
    ],
    faq: [
      {
        q: "How long should a CC session be?",
        a: "One focused goal per session. 'Add the lab flag API route' is a session. 'Build the whole app' is not. When CC starts making changes across too many files without you reviewing, interrupt it (Ctrl+C), review what's happened, commit if it's good, and start a fresh session for the next thing. Context window fills up — a fresh session with a clear CLAUDE.md is often faster than a long rambling one.",
      },
      {
        q: "How do I write a good CC prompt for a FHIR feature?",
        a: "Give it: (1) what you want built, (2) which file it goes in, (3) what data it gets and where it comes from, (4) any constraints. Bad: 'Add a labs page.' Good: 'Add a Server Component at src/app/patient/[id]/labs/page.tsx that reads Observation resources from Medplum for the patient ID from the URL params, and displays them in a table with the date, test name (coding.display), value, and unit. Use the MedplumClient pattern from src/lib/medplum.ts.' Specific = less back-and-forth.",
      },
      {
        q: "CC made a change I don't want. How do I roll back?",
        a: "Commit frequently so rollback is just `git checkout HEAD~1 -- path/to/file`. If you haven't committed, `git diff` shows what changed. The nuclear option: `git stash` saves everything and puts you back to HEAD. The lesson: commit after every CC step that works, before asking it to do the next thing. That discipline makes every step reversible.",
      },
    ],
    examples: [
      {
        title: "Effective CC prompt for a FHIR feature",
        lang: "text",
        code: `# Too vague (CC will guess a lot):
"Add labs to the patient page"

# Specific (CC knows exactly what to do):
"Add a GET route at /api/patient/[id]/labs that:
1. Reads Observation resources from Medplum for the patient
2. Filters to lab results (category = laboratory)
3. Returns {date, code, display, value, unit, interpretation} for each
4. Uses the server-side MedplumClient from lib/medplum.ts

Add it to src/app/api/patient/[id]/labs/route.ts
Use the Next.js App Router route handler pattern.
Don't add UI yet — just the API endpoint."`,
      },
      {
        title: "Daily CC commit discipline",
        lang: "bash",
        code: `# Start of session: check git status
git status
git log --oneline -5  # see what CC did last session

# During session: commit after each working step
# (Don't let CC go 10 steps without a checkpoint)
git add src/app/api/labs/route.ts
git commit -m "feat: lab observations API endpoint"

# If CC breaks something: stash and restore
git stash       # save CC's work
git stash pop   # restore if you want it back

# End of session: push and check Vercel preview
git push
# Vercel auto-deploys — check the preview URL in your Vercel dashboard`,
        note: "Commit after every working step. It takes 10 seconds and makes everything reversible.",
      },
    ],
    tryIt:
      "Run a CC session with one specific goal for your project. Start it by saying: 'I'm building [your one-sentence scope]. Today I want to [one specific feature]. Here's what already exists: [paste any relevant file paths].' Commit the result.",
    docs: [
      { label: "Claude Code concepts", href: "https://docs.anthropic.com/en/docs/claude-code/overview" },
      { label: "CC keyboard shortcuts", href: "https://docs.anthropic.com/en/docs/claude-code/keyboard-shortcuts" },
      { label: "CLAUDE.md guide", href: "https://docs.anthropic.com/en/docs/claude-code/settings#claude-md" },
    ],
  },
  {
    id: "deploy",
    n: 5,
    title: "Deploy to Vercel — Your First Public URL",
    objectives: [
      "Push your project to GitHub and link it to Vercel so every push to main auto-deploys.",
      "Add your Medplum credentials as Vercel env vars so the production deployment can read FHIR data.",
    ],
    faq: [
      {
        q: "Do I need to deploy before Session 4?",
        a: "Yes. Session 4 is 'ship one real slice' — that means a working URL, not localhost. The Vercel deploy only takes 5 minutes if your repo is already on GitHub. Do it now so you're not rushing at Session 4. A broken deploy the night before is much easier to debug when you have time than during the call.",
      },
      {
        q: "How do I add MEDPLUM_CLIENT_SECRET to Vercel without committing it?",
        a: "Never put secrets in your repo. Add them in the Vercel dashboard: Project → Settings → Environment Variables. Add MEDPLUM_BASE_URL, MEDPLUM_CLIENT_ID, and MEDPLUM_CLIENT_SECRET for all three environments (Development, Preview, Production). Vercel injects them at build time and runtime — your server-side code reads them as process.env.MEDPLUM_CLIENT_SECRET exactly like .env.local in local dev.",
      },
      {
        q: "My Vercel deploy works but Medplum calls fail in production. Why?",
        a: "Three common causes: (1) Missing env var — check Vercel → Settings → Environment Variables and verify spelling. (2) Wrong variable scope — the variable is set for Development only, not Production. (3) Server vs edge runtime — Medplum's Node client doesn't run in the Edge runtime. Add `export const runtime = 'nodejs'` to any route that uses MedplumClient. Check the Vercel function logs in the dashboard for the actual error.",
      },
    ],
    examples: [
      {
        title: "Deploy to Vercel in 3 commands",
        lang: "bash",
        code: `# One-time setup: link your repo to Vercel
npm install -g vercel  # if not installed
vercel link            # follow the prompts — select your team + project name

# Push to deploy
git add .
git commit -m "feat: initial FHIR read working"
git push               # Vercel auto-deploys on every push to main

# Your preview URL appears in the Vercel dashboard
# every branch push gets a unique preview URL too`,
        note: "After the first deploy, just push to main — Vercel picks it up automatically.",
      },
      {
        title: "Fix the edge runtime issue for Medplum routes",
        lang: "typescript",
        code: `// src/app/api/labs/route.ts
// Add this if Medplum calls fail in Vercel production:
export const runtime = "nodejs";  // ← MedplumClient needs Node.js

import { NextRequest, NextResponse } from "next/server";
import { MedplumClient } from "@medplum/core";

// ... rest of your route`,
        note: "Next.js API routes default to the Edge runtime on Vercel. MedplumClient requires Node.js.",
      },
    ],
    tryIt:
      "Deploy your project to Vercel today. Paste your preview URL in #all-fhir-builders — even if it's just a page that says 'hello' or shows raw JSON. A live URL is the goal. Eugene will look at every one posted before Session 4.",
    docs: [
      { label: "Vercel deploy guide", href: "https://vercel.com/docs/deployments/overview" },
      { label: "Vercel environment variables", href: "https://vercel.com/docs/projects/environment-variables" },
      { label: "Next.js runtime config", href: "https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#runtime" },
    ],
  },
  {
    id: "session4-target",
    n: 6,
    title: "Your Session 4 Target — One Real Slice",
    objectives: [
      "Write the three-sentence scope of what you will demo at Session 4 on Jul 8: what it does, who uses it, what FHIR data it reads.",
      "Identify the one thing that must work perfectly and the two things you will explicitly leave out of the demo.",
    ],
    faq: [
      {
        q: "What does 'one real slice' mean exactly?",
        a: "One complete user action, end to end, working on real data. Not a mockup, not hardcoded JSON, not a localhost prototype. Real FHIR data in → real output out → works from a public URL. Example: 'User enters a patient ID → app reads their Observations → returns a list of out-of-range labs with their reference ranges.' That's a real slice. 'A dashboard for all lab management' is not.",
      },
      {
        q: "What if I'm not ready by Session 4?",
        a: "Reach out in Slack before Jul 8 — not after. Eugene can do a quick pair session the week before if you're stuck. Being unready is fixable; not saying anything is the only thing that doesn't work. Session 4 is mandatory live — but 'live' means a URL exists and the core thing works, not that it's polished.",
      },
      {
        q: "How long should my demo be at Session 5?",
        a: "90-second pitch + 3-minute demo = 4.5 minutes total. The pitch is: what problem, who has it, how your tool helps. The demo is: open the URL, click through the real flow, show the FHIR data it reads and the output it produces. No slides. No 'imagine if.' Real tool, real data, real user.",
      },
    ],
    examples: [
      {
        title: "Session 4 scope statement template",
        lang: "text",
        code: `Template:
"My Session 4 demo is [tool name].
[Who] can [do what] in under [X seconds].
It reads [FHIR resource(s)] from [Medplum / Blue Button / other].
The URL is [your-project.vercel.app].
What I'm leaving out of v0: [X, Y]."

Example (John Noss — provider directory):
"My Session 4 demo is PlanMatch.
A patient can enter their provider's NPI and see which plans include
 that provider as in-network — in under 10 seconds.
It reads InsurancePlan + PractitionerRole from CMS machine-readable files,
 normalized to FHIR R4 and stored in pgvector.
The URL is planmatch.vercel.app.
What I'm leaving out of v0: plan comparison UI, cost estimates."`,
      },
      {
        title: "Session 4 demo checklist",
        lang: "text",
        code: `□ Public URL exists (not localhost)
□ Core FHIR read works on real data (not hardcoded)
□ At least one user interaction (input → output)
□ No crashes on the happy path
□ Security scan run before making repo public
  (claude /fhirbuilders-cohort:security-review)

Nice to have but not required:
○ Good UI/design
○ Error handling for edge cases
○ Auth / login
○ Mobile-responsive
○ Performance optimization

"Done" means the core thing works. Everything else is polish.`,
        note: "Ship the core thing. Eugene cares about real FHIR data flowing, not Tailwind perfection.",
      },
    ],
    tryIt:
      "Fill in the scope template above for your project and post it in #all-fhir-builders before Jul 1. That's your public commitment. It makes the target real and lets Eugene and your pod give you useful feedback before Session 4.",
    docs: [
      { label: "Vercel preview deployments", href: "https://vercel.com/docs/deployments/preview-deployments" },
      { label: "FHIRBuilders security skill", href: "https://fhirbuilders.com/cohort/cohort-00/prereqs" },
      { label: "Session 5 Demo Day format", href: "https://fhirbuilders.com/cohort/cohort-00/session-5" },
    ],
  },
];
