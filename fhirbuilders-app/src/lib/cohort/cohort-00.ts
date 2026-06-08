// Cohort 00 — static seed data for the Phase 1 demo surface at /cohort/cohort-00.
// Replaces real DB queries until the Cohort/CohortEvent/WeeklyCommitment Prisma
// models land (Phase 2). Anything sourced from this file is safe to demo on the
// Wed/Thu intro calls; commitments persist via localStorage (see CommitmentsWidget).

export type SessionKind = "intro" | "session" | "demo";

export type CohortSession = {
  id: string;
  kind: SessionKind;
  weekNumber: number | null;
  title: string;
  description: string;
  startsAt: string; // ISO
  endsAt: string;
  meetUrl?: string;
  mandatory: boolean;
  /**
   * Optional NotebookLM (notebooklm.google.com) URL — a per-session AI-curated
   * resource hub. Builders use it as a Q&A bot tuned to the session's syllabus
   * + linked docs, with a generated audio overview. Created manually after the
   * Drive folder is populated; Eugene pastes the share URL back here.
   * Suggested by John Lee (cohort 00) at the Wed intro call.
   */
  notebookLmUrl?: string;
  /**
   * Google Drive folder containing all sources for the session (syllabus doc,
   * recordings, slides, reference PDFs). NotebookLM ingests directly from
   * Drive picker, so this folder is also the "source of truth" for prep.
   */
  driveFolderUrl?: string;
  /** Recording URL — Google Drive (Meet recording) or YouTube. */
  recordingUrl?: string;
  /** Chat transcript URL — usually the Meet-attached chat .txt in Drive. */
  chatTranscriptUrl?: string;
};

export type CohortSignup = {
  name: string;
  email: string;
  building: string;
  /** Optional pod assignment — slug into `pods` map. Set Fri before Session 1. */
  podId?: string;
};

export type CohortPod = {
  id: string;             // e.g. "pod-1"
  name: string;           // display name e.g. "Prior Auth + Claims"
  theme: string;          // short theme summary
  emails: string[];       // builder emails — joined to signups by email
  // No per-pod Slack channels — we intentionally don't fragment the workspace.
  // Pods coordinate via the calendar + community page; cross-pod chat happens
  // in #cohort-00-general + #help-build. Eugene's call after Wed intro: fewer
  // channels = more signal.
};

export type Cohort = {
  slug: string;
  name: string;
  status: "upcoming" | "active" | "complete";
  cap: number;
  startsAt: string;
  endsAt: string;
  description: string;
  workshopAgendaUrl: string;
  podSize: number;
  sessions: CohortSession[];
  signups: CohortSignup[];
  pods: CohortPod[];
};

