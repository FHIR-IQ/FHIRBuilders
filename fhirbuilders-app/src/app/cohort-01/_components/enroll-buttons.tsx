"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { CohortPlan } from "@/lib/stripe";

type Props = { repeat: boolean };

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
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={() => enroll("full")}
          disabled={loading !== null}
          className="flex-1"
          size="lg"
        >
          {loading === "full" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting checkout…
            </>
          ) : (
            <>Enroll — pay for all 12 weeks</>
          )}
        </Button>
        <Button
          onClick={() => enroll("weekly")}
          disabled={loading !== null}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          {loading === "weekly" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting checkout…
            </>
          ) : (
            <>Enroll — pay weekly</>
          )}
        </Button>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {repeat && (
        <p className="text-sm font-medium text-emerald-700">
          ✓ You&apos;re a Cohort 00 builder — your returning-builder rate is applied automatically
          at checkout.
        </p>
      )}
      <p className="text-[11px] text-slate-500">
        Secure checkout via Stripe. Weekly plan cancels anytime from your receipt. Sign in first if
        you&apos;re a returning builder so your discount applies.
      </p>
    </div>
  );
}
