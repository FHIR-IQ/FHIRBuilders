import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Linkedin, Users } from "lucide-react";
import { getCohortBySlug, initialsFromName } from "@/lib/cohort/cohort-00";

// LinkedIn URLs captured from /api/workshop-signup notifications.
// Maintained inline (not in data module) since these are PII-adjacent.
const LINKEDIN: Record<string, string> = {
  "jnoss@livmor.ai": "https://www.linkedin.com/in/johnnoss/",
  "matthew.maher@myriad.com": "https://www.linkedin.com/in/matthewjmaher/",
  "johnlee@hitpeakadvisors.com": "https://www.linkedin.com/in/johnleecmio/",
  "joelsathiyendra@gmail.com": "https://www.linkedin.com/in/joel-sathiyendra-7934391a0/",
  "markgunnels@gmail.com": "https://www.linkedin.com/in/mark-gunnels-13b2385/",
  "mcampbell@indicina.com": "https://www.linkedin.com/in/michael-e-campbell-1b19516/",
  "vanessa.paolantonio@yahoo.com": "https://www.linkedin.com/in/vanessa-paolantonio-5b2a034",
  "adam@nerdmds.com": "https://www.linkedin.com/in/adam-carewe",
  "rick@mtcgroupllc.com": "https://www.linkedin.com/in/rickmore",
  "spolevikov@gmail.com": "https://www.linkedin.com/in/sergeiai/",
  "jayte.boehler@gmail.com": "https://www.linkedin.com/in/jayte/",
  "eslamelgebaly11@outlook.com":
    "https://www.linkedin.com/in/islam-algebaly-b98060207",
};

type PageProps = { params: Promise<{ slug: string }> };

export default async function CommunityPage({ params }: PageProps) {
  const { slug } = await params;
  const cohort = getCohortBySlug(slug);
  if (!cohort) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="mb-8">
        <Badge variant="outline" className="mb-2 border-violet-300 bg-violet-50 text-violet-700">
          <Users className="mr-1 h-3 w-3" /> Community
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Your cohort.
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          {cohort.signups.length} builders signed up so far, {cohort.cap - cohort.signups.length}{" "}
          seats remaining. Names + LinkedIn here; pod assignments land Fri Jun 5 EOD.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {cohort.signups.map((s) => {
          const li = LINKEDIN[s.email];
          return (
            <Card key={s.email} className="overflow-hidden">
              <CardContent className="flex items-start gap-4 p-4">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-100 text-sm font-medium text-slate-700">
                    {initialsFromName(s.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-slate-900">{s.name}</span>
                    {li && (
                      <a
                        href={li}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-slate-400 hover:text-blue-600"
                        aria-label={`${s.name} on LinkedIn`}
                      >
                        <Linkedin className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{s.building}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 border-dashed bg-amber-50/40">
        <CardContent className="flex items-start gap-3 p-4">
          <ExternalLink className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700" />
          <div className="text-sm text-slate-700">
            Public profiles (Cohort 00 charter badge, shipped projects, alumni status) go live on{" "}
            <strong>fhirbuilders.com/u/[username]</strong> after Demo Day.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
