import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Hash, Linkedin, Users } from "lucide-react";
import { getCohortBySlug, getPodMembers, initialsFromName } from "@/lib/cohort/cohort-00";

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
          seats remaining. Pod assignments live below — {cohort.pods.length} pods of{" "}
          {Math.round(cohort.signups.length / cohort.pods.length)} themed by building intent.
        </p>
      </div>

      {/* PODS — themed groupings of builders. Channels (#pod-1 … #pod-5) land in
          Slack before Session 1; the channelName here is the canonical name. */}
      <section className="mb-12">
        <div className="mb-4 flex items-baseline justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Pods</h2>
            <p className="mt-1 text-sm text-slate-500">
              3 builders per pod, themed by what you said you&apos;re building. Swap requests:
              ping #help-build before Session 1.
            </p>
          </div>
          <span className="font-mono text-xs text-slate-400">{cohort.pods.length} pods</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {cohort.pods.map((pod) => {
            const members = getPodMembers(pod.id, cohort.slug);
            return (
              <Card key={pod.id} className="border-violet-100 bg-violet-50/30">
                <CardHeader className="pb-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <CardTitle className="text-base">
                      <span className="font-mono text-xs text-violet-700">{pod.id}</span>{" "}
                      <span className="text-slate-900">· {pod.name}</span>
                    </CardTitle>
                    {pod.channelName && (
                      <Badge variant="outline" className="border-violet-300 bg-white text-violet-700">
                        <Hash className="mr-0.5 h-3 w-3" />
                        {pod.channelName}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs">{pod.theme}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 pt-1">
                  {members.map((m) => {
                    const li = LINKEDIN[m.email];
                    return (
                      <div key={m.email} className="flex items-center gap-3 rounded-md bg-white p-2.5">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-violet-200 to-violet-100 text-xs font-medium text-violet-800">
                            {initialsFromName(m.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-medium text-slate-900">
                              {m.name}
                            </span>
                            {li && (
                              <a
                                href={li}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 text-slate-400 hover:text-blue-600"
                                aria-label={`${m.name} on LinkedIn`}
                              >
                                <Linkedin className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <p className="truncate text-[11px] text-slate-500">{m.building}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* FULL ROSTER — flat list of everyone, regardless of pod */}
      <section>
        <div className="mb-4 flex items-baseline justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl font-semibold text-slate-900">All builders</h2>
          <span className="font-mono text-xs text-slate-400">{cohort.signups.length} total</span>
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
                      {s.podId && (
                        <Badge
                          variant="outline"
                          className="ml-auto flex-shrink-0 border-violet-300 bg-violet-50 text-[10px] text-violet-700"
                        >
                          {s.podId}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{s.building}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

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
