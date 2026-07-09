import type { CurriculumBlock } from "@/app/cohort/[slug]/_components/learn/types";

// Session 4 — "You ship one real slice."
// The make-or-break week: deployed, tested, watched by a real user before Session 5.
export const CURRICULUM: CurriculumBlock[] = [
  {
    id: "one-real-slice",
    n: 1,
    title: "What \"one real slice\" actually means",
    objectives: [
      "Scope your build down to a single end-to-end user flow that works start to finish, instead of a broad app where nothing fully works.",
      "Write a one-sentence slice definition you can put in front of a real user this week.",
    ],
    faq: [
      {
        q: "How is a \"slice\" different from an MVP?",
        a: "An MVP is often still a whole product, just smaller. A slice is one vertical path through your app: a single user, a single goal, from the first click to a visible result — including the real FHIR read and the real LLM call. Everything not on that path (settings, auth polish, a second flow) is explicitly out of scope this week.",
      },
      {
        q: "My idea has five features. Which one is the slice?",
        a: "Pick the one flow that, if a clinician saw it work end-to-end, would make them say \"oh, that's useful.\" Usually it's: fetch one patient's data from Medplum, run one Claude analysis, show one clear output. If you can't demo it in 90 seconds, it's still too broad.",
      },
      {
        q: "Isn't shipping something this thin embarrassing?",
        a: "A thin thing that fully works beats a broad thing that half-works every time. A real user can't give you feedback on a flow that errors out on step two. Depth on one path is what earns the 'this is real' reaction on Demo Day.",
      },
    ],
    examples: [
      {
        title: "Write your slice definition before you touch code",
        lang: "text",
        code: `SLICE (one sentence):
  "A primary-care nurse pastes a synthetic patient ID, and the app
   summarizes that patient's active medications and flags any that
   interact — in under 10 seconds."

ON the slice (build this week):
  - patient ID input + validation
  - Medplum read: MedicationRequest for that patient
  - one Claude call: summarize + flag interactions
  - one results screen with loading + error states

OFF the slice (NOT this week):
  - login / accounts
  - saving history
  - a second patient view
  - charts / export`,
        note: "Keep this file in your repo as SLICE.md. If a task isn't on the slice, it waits.",
      },
      {
        title: "Ask Claude Code to hold you to the scope",
        lang: "bash",
        code: `# In your project, in Claude Code:
claude

> Read SLICE.md. I want to build ONLY the flow described there for a demo
> to one real user. Before writing code, list the smallest set of files
> and functions needed for that single flow end-to-end. If I ask for
> anything OFF the slice, push back and remind me it's out of scope.`,
        note: "Naming the constraint up front makes Claude a scope ally, not a feature-adder.",
      },
    ],
    tryIt:
      "Write your SLICE.md (one sentence + an ON list and an OFF list) and commit it. Then ask Claude Code to enumerate the minimal files for just that flow. If the list has more than ~6 files, your slice is still too wide — cut it.",
    docs: [
      { label: "Next.js App Router overview", href: "https://nextjs.org/docs" },
      { label: "Vercel docs home", href: "https://vercel.com/docs" },
    ],
  },
  {
    id: "deploy-to-vercel",
    n: 2,
    title: "Deploy to Vercel (real URL, not localhost)",
    objectives: [
      "Connect your GitHub repo to Vercel so every push to main auto-deploys, and get a public URL you can send to a real user.",
      "Set environment variables in Vercel (not .env.local) so your Medplum and Anthropic calls work in production.",
    ],
    faq: [
      {
        q: "I set my keys in .env.local — why do they fail in production?",
        a: "Vercel does NOT read your local .env.local file. That file only exists on your laptop and is gitignored. Production reads env vars from the Vercel project settings. You must add each one in the Vercel dashboard (Settings → Environment Variables) or with `vercel env add`. This is the #1 cause of 'works locally, 500s in prod.'",
      },
      {
        q: "How do preview URLs work?",
        a: "Once your repo is imported, Vercel builds every branch and every pull request and gives you a unique preview URL for each. Push a branch, open a PR, and you get a shareable link that reflects exactly that code — perfect for letting a user test a change before it hits main.",
      },
      {
        q: "My build passes locally but fails on Vercel. Why?",
        a: "Vercel runs `npm run build` on a clean machine, so it catches things your dev server ignores: TypeScript errors, ESLint errors, missing env vars read at build time, and case-sensitive import paths (Linux is case-sensitive; macOS isn't). Read the build log top to bottom — the first red line is the real error.",
      },
    ],
    examples: [
      {
        title: "First deploy: GitHub → Vercel",
        lang: "bash",
        code: `# 1. Push your repo to GitHub
git add -A && git commit -m "feat: patient med-summary slice"
git push origin main

# 2. On vercel.com: "Add New… → Project" → Import your GitHub repo.
#    Vercel auto-detects Next.js. Framework preset: Next.js.
#    Root directory: fhirbuilders-app  (if your app isn't at repo root)

# 3. After the first deploy, every future push auto-builds:
git commit -am "fix: loading state" && git push   # → new deploy`,
        note: "Set the Root Directory to fhirbuilders-app in Vercel if your Next app is nested.",
      },
      {
        title: "Add production env vars (the step everyone forgets)",
        lang: "bash",
        code: `# Option A — Vercel dashboard:
#   Project → Settings → Environment Variables → add each key
#   for the Production (and Preview) environments.

# Option B — CLI:
npm i -g vercel
vercel login
vercel link                       # connect this folder to the project
vercel env add ANTHROPIC_API_KEY  # paste value, choose Production + Preview
vercel env add MEDPLUM_CLIENT_ID
vercel env add MEDPLUM_CLIENT_SECRET

# Re-deploy so the new vars take effect:
vercel --prod`,
        note: "Never commit real keys. .env.local stays gitignored; Vercel holds the prod copy.",
      },
    ],
    tryIt:
      "Import your repo into Vercel and get a green production deploy with a real URL. Add every env var your app reads, then open the live URL on your phone (not localhost) and run your slice once. If it 500s, open the Vercel build/runtime logs and fix the first error.",
    docs: [
      { label: "Vercel docs", href: "https://vercel.com/docs" },
      { label: "Vercel environment variables", href: "https://vercel.com/docs/projects/environment-variables" },
      { label: "Next.js docs", href: "https://nextjs.org/docs" },
    ],
  },
  {
    id: "not-embarrassing",
    n: 3,
    title: "Make it not embarrassing: states, validation, guards, tests",
    objectives: [
      "Add loading, empty, and error states plus input validation so a real user never stares at a blank screen or a raw stack trace.",
      "Guard your FHIR and LLM calls and cover the core logic with a couple of vitest tests so a bad input can't crash the demo.",
    ],
    faq: [
      {
        q: "What's the minimum polish before a user touches it?",
        a: "Three states on the one screen that matters: loading (a spinner or skeleton while the FHIR/LLM call runs), error (a friendly message + retry, never a stack trace), and empty (what shows when the patient has no matching data). Plus validate the input before you call anything. That's it — don't gold-plate the rest.",
      },
      {
        q: "How do I guard the FHIR and LLM calls?",
        a: "Wrap them in try/catch, validate inputs with Zod before the call, set a timeout, and check for the empty case (no MedicationRequest, empty LLM response). Never assume the model returns valid JSON — parse defensively and fall back to a readable error. The LLM and the network are the two things most likely to break live.",
      },
      {
        q: "How much testing is enough for one slice?",
        a: "Two or three vitest tests on the logic that would embarrass you if it broke: your input validator, and your parser for the LLM response. You don't need coverage of the whole app — you need confidence that the happy path and one bad input both behave. Run `npm run test:run` before every push.",
      },
    ],
    examples: [
      {
        title: "Validate input and guard the calls",
        lang: "typescript",
        code: `import { z } from "zod";

const PatientInput = z.object({
  patientId: z.string().min(1, "Enter a patient ID").max(64),
});

export async function summarizeMeds(raw: unknown) {
  const parsed = PatientInput.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: "Please enter a valid patient ID." };
  }
  try {
    const meds = await medplum.searchResources("MedicationRequest", {
      subject: \`Patient/\${parsed.data.patientId}\`,
    });
    if (meds.length === 0) {
      return { ok: true as const, summary: "No active medications on file." };
    }
    const summary = await callClaude(meds); // wraps the Anthropic SDK call
    return { ok: true as const, summary };
  } catch (err) {
    console.error("summarizeMeds failed", err);
    return { ok: false as const, error: "Something went wrong. Try again." };
  }
}`,
        note: "Synthetic (Synthea) patients only — never a real patient ID or any real PHI.",
      },
      {
        title: "A vitest test that protects the demo",
        lang: "typescript",
        code: `import { describe, it, expect } from "vitest";
import { summarizeMeds } from "./summarize-meds";

describe("summarizeMeds input guard", () => {
  it("rejects an empty patient ID without calling FHIR", async () => {
    const res = await summarizeMeds({ patientId: "" });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/valid patient id/i);
  });

  it("rejects a wrong-shaped payload", async () => {
    const res = await summarizeMeds({ notAField: 123 });
    expect(res.ok).toBe(false);
  });
});

// Run once before pushing:  npm run test:run`,
        note: "Two small tests on the validator catch the inputs a real user will actually try.",
      },
    ],
    tryIt:
      "Add loading, error, and empty states to your one screen, wrap your FHIR/LLM calls in try/catch with Zod validation, and write two vitest tests for your input guard. Then deliberately feed the live app garbage (empty field, nonsense ID) and confirm it shows a friendly message, not a crash.",
    docs: [
      { label: "Vitest", href: "https://vitest.dev" },
      { label: "Next.js docs", href: "https://nextjs.org/docs" },
    ],
  },
  {
    id: "real-user",
    n: 4,
    title: "Get a REAL user to try it",
    objectives: [
      "Recruit one real clinician or patient-proxy and put your deployed URL in front of them before Session 5.",
      "Watch them use it silently and capture what confused them — where they hesitated, misread, or gave up.",
    ],
    faq: [
      {
        q: "Where do I find a real user this week?",
        a: "You don't need a stranger. A nurse or doctor friend, a med student, a family member who works in a clinic, or another builder acting as a patient-proxy all count. One person who fits the flow beats five who don't. Post in the cohort community channel — someone will swap 15 minutes with you.",
      },
      {
        q: "What exactly do I do while they use it?",
        a: "Send them the live URL, give them one sentence of context ('this summarizes a patient's meds'), and then stay quiet. Watch where they pause, what they click that you didn't expect, and where they say 'wait, what does this mean?' The silence is the method — every time you jump in to explain, you lose a piece of feedback.",
      },
      {
        q: "Do I need consent or real patient data for the user test?",
        a: "You use synthetic Synthea patients only — never real PHI — so there's no patient-privacy issue to clear. Just tell your tester the data is fake and synthetic. Before you send them the link, run the security review so you're not exposing a key or a real ID: /fhirbuilders-cohort:security-review",
      },
    ],
    examples: [
      {
        title: "The recruiting message (send today)",
        lang: "markdown",
        code: `Hey [name] — I'm building a small healthcare tool in a Claude Code cohort
and I need **15 minutes** of your eyes before Friday.

It summarizes a patient's medications and flags interactions. The data is
**100% synthetic (Synthea) — no real patients**. I'll send you a link,
you try it while I watch quietly, and tell me where it's confusing.

Free for a quick call [two time options]? It genuinely helps me a ton.`,
        note: "Specific ask + tiny time box + 'no real patients' removes every reason to say no.",
      },
      {
        title: "Structured observation notes",
        lang: "markdown",
        code: `# User test — [name], [role], [date]

## Task given
"Summarize patient <synthetic-id>'s meds."

## What I OBSERVED (facts, not opinions)
- [ ] Paused 8s on the input — wasn't sure what an ID looked like
- [ ] Clicked "Run" twice thinking it didn't work (no loading state feedback)
- [ ] Read the interaction flag but asked "is this dangerous or not?"

## What they SAID
- "I'd want to see the dose next to each med."

## Top 1 thing to fix before Session 5
- Add a visible loading state + example ID placeholder.`,
        note: "Separate what you saw from what they said. Observations beat opinions.",
      },
    ],
    tryIt:
      "Send the recruiting message to one real person today, run the security review, then do the 15-minute session before Session 5 with your deployed URL. Fill in the observation notes and circle the single biggest friction point — that's what you fix in the next block.",
    docs: [
      { label: "Vercel docs (sharing preview URLs)", href: "https://vercel.com/docs" },
      { label: "Claude Code Skills (security review skill)", href: "https://code.claude.com/docs/en/skills" },
    ],
  },
  {
    id: "iterate-fast",
    n: 5,
    title: "Iterate fast on what you observed",
    objectives: [
      "Turn your top observed friction point into one small, shippable change and redeploy it the same day.",
      "Work in small commits with preview URLs so you can measure whether the fix actually helped.",
    ],
    faq: [
      {
        q: "How big should each change be?",
        a: "One friction point per commit. If you watched someone hesitate on the input, add a placeholder example ID and a loading state — that's a commit, push it, redeploy. Small changes deploy fast, are easy for Claude Code to make cleanly, and are easy to roll back if they don't help.",
      },
      {
        q: "Should I fix everything they flagged?",
        a: "No. You'll get five suggestions; fix the one or two that block the core flow. 'Add dose next to each med' that clarifies the output — yes. 'Add dark mode' — off the slice, ignore it this week. Ruthless triage is the skill; the OFF list from Block 1 is your filter.",
      },
      {
        q: "How do I know the fix worked without another full user test?",
        a: "Use the preview URL to sanity-check the exact change in isolation, and re-run your own slice end-to-end plus your vitest tests. If you can grab even 5 more minutes from your tester (or a second one) on the preview link, do it — but a clean re-run of the flow you watched break is enough signal to keep moving.",
      },
    ],
    examples: [
      {
        title: "Tight observe → fix → ship loop",
        lang: "bash",
        code: `# Branch the single fix so you get a preview URL
git checkout -b fix/loading-and-example-id

# Ask Claude Code for the smallest change that addresses the observation:
#   "Add a loading spinner on submit and an example synthetic patient ID
#    placeholder in the input. Nothing else."

npm run test:run          # green before you push
git commit -am "fix: loading state + example ID placeholder"
git push -u origin fix/loading-and-example-id
# → open the PR, grab the Vercel preview URL, click through the flow

# Happy? Merge to main → auto-deploys to production.`,
        note: "One observation, one branch, one preview URL, one merge. Repeat.",
      },
      {
        title: "A tiny change log to show your iteration on Demo Day",
        lang: "markdown",
        code: `# ITERATIONS.md

## From user test with [name] (synthetic data)
- OBSERVED: clicked Run twice, no feedback
  → FIX: added loading spinner            (commit a1b2c3d)
- OBSERVED: unsure what an ID looks like
  → FIX: example ID placeholder           (commit e4f5g6h)
- SAID: "want dose next to each med"
  → FIX: show dose in summary line        (commit i7j8k9l)

Result: second run-through, zero hesitation on input.`,
        note: "This log is gold for your Demo Day story: 'I watched a real user, here's what changed.'",
      },
    ],
    tryIt:
      "Take the single biggest friction point from your user test, branch it, make the smallest fix with Claude Code, verify with `npm run test:run`, and merge so it redeploys. Log each observed → fix pair in ITERATIONS.md — you'll use it in your demo.",
    docs: [
      { label: "Vercel docs (preview deployments)", href: "https://vercel.com/docs" },
      { label: "Vitest", href: "https://vitest.dev" },
    ],
  },
  {
    id: "done-and-demo",
    n: 6,
    title: "Definition of done + prep for Demo Day",
    objectives: [
      "Check your slice against a concrete definition of done: deployed, guarded, tested, and watched by a real user.",
      "Prepare a 90-second pitch and a 3-minute live demo that tells the story of the slice and the user you watched.",
    ],
    faq: [
      {
        q: "How do I know the slice is actually done?",
        a: "Run the checklist: it's on a public Vercel URL (not localhost); env vars are set in Vercel; the one flow works end-to-end with loading/error/empty states; inputs are validated and FHIR/LLM calls are guarded; two vitest tests pass; the security review is clean; and at least one real user has run it while you watched. If all eight are true, ship it — it's done for this week.",
      },
      {
        q: "What goes in a 90-second pitch?",
        a: "The problem (who hurts and why), the slice (what it does in one sentence), and the proof (you deployed it and watched a real clinician use it). No slides of architecture. End on the user's reaction. Ninety seconds forces you to cut everything that isn't the point.",
      },
      {
        q: "Do I demo on production or localhost?",
        a: "Production, on the real Vercel URL, with a synthetic patient — never localhost and never real PHI. Have the patient ID and browser tab ready before you start so the 3 minutes is the flow, not setup. If the live LLM call is slow or risky, have a backup: a preview URL, or a screen recording of a clean run.",
      },
    ],
    examples: [
      {
        title: "Definition-of-done checklist",
        lang: "markdown",
        code: `# DONE for Session 4 — all eight must be true
- [ ] Live on a public Vercel URL (not localhost)
- [ ] All env vars set in Vercel (Medplum + Anthropic)
- [ ] One flow works end-to-end with loading / error / empty states
- [ ] Inputs validated; FHIR + LLM calls in try/catch
- [ ] npm run test:run passes (>=2 real tests)
- [ ] /fhirbuilders-cohort:security-review is clean (no keys, no PHI)
- [ ] Synthetic (Synthea) data only — verified
- [ ] >=1 real user ran it while I watched; notes captured`,
        note: "If any box is unchecked, that's your remaining work before Session 5 — not new features.",
      },
      {
        title: "Demo Day script skeleton (90s pitch + 3min demo)",
        lang: "text",
        code: `[0:00-0:90  PITCH]
  Problem:  "Nurses reconcile meds by hand; interactions get missed."
  Slice:    "Paste a patient ID, get a summarized, interaction-flagged
             med list in under 10 seconds."
  Proof:    "It's live on Vercel. I watched a real nurse use it Tuesday."

[0:00-3:00  LIVE DEMO on the production URL, synthetic patient]
  1. Paste synthetic patient ID (already copied)      ~20s
  2. Show loading state → summarized meds + flags      ~60s
  3. Trigger the empty/error path once (it's graceful) ~30s
  4. "Here's what I changed after watching my user…"   ~60s
  5. One line on what's next                           ~10s

  BACKUP: preview URL + a 30s screen recording, in case the live call lags.`,
        note: "Rehearse it twice against the live URL. Timing and a backup recording save demos.",
      },
    ],
    tryIt:
      "Fill in the eight-item DONE checklist and close any open box. Then write your 90-second pitch and rehearse the 3-minute demo twice against your live Vercel URL with a synthetic patient — and record a 30-second backup clip of a clean run.",
    docs: [
      { label: "Vercel docs", href: "https://vercel.com/docs" },
      { label: "Claude Code Skills", href: "https://code.claude.com/docs/en/skills" },
      { label: "Next.js docs", href: "https://nextjs.org/docs" },
    ],
  },
];
