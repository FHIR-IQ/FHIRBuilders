"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { analytics } from "@/lib/analytics";

// Self-contained email capture band. Ships its own background + palette so it
// reads as a deliberate island wherever it lands — including on pre-redesign
// pages (/sandbox/demo, /openclaw) that don't use the editorial system.
//
// Posts to the existing /api/waitlist route with a `source` tag (which page
// converted) and fires a `lead_capture` analytics event. The route best-effort
// sends a confirmation email; a failure there never blocks the signup.
export function EmailCapture({
  source,
  variant = "dark",
  kicker = "Healthcare AI Builders",
  heading,
  sub = "Get the Cohort 01 syllabus and first notice when enrollment opens. No spam — occasional build resources, that's it.",
  cta = "Get the syllabus",
}: {
  source: string;
  variant?: "dark" | "light";
  kicker?: string;
  heading?: ReactNode;
  sub?: string;
  cta?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const dark = variant === "dark";
  const accent = dark ? "#5cc7d1" : "var(--e-accent)";

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Enter a valid email.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, source }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong.");
      }
      analytics.trackLeadCapture(source);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const defaultHeading = (
    <>
      Build on real FHIR — <span style={{ fontStyle: "italic", color: accent }}>with us</span>.
    </>
  );

  return (
    <section
      className={dark ? "ed-grain relative isolate overflow-hidden border-t" : "border-t border-e-line"}
      style={
        dark
          ? { background: "#080b0d", color: "#eef2f2", borderColor: "rgba(255,255,255,0.08)" }
          : { background: "var(--e-paper-2)", color: "var(--e-ink)" }
      }
    >
      {dark && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 90% at 85% 0%, rgba(92,199,209,0.12), transparent 60%)",
          }}
        />
      )}
      <div className="container relative z-10 grid gap-8 py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:py-20">
        <div className="max-w-xl">
          <div
            className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em]"
            style={{ color: dark ? "#8fb6bb" : "var(--e-ink-faint)" }}
          >
            {kicker}
          </div>
          <h2
            className="ed-display"
            style={{ fontSize: "clamp(1.75rem, 3.6vw, 2.75rem)", lineHeight: 1.04 }}
          >
            {heading ?? defaultHeading}
          </h2>
          <p className="mt-4 text-[1.02rem]" style={{ color: dark ? "#aeb9bb" : "var(--e-ink-soft)" }}>
            {sub}
          </p>
        </div>

        <div className="lg:justify-self-end lg:w-full">
          {status === "success" ? (
            <div
              className="flex items-start gap-3 p-5"
              style={{
                border: dark ? "1px solid rgba(92,199,209,0.35)" : "1px solid var(--e-line-strong)",
                background: dark ? "rgba(92,199,209,0.06)" : "var(--e-accent-soft)",
              }}
            >
              <span aria-hidden style={{ color: accent, fontSize: "1.1rem", lineHeight: 1.4 }}>
                ✓
              </span>
              <div>
                <div className="font-medium" style={{ color: dark ? "#eef2f2" : "var(--e-ink)" }}>
                  You&apos;re on the list.
                </div>
                <p className="mt-1 text-sm" style={{ color: dark ? "#aeb9bb" : "var(--e-ink-soft)" }}>
                  Check your inbox for the details. Reply to that email and tell us what you&apos;re
                  building.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor={`ec-${source}`}>
                  Email address
                </label>
                <input
                  id={`ec-${source}`}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder="you@work.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  className="min-w-0 flex-1 px-4 py-3.5 text-base outline-none transition-colors focus:ring-2"
                  style={{
                    background: dark ? "rgba(255,255,255,0.06)" : "#fff",
                    border: dark ? "1px solid rgba(255,255,255,0.18)" : "1px solid var(--e-line-strong)",
                    color: dark ? "#eef2f2" : "var(--e-ink)",
                  }}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="shrink-0 px-6 py-3.5 text-base font-medium transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                  style={
                    dark
                      ? { background: "#5cc7d1", color: "#06282c" }
                      : { background: "var(--e-ink)", color: "var(--e-paper-2)" }
                  }
                >
                  {status === "loading" ? "…" : cta}
                </button>
              </div>
              {status === "error" && (
                <p className="text-sm" style={{ color: dark ? "#ff9c9c" : "#b42318" }}>
                  {error}
                </p>
              )}
              <p className="text-xs" style={{ color: dark ? "#7f8d90" : "var(--e-ink-faint)" }}>
                No spam. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
