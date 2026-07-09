import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calendar,
  FolderOpen,
  Play,
  Sparkles,
  Target,
  Video,
} from "lucide-react";
import { getCohortBySlug, formatSessionTime } from "@/lib/cohort/cohort-00";
import type { CurriculumBlock } from "./types";

// Shared session overview page for Sessions 2+. Pulls session meta from
// cohort-00.ts and derives the agenda from the session's own curriculum, so the
// overview never drifts from the Study Guide.
export function SessionOverview({
  cohortSlug,
  sessionId,
  blocks,
}: {
  cohortSlug: string;
  sessionId: string;
  blocks: CurriculumBlock[];
}) {
  const cohort = getCohortBySlug(cohortSlug);
  if (!cohort) notFound();
  const session = cohort.sessions.find((s) => s.id === sessionId);
  if (!session) notFound();

  const learnHref = `/cohort/${cohortSlug}/${sessionId}/learn`;
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const isPast = new Date(session.endsAt).getTime() < now;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-teal-300 bg-teal-50 text-teal-700">
            <BookOpen className="mr-1 h-3 w-3" />
            {session.weekNumber ? `Week ${session.weekNumber}` : "Session"}
          </Badge>
          {session.mandatory && (
            <Badge variant="outline" className="border-rose-300 bg-rose-50 text-rose-700">
              Mandatory live
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {session.title}
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">{session.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-400" />
            {formatSessionTime(session)}
          </span>
        </div>

        {/* Resource buttons */}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button size="sm" asChild className="bg-slate-900 hover:bg-slate-800">
            <Link href={learnHref}>
              <BookOpen className="mr-2 h-3.5 w-3.5" /> Open the Study Guide
            </Link>
          </Button>
          {session.meetUrl && !isPast && (
            <Button size="sm" variant="outline" asChild>
              <a href={session.meetUrl} target="_blank" rel="noopener noreferrer">
                <Video className="mr-2 h-3.5 w-3.5" /> Join Meet
              </a>
            </Button>
          )}
          {session.recordingUrl && (
            <Button size="sm" variant="outline" asChild>
              <a href={session.recordingUrl} target="_blank" rel="noopener noreferrer">
                <Play className="mr-2 h-3.5 w-3.5" /> Recording
              </a>
            </Button>
          )}
          {session.notebookLmUrl && (
            <Button size="sm" variant="outline" asChild>
              <a href={session.notebookLmUrl} target="_blank" rel="noopener noreferrer">
                <Sparkles className="mr-2 h-3.5 w-3.5" /> NotebookLM
              </a>
            </Button>
          )}
          {session.driveFolderUrl && (
            <Button size="sm" variant="outline" asChild>
              <a href={session.driveFolderUrl} target="_blank" rel="noopener noreferrer">
                <FolderOpen className="mr-2 h-3.5 w-3.5" /> Drive folder
              </a>
            </Button>
          )}
        </div>

        {!session.recordingUrl && (
          <p className="mt-3 text-xs text-slate-500">
            Meet link, recording, and NotebookLM are posted here after the live session. The Study
            Guide below is available now — read ahead.
          </p>
        )}
      </div>

      {/* Agenda derived from the curriculum */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Target className="h-4 w-4 text-rose-500" /> What we cover — {blocks.length} blocks
          </h2>
        </div>
        <ol className="divide-y divide-slate-100">
          {blocks.map((b) => (
            <li key={b.id} className="flex items-start gap-4 px-6 py-4">
              <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-900 font-mono text-xs font-semibold text-white">
                {String(b.n).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <div className="font-medium text-slate-900">{b.title}</div>
                <div className="mt-0.5 text-sm text-slate-600">{b.objectives[0]}</div>
              </div>
            </li>
          ))}
        </ol>
        <div className="border-t border-slate-100 px-6 py-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={learnHref}>
              Open the full Study Guide
              <BookOpen className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
