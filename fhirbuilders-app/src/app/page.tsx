import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Healthcare AI Builders — Ship healthcare AI on real FHIR",
  description:
    "A paid, 12-week build cohort for healthcare AI on real FHIR data. Weekly demos, your own agents, live problem-solving. Starts late August.",
};

const ORGS = [
  "Bayada Home Health",
  "Myriad Genetics",
  "LivMor",
  "Indicina",
  "Lanyard Health",
  "Centric Healthcare",
  "Virginia Medicaid",
  "HitPeak Advisors",
  "Velox Metadata",
];

const BUILT = [
  {
    name: "Gail Hamilton",
    org: "Velox Metadata",
    body: "Built a FHIR data-quality app on her own Medplum server: 50 patients, 10% deliberately corrupted, pluggable PIQI tests, and an MCP server on top so an agent can query the results in plain language. All with Claude Code.",
  },
  {
    name: "Rick Moore",
    org: "MTC Group",
    body: "Went from never opening a terminal in May to three working apps in July, and a security review of an open-source guardrail project sharper than most vendors would write.",
  },
  {
    name: "Michael Campbell",
    org: "Indicina",
    body: "Seeded the shared FHIR sandbox the whole cohort built on, then organized his own study group on the side. Nobody asked him to. That is the kind of room this is.",
  },
];

const HOW = [
  {
    n: "01",
    title: "A demo every Friday",
    body: "You show what you shipped this week, live and recorded. Solo or with your team. The best clips go on LinkedIn with your name on them.",
  },
  {
    n: "02",
    title: "You and your agents",
    body: "Bring Claude Code, Codex, your own MCP servers. We build with agents, not despite them. Bring your own LLM account.",
  },
  {
    n: "03",
    title: "Problems solved live",
    body: "Free-form working sessions, not lectures. Bring what is blocking you and we unblock it in the room. Stuck is part of the format.",
  },
  {
    n: "04",
    title: "The room stays on",
    body: "Between Fridays the cohort lives on Buzz, where you share progress, trade fixes, and get unstuck without waiting for the call.",
  },
];

