import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { isCohortMember } from "@/lib/cohort/cohort-00";
import { COHORT_01_PRICING } from "@/lib/stripe";
import { EnrollButtons } from "./_components/enroll-buttons";

export const metadata: Metadata = {
  title: "Cohort 01 — The FHIR + AI build cohort",
  description:
    "Twelve weeks, paid, build-in-public. Ship healthcare AI on real FHIR with your own agents. Weekly Friday demos. Starts late August.",
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

const HOW = [
  {
    n: "01",
    title: "A demo every Friday",
    body: "The spine of the cohort. You show what you built this week, live and on camera, solo or with your team. Recorded, and the best clips go on LinkedIn with your name on them.",
  },
  {
    n: "02",
    title: "You and your agents",
    body: "Come with an agent setup or build one in week one. Claude Code, Codex, your own MCP servers, whatever you drive. We build with agents, not despite them.",
  },
  {
    n: "03",
    title: "Problems solved live",
    body: "Free-form working sessions, not lectures. Bring what is blocking you and we unblock it in the room. Stuck is a feature of the format, not a failure.",
  },
  {
    n: "04",
    title: "The room stays on",
    body: "Between Fridays the cohort lives on Buzz, Block's new team chat, where you share progress, trade fixes, and get unstuck without waiting for the call.",
  },
];

export default async function Cohort01Page() {
  const session = await auth();
  const repeat = isCohortMember(session?.user?.email);

  const full = repeat ? COHORT_01_PRICING.full.repeat : COHORT_01_PRICING.full.standard;
  const weekly = repeat ? COHORT_01_PRICING.weekly.repeat : COHORT_01_PRICING.weekly.standard;

  return (
    <div className="ed-surface bg-e-paper text-e-ink">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="container pt-20 pb-14 lg:pt-24">
        <div className="max-w-3xl">
          <div className="ed-kicker">Cohort 01 · 12 weeks · paid · starts late August</div>
          <h1 className="ed-display mt-5 text-[2.75rem] leading-[0.98] sm:text-6xl">
            The FHIR + AI build cohort.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-e-ink-soft sm:text-xl">
            Twelve weeks. Real patient data. Your own agents. You ship healthcare AI in public,
            demo it live every Friday, and walk out with deployed work and a reel of it. Solo or
            bring your team.
          </p>
          <p className="mt-4 max-w-2xl text-e-ink-soft">
            Cohort 00 was free, and free made it optional. This one is paid on purpose: you put
            money down, you do the work, you ship. Nobody drifts.
          </p>
          <div className="mt-8">
            <a
              href="#enroll"
              className="inline-flex items-center gap-2 bg-e-ink px-6 py-3.5 text-base font-medium text-e-paper transition-colors hover:bg-e-accent"
            >
              Enroll <span aria-hidden>→</span>
            </a>
          </div>
        </div>

        <div className="mt-16 border-t border-e-line pt-6">
          <div className="ed-kicker mb-3">Cohort 00 builders came from</div>
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

      {/* ── How it runs ──────────────────────────────────────────────────── */}
      <section className="border-t border-e-line">
        <div className="container py-20">
          <div className="ed-kicker mb-3">How it runs</div>
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
          <p className="mt-12 max-w-2xl border-t border-e-line pt-6 text-sm text-e-ink-soft">
            <span className="font-medium text-e-ink">What you bring:</span> your own LLM account
            (Claude, ChatGPT, whatever you run) and the agent you drive. This is a build cohort. We
            will help you set up in week one if you are starting fresh, but the accounts are yours.
            The shared FHIR sandbox and curriculum are included.
          </p>
        </div>
      </section>

      {/* ── Enroll ───────────────────────────────────────────────────────── */}
      <section id="enroll" className="scroll-mt-20 border-t border-e-line bg-e-ink text-e-paper">
        <div className="container py-20">
          <div
            className="font-mono text-[11px] uppercase tracking-[0.22em]"
            style={{ color: "var(--e-accent-2)" }}
          >
            Enroll
          </div>
          <h2 className="ed-display mt-4 max-w-2xl text-4xl sm:text-5xl">
            Pay once, or week to week.
          </h2>
          <p className="mt-4 max-w-xl" style={{ color: "#c9d0d3" }}>
            No application, no waiting list. Paying is how you claim your seat.
          </p>

          <div className="mt-12 grid gap-px overflow-hidden border sm:grid-cols-2" style={{ borderColor: "var(--e-line-strong)", background: "var(--e-line-strong)" }}>
            <div className="bg-e-ink p-8">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--e-accent-2)" }}>
                Full 12 weeks
              </div>
              <div className="ed-display mt-3 text-5xl tabular-nums">${full.toLocaleString()}</div>
              <p className="mt-3 text-sm" style={{ color: "#c9d0d3" }}>
                One payment, whole cohort. Best value, under{" "}
                <span className="font-mono tabular-nums">${Math.round(full / 12)}</span>/week.
                {repeat && (
                  <span className="mt-1 block font-medium" style={{ color: "var(--e-accent-2)" }}>
                    Returning-builder rate applied.
                  </span>
                )}
              </p>
            </div>
            <div className="bg-e-ink p-8">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "#c9d0d3" }}>
                Pay weekly
              </div>
              <div className="ed-display mt-3 text-5xl tabular-nums">
                ${weekly}
                <span className="text-xl" style={{ color: "#8b949a" }}>
                  /wk
                </span>
              </div>
              <p className="mt-3 text-sm" style={{ color: "#c9d0d3" }}>
                Cancel anytime. If a week is not worth it, do not pay for the next one. That keeps
                me honest.
                {repeat && (
                  <span className="mt-1 block font-medium" style={{ color: "var(--e-accent-2)" }}>
                    Returning-builder rate.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <EnrollButtons repeat={repeat} />
          </div>

          {!repeat && (
            <p className="mt-6 max-w-2xl text-sm" style={{ color: "#c9d0d3" }}>
              <span className="font-medium text-e-paper">Cohort 00 builder or returning?</span> Sign
              in with your cohort email before enrolling and your discounted rate applies
              automatically (${COHORT_01_PRICING.full.repeat.toLocaleString()} full / $
              {COHORT_01_PRICING.weekly.repeat}/week).
            </p>
          )}
        </div>
      </section>

      {/* ── Dates ────────────────────────────────────────────────────────── */}
      <section className="border-t border-e-line">
        <div className="container py-16">
          <div className="grid gap-6 sm:grid-cols-[1fr_2fr]">
            <div className="ed-kicker">Dates &amp; format</div>
            <p className="max-w-2xl text-e-ink-soft">
              Twelve weeks starting late August, weekly Friday demo sessions (time confirmed to
              enrolled builders, recorded either way). Once you enroll you get the Buzz invite, the
              async materials, and the FHIR sandbox the same day.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-e-line">
        <div className="container py-10 text-xs text-e-ink-faint">
          <span className="font-mono">FHIR IQ · Healthcare AI Builders.</span> Questions before you
          enroll?{" "}
          <a className="text-e-accent underline underline-offset-2" href="mailto:eugene.vestel@gmail.com">
            eugene.vestel@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
}
