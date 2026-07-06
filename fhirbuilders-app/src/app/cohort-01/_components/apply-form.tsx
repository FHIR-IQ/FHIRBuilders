"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

type FormState = "idle" | "submitting" | "done" | "error";

const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100";

export function ApplyForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    orgRole: "",
    building: "",
    referredBy: "",
    demoDayInvite: true,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setError(null);
    try {
      const res = await fetch("/api/cohort01/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setError("Network error. Please try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
        <p className="font-semibold text-slate-900">Application in.</p>
        <p className="mt-1 text-sm text-slate-600">
          We review on a rolling basis and reply within a few days. If you asked for a Demo Day
          invite, the link comes by email before Jul 15.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-xs font-medium text-slate-600">
            Name *
          </label>
          <input
            id="name"
            required
            className={inputCls}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-600">
            Email *
          </label>
          <input
            id="email"
            type="email"
            required
            className={inputCls}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label htmlFor="orgRole" className="mb-1 block text-xs font-medium text-slate-600">
          Organization &amp; role
        </label>
        <input
          id="orgRole"
          className={inputCls}
          placeholder="e.g. Director of Clinical Informatics, Bayada"
          value={form.orgRole}
          onChange={(e) => setForm({ ...form, orgRole: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="building" className="mb-1 block text-xs font-medium text-slate-600">
          What will you build? *
        </label>
        <textarea
          id="building"
          required
          rows={4}
          className={inputCls}
          placeholder="Two or three sentences. Who uses it, what data it touches, what it does. Rough is fine - specific beats polished."
          value={form.building}
          onChange={(e) => setForm({ ...form, building: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="referredBy" className="mb-1 block text-xs font-medium text-slate-600">
          Referred by a Cohort 00 builder?
        </label>
        <input
          id="referredBy"
          className={inputCls}
          placeholder="Their name - referred applicants get priority review"
          value={form.referredBy}
          onChange={(e) => setForm({ ...form, referredBy: e.target.value })}
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600"
          checked={form.demoDayInvite}
          onChange={(e) => setForm({ ...form, demoDayInvite: e.target.checked })}
        />
        <span>
          Invite me to watch Cohort 00 Demo Day live (Wed Jul 15, 6:30 PM ET) - free, no
          commitment
        </span>
      </label>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <Button type="submit" disabled={state === "submitting"} className="w-full sm:w-auto">
        {state === "submitting" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
          </>
        ) : (
          "Apply for Cohort 01"
        )}
      </Button>
      <p className="text-[11px] text-slate-500">
        Takes about 3 minutes. Applying doesn&apos;t commit you to anything - payment only happens
        after you&apos;re accepted and confirm your seat.
      </p>
    </form>
  );
}
