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
  ArrowRight,
  Calendar,
  ExternalLink,
  FileText,
  FolderOpen,
  NotebookText,
  PlayCircle,
  Video,
} from "lucide-react";
import { formatSessionTime, getCohortBySlug, nextSession } from "@/lib/cohort/cohort-00";

type PageProps = { params: Promise<{ slug: string }> };

export default async function MeetingPage({ params }: PageProps) {
  const { slug } = await params;
  const cohort = getCohortBySlug(slug);
  if (!cohort) notFound();
  // eslint-disable-next-line react-hooks/purity
  const upcoming = nextSession(cohort, new Date(Date.now()));

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="mb-8">
        <Badge variant="outline" className="mb-2 border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700">
          <Video className="mr-1 h-3 w-3" /> Meeting
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Where you go right now.
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          One button. No tab-hunting. This page always shows the next live session.
        </p>
      </div>

      {upcoming ? (
        <Card className="overflow-hidden border-0 shadow-lg">
          <div
            className={`relative px-8 py-9 ${
              upcoming.kind === "intro"
                ? "bg-gradient-to-br from-violet-600 via-fuchsia-500 to-rose-500"
                : "bg-gradient-to-br from-teal-600 via-emerald-500 to-lime-500"
            } text-white`}
          >
            <div className="absolute inset-0 opacity-10 mix-blend-overlay [background-image:radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_60%,white,transparent_40%)]" />
            <div className="relative">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge className="border-0 bg-white/20 text-white hover:bg-white/30">
                  {upcoming.kind === "intro" ? "Intro" : `Week ${upcoming.weekNumber ?? "—"}`}
                </Badge>
                {upcoming.mandatory && (
                  <Badge className="border-0 bg-rose-500/90 text-white hover:bg-rose-500">
                    Mandatory live
                  </Badge>
                )}
              </div>
              <div className="mb-1 font-mono text-xs uppercase tracking-widest opacity-90">
                Up next
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{upcoming.title}</h2>
              <p className="mt-3 max-w-xl text-sm text-white/90">{upcoming.description}</p>

              <div className="mt-6 flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 opacity-90" />
                <span>{formatSessionTime(upcoming)}</span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {upcoming.meetUrl ? (
                  <Button size="lg" asChild className="bg-white text-slate-900 hover:bg-white/90">
                    <a href={upcoming.meetUrl} target="_blank" rel="noopener noreferrer">
                      <Video className="mr-2 h-4 w-4" />
                      Join on Google Meet
                    </a>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="border-2 border-white/30 bg-white/10 text-white hover:bg-white/20"
                    disabled
                  >
                    Meet link arrives 24h before
                  </Button>
                )}
              </div>

              {(upcoming.notebookLmUrl || upcoming.driveFolderUrl) && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {upcoming.notebookLmUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 px-3 text-xs text-white/90 hover:bg-white/15 hover:text-white"
                    >
                      <a
                        href={upcoming.notebookLmUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <NotebookText className="mr-1.5 h-3.5 w-3.5" />
                        NotebookLM
                      </a>
                    </Button>
                  )}
                  {upcoming.driveFolderUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 px-3 text-xs text-white/90 hover:bg-white/15 hover:text-white"
                    >
                      <a
                        href={upcoming.driveFolderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
                        Drive sources
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No upcoming sessions</CardTitle>
            <CardDescription>Cohort 00 has wrapped. Check Calendar for the full archive.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <PlayCircle className="h-4 w-4 text-slate-600" /> Recordings
          </CardTitle>
          <CardDescription>
            Posted within 24 hours of each session. Mirrored in Slack #demos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {cohort.sessions.filter((s) => s.recordingUrl).length === 0 ? (
            <p className="text-sm text-slate-500">
              No recordings yet — the first one drops after the intro call wraps.
            </p>
          ) : (
            cohort.sessions
              .filter((s) => s.recordingUrl)
              .map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2 transition hover:border-rose-300 hover:bg-rose-50/30"
                >
                  <PlayCircle className="h-4 w-4 flex-shrink-0 text-rose-500" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-900">
                      {s.title}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500">
                      {formatSessionTime(s)}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 gap-1.5">
                    <Button variant="outline" size="sm" asChild className="h-7 px-2.5 text-xs">
                      <a
                        href={s.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Watch recording of ${s.title}`}
                      >
                        <Video className="mr-1 h-3 w-3" /> Watch
                      </a>
                    </Button>
                    {s.chatTranscriptUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-7 px-2 text-xs text-slate-500"
                      >
                        <a
                          href={s.chatTranscriptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Chat transcript for ${s.title}`}
                        >
                          <FileText className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))
          )}
        </CardContent>
      </Card>

      <Card className="mt-3 border-dashed">
        <CardContent className="flex items-start justify-between gap-3 p-4">
          <div className="text-sm">
            <div className="font-medium text-slate-900">1:1 with Eugene</div>
            <p className="mt-0.5 text-slate-600">
              Two per builder over the 6 weeks. Reply to any cohort email to book.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="mailto:gene@fhiriq.com?subject=Cohort%2000%20%E2%80%94%201%3A1%20request">
              Email Eugene <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
