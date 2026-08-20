import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "./_components/hero";
import { Reveal } from "./_components/reveal";
import { EmailCapture } from "./_components/email-capture";

export const metadata: Metadata = {
  title: "Healthcare AI Builders — Ship healthcare AI on real FHIR",
  description:
    "A paid, 12-week build cohort for healthcare AI on real FHIR data. Weekly demos, your own agents, live problem-solving. Starts late August.",
};

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
      <Hero />

      {/* ── Thesis ───────────────────────────────────────────────────────── */}
      <section className="border-t border-e-line">
        <Reveal className="container grid gap-10 py-24 lg:grid-cols-[1.15fr_1fr] lg:gap-24 lg:py-36">
          <h2
            className="ed-display"
            style={{ fontSize: "clamp(2.1rem, 5vw, 4rem)", lineHeight: 1.02 }}
          >
            AI courses skip healthcare data. FHIR courses skip AI. This is where{" "}
            <span style={{ fontStyle: "italic", color: "var(--e-accent)" }}>both</span> get built.
          </h2>
          <div className="space-y-5 text-e-ink-soft lg:pt-3">
            <p className="text-lg">
              FHIR standardized health data. Agents changed who can build on it. Almost nobody
              teaches the two together, on real data, with the tools you actually use.
            </p>
            <p>
              Cohort 00 was free, and free made it optional. This one is paid, on purpose. You put
              money down, you do the work, you ship. The people with something at stake are the
              ones who finish.
            </p>
            <p className="border-l-2 border-e-accent pl-5 text-e-ink">
              Seventeen people from real health organizations. Three shipped apps, one open-source
              security collaboration, and a blueprint for a program that works. That was the pilot.
              This is the build.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── What Cohort 00 built ─────────────────────────────────────────── */}
      <section id="built" className="scroll-mt-20 border-t border-e-line">
        <div className="container py-24 lg:py-36">
          <Reveal className="mb-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="ed-kicker mb-4">What Cohort 00 built</div>
              <h2
                className="ed-display max-w-2xl"
                style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", lineHeight: 1.02 }}
              >
                Real people. Real FHIR. Shipped in six weeks.
              </h2>
            </div>
          </Reveal>
          <Reveal className="grid gap-px overflow-hidden border border-e-line bg-e-line lg:grid-cols-3">
            {BUILT.map((b, i) => (
              <article
                key={b.name}
                className="group flex flex-col bg-e-paper p-8 transition-colors hover:bg-e-paper-2 lg:p-10"
              >
                <div
                  className="ed-display mb-6 text-e-line-strong transition-colors group-hover:text-e-accent"
                  style={{ fontSize: "2.5rem", lineHeight: 1 }}
                >
                  0{i + 1}
                </div>
                <p className="flex-1 text-[1.05rem] leading-relaxed text-e-ink">{b.body}</p>
                <div className="mt-10 border-t border-e-line pt-4">
                  <div className="font-medium text-e-ink">{b.name}</div>
                  <div className="ed-kicker mt-1">{b.org}</div>
                </div>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── How it runs ──────────────────────────────────────────────────── */}
      <section className="border-t border-e-line">
        <div className="container py-24 lg:py-36">
          <Reveal className="mb-16">
            <div className="ed-kicker mb-4">How the cohort runs</div>
            <h2
              className="ed-display max-w-2xl"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", lineHeight: 1.02 }}
            >
              Twelve weeks, built around the work.
            </h2>
          </Reveal>
          <Reveal className="grid gap-x-16 gap-y-16 sm:grid-cols-2">
            {HOW.map((item) => (
              <div key={item.n} className="flex flex-col gap-4 border-t border-e-line pt-6 sm:flex-row sm:gap-8">
                <div
                  className="ed-display shrink-0 tabular-nums text-e-accent"
                  style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", lineHeight: 0.9 }}
                >
                  {item.n}
                </div>
                <div className="max-w-md">
                  <h3 className="ed-display text-2xl text-e-ink">{item.title}</h3>
                  <p className="mt-3 text-e-ink-soft">{item.body}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Email capture (light) ────────────────────────────────────────── */}
      <EmailCapture variant="light" source="home" />

      {/* ── CTA band ─────────────────────────────────────────────────────── */}
      <section className="ed-grain relative isolate border-t border-e-line" style={{ background: "#080b0d", color: "#eef2f2" }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(100% 100% at 85% 0%, rgba(92,199,209,0.12), transparent 60%)" }}
        />
        <div className="container relative z-10 flex flex-col gap-12 py-24 lg:flex-row lg:items-end lg:justify-between lg:py-32">
          <div className="max-w-2xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.28em]" style={{ color: "#5cc7d1" }}>
              Starts late August
            </div>
            <h2
              className="ed-display mt-5"
              style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)", lineHeight: 0.95, letterSpacing: "-0.02em" }}
            >
              Build the thing
              <br />
              this <span style={{ fontStyle: "italic", color: "#5cc7d1" }}>time</span>.
            </h2>
            <p className="mt-7 text-lg" style={{ color: "#aeb9bb" }}>
              <span className="font-mono tabular-nums" style={{ color: "#eef2f2" }}>
                $1,000
              </span>{" "}
              for the full twelve weeks, or{" "}
              <span className="font-mono tabular-nums" style={{ color: "#eef2f2" }}>
                $99
              </span>
              /week, cancel anytime. Cohort 00 builders enroll at the returning rate.
            </p>
          </div>
          <Link
            href="/cohort-01"
            className="group inline-flex shrink-0 items-center justify-center gap-2 px-8 py-4 text-base font-medium transition-transform hover:-translate-y-0.5"
            style={{ background: "#5cc7d1", color: "#06282c" }}
          >
            See the program and enroll
            <span className="transition-transform group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
