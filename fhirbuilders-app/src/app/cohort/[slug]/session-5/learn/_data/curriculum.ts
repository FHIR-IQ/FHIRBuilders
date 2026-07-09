import type { CurriculumBlock } from "@/app/cohort/[slug]/_components/learn/types";

export const CURRICULUM: CurriculumBlock[] = [
  {
    id: "the-90-second-pitch",
    n: 1,
    title: "The 90-Second Pitch",
    objectives: [
      "Write a tight 90-second pitch that moves problem → who it's for → why now → what you built.",
      "Cut every sentence that doesn't earn its place in a 90-second window (~200-230 spoken words).",
    ],
    faq: [
      {
        q: "Why exactly 90 seconds? Isn't that too short to explain a healthcare app?",
        a: "Demo Day is a public event with senior leaders and the Cohort 01 waitlist watching, and every builder gets the same slot: a live 90-second pitch followed by a 3-minute demo. The constraint is the point. If you can't say what the problem is and who it's for in 90 seconds, the audience won't remember it either. You are not explaining the whole app — you are earning the next 3 minutes.",
      },
      {
        q: "What's the single most common way pitches fail?",
        a: "Starting with the technology instead of the problem. 'I built a Next.js app on Medplum with a FHIR bulk export pipeline' tells a senior leader nothing about why they should care. Start with a human: 'A care coordinator opens six tabs to reconcile one patient's medication list.' Lead with the pain, name who feels it, then reveal what you built as the relief.",
      },
      {
        q: "Should I memorize the pitch word-for-word or wing it?",
        a: "Memorize the structure and the first and last sentences; keep the middle conversational. A fully memorized script sounds robotic and collapses if you lose your place. But the opening hook and the closing ask are the two moments you cannot fumble — lock those. Rehearse out loud with a timer at least five times; reading it silently always feels faster than speaking it.",
      },
    ],
    examples: [
      {
        title: "The four-beat pitch skeleton",
        lang: "text",
        code: `[PROBLEM — 20s]
"Today, a diabetes care coordinator manually reviews 40 patient charts
every morning to find who's overdue for an A1c test. It takes two hours,
and the ones who slip through are exactly the patients at highest risk."

[WHO IT'S FOR — 15s]
"This is for the coordinators and care managers inside value-based care
clinics — the people accountable for population health, not the physician."

[WHY NOW — 20s]
"FHIR bulk export finally makes a whole panel queryable in seconds, and
AI can read a chart and reason about gaps. Two years ago you couldn't
build this in a weekend. Now you can."

[WHAT YOU BUILT — 35s]
"So I built PanelPulse. It pulls the clinic's full patient panel over
FHIR, flags every overdue screening, and drafts the outreach message —
so a two-hour morning becomes a five-minute review. Let me show you."`,
        note: "Total ~90 seconds spoken at a calm pace. The last line hands off directly into your demo.",
      },
      {
        title: "Same pitch, tightened from a bloated first draft",
        lang: "markdown",
        code: `### Before (145 words, tech-first, no human)
> My app is a full-stack TypeScript application built with Next.js 16 and
> the App Router, using Prisma with a Postgres database on Neon, that
> connects to a Medplum FHIR server and uses the Anthropic API to analyze
> Observation and Condition resources for a patient population so that
> clinical staff can identify care gaps more efficiently than before...

### After (58 words, human-first)
> A care coordinator spends two hours every morning hunting for patients
> overdue on screenings. PanelPulse does it in five minutes: it reads the
> whole panel over FHIR, flags the gaps, and drafts the outreach. It's for
> the person accountable for population health. Here's what a Monday
> morning looks like now.`,
        note: "The 'after' never mentions Prisma, Neon, or the model name. Senior leaders buy the outcome, not the stack.",
      },
    ],
    tryIt:
      "Write your pitch as four labeled beats (problem / who / why now / what). Read it aloud with a stopwatch. If you're over 95 seconds, delete words — don't speed up. Then delete every proper noun that names a technology and see if the pitch still lands. It should.",
    docs: [
      { label: "Loom — record and time your pitch run-throughs", href: "https://www.loom.com" },
      { label: "SMART on FHIR App Gallery (see how shipped apps describe themselves)", href: "https://gallery.smarthealthit.org" },
    ],
  },
  {
    id: "the-3-minute-demo",
    n: 2,
    title: "The 3-Minute Live Demo",
    objectives: [
      "Structure a 3-minute demo as one user's story, not a tour of every feature you built.",
      "Narrate what the user is trying to accomplish at each click, so the audience follows the why, not the UI.",
    ],
    faq: [
      {
        q: "How do I decide what to show in only 3 minutes?",
        a: "Pick one persona and one job-to-be-done, then show that single flow end to end. A demo that shows the login screen, the settings page, the admin panel, and three half-features is forgettable. A demo that follows 'Maria the care coordinator arrives Monday and finds her five highest-risk gaps in under a minute' is a story people repeat. Cut everything that isn't on that one path.",
      },
      {
        q: "Should I narrate the UI or narrate the user's goal?",
        a: "Narrate the goal. 'Now I click the blue button in the top right' makes the audience watch your mouse. 'Maria wants to see who's overdue, so she opens today's worklist' makes them watch the outcome. Every action should be framed as a step toward what the user is trying to get done. The UI is just how the goal gets met.",
      },
      {
        q: "Is a feature tour ever the right call?",
        a: "Almost never on Demo Day. A feature tour ('and it can also do this, and this, and this') signals you don't know which feature matters most. Show one flow deeply. If leaders want the full surface area, they'll ask in Q&A or click your link afterward — the demo's job is to make them want that link, not to be the manual.",
      },
    ],
    examples: [
      {
        title: "A 3-minute demo storyboard (one flow, one persona)",
        lang: "text",
        code: `0:00  "Maria is a care coordinator. It's Monday. She opens PanelPulse."
      → Land on the worklist, already loaded with synthetic panel data.

0:30  "Her panel is 400 patients. She can't review them all, so the
       first thing she sees is the 12 flagged as overdue and high-risk."
      → Scroll the ranked gap list. Point at the top row.

1:15  "She opens the top patient. PanelPulse already pulled the labs
       over FHIR and explains *why* this person is flagged."
      → Open patient detail. Show the gap summary + source Observations.

2:00  "Instead of writing outreach from scratch, she clicks Draft."
      → Show the AI-drafted message appear. Read one line of it aloud.

2:40  "She edits one word, sends it, and moves on. Two-hour morning,
       done in five minutes."
      → Return to worklist, row now marked done. End on the win.`,
        note: "Notice: no settings page, no login, no 'it also supports.' One patient, one Monday, one outcome.",
      },
      {
        title: "Rehearsal narration cues taped next to your screen",
        lang: "markdown",
        code: `## Say the GOAL, click SECOND

- [ ] Open on the worklist ALREADY loaded — never demo a spinner
- [ ] Frame each click: "she wants X" BEFORE the cursor moves
- [ ] Say "over FHIR" exactly once — it signals real interop, don't overuse
- [ ] When the AI draft appears, PAUSE 2 seconds. Let it land.
- [ ] Last sentence = the time saved, out loud, as a number
- [ ] Do NOT apologize for anything on screen. Never say "ignore that"

## Hard stops
- If a click hangs > 3s, talk over it: "while that loads, here's why..."
- Never scroll code. This audience buys outcomes, not source.`,
        note: "Print this or keep it on a second monitor. Under pressure, your memory of the narration is the first thing to go.",
      },
    ],
    tryIt:
      "Storyboard your demo as a timed sequence of one persona's actions, like the example above. Rehearse it three times with a timer. On the third run, delete any step that isn't strictly required for the story to make sense — you'll almost always find 20-30 seconds of fat you didn't see the first time.",
    docs: [
      { label: "Loom — capture rehearsal runs and watch your own pacing", href: "https://www.loom.com" },
      { label: "Vercel docs — preview vs production URLs for demoing", href: "https://vercel.com/docs" },
    ],
  },
  {
    id: "failure-proofing-the-demo",
    n: 3,
    title: "Failure-Proofing the Demo",
    objectives: [
      "Pre-seed synthetic data and rehearse the exact happy path so nothing is generated live for the first time on stage.",
      "Identify and neutralize the live-demo risks: cold servers, network drops, API rate limits, and screen-share leaks.",
    ],
    faq: [
      {
        q: "What breaks live demos most often?",
        a: "Cold starts and empty states. A serverless function that hasn't been hit in a while takes several seconds to wake up, and an app you just deployed has no data in it, so you land on a blank screen. Both are fully preventable: warm the app by loading it minutes before you present, and seed your synthetic patients ahead of time so the first screen the audience sees is already full and impressive.",
      },
      {
        q: "Should the demo hit a live AI API or a live FHIR server during my 3 minutes?",
        a: "Only if you've rehearsed that exact call succeeding, and even then have a fallback. Live model calls can be slow or rate-limited at the worst moment. Safest pattern: rehearse the real call so it works, but also record a backup video (see the next block) of the whole flow succeeding. If the live call stalls, you talk over it or cut to the recording. Never let a spinning loader own the room.",
      },
      {
        q: "How do I make sure I don't leak anything sensitive while screen-sharing?",
        a: "Two rules. First: only synthetic data on screen, ever — Synthea-generated patients, never real PHI, no exceptions on a public share. Second: close every other tab, quit Slack and email, disable notifications (macOS Focus / Do Not Disturb), and hide your bookmarks bar and any .env files. A single Slack toast with a patient name or an API key on a public stream is the one mistake you can't take back.",
      },
    ],
    examples: [
      {
        title: "Pre-demo warm-up and seed checklist",
        lang: "bash",
        code: `# 15 minutes before you present — run these against your PROD demo URL

# 1. Seed synthetic patients so the app is never empty on screen
npx tsx prisma/seed.ts

# 2. Warm the deployment so the first real click isn't a cold start
curl -s -o /dev/null -w "%{http_code} %{time_total}s\\n" \\
  https://your-app.vercel.app/dashboard
# expect 200 and a fast second hit — run it twice

# 3. Confirm the exact demo route loads with data already present
open https://your-app.vercel.app/dashboard

# 4. Turn OFF everything that can interrupt the share
#    macOS: enable Do Not Disturb / Focus, quit Slack + Mail`,
        note: "Warm the production URL, not localhost. Demo from the same deployment the audience could visit afterward.",
      },
      {
        title: "The 'happy path locked' rehearsal contract",
        lang: "markdown",
        code: `## Happy path = the ONE sequence I will click live

Patient: Maria Alvarez (synthetic, seeded, id pinned in notes)
Route:   /dashboard → top flagged row → Draft → send → back to list

## Rehearsed and confirmed
- [ ] Ran the full path 3x today on the PROD url — all green
- [ ] Synthetic data seeded; first screen is full, not empty
- [ ] Backup Loom recording of this exact path exists and plays
- [ ] Every tab except the app is closed; notifications off
- [ ] No .env, no API keys, no real PHI visible anywhere
- [ ] Phone hotspot ready if venue wifi drops

## If it breaks
1. Keep talking — narrate the goal while it recovers
2. > 5s stalled → cut to the Loom backup, keep the story going
3. Never say "this usually works" — the audience won't notice
   a swap to video unless you announce it`,
        note: "The goal is that no part of the demo is being attempted for the first time in front of the audience.",
      },
    ],
    tryIt:
      "Do a full dress rehearsal on your production URL — not localhost — with notifications off and every other app closed. Time it. Then deliberately break your wifi (turn it off mid-demo) and practice recovering: talk through the goal, then cut to your backup recording. If you can recover gracefully once in rehearsal, you'll be calm when it happens for real.",
    docs: [
      { label: "Vercel docs — deployments, cold starts, and production URLs", href: "https://vercel.com/docs" },
      { label: "Loom — record the backup video that saves a stalled demo", href: "https://www.loom.com" },
    ],
  },
  {
    id: "backup-recording-and-testimonial",
    n: 4,
    title: "Backup Recording + 60-Second Testimonial",
    objectives: [
      "Record a clean backup demo (Loom or screen capture) that can stand in for the live run if anything fails.",
      "Record the 60-second video testimonial the cohort asks every builder to deliver by Demo Day.",
    ],
    faq: [
      {
        q: "What exactly does the backup recording need to cover?",
        a: "The same 3-minute happy path you'll present live, captured cleanly with narration, using synthetic data only. It's your insurance policy: if the live demo stalls, you cut to this and the audience barely notices. Record it a day early so you're not scrambling, watch it once at full speed to catch anything embarrassing on screen (stray tabs, real names), and keep the link one click away during your presentation.",
      },
      {
        q: "What's the 60-second testimonial and why does the cohort want it?",
        a: "It's a short, face-to-camera video where you say who you are, what you built in the cohort, and what shifted for you — proof that a working healthcare app came out of these five sessions. Alongside the live 90-second pitch and 3-minute demo, the 60-second testimonial is one of the three canonical Demo Day deliverables. The cohort uses these to show the Cohort 01 waitlist what's actually possible, so keep it genuine and specific.",
      },
      {
        q: "How do I make the testimonial not feel cringey?",
        a: "Be specific instead of grateful-in-general. 'This was amazing, thanks everyone' says nothing. 'Five weeks ago I'd never touched FHIR; on Monday I deployed an app that reads a patient panel and drafts outreach' is concrete and credible. Name the one thing you couldn't do before and can do now. One take, good light, look at the lens, 60 seconds — done is better than polished.",
      },
    ],
    examples: [
      {
        title: "60-second testimonial script template",
        lang: "text",
        code: `[WHO — 10s]
"I'm Jordan, a nurse informaticist. I joined this cohort because I could
describe the app I wanted but couldn't build it myself."

[WHAT YOU BUILT — 20s]
"Over five sessions I built PanelPulse with Claude Code — it reads a
clinic's patient panel over FHIR and drafts overdue-screening outreach.
It's deployed on Vercel and running on synthetic data right now."

[WHAT SHIFTED — 20s]
"The thing that changed is I stopped waiting for an engineer. I can take
a clinical idea and have something real, on a live URL, the same week."

[THE INVITE — 10s]
"If you're on the Cohort 01 waitlist and you've got a healthcare idea
stuck in your head — this is how it gets out. See you there."`,
        note: "One take, phone at eye level, window light in front of you. 60 seconds. Look at the lens, not the screen.",
      },
      {
        title: "Backup demo recording checklist (Loom)",
        lang: "markdown",
        code: `## Recording the backup demo

- [ ] Same happy path as the live demo, synthetic data only
- [ ] Close all other tabs; notifications off; hide bookmarks bar
- [ ] Record at 1080p, camera bubble optional (voice matters more)
- [ ] Narrate the GOAL at each step, same as live
- [ ] Keep it under 3:15 — trim dead air in Loom after recording
- [ ] Watch it back ONCE at full speed to catch:
      - stray real names / PHI  - visible API keys  - a wrong tab
- [ ] Copy the share link; paste it in your presenter notes
- [ ] Set link visibility so leaders/waitlist can open it later

## Why Loom specifically
- instant shareable link, no upload wait
- trim + speed edits without leaving the browser
- viewer analytics tell you if leaders actually watched`,
        note: "Record this a full day before Demo Day. A backup you make the night before is a backup you didn't really test.",
      },
    ],
    tryIt:
      "Record two things this week: (1) your full 3-minute backup demo, and (2) your 60-second testimonial. Watch each back once at full speed. For the demo, hunt for anything on screen you wouldn't want a senior leader to see. For the testimonial, ask: did I name one specific thing I can now do that I couldn't five weeks ago? If not, re-record — it's 60 seconds.",
    docs: [
      { label: "Loom — screen + camera recording, trimming, share links", href: "https://www.loom.com" },
      { label: "Vercel docs — the live URL your testimonial can point to", href: "https://vercel.com/docs" },
    ],
  },
  {
    id: "clinical-credibility",
    n: 5,
    title: "Clinical Credibility for Senior Leaders",
    objectives: [
      "Talk about FHIR, PHI, and safety in language that makes healthcare leaders trust you.",
      "State clearly that your demo runs on synthetic data and how you'd handle real PHI in production.",
    ],
    faq: [
      {
        q: "How do I mention FHIR without either overselling or losing the room?",
        a: "Say it once, concretely, tied to an outcome. 'It reads the patient panel over FHIR' tells a leader you're using the real interoperability standard, not scraping screens — that's the signal they need. You don't need to explain resources, profiles, or bulk export unless asked. Overexplaining the standard reads as insecurity; one confident, correct mention reads as competence.",
      },
      {
        q: "A leader asks about PHI and HIPAA on stage. What do I say?",
        a: "Lead with the truth that de-risks the demo: 'Everything on screen right now is synthetic — Synthea-generated patients, no real PHI.' Then show you've thought about production: 'For real data, this runs against a FHIR server inside the covered entity's environment, access is scoped and audited, and no PHI ever leaves that boundary or touches a public URL.' You don't need to be a compliance lawyer — you need to prove you know PHI is not a detail to hand-wave.",
      },
      {
        q: "What if I get a hard clinical or safety question I can't fully answer?",
        a: "Never bluff to a room of healthcare leaders — they'll catch it and you lose all credibility. Say what you know, name the boundary honestly, and frame the gap as your next step: 'Right now it drafts the outreach and a human reviews every message before it sends — the clinician stays in the loop. Fully automating that safely is exactly the validation work I'd do next.' Honesty plus a clear human-in-the-loop story builds more trust than a confident wrong answer.",
      },
    ],
    examples: [
      {
        title: "The synthetic-data disclosure, said out loud",
        lang: "text",
        code: `Say this early, unprompted, the first time a patient appears on screen:

  "Quick note — every patient you'll see is synthetic, generated with
   Synthea. There's no real PHI on this screen. In production, this runs
   against the clinic's own FHIR server inside their environment, and no
   patient data ever leaves that boundary or lands on a public URL like
   this one."

Why say it before anyone asks:
  - It removes the biggest objection a healthcare leader has
  - It signals you understand PHI is a hard line, not a footnote
  - It lets the audience relax and watch the product, not the risk`,
        note: "Synthetic data in demos, always. Never put real PHI on a public screen-share — there is no undo.",
      },
      {
        title: "Credibility phrasebook — swap vague for precise",
        lang: "markdown",
        code: `| Instead of...                        | Say...                                            |
|--------------------------------------|---------------------------------------------------|
| "it grabs the patient data"          | "it reads the panel over FHIR"                    |
| "it's HIPAA compliant" (a claim)     | "PHI stays inside the covered entity's boundary"  |
| "the AI sends the outreach"          | "it drafts outreach; a human reviews before send" |
| "it's totally safe"                  | "the clinician stays in the loop on every action" |
| "I used fake patients"               | "synthetic Synthea data, no real PHI"             |

Rule of thumb: name the safeguard, not the adjective.
"Compliant" and "safe" are claims. "Human reviews every message" and
"data never leaves the boundary" are safeguards leaders can verify.`,
        note: "Senior healthcare leaders trust specific safeguards, not reassuring adjectives. Show the guardrail, don't assert the outcome.",
      },
    ],
    tryIt:
      "Write your one-sentence synthetic-data disclosure and rehearse saying it out loud the moment your first patient appears on screen. Then have someone play a skeptical CMIO and ask you 'what about PHI?' and 'is this safe to actually use?' Practice answering with a named safeguard and a human-in-the-loop story — no bluffing, no hand-waving.",
    docs: [
      { label: "SMART on FHIR App Gallery — how credible apps present safety & scope", href: "https://gallery.smarthealthit.org" },
      { label: "Vercel docs — production environments and access boundaries", href: "https://vercel.com/docs" },
    ],
  },
  {
    id: "whats-next-publishing",
    n: 6,
    title: "What's Next — Publishing and Momentum",
    objectives: [
      "Choose your publishing path: Vercel web (default), the app stores, or the SMART on FHIR App Gallery.",
      "Set one concrete next step so momentum survives the week after the cohort ends.",
    ],
    faq: [
      {
        q: "What's the default way to publish, and when do I go beyond it?",
        a: "The web is the default: a production deployment on Vercel gives you a real URL you can put in your pitch, your testimonial, and an email the same day — zero app-store review, instant to share. Go beyond it only when the use case demands it: native mobile (App Store / Google Play) when clinicians genuinely need an on-the-phone experience, and the SMART on FHIR App Gallery once your app can SMART-launch inside an EHR. Ship the web version first; it unblocks everything else.",
      },
      {
        q: "What's different about publishing a health app to the Apple App Store or Google Play?",
        a: "Both stores apply extra scrutiny to health and medical apps, especially around data privacy. Apple's review looks hard at how you collect and use health data and requires a clear privacy policy; Google Play has a dedicated health-apps declaration and data-safety requirements. Budget real time for review — it's not the instant publish that a Vercel deploy is. Have your privacy policy and a plain-English data-handling description ready before you submit, and never ship real PHI through a store-distributed build without the compliance work behind it.",
      },
      {
        q: "How do I get into the SMART on FHIR App Gallery, and is it worth it?",
        a: "The gallery at gallery.smarthealthit.org lists apps that use SMART on FHIR to launch against EHR data. It's the right home once your app can actually SMART-launch — i.e. it does the SMART authorization handshake and reads FHIR from an EHR sandbox or live system. It's worth it when your goal is distribution to health systems and developers who specifically shop for interoperable apps. If you're still on synthetic data and haven't wired SMART launch yet, that's your prerequisite, not a blocker to shipping the web version now.",
      },
    ],
    examples: [
      {
        title: "Ship the web version to production today",
        lang: "bash",
        code: `# The fastest real publish: a production Vercel deploy you can share now

# One-time: link the repo to a Vercel project (or use the dashboard)
npx vercel link

# Deploy to production and get your public URL
npx vercel --prod
# → https://panelpulse.vercel.app  (put this in your pitch + testimonial)

# Set env vars for production (do NOT commit secrets)
npx vercel env add ANTHROPIC_API_KEY production
npx vercel env add MEDPLUM_CLIENT_SECRET production

# Redeploy after adding env vars so they take effect
npx vercel --prod`,
        note: "Synthetic data only on a public URL. A production Vercel deploy is your default publish — everything else is optional and later.",
      },
      {
        title: "Post-cohort momentum plan (pick ONE next step)",
        lang: "markdown",
        code: `## The week after Demo Day — do not let it go cold

### This week (pick exactly one, ship it)
- [ ] Production deploy live on Vercel + link in my testimonial
- [ ] Add a privacy policy page (prereq for either app store)
- [ ] Wire SMART launch against a sandbox → App Gallery candidate

### The publishing ladder (in order)
1. Vercel web (prod URL)        → done, share it everywhere
2. SMART on FHIR App Gallery    → once SMART-launch works
   → gallery.smarthealthit.org
3. Google Play / App Store      → only if clinicians need native;
   → budget time for the health-data privacy review

### Keep momentum
- [ ] Post the Demo Day link in the cohort community
- [ ] Find your first real user and get one piece of feedback
- [ ] Book 30 min next week to ship the ONE thing above`,
        note: "The goal isn't to publish everywhere — it's to keep one concrete thread alive so the app doesn't die the week after the cohort.",
      },
    ],
    tryIt:
      "Before you leave Demo Day, do two things: (1) confirm your app is live on a production Vercel URL with synthetic data, and (2) write down the single next publishing step you'll take next week — a privacy policy, a SMART launch against a sandbox, or your first real user. One step, booked on your calendar. Momentum is a decision, not a feeling.",
    docs: [
      { label: "Vercel docs — production deployments and environment variables", href: "https://vercel.com/docs" },
      { label: "SMART on FHIR App Gallery — list your SMART-launched app", href: "https://gallery.smarthealthit.org" },
      { label: "Google Play Console — health apps declaration & data safety", href: "https://play.google.com/console" },
    ],
  },
];
