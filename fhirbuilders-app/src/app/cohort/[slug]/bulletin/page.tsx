import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Pin } from "lucide-react";

export default function BulletinPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="mb-8">
        <Badge variant="outline" className="mb-2 border-blue-300 bg-blue-50 text-blue-700">
          <Newspaper className="mr-1 h-3 w-3" /> Bulletin
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Announcements + recaps.
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          One post per session, plus pre-launch pins. Recordings, decks, and the week-ahead
          checklist live here. Mirrored to Slack #announcements.
        </p>
      </div>

      {/* One pinned pre-launch post */}
      <Card className="border-rose-200 bg-rose-50/30">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-rose-100 text-sm font-medium text-rose-700">EV</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-semibold text-slate-900">Eugene</span>
                <Badge variant="outline" className="border-rose-300 bg-white text-xs text-rose-700">
                  <Pin className="mr-1 h-2.5 w-2.5" /> Pinned
                </Badge>
                <span className="font-mono text-xs text-slate-500">Mon Jun 1</span>
              </div>
              <CardTitle className="text-base">Welcome to Cohort 00 — what happens this week.</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="ml-13 space-y-2 pl-13 text-sm text-slate-700">
            <p>
              <strong>Wed Jun 3, 3:00 PM ET</strong> or{" "}
              <strong>Thu Jun 4, 8:00 PM ET</strong> — 45-min intro call.
              Pick one. Calendar invites already in your inbox.
            </p>
            <p>
              <strong>Fri Jun 5</strong> — pod assignments + Slack channel invites land in your email.
            </p>
            <p>
              <strong>Mon Jun 8, 1:00 PM ET</strong> — Session 1. Setup + your first real commit.
            </p>
            <p className="text-xs text-slate-500">
              Slack workspace:{" "}
              <a
                href="https://join.slack.com/t/fhirbuilders/shared_invite/zt-405j5tykg-T9v8~nNaX9tFZZgzaj37Ow"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-600 hover:underline"
              >
                join.slack.com/t/fhirbuilders
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-dashed">
        <CardHeader>
          <CardTitle className="text-base">First session recap</CardTitle>
          <CardDescription>
            Eugene posts a recap, deck, recording, and Week 1 checklist here by Mon Jun 8 EOD.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
