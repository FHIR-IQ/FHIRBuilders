import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ChevronRight, Sparkles } from "lucide-react";
import { getCohortBySlug } from "@/lib/cohort/cohort-00";
import { CommitmentsWidget } from "../_components/commitments-widget";

type PageProps = { params: Promise<{ slug: string }> };

export default async function PlanPage({ params }: PageProps) {
  const { slug } = await params;
  const cohort = getCohortBySlug(slug);
  if (!cohort) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="outline" className="border-rose-300 bg-rose-50 text-rose-700">
            <Sparkles className="mr-1 h-3 w-3" /> Plan
          </Badge>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            Pre-launch · Cohort starts Mon Jun 8
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          What are you shipping this week?
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Three commitments. Public-by-default. Your pod sees them on Monday and reviews
          them on Friday. Keep them small enough to actually finish.
        </p>
      </div>

      <CommitmentsWidget cohortSlug={cohort.slug} />

      <Card className="mt-6 border-dashed">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarDays className="h-4 w-4 text-slate-600" /> Last week
              </CardTitle>
              <CardDescription>
                Your shipped vs. carried-over commitments roll up here every Sunday at midnight ET.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Empty
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Nothing yet — Cohort 00 starts Mon Jun 8. Your first roll-up appears Sun Jun 14.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ChevronRight className="h-4 w-4 text-slate-600" /> Pod plan (next week)
          </CardTitle>
          <CardDescription>
            Your pod&apos;s combined commitments + the one slice you&apos;re demoing Friday.
            Visible to all 4 pod-mates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Available after pod assignment (Fri Jun 5 EOD).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
