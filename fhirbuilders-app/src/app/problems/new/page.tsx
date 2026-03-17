"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, Loader2, Lightbulb, Linkedin } from "lucide-react";

const CATEGORIES = [
  "Care Coordination",
  "Medication Safety",
  "Patient Access",
  "Quality Measurement",
  "Data Access",
  "Workflow Automation",
  "Diagnostics",
  "Other",
];

const AFFECTED_ROLES = [
  "Patients",
  "Nurses",
  "Physicians",
  "Care coordinators",
  "Pharmacists",
  "Administrators",
  "Payers",
  "Family caregivers",
];

const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Occasionally"];

export default function NewProblemPage() {
  const [formState, setFormState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedProblem, setSubmittedProblem] = useState<{ id: string; title: string } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    affectedRoles: [] as string[],
    frequency: "",
    postedByRole: "",
    contactEmail: "",
    willingToAdvise: false,
  });

  const toggleRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      affectedRoles: prev.affectedRoles.includes(role)
        ? prev.affectedRoles.filter((r) => r !== role)
        : [...prev.affectedRoles, role],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.category) {
      setErrorMsg("Please select a category.");
      return;
    }
    if (!formData.frequency) {
      setErrorMsg("Please select how often you see this.");
      return;
    }
    if (formData.affectedRoles.length === 0) {
      setErrorMsg("Please select at least one affected group.");
      return;
    }

    setFormState("loading");

    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmittedProblem({ id: data.problem.id, title: formData.title });
        setFormState("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setFormState("error");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setFormState("error");
    }
  };

  if (formState === "success" && submittedProblem) {
    const shareText = `I just posted a healthcare problem on FHIRBuilders.com: "${submittedProblem.title}". If you're a developer working in health tech, this one is worth solving.`;
    const shareUrl = `https://fhir-builders.vercel.app/problems/${submittedProblem.id}`;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`;

    return (
      <div className="container py-20">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6">
            <Check className="h-8 w-8 text-rose-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Problem posted!</h1>
          <p className="text-muted-foreground mb-6">
            If a builder starts working on it, we&apos;ll let you know.
            Know someone else who has this problem? Share it.
          </p>
          <div className="bg-muted/40 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-muted-foreground italic">&ldquo;{shareText}&rdquo;</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Button asChild className="border-[#0A66C2] bg-[#0A66C2] text-white hover:bg-[#094d9e]">
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                <Linkedin className="mr-2 h-4 w-4" />
                Share on LinkedIn
              </a>
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" asChild>
              <Link href="/problems">See all problems</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/projects">Browse builders working on solutions →</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/problems"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to problems
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-5 w-5 text-rose-500" />
            <h1 className="text-3xl font-bold">Post a Healthcare Problem</h1>
          </div>
          <p className="text-muted-foreground">
            You live with this problem. Describe it like you&apos;re telling a colleague at lunch.
            A builder might read this tomorrow.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Problem Details</CardTitle>
            <CardDescription>
              No jargon needed. Plain language is better. Fields marked * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Title */}
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Problem title <span className="text-red-500">*</span>
                  <span className="text-muted-foreground font-normal ml-1">(max 80 chars)</span>
                </label>
                <Input
                  id="title"
                  type="text"
                  maxLength={80}
                  required
                  placeholder='Care teams have no way to know when their patients are admitted to a different hospital system'
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <p className={`text-xs ${formData.title.length > 70 ? "text-amber-600" : "text-muted-foreground"}`}>
                  {formData.title.length} / 80
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Tell us what happens <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  required
                  placeholder="Describe it like you're telling a colleague at lunch. What do you have to do manually? What gets missed? Who gets hurt?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[140px] px-3 py-2 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-all ${
                        formData.category === cat
                          ? "bg-rose-100 text-rose-700 border-rose-300 ring-2 ring-rose-300 ring-offset-1"
                          : "bg-muted text-muted-foreground border-transparent hover:border-border"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Who does this affect */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Who does this affect? <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {AFFECTED_ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        formData.affectedRoles.includes(role)
                          ? "bg-rose-100 text-rose-800 border-rose-300"
                          : "bg-muted text-muted-foreground border-transparent hover:border-border"
                      }`}
                    >
                      {formData.affectedRoles.includes(role) && (
                        <Check className="inline h-3 w-3 mr-1" />
                      )}
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  How often do you see this? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3 flex-wrap">
                  {FREQUENCIES.map((f) => (
                    <label key={f} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="frequency"
                        value={f}
                        checked={formData.frequency === f}
                        onChange={() => setFormData({ ...formData, frequency: f })}
                        className="accent-rose-500"
                      />
                      <span className="text-sm">{f}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Your role */}
              <div className="space-y-2">
                <label htmlFor="postedByRole" className="text-sm font-medium">
                  Your role (not your name) <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-muted-foreground">
                  E.g. &quot;Hospitalist at an academic medical center&quot; or &quot;Patient advocate&quot;
                </p>
                <Input
                  id="postedByRole"
                  type="text"
                  required
                  placeholder="Hospitalist, community hospital"
                  value={formData.postedByRole}
                  onChange={(e) => setFormData({ ...formData, postedByRole: e.target.value })}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="contactEmail" className="text-sm font-medium">
                  Email <span className="text-muted-foreground font-normal">(optional, not displayed)</span>
                </label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="you@hospital.org"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  We&apos;ll notify you if a builder starts working on this.
                </p>
              </div>

              {/* Willing to advise */}
              <div className="flex items-start gap-3 p-4 bg-muted/40 rounded-lg">
                <input
                  type="checkbox"
                  id="willingToAdvise"
                  checked={formData.willingToAdvise}
                  onChange={(e) => setFormData({ ...formData, willingToAdvise: e.target.checked })}
                  className="mt-1 accent-rose-500"
                />
                <label htmlFor="willingToAdvise" className="text-sm cursor-pointer">
                  <span className="font-medium">I&apos;m open to a 30-minute call</span> if someone starts building a solution.
                  <span className="block text-muted-foreground mt-0.5">Builders can reach out through the platform. Your name stays private.</span>
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                disabled={formState === "loading"}
              >
                {formState === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post this problem"
                )}
              </Button>

              {(formState === "error" || errorMsg) && (
                <p className="text-sm text-red-500 text-center">{errorMsg || "Something went wrong. Please try again."}</p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
