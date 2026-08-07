"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { CohortPlan } from "@/lib/stripe";

type Props = { repeat: boolean };

// Rendered on the dark (ink) enroll band, so buttons are light-on-dark.
export function EnrollButtons({ repeat }: Props) {
  const [loading, setLoading] = useState<CohortPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function enroll(plan: CohortPlan) {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/cohort01/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Couldn't start checkout. Please try again.");
        setLoading(null);
        return;
      }
      window.location.href = data.url; // Stripe hosted checkout
    } catch {
      setError("Network error. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => enroll("full")}
          disabled={loading !== null}
          className="inline-flex flex-1 items-center justify-center gap-2 bg-e-paper px-6 py-3.5 text-base font-medium text-e-ink transition-colors hover:bg-e-accent hover:text-e-paper disabled:opacity-60"
        >
          {loading === "full" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Starting checkout…
            </>
          ) : (
            <>Enroll — pay for all 12 weeks</>
          )}
        </button>
        <button
          onClick={() => enroll("weekly")}
          disabled={loading !== null}
          className="inline-flex flex-1 items-center justify-center gap-2 border px-6 py-3.5 text-base text-e-paper transition-colors hover:border-e-paper disabled:opacity-60"
          style={{ borderColor: "var(--e-line-strong)" }}
        >
          {loading === "weekly" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Starting checkout…
            </>
          ) : (
            <>Enroll — pay weekly</>
          )}
        </button>
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}

      {repeat && (
        <p className="text-sm font-medium" style={{ color: "var(--e-accent-2)" }}>
          You&apos;re a Cohort 00 builder. Your returning-builder rate is applied automatically at
          checkout.
        </p>
      )}

      <p className="text-[11px]" style={{ color: "#8b949a" }}>
        Secure checkout via Stripe. Weekly plan cancels anytime from your receipt. Sign in first if
        you&apos;re a returning builder so your discount applies.
      </p>
    </div>
  );
}
