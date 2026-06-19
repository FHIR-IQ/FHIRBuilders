"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Loader2, CheckCircle } from "lucide-react";

const SUGGESTED = [25, 50, 100, 200] as const;

type PageProps = { params: Promise<{ slug: string }> };

export default function ContributePage({ params }: PageProps) {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "1";
  const canceled = searchParams.get("canceled") === "1";

  const [slug, setSlug] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | "">(50);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resolve params (Next.js 15 async params)
  if (!slug) {
    params.then((p) => setSlug(p.slug));
  }

  const effectiveAmount = custom !== "" ? Number(custom) : typeof amount === "number" ? amount : 0;

  async function handleCheckout() {
    if (!slug) return;
    if (effectiveAmount < 25) {
      setError("Minimum contribution is $25.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/payments/cohort-contribution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: effectiveAmount, cohortSlug: slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
        <h1 className="text-2xl font-bold text-slate-900">Thank you.</h1>
        <p className="mt-2 text-slate-600">
          Your contribution helps cover the time investment and plan for Cohort 1 in August. Much appreciated.
        </p>
        <Button className="mt-6" asChild>
          <a href={slug ? `/cohort/${slug}` : "/cohort"}>Back to cohort</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <Badge variant="outline" className="mb-3 border-rose-300 bg-rose-50 text-rose-700">
          <Heart className="mr-1 h-3 w-3" /> Support the cohort
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Pay what you want
        </h1>
        <p className="mt-2 text-slate-600">
          This cohort has been free. Starting Session 4, contributions help cover the time
          and fund Cohort 1 in August. No pressure — contribute what feels right.
        </p>
      </div>

      {canceled && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Payment canceled — no charge was made.
        </div>
      )}

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-4 grid grid-cols-4 gap-2">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => { setAmount(s); setCustom(""); setError(null); }}
                className={`rounded-lg border py-3 text-sm font-semibold transition ${
                  amount === s && custom === ""
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                ${s}
              </button>
            ))}
          </div>

          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Custom amount (min $25)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                min={25}
                step={1}
                placeholder="Enter amount"
                value={custom}
                onChange={(e) => { setCustom(e.target.value); setAmount(""); setError(null); }}
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-7 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-0"
              />
            </div>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-600">{error}</p>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={loading || effectiveAmount < 25}
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecting…</>
            ) : (
              <>Contribute ${effectiveAmount || "—"} via Stripe</>
            )}
          </Button>

          <p className="mt-3 text-center text-[11px] text-slate-400">
            Secure payment via Stripe · Card, Apple Pay, Google Pay
          </p>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-slate-500">
        Want to skip or contribute $0? That&apos;s completely fine —&nbsp;
        <a href={slug ? `/cohort/${slug}` : "/cohort"} className="underline">
          go back to the cohort
        </a>.
      </p>
    </div>
  );
}
