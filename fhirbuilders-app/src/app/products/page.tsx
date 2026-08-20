import type { Metadata } from "next";
import { EmailCapture } from "../_components/email-capture";

export const metadata: Metadata = {
  title: "Digital products for builders — ship faster on real FHIR",
  description:
    "Templates, Claude Code skills, and a self-paced course for building healthcare AI on real FHIR. Launching with Cohort 01 — join for early access.",
};

// v1: a showcase + demand gauge. Paid checkout is intentionally deferred until
// the dedicated Healthcare AI Builders Stripe account is live (see the cohort
// enrollment flow). Until then the CTA is email capture (source="products"),
// so we measure real willingness-to-buy before wiring payment.
const PRODUCTS = [
  {
    n: "01",
    name: "FHIR App Starter Templates",
    price: "$49",
    body: "Clone-and-ship templates for the things you keep rebuilding: a SMART-on-FHIR app, an MCP server over a FHIR store, and a data-quality harness with synthetic patients. Wired for Claude Code from the first commit.",
  },
  {
    n: "02",
    name: "Claude Code Skills for FHIR",
    price: "$29",
    body: "A pack of agent skills that make Claude Code fluent in FHIR — resource scaffolding, validation, Synthea data, and Medplum wiring — so you spend your prompts on the product, not the plumbing.",
  },
  {
    n: "03",
    name: "FHIR + AI with Claude Code",
    price: "$99",
    body: "The Cohort 01 Session-1 curriculum as a self-paced course: from an empty terminal to a working app on real FHIR data. For builders who want the material without the live cohort.",
  },
];

export default function ProductsPage() {
  return (
    <div className="ed-surface bg-e-paper text-e-ink">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className="border-b border-e-line">
        <div className="container py-24 lg:py-32">
          <div className="ed-kicker mb-5">For builders · Launching with Cohort 01</div>
          <h1
            className="ed-display max-w-4xl"
            style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)", lineHeight: 0.98, letterSpacing: "-0.02em" }}
          >
            Ship faster on{" "}
            <span style={{ fontStyle: "italic", color: "var(--e-accent)" }}>real FHIR</span>.
          </h1>
          <p className="mt-7 max-w-xl text-lg text-e-ink-soft">
            The templates, skills, and course we build the cohort on — packaged for every other
            builder. Not live yet: they drop with Cohort 01, and the list gets them first, at the
            launch price.
          </p>
        </div>
      </section>

      {/* ── Product grid ─────────────────────────────────────────────────── */}
      <section>
        <div className="container py-20 lg:py-28">
          <div className="grid gap-px overflow-hidden border border-e-line bg-e-line lg:grid-cols-3">
            {PRODUCTS.map((p) => (
              <article key={p.n} className="flex flex-col bg-e-paper p-8 lg:p-10">
                <div className="flex items-baseline justify-between">
                  <div
                    className="ed-display text-e-line-strong"
                    style={{ fontSize: "2.25rem", lineHeight: 1 }}
                  >
                    {p.n}
                  </div>
                  <div className="ed-kicker" style={{ color: "var(--e-accent)" }}>
                    Early access
                  </div>
                </div>
                <h2 className="ed-display mt-6 text-2xl text-e-ink">{p.name}</h2>
                <p className="mt-3 flex-1 text-[1.02rem] leading-relaxed text-e-ink-soft">{p.body}</p>
                <div className="mt-8 flex items-baseline gap-2 border-t border-e-line pt-4">
                  <span className="font-mono text-lg tabular-nums text-e-ink">{p.price}</span>
                  <span className="ed-kicker">at launch</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capture (products) ───────────────────────────────────────────── */}
      <EmailCapture
        source="products"
        kicker="Early access"
        heading={
          <>
            Get the builder kit <span style={{ fontStyle: "italic", color: "#5cc7d1" }}>first</span>.
          </>
        }
        sub="Templates, skills, and the self-paced course drop with Cohort 01. Join and you get them at the launch price, before anyone else."
        cta="Get early access"
      />
    </div>
  );
}