export const COHORT_00: Cohort = {
  slug: "cohort-00",
  name: "FHIR IQ Cohort 00",
  status: "upcoming",
  cap: 20,
  startsAt: "2026-06-08T13:00:00-04:00",
  endsAt: "2026-07-17T17:00:00-04:00",
  description:
    "Free, hands-on, 6-week sprint. Building Healthcare AI with Claude Code on real FHIR via Medplum.",
  workshopAgendaUrl: "https://fhiriq.com/workshop-agenda",
  podSize: 4,
  sessions: [
    {
      id: "intro-wed",
      kind: "intro",
      weekNumber: null,
      title: "Intro Call (Wed) — Cohort 00",
      description:
        "Same content runs Thu. Pick one. Meet the cohort, see the arc, get the pod brief.",
      startsAt: "2026-06-03T15:00:00-04:00",
      endsAt: "2026-06-03T15:45:00-04:00",
      meetUrl: "https://meet.google.com/xkg-cnqo-jse",
      mandatory: false,
      recordingUrl:
        "https://drive.google.com/file/d/1wtN8agd9CKVkvhMAvZBvyD4kD8ERAHrV/view",
      chatTranscriptUrl:
        "https://drive.google.com/file/d/1PxJ5YjyHFfp5F_gHXY0ZiW1DQAer74mG/view",
    },
    {
      id: "intro-thu",
      kind: "intro",
      weekNumber: null,
      title: "Intro Call (Thu) — Cohort 00",
      description:
        "Same content runs Wed. Pick one. Meet the cohort, see the arc, get the pod brief.",
      startsAt: "2026-06-04T20:00:00-04:00",
      endsAt: "2026-06-04T20:45:00-04:00",
      meetUrl: "https://meet.google.com/zuk-sunu-ahf",
      mandatory: false,
      recordingUrl:
        "https://drive.google.com/file/d/1Lo9bL2OZ4ZCzusCKxN9Ec0L0ldBkJpNg/view",
      chatTranscriptUrl:
        "https://drive.google.com/file/d/1li7XmNAhhDAt1kqeFLpQYB191bJ2KY-u/view",
    },
    {
      id: "session-1",
      kind: "session",
      weekNumber: 1,
      title: "Session 1 — Setup + first real commit",
      description:
        "VS Code + Git + Claude Code, fluent. FHIRBuilders sandbox login, one FHIR read deployed.",
      startsAt: "2026-06-08T13:00:00-04:00",
      endsAt: "2026-06-08T14:30:00-04:00",
      meetUrl: "https://meet.google.com/cjr-azsx-udq",
      mandatory: true,
      driveFolderUrl:
        "https://drive.google.com/drive/folders/1ysomAEmYFJyzTljdP-oNHATEL4hHm43a",
      notebookLmUrl:
        "https://notebooklm.google.com/notebook/3e2285b5-07e1-405d-9887-6b737d64bb5a",
    },
    {
      id: "session-2",
      kind: "session",
      weekNumber: 2,
      title: "Session 2 — MCP servers + vector DB",
      description:
        "Live FHIR hands for your agent. Synthea, Medplum, the four tools that actually earn their seat.",
      startsAt: "2026-06-15T13:00:00-04:00",
      endsAt: "2026-06-15T14:30:00-04:00",
      mandatory: true,
    },
    {
      id: "session-3",
      kind: "session",
      weekNumber: 3,
      title: "Session 3 — FHIR-native workflows",
      description:
        "Survey → intervention. Screening → referral. Real FHIR R4 resources, your primary user flow end-to-end.",
      startsAt: "2026-06-22T13:00:00-04:00",
      endsAt: "2026-06-22T14:30:00-04:00",
      mandatory: true,
    },
    {
      id: "session-4",
      kind: "session",
      weekNumber: 4,
      title: "Session 4 — You ship one real slice",
      description:
        "Deployed. Tested. Watched by a real user before session 5. Mandatory live — this is the session you cannot miss.",
      startsAt: "2026-06-29T13:00:00-04:00",
      endsAt: "2026-06-29T14:30:00-04:00",
      mandatory: true,
    },
    {
      id: "session-5",
      kind: "session",
      weekNumber: 5,
      title: "Session 5 — Demos + what's next",
      description:
        "Public Demo Day. 90-sec pitch + 3-min demo. Senior leaders + Cohort 01 waitlist watching.",
      startsAt: "2026-07-03T13:00:00-04:00",
      endsAt: "2026-07-03T15:00:00-04:00",
      mandatory: true,
    },
  ],
  // 19 confirmed Cohort 00 signups as of Jun 8, 2026 (1 seat remaining).
  // Adam Carewe + Benji Graham moved to observer Jun 8 — not participating as builders.
  // Matt Lanphier confirmed via workshop signup Jun 6 (was in PENDING_REGISTRATIONS).
  // Greg Barabell (Virginia DMAS) added Jun 8 via workshop.
  // Joel Sathiyendra (joelsathiyendra@gmail.com) confirmed for Cohort 01
  // after schedule conflict — see DEFERRED_TO_NEXT_COHORT.
  signups: [
    // Pod 1 — Prior Auth + Claims
    { name: "Matthew Maher",  email: "matthew.maher@myriad.com",  building: "FHIR-based prior-auth flow",                podId: "pod-1" },
    { name: "Rick Moore",     email: "rick@mtcgroupllc.com",       building: "FHIR-based medical record locator service", podId: "pod-1" },
    { name: "John Noss",      email: "jnoss@livmor.ai",            building: "Blue Button integration, then expand",      podId: "pod-1" },
    // Pod 2 — Home Health + Primary Care Ops
    { name: "Eric Guasch",     email: "eguasch@centric-hc.com",     building: "Tech for primary-care network operations",   podId: "pod-2" },
    { name: "Divesh Aidasani", email: "daidasani@bayada.com",       building: "New EMR for home health",                    podId: "pod-2" },
    { name: "Adnan Lakdawala", email: "adnanmlakdawala@gmail.com",  building: "SMART on FHIR app — home health clinical notes → LLM audit Q&A", podId: "pod-2" },
    // Pod 3 — Patient-facing Tooling
    { name: "John Lee",            email: "johnlee@hitpeakadvisors.com",   building: "Anonymous patient tooling",          podId: "pod-3" },
    { name: "Vanessa Paolantonio", email: "vanessa.paolantonio@yahoo.com", building: "(scoping at intro call)",            podId: "pod-3" },
    { name: "Jayte Boehler",       email: "jayte.boehler@gmail.com",       building: "Patient-experience tooling",         podId: "pod-3" },
    { name: "Kay (Lanyard Health)", email: "kay@lanyardhealth.com",         building: "Care navigation / patient-facing — Lanyard Health", podId: "pod-3" },
    // Pod 4 — EMR + Workflow
    { name: "Mark Gunnels",     email: "markgunnels@gmail.com",  building: "Experiment → shippable feature",          podId: "pod-4" },
    { name: "Michael E Campbell", email: "mcampbell@indicina.com", building: "FHIR-native build",                       podId: "pod-4" },
    { name: "Jagnyesh",          email: "jagnyesh@gmail.com",     building: "(scoping — direct outreach, late add)",   podId: "pod-4" },
    // Pod 5 — Exploration + AI Patterns
    { name: "Sergei Polevikov",  email: "spolevikov@gmail.com",        building: "Not sure yet — wants to build",          podId: "pod-5" },
    { name: "Matt (studiolab)",  email: "matt@studiolab.io",            building: "AI + healthcare exploration",            podId: "pod-5" },
    { name: "Eslam Elgebaly",    email: "eslamelgebaly11@outlook.com",  building: "Open scope — joining late, ramping up",  podId: "pod-5" },
    { name: "Medtec",            email: "medtec1@gmail.com",            building: "(scoping — direct outreach, late add)",  podId: "pod-5" },
    // Added Jun 8 via workshop signups — pod assignments TBD after Session 1
    { name: "Matt Lanphier",   email: "mlanphie@gmail.com",               building: "FHIR learning — ships personal projects (medicaidmonitor.org)" },
    { name: "Greg Barabell",   email: "greg.barabell@dmas.virginia.gov",  building: "(scoping — Virginia DMAS)" },
  ],
  // Pod assignments — 5 pods of 3–4, themed by building intent. NO per-pod
  // Slack channels (deliberate — fewer channels, more signal). Pods coordinate
  // via calendar + community page; cross-pod chat happens in #cohort-00-general
  // and #help-build. Eugene rebalances after Session 1 if anyone wants to swap.
  pods: [
    {
      id: "pod-1",
      name: "Prior Auth + Claims",
      theme:
        "FHIR-driven prior auth (DaVinci CRD/DTR/PAS) and Blue Button-style claims pipelines. CMS-0057 is the regulatory tailwind.",
      emails: [
        "matthew.maher@myriad.com",
        "rick@mtcgroupllc.com",
        "jnoss@livmor.ai",
      ],
    },
    {
      id: "pod-2",
      name: "Home Health + Primary Care Ops",
      theme:
        "Operational FHIR for home health and primary-care networks — EMR integration, workflow automation, care coordination.",
      emails: [
        "eguasch@centric-hc.com",
        "daidasani@bayada.com",
        "adnanmlakdawala@gmail.com",
      ],
    },
    {
      id: "pod-3",
      name: "Patient-Facing Tooling",
      theme:
        "Patient-side experiences — anonymous patient apps, intake, care navigation, experience tooling. SDOH + SDC profiles cluster here.",
      emails: [
        "johnlee@hitpeakadvisors.com",
        "vanessa.paolantonio@yahoo.com",
        "jayte.boehler@gmail.com",
        "kay@lanyardhealth.com",
      ],
    },
    {
      id: "pod-4",
      name: "EMR + Workflow",
      theme:
        "FHIR-native EMR builds + provider workflow. US Core + SMART on FHIR is the substrate; shippable features inside provider systems.",
      emails: [
        "markgunnels@gmail.com",
        "mcampbell@indicina.com",
        "jagnyesh@gmail.com",
      ],
    },
    {
      id: "pod-5",
      name: "Exploration + AI Patterns",
      theme:
        "Open-scope AI + healthcare exploration — MCP, agent loops, retrieval over clinical content. Pod-1 in spirit but topic later.",
      emails: [
        "spolevikov@gmail.com",
        "matt@studiolab.io",
        "eslamelgebaly11@outlook.com",
        "medtec1@gmail.com",
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Pending registrations — direct outreach (LinkedIn DM or referral) where we
// don't have a confirmed email yet. These people get manually invited to the
// workshop + cohort once we capture an email. Maintained inline so we can
// see the full pipeline + clear them out as emails come in.
// ─────────────────────────────────────────────────────────────────────────────
export type PendingRegistration = {
  name: string;
  linkedinUrl?: string;
  website?: string;
  note?: string;
  source: "linkedin-dm" | "referral" | "direct-outreach";
  capturedAt: string; // ISO
};

export const PENDING_REGISTRATIONS: PendingRegistration[] = [
  {
    name: "Pradeep Podila",
    linkedinUrl: "https://www.linkedin.com/in/pradeeppodila/",
    source: "direct-outreach",
    capturedAt: "2026-06-05T15:00:00-04:00",
    note: "Reach out via LinkedIn DM — capture email for cohort + workshop",
  },
  {
    name: "Alex Thomas",
    website: "https://www.alex-thomas.net",
    source: "direct-outreach",
    capturedAt: "2026-06-05T15:00:00-04:00",
    note: "Contact form on alex-thomas.net — capture email",
  },
  {
    name: "Sweetram",
    linkedinUrl: "https://www.linkedin.com/in/sweetram/",
    source: "direct-outreach",
    capturedAt: "2026-06-05T15:00:00-04:00",
    note: "Reach out via LinkedIn DM — capture email for cohort + workshop",
  },
];

// Builders who showed interest but won't make Cohort 00 — invite to Cohort 01
// when scheduling lands. Kept for the cohort-01 kickoff comms.
export const DEFERRED_TO_NEXT_COHORT: Array<{ name: string; email: string; reason: string; deferredAt: string }> = [
  {
    name: "Joel Sathiyendra Thiyaheswaran",
    email: "joelsathiyendra@gmail.com",
    reason: "Schedule conflict for Cohort 00 — confirmed interest in Cohort 01",
    deferredAt: "2026-06-05",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Supporters & observers — invited to follow the cohort but NOT expected to
// build. Get the Monday call invite (as optional attendees) + Slack invite +
// public roster page access. No pod, no weekly commitment, no Demo Day pitch.
// Useful for advisors, exec sponsors, ecosystem contacts, prospective Cohort 01
// participants who want to lurk first.
// ─────────────────────────────────────────────────────────────────────────────
export type CohortSupporter = {
  name: string;
  email: string;
  title?: string;
  affiliation?: string;
  /** Where they came from — direct outreach, intro, etc. */
  source?: string;
  addedAt: string; // ISO date
};

export const SUPPORTERS: CohortSupporter[] = [
  {
    name: "Benji Graham",
    email: "benjamin.graham@icf.com",
    affiliation: "ICF",
    source: "cohort-00 builder → moved to observer Jun 8",
    addedAt: "2026-06-08",
  },
  {
    name: "Adam Carewe",
    email: "adam@nerdmds.com",
    affiliation: "NerdMDs",
    source: "cohort-00 builder → moved to observer Jun 8",
    addedAt: "2026-06-08",
  },
  {
    name: "Bipinkumar G Rathod",
    email: "bipin4uk@yahoo.co.uk",
    title:
      "Consultant & Business Partner · Advisory Council member, Harvard Business Review · Consultant, UNDP",
    affiliation: "African Medical City — Ghana (Digital health & infrastructure)",
    source: "direct outreach",
    addedAt: "2026-06-05",
  },
  {
    name: "Ellen Brown",
    email: "ebrown@healthcareactually.com",
    affiliation: "Healthcare Actually",
    source: "direct outreach",
    addedAt: "2026-06-05",
  },
  {
    name: "Steph Habif",
    email: "stephhabif@google.com",
    affiliation: "Google",
    source: "direct outreach",
    addedAt: "2026-06-05",
  },
];

export const COHORTS: Record<string, Cohort> = {
  "cohort-00": COHORT_00,
};

export function getCohortBySlug(slug: string): Cohort | null {
  return COHORTS[slug] ?? null;
}

// Returns the next session whose startsAt is in the future (relative to `now`).
// Used by the hero card to surface the immediate "what's next" event.
export function nextSession(cohort: Cohort, now: Date = new Date()): CohortSession | null {
  const upcoming = cohort.sessions
    .filter((s) => new Date(s.startsAt).getTime() > now.getTime())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  return upcoming[0] ?? null;
}

// Formats a session window for display: "Mon Jun 8 · 1:00–2:30 PM ET"
export function formatSessionTime(s: CohortSession): string {
  const start = new Date(s.startsAt);
  const end = new Date(s.endsAt);
  const day = start.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
  const startTime = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });
  const endTime = end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });
  return `${day} · ${startTime}–${endTime} ET`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Account linking — connect a logged-in FHIRBuilders user to their cohort row.
// All matching is case-insensitive on email. The cohort signups list is the
// authoritative source; we don't write back to it from auth, just look up.
// ─────────────────────────────────────────────────────────────────────────────

function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  return email.trim().toLowerCase();
}

/**
 * Cohort admin = anyone listed in ADMIN_EMAILS (comma-separated env var).
 * Eugene is the default. Admins get:
 *   - access to /admin/cohort/[slug]
 *   - bypass on the cohort layout's member gate (preview as anyone)
 *   - the dashboard banner rendered as "Organizer" instead of "Builder"
 *
 * Keep this in sync with the parallel inline checks in app/admin/cohort/[slug]
 * and app/cohort/[slug]/layout — single source of truth.
 */
export function isCohortAdmin(email: string | null | undefined): boolean {
  const e = normalizeEmail(email);
  if (!e) return false;
  const admins = new Set(
    (process.env.ADMIN_EMAILS ?? "eugene.vestel@gmail.com")
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean),
  );
  return admins.has(e);
}

/** True if the email is in any cohort's signup roster. */
export function isCohortMember(email: string | null | undefined, cohortSlug = "cohort-00"): boolean {
  const e = normalizeEmail(email);
  if (!e) return false;
  const cohort = COHORTS[cohortSlug];
  return cohort?.signups.some((s) => normalizeEmail(s.email) === e) ?? false;
}

/** Find the cohort signup row for an email; returns null if not a member. */
export function getCohortBuilder(
  email: string | null | undefined,
  cohortSlug = "cohort-00",
): CohortSignup | null {
  const e = normalizeEmail(email);
  if (!e) return null;
  const cohort = COHORTS[cohortSlug];
  return cohort?.signups.find((s) => normalizeEmail(s.email) === e) ?? null;
}

/** Look up the pod a builder belongs to. Returns null if the builder has no pod assignment yet. */
export function getPodForEmail(
  email: string | null | undefined,
  cohortSlug = "cohort-00",
): CohortPod | null {
  const builder = getCohortBuilder(email, cohortSlug);
  if (!builder?.podId) return null;
  const cohort = COHORTS[cohortSlug];
  return cohort?.pods.find((p) => p.id === builder.podId) ?? null;
}

/** Look up a pod by id. */
export function getPodById(podId: string, cohortSlug = "cohort-00"): CohortPod | null {
  return COHORTS[cohortSlug]?.pods.find((p) => p.id === podId) ?? null;
}

/** Resolve pod members to full signup rows (in pod-defined order). */
export function getPodMembers(podId: string, cohortSlug = "cohort-00"): CohortSignup[] {
  const pod = getPodById(podId, cohortSlug);
  if (!pod) return [];
  const cohort = COHORTS[cohortSlug];
  if (!cohort) return [];
  const byEmail = new Map(cohort.signups.map((s) => [normalizeEmail(s.email)!, s]));
  return pod.emails
    .map((e) => byEmail.get(normalizeEmail(e)!))
    .filter((s): s is CohortSignup => !!s);
}

// Initials for an avatar fallback ("John Noss" → "JN").
export function initialsFromName(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
