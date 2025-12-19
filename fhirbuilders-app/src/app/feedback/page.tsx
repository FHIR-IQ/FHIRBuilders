"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Check,
  Loader2,
  MessageSquare,
} from "lucide-react";

const EASE_OPTIONS = [
  { value: 1, label: "Very difficult" },
  { value: 2, label: "Difficult" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Easy" },
  { value: 5, label: "Very easy" },
];

const DATA_OPTIONS = [
  { value: "yes", label: "Yes, exactly what I needed" },
  { value: "partially", label: "Partially, some gaps" },
  { value: "no", label: "No, missing critical data" },
];

const NPS_SCORES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function FeedbackPage() {
  const [formState, setFormState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    email: "",
    easeOfUse: 0,
    dataFit: "",
    whatBuilt: "",
    topRequest: "",
    nps: -1,
    canShare: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormState("success");
      } else {
        setFormState("error");
      }
    } catch {
      setFormState("error");
    }
  };

  if (formState === "success") {
    return (
      <div className="container py-20">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Thank you for your feedback!</h1>
          <p className="text-muted-foreground mb-8">
            Your input helps us build a better product. We appreciate you taking the time.
          </p>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">
            How's Your Sandbox Experience?
          </h1>
          <p className="text-lg text-muted-foreground">
            Quick 2-minute survey to help us improve
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Your Feedback</CardTitle>
            <CardDescription>
              All fields are optional, but we'd love to hear your thoughts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email (so we can follow up)
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Ease of use */}
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  1. How easy was it to get started? (1-5)
                </label>
                <div className="flex gap-2 flex-wrap">
                  {EASE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, easeOfUse: option.value })}
                      className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                        formData.easeOfUse === option.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "hover:border-primary/50"
                      }`}
                    >
                      {option.value} - {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data fit */}
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  2. Did the sandbox have the data you needed?
                </label>
                <div className="space-y-2">
                  {DATA_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.dataFit === option.value
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="dataFit"
                        value={option.value}
                        checked={formData.dataFit === option.value}
                        onChange={(e) => setFormData({ ...formData, dataFit: e.target.value })}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          formData.dataFit === option.value
                            ? "border-primary"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {formData.dataFit === option.value && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* What did you build */}
              <div className="space-y-2">
                <label htmlFor="whatBuilt" className="text-sm font-medium">
                  3. What did you build or test?
                </label>
                <textarea
                  id="whatBuilt"
                  placeholder="Tell us about your project..."
                  value={formData.whatBuilt}
                  onChange={(e) => setFormData({ ...formData, whatBuilt: e.target.value })}
                  className="w-full min-h-[100px] px-3 py-2 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Top request */}
              <div className="space-y-2">
                <label htmlFor="topRequest" className="text-sm font-medium">
                  4. What's the #1 thing we should add?
                </label>
                <textarea
                  id="topRequest"
                  placeholder="More data types, better docs, specific features..."
                  value={formData.topRequest}
                  onChange={(e) => setFormData({ ...formData, topRequest: e.target.value })}
                  className="w-full min-h-[80px] px-3 py-2 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* NPS */}
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  5. How likely are you to recommend FHIRBuilders? (0-10)
                </label>
                <div className="flex gap-1 flex-wrap">
                  {NPS_SCORES.map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setFormData({ ...formData, nps: score })}
                      className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                        formData.nps === score
                          ? "border-primary bg-primary text-primary-foreground"
                          : "hover:border-primary/50"
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Not at all likely</span>
                  <span>Extremely likely</span>
                </div>
              </div>

              {/* Share consent */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <input
                  type="checkbox"
                  id="canShare"
                  checked={formData.canShare}
                  onChange={(e) => setFormData({ ...formData, canShare: e.target.checked })}
                  className="mt-1"
                />
                <label htmlFor="canShare" className="text-sm">
                  <span className="font-medium">You can share my project on your site</span>
                  <p className="text-muted-foreground mt-1">
                    We may feature your project as a success story (with your approval on specifics)
                  </p>
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={formState === "loading"}
              >
                {formState === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>

              {formState === "error" && (
                <p className="text-sm text-red-500 text-center">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
