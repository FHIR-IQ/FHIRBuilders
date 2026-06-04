import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Download,
  FolderOpen,
  NotebookText,
  Video,
} from "lucide-react";
import { formatSessionTime, getCohortBySlug, type CohortSession } from "@/lib/cohort/cohort-00";

type PageProps = { params: Promise<{ slug: string }> };

export default async function CalendarPage({ params }: PageProps) {
  const { slug } = await params;
  const cohort = getCohortBySlug(slug);
  if (!cohort) notFound();
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-2 border-teal-300 bg-teal-50 text-teal-700">
            <CalendarIcon className="mr-1 h-3 w-3" /> Calendar
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            The 6-week run.
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Every session, demo, and intro call. Google Calendar invites have already gone out;
            this is the canonical reference.
          </p>
        </div>
        <Button variant="outline" size="sm" disabled>
          <Download className="mr-2 h-4 w-4" /> Download .ics (Phase 2)
        </Button>
      </div>

      <div className="space-y-3">
        {cohort.sessions.map((s) => (
          <CalendarRow key={s.id} session={s} isPast={new Date(s.startsAt).getTime() < now} />
        ))}
      </div>
    </div>
  );
}

function CalendarRow({ session, isPast }: { session: CohortSession; isPast: boolean }) {
  const isIntro = session.kind === "intro";
  return (
    <Card className={isPast ? "opacity-60" : undefined}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className={
                  isIntro
                    ? "border-violet-200 bg-violet-50 text-violet-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-800"
                }
              >
                {isIntro ? "Intro" : `Week ${session.weekNumber}`}
              </Badge>
              {session.mandatory && (
                <Badge variant="outline" className="border-rose-200 text-rose-700">
                  Mandatory live
                </Badge>
              )}
              {isPast && <Badge variant="secondary">Past</Badge>}
            </div>
            <CardTitle className="text-base">{session.title}</CardTitle>
            <CardDescription className="mt-1">{session.description}</CardDescription>
          </div>
          {session.meetUrl ? (
            <Button size="sm" asChild>
              <a href={session.meetUrl} target="_blank" rel="noopener noreferrer">
                <Video className="mr-2 h-3.5 w-3.5" />
                Join Meet
              </a>
            </Button>
          ) : (
            <Badge variant="outline" className="text-xs">
              Meet link 24h before
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="font-mono text-xs text-slate-500">{formatSessionTime(session)}</div>
        {(session.notebookLmUrl || session.driveFolderUrl) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {session.notebookLmUrl && (
              <Button variant="outline" size="sm" asChild className="h-7 px-2.5 text-xs">
                <a href={session.notebookLmUrl} target="_blank" rel="noopener noreferrer">
                  <NotebookText className="mr-1.5 h-3 w-3 text-violet-600" />
                  NotebookLM
                </a>
              </Button>
            )}
            {session.driveFolderUrl && (
              <Button variant="outline" size="sm" asChild className="h-7 px-2.5 text-xs">
                <a href={session.driveFolderUrl} target="_blank" rel="noopener noreferrer">
                  <FolderOpen className="mr-1.5 h-3 w-3 text-slate-500" />
                  Drive sources
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
