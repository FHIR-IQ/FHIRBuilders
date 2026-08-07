import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, MessagesSquare, BookOpen, Database } from "lucide-react";

export const metadata: Metadata = {
  title: "You're in — Cohort 01 · Healthcare AI Builders",
  robots: { index: false }, // post-checkout page, not for search
};

// Buzz community invite. Set NEXT_PUBLIC_BUZZ_INVITE_URL in Vercel once the
// workspace exists; until then this points at the contact email.
const BUZZ_INVITE =
  process.env.NEXT_PUBLIC_BUZZ_INVITE_URL ?? "mailto:eugene.vestel@gmail.com";

export default function EnrolledPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 lg:px-8">
      <div className="mb-8 text-center">
        <Badge variant="outline" className="mb-3 border-emerald-300 bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="mr-1 h-3 w-3" /> You&apos;re in
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Welcome to Cohort 01.
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-slate-600">
          Payment&apos;s confirmed and your seat is held. Your receipt is in your inbox. Three
          things to do now while it&apos;s in front of you.
        </p>
      </div>

      <div className="space-y-4">
        <Card className="border-slate-200">
          <CardContent className="flex items-start gap-3 p-5">
            <MessagesSquare className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600" />
            <div>
              <div className="font-semibold text-slate-900">1. Join the room on Buzz</div>
              <p className="mt-1 text-sm text-slate-600">
                This is where the cohort lives between Friday demos.{" "}
                <a href={BUZZ_INVITE} className="font-medium text-rose-700 underline">
                  Join the Buzz workspace
                </a>{" "}
                and say what you&apos;re building.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="flex items-start gap-3 p-5">
            <BookOpen className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600" />
            <div>
              <div className="font-semibold text-slate-900">2. Open the materials</div>
              <p className="mt-1 text-sm text-slate-600">
                Self-paced study guides, setup walkthroughs, and the FHIR reference — start
                whenever you like.{" "}
                <Link href="/cohort/cohort-00/session-1/learn" className="font-medium text-rose-700 underline">
                  Go to the materials
                </Link>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="flex items-start gap-3 p-5">
            <Database className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600" />
            <div>
              <div className="font-semibold text-slate-900">3. Bring your agent + LLM account</div>
              <p className="mt-1 text-sm text-slate-600">
                Have your Claude or ChatGPT account ready and Claude Code (or your agent of choice)
                installed. New to it? The week-one materials get you set up. Sandbox access details
                come by email.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        Questions?{" "}
        <a className="underline" href="mailto:eugene.vestel@gmail.com">
          eugene.vestel@gmail.com
        </a>
      </p>
    </div>
  );
}
