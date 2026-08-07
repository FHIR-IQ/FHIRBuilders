"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const ORGS = [
  "Bayada Home Health",
  "Myriad Genetics",
  "LivMor",
  "Indicina",
  "Lanyard Health",
  "Virginia Medicaid",
  "Velox Metadata",
];

// A recognizable ECG beat over a normalized cycle p ∈ [0,1). Returns the
// vertical deflection (positive = up). Shaped P–QRS–T so it reads as a vital
// sign, not a generic sine — the healthcare signal is the brand's pulse.
function beat(p: number): number {
  const g = (center: number, width: number, amp: number) =>
    amp * Math.exp(-((p - center) * (p - center)) / (2 * width * width));
  return (
    g(0.16, 0.022, 0.18) + // P
    g(0.33, 0.006, -0.16) + // Q
    g(0.37, 0.006, 1.0) + // R (spike)
    g(0.41, 0.007, -0.28) + // S
    g(0.62, 0.03, 0.28) // T
  );
}

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let raf = 0;
    let t = 0;

    function resize() {
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      width = r.width;
      height = r.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // One ECG trace. `speed` and `alpha` let us layer a faint echo behind.
    function trace(mid: number, amp: number, period: number, phase: number, color: string, alpha: number, glow: number) {
      ctx!.beginPath();
      for (let x = 0; x <= width; x += 1.5) {
        const p = (x / period + phase) % 1;
        const y = mid - beat(p) * amp;
        if (x === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.strokeStyle = color;
      ctx!.globalAlpha = alpha;
      ctx!.lineWidth = 1.6;
      ctx!.lineJoin = "round";
      ctx!.shadowColor = color;
      ctx!.shadowBlur = glow;
      ctx!.stroke();
      ctx!.shadowBlur = 0;
      ctx!.globalAlpha = 1;
    }

    function frame() {
      ctx!.clearRect(0, 0, width, height);
      const mid = height * 0.52;
      const amp = Math.min(height * 0.26, 150);
      // Faint echo behind, drifting slower.
      trace(mid + 8, amp * 0.7, width * 0.55, t * 0.4, "#2f6f78", 0.35, 6);
      // Primary luminous trace.
      trace(mid, amp, width * 0.62, t, "#5cc7d1", 0.9, 16);
      t += 0.0016;
      raf = requestAnimationFrame(frame);
    }

    resize();
    if (reduced) {
      // Single static frame.
      const mid = height * 0.52;
      const amp = Math.min(height * 0.26, 150);
      trace(mid + 8, amp * 0.7, width * 0.55, 0.2, "#2f6f78", 0.35, 6);
      trace(mid, amp, width * 0.62, 0, "#5cc7d1", 0.9, 16);
    } else {
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduced) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <section
      className="ed-grain relative isolate overflow-hidden"
      style={{ background: "#080b0d", color: "#eef2f2" }}
    >
      {/* Signal canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      {/* Depth: radial glow + top/bottom vignette so type stays legible */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 15% 0%, rgba(92,199,209,0.10), transparent 55%), linear-gradient(180deg, rgba(8,11,13,0.35) 0%, rgba(8,11,13,0) 30%, rgba(8,11,13,0.6) 100%)",
        }}
      />

      <div className="container relative z-10 flex min-h-[92vh] flex-col justify-between pt-28 pb-12 lg:pt-32">
        <div className="max-w-5xl">
          {/* Live kicker */}
          <div
            className="mb-8 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.28em]"
            style={{ color: "#8fb6bb" }}
          >
            <span
              className="ed-pulse inline-block h-2 w-2 rounded-full"
              style={{ background: "#5cc7d1", boxShadow: "0 0 12px #5cc7d1" }}
            />
            Cohort 01 · Enrolling · Starts late August
          </div>

          {/* Monumental headline, line-by-line reveal */}
          <h1
            className="ed-display font-normal"
            style={{
              fontSize: "clamp(3rem, 10.5vw, 9rem)",
              lineHeight: 0.92,
              letterSpacing: "-0.03em",
            }}
          >
            <span className="ed-line-mask block">
              <span className="ed-line-in block" style={{ animationDelay: "0.05s" }}>
                Ship healthcare AI
              </span>
            </span>
            <span className="ed-line-mask block">
              <span className="ed-line-in block" style={{ animationDelay: "0.16s" }}>
                on{" "}
                <span style={{ fontStyle: "italic", color: "#5cc7d1" }}>real FHIR</span>.
              </span>
            </span>
          </h1>

          <p
            className="ed-rise mt-8 max-w-xl text-lg sm:text-xl"
            style={{ color: "#aeb9bb", animationDelay: "0.5s" }}
          >
            A build cohort for people who make things. Twelve weeks on live patient data, your own
            agents, and a demo every Friday. You leave with deployed work and the reel to prove it.
          </p>

          <div
            className="ed-rise mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "0.62s" }}
          >
            <Link
              href="/cohort-01"
              className="group inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-medium transition-transform hover:-translate-y-0.5"
              style={{ background: "#5cc7d1", color: "#06282c" }}
            >
              Enroll in Cohort 01
              <span className="transition-transform group-hover:translate-x-1" aria-hidden>
                →
              </span>
            </Link>
            <a
              href="#built"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 text-base transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.18)", color: "#dfe6e6" }}
            >
              See what Cohort 00 built
            </a>
          </div>
        </div>

        {/* Ticker of orgs, riding the baseline */}
        <div
          className="ed-rise mt-16 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-5 font-mono text-xs"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: "#7f8d90", animationDelay: "0.8s" }}
        >
          <span style={{ color: "#5b6b6e" }}>BUILDERS FROM</span>
          {ORGS.map((org) => (
            <span key={org} className="flex items-center gap-4">
              <span style={{ color: "#3a4749" }}>/</span>
              {org}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
