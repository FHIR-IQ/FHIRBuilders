import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ListChecks } from "lucide-react";
import { getCohortBySlug } from "@/lib/cohort/cohort-00";
import { PrereqsChecklist } from "./_components/prereqs-checklist";

type PageProps = { params: Promise<{ slug: string }> };

export default async function PrereqsPage({ params }: PageProps) {
  const { slug } = await params;
  const cohort = getCohortBySlug(slug);
  if (!cohort) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="mb-8">
        <Badge variant="outline" className="mb-2 border-rose-300 bg-rose-50 text-rose-700">
          <ListChecks className="mr-1 h-3 w-3" /> Pre-flight
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Ready for Session 1?
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Check off the required items by <strong>Sun Jun 7 EOD</strong> and we hit the
          ground building Monday. Read-only cards are heads-up references — they get
          covered in-session, no action needed now.
        </p>
      </div>

      <PrereqsChecklist cohortSlug={cohort.slug} />
    </div>
  );
}