export default function HomePage() {
  return (
    <div className="ed-surface bg-e-paper text-e-ink">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="container pt-20 pb-16 lg:pt-28 lg:pb-20">
        <div className="max-w-4xl">
          <div className="ed-kicker ed-rise" style={{ animationDelay: "0ms" }}>
            Cohort 01 · 12 weeks · enrolling now
          </div>
          <h1
            className="ed-display ed-rise mt-5 text-[2.75rem] leading-[0.98] sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            Ship healthcare AI
            <br />
            on <span className="text-e-accent">real FHIR</span>.
          </h1>
          <p
            className="ed-rise mt-7 max-w-2xl text-lg text-e-ink-soft sm:text-xl"
            style={{ animationDelay: "160ms" }}
          >
            A build cohort for people who make things. Twelve weeks on live patient data, your own
            agents, and a demo every Friday. You leave with deployed work and the reel to prove it.
          </p>
          <div
            className="ed-rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href="/cohort-01"
              className="inline-flex items-center justify-center gap-2 bg-e-ink px-6 py-3.5 text-base font-medium text-e-paper transition-colors hover:bg-e-accent"
            >
              Enroll in Cohort 01 <span aria-hidden>→</span>
            </Link>
            <a
              href="#built"
              className="inline-flex items-center justify-center gap-2 border border-e-line-strong px-6 py-3.5 text-base text-e-ink transition-colors hover:border-e-ink"
            >
              See what Cohort 00 built
            </a>
          </div>
        </div>

        {/* Proof strip */}
        <div className="ed-rise mt-16 border-t border-e-line pt-6" style={{ animationDelay: "320ms" }}>
          <div className="ed-kicker mb-3">Builders came from</div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-sm text-e-ink-soft">
            {ORGS.map((org, i) => (
              <span key={org} className="flex items-center gap-4">
                {org}
                {i < ORGS.length - 1 && <span className="text-e-line-strong">·</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Thesis ───────────────────────────────────────────────────────── */}
      <section className="border-t border-e-line">
        <div className="container grid gap-10 py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:py-28">
          <h2 className="ed-display text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]">
            AI courses skip healthcare data. FHIR courses skip AI. This is where both get built.
          </h2>
          <div className="space-y-5 text-e-ink-soft lg:pt-2">
            <p className="text-lg">
              FHIR standardized health data. Agents changed who can build on it. Almost nobody
              teaches the two together, on real data, with the tools you actually use.
            </p>
            <p>
              Cohort 00 was free, and free made it optional. This one is paid, on purpose. You put
              money down, you do the work, you ship. The people with something at stake are the
              ones who finish.
            </p>
            <p className="border-l-2 border-e-accent pl-4 text-e-ink">
              Eighteen people from real health organizations. Three shipped apps, one open-source
              security collaboration, and a blueprint for a program that works. That was the pilot.
              This is the build.
            </p>
          </div>
        </div>
      </section>

      {/* ── What Cohort 00 built ─────────────────────────────────────────── */}
      <section id="built" className="scroll-mt-20 border-t border-e-line">
        <div className="container py-20 lg:py-28">
          <div className="ed-kicker mb-3">What Cohort 00 built</div>
          <h2 className="ed-display mb-14 max-w-2xl text-3xl sm:text-4xl">
            Real people. Real FHIR. Shipped in six weeks.
          </h2>
          <div className="grid gap-px overflow-hidden border border-e-line bg-e-line sm:grid-cols-3">
            {BUILT.map((b) => (
              <article key={b.name} className="flex flex-col bg-e-paper p-7 lg:p-9">
                <p className="flex-1 text-e-ink">{b.body}</p>
                <div className="mt-8 border-t border-e-line pt-4">
                  <div className="font-medium text-e-ink">{b.name}</div>
                  <div className="ed-kicker mt-1">{b.org}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it runs ──────────────────────────────────────────────────── */}
      <section className="border-t border-e-line">
        <div className="container py-20 lg:py-28">
          <div className="ed-kicker mb-3">How the cohort runs</div>
          <h2 className="ed-display mb-14 max-w-2xl text-3xl sm:text-4xl">
            Twelve weeks, built around the work.
          </h2>
          <div className="grid gap-x-16 gap-y-12 sm:grid-cols-2">
            {HOW.map((item) => (
              <div key={item.n} className="flex gap-6">
                <div className="ed-display shrink-0 text-3xl text-e-accent">{item.n}</div>
                <div>
                  <h3 className="text-lg font-medium text-e-ink">{item.title}</h3>
                  <p className="mt-2 text-e-ink-soft">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ─────────────────────────────────────────────────────── */}
      <section className="border-t border-e-line bg-e-ink text-e-paper">
        <div className="container flex flex-col gap-10 py-20 lg:flex-row lg:items-end lg:justify-between lg:py-24">
          <div className="max-w-xl">
            <div
              className="font-mono text-[11px] uppercase tracking-[0.22em]"
              style={{ color: "var(--e-accent-2)" }}
            >
              Starts late August
            </div>
            <h2 className="ed-display mt-4 text-4xl sm:text-5xl">Build the thing this time.</h2>
            <p className="mt-5 text-lg" style={{ color: "#c9d0d3" }}>
              <span className="font-mono tabular-nums">$1,000</span> for the full twelve weeks, or{" "}
              <span className="font-mono tabular-nums">$99</span>/week, cancel anytime. Cohort 00
              builders enroll at the returning rate.
            </p>
          </div>
          <Link
            href="/cohort-01"
            className="inline-flex shrink-0 items-center justify-center gap-2 bg-e-paper px-8 py-4 text-base font-medium text-e-ink transition-colors hover:bg-e-accent hover:text-e-paper"
          >
            See the program and enroll <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
