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
};

export type CohortSignup = {
  name: string;
  email: string;
  building: string;
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
      mandatory: true,
      driveFolderUrl:
        "https://drive.google.com/drive/folders/1ysomAEmYFJyzTljdP-oNHATEL4hHm43a",
      notebookLmUrl:
        "https://drive.google.com/file/d/1wtN8agd9CKVkvhMAvZBvyD4kD8ERAHrV/view",
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
  // 12 confirmed Cohort 00 signups as of Jun 1, 2026 (8 seats remaining)
  signups: [
    { name: "John Noss", email: "jnoss@livmor.ai", building: "Blue Button integration, then expand" },
    { name: "Eric Guasch", email: "eguasch@centric-hc.com", building: "Tech for primary-care network operations" },
    { name: "Divesh Aidasani", email: "daidasani@bayada.com", building: "New EMR for home health" },
    { name: "Matthew Maher", email: "matthew.maher@myriad.com", building: "FHIR-based prior-auth flow" },
    { name: "John Lee", email: "johnlee@hitpeakadvisors.com", building: "Anonymous patient tooling" },
    { name: "Joel Sathiyendra Thiyaheswaran", email: "joelsathiyendra@gmail.com", building: "(scoping at intro call)" },
    { name: "Mark Gunnels", email: "markgunnels@gmail.com", building: "Experiment → shippable feature" },
    { name: "Michael E Campbell", email: "mcampbell@indicina.com", building: "FHIR-native build" },
    { name: "Vanessa Paolantonio", email: "vanessa.paolantonio@yahoo.com", building: "(scoping at intro call)" },
    { name: "Adam Carewe", email: "adam@nerdmds.com", building: "Anything and everything — narrowing on call" },
    { name: "Rick Moore", email: "rick@mtcgroupllc.com", building: "FHIR-based medical record locator service" },
    { name: "Sergei Polevikov", email: "spolevikov@gmail.com", building: "Not sure yet — wants to build" },
  ],
};

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

// Initials for an avatar fallback ("John Noss" → "JN").
export function initialsFromName(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
