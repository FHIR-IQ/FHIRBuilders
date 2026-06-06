import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Lock,
  Users,
} from "lucide-react";
import {
  DEFERRED_TO_NEXT_COHORT,
  PENDING_REGISTRATIONS,
  SUPPORTERS,
  getCohortBySlug,
  initialsFromName,
} from "@/lib/cohort/cohort-00";

export const metadata: Metadata = {
  title: "Cohort admin",
  description: "Admin roster + signin tracking for cohort participants.",
};

function adminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "eugene.vestel@gmail.com")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

function timeAgo(d: Date | null): string {
  if (!d) return "—";
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return d.toISOString().slice(0, 10);
}

function fmt(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type PageProps = { params: Promise<{ slug: string }> };

export default async function CohortAdminPage({ params }: PageProps) {
  const { slug } = await params;

  // Auth gate — must be signed in AND email in ADMIN_EMAILS.
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/admin/cohort/${slug}`)}`);
  }
  if (!email || !adminEmails().has(email)) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <Lock className="mx-auto mb-4 h-10 w-10 text-slate-400" />
        <h1 className="text-2xl font-bold text-slate-900">Admin only</h1>
        <p className="mt-2 text-sm text-slate-600">
          Signed in as <span className="font-mono">{session.user.email}</span> — not in the
          ADMIN_EMAILS list. Update the env var in Vercel if you should have access.
        </p>
      </div>
    );
  }

  const cohort = getCohortBySlug(slug);
  if (!cohort) notFound();

  // Pull all User rows whose email matches a cohort signup. We index by
  // normalized email so case + whitespace don't matter.
  const signupEmails = cohort.signups.map((s) => s.email.toLowerCase());
  const users = await prisma.user.findMany({
    where: { email: { in: signupEmails, mode: "insensitive" } },
    select: {
      id: true,
      email: true,
      name: true,
      firstSignInAt: true,
      lastSignInAt: true,
      signInCount: true,
      createdAt: true,
    },
  });
  const userByEmail = new Map(
    users.map((u) => [u.email?.toLowerCase() ?? "", u]),
  );

  // Join cohort signups (left side, source of truth) with our User rows.
  const roster = cohort.signups.map((sig) => {
    const u = userByEmail.get(sig.email.toLowerCase());
    return {
      ...sig,
      user: u,
      signedIn: !!u?.firstSignInAt,
    };
  });
  const signedInCount = roster.filter((r) => r.signedIn).length;
  const todayCount = roster.filter(
    (r) => r.user?.lastSignInAt &&
      Date.now() - r.user.lastSignInAt.getTime() < 24 * 60 * 60 * 1000,
  ).length;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 lg:px-8 lg:py-14">
      {/* HEADER */}
      <div className="mb-8">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-slate-400 bg-slate-50">
            <Lock className="mr-1 h-3 w-3" /> Admin · {cohort.slug}
          </Badge>
          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800">
            {signedInCount}/{roster.length} accounts active
          </Badge>
          {todayCount > 0 && (
            <Badge variant="outline" className="border-rose-300 bg-rose-50 text-rose-800">
              {todayCount} active in last 24h
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {cohort.name}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Cohort signup roster joined to FHIRBuilders accounts. Account status updates whenever
          a builder signs in (any provider — magic link, GitHub, Google).
        </p>
      </div>

      {/* STAT STRIP */}
      <div className="mb-8 grid gap-3 sm:grid-cols-4">
        <Card><CardContent className="p-4">
          <div className="text-xs uppercase tracking-widest text-slate-500">Total signups</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{roster.length}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">{cohort.cap - roster.length} seats remaining</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs uppercase tracking-widest text-slate-500">Signed in (ever)</div>
          <div className="mt-1 text-2xl font-semibold text-emerald-700">{signedInCount}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">{roster.length - signedInCount} still need to sign in</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs uppercase tracking-widest text-slate-500">Active 24h</div>
          <div className="mt-1 text-2xl font-semibold text-rose-700">{todayCount}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Signed in last day</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs uppercase tracking-widest text-slate-500">Pods</div>
          <div className="mt-1 text-2xl font-semibold text-violet-700">{cohort.pods.length}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">{cohort.signups.filter(s => s.podId).length}/{roster.length} assigned</div>
        </CardContent></Card>
      </div>

      {/* ROSTER TABLE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-slate-500" /> Roster
          </CardTitle>
          <CardDescription className="text-xs">
            Sorted by signed-in status (active first, then never-signed-in). Click any name to open
            the public profile (when available).
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full border-collapse text-sm">
            <thead className="border-y border-slate-200 bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5">Builder</th>
                <th className="px-4 py-2.5">Pod</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">First signin</th>
                <th className="px-4 py-2.5">Last signin</th>
                <th className="px-4 py-2.5 text-right">Signins</th>
              </tr>
            </thead>
            <tbody>
              {[...roster]
                .sort((a, b) => {
                  // active first; tie-break by lastSignInAt desc
                  const al = a.user?.lastSignInAt?.getTime() ?? 0;
                  const bl = b.user?.lastSignInAt?.getTime() ?? 0;
                  return bl - al;
                })
                .map((r) => (
                  <tr key={r.email} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-100 text-[11px] font-medium text-slate-700">
                            {initialsFromName(r.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-900">{r.name}</div>
                          <div className="truncate text-[11px] text-slate-500 font-mono">{r.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      {r.podId ? (
                        <Badge variant="outline" className="border-violet-300 bg-violet-50 text-[10px] text-violet-700">
                          {r.podId}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {r.signedIn ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-700">
                          <AlertTriangle className="h-3.5 w-3.5" /> never signed in
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-slate-600">
                      {fmt(r.user?.firstSignInAt ?? null)}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-mono text-[11px] text-slate-600">
                        {fmt(r.user?.lastSignInAt ?? null)}
                      </div>
                      <div className="text-[11px] text-slate-400">{timeAgo(r.user?.lastSignInAt ?? null)}</div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-700">
                      {r.user?.signInCount ?? 0}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* SUPPORTERS — observers/advisors, not builders. No pod, no commitment.
          Added 2026-06-05; cohort layout doesn't gate them, calendar invite is
          optional. We don't show this section on the public community page. */}
      {SUPPORTERS.length > 0 && (
        <Card className="mt-8 border-slate-200 bg-slate-50/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900">Supporters & observers</CardTitle>
            <CardDescription className="text-xs">
              Invited to follow the cohort but not expected to build. Optional attendees on the
              Monday call; visible on the public community page is opt-in (not by default).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-1">
            {SUPPORTERS.map((s) => (
              <div key={s.email} className="rounded-md border border-slate-200 bg-white p-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium text-slate-900">{s.name}</span>
                  <span className="font-mono text-[11px] text-slate-500">{s.email}</span>
                </div>
                {s.title && (
                  <p className="mt-1 text-xs text-slate-600">{s.title}</p>
                )}
                {s.affiliation && (
                  <p className="mt-0.5 text-[11px] text-slate-500">{s.affiliation}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* PENDING REGISTRATIONS — no email captured yet. Need DM outreach. */}
      {PENDING_REGISTRATIONS.length > 0 && (
        <Card className="mt-6 border-amber-200 bg-amber-50/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900">Pending registrations</CardTitle>
            <CardDescription className="text-xs">
              Direct outreach — need to capture an email before cohort enrollment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5 pt-1">
            {PENDING_REGISTRATIONS.map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between gap-3 rounded-md bg-white p-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900">{p.name}</div>
                  {p.note && <div className="text-[11px] text-slate-500">{p.note}</div>}
                </div>
                {(p.linkedinUrl || p.website) && (
                  <a
                    href={p.linkedinUrl ?? p.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-[11px] text-blue-600 underline hover:text-blue-800"
                  >
                    {p.linkedinUrl ? "LinkedIn" : "Website"}
                  </a>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* DEFERRED — confirmed no for this cohort, invite to next. */}
      {DEFERRED_TO_NEXT_COHORT.length > 0 && (
        <Card className="mt-6 border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900">Deferred to Cohort 01</CardTitle>
            <CardDescription className="text-xs">
              Confirmed interest in the next cohort. Re-invite when Cohort 01 scheduling lands.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5 pt-1">
            {DEFERRED_TO_NEXT_COHORT.map((d) => (
              <div
                key={d.email}
                className="flex items-baseline justify-between gap-3 rounded-md bg-slate-50 p-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900">{d.name}</div>
                  <div className="text-[11px] text-slate-500">{d.reason}</div>
                </div>
                <span className="flex-shrink-0 font-mono text-[11px] text-slate-500">{d.email}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* QUICK LINKS */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/cohort/${cohort.slug}`}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 hover:border-rose-300 hover:bg-rose-50/30"
        >
          <ExternalLink className="h-3 w-3" />
          Cohort home
        </Link>
        <Link
          href={`/cohort/${cohort.slug}/community`}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 hover:border-rose-300 hover:bg-rose-50/30"
        >
          <ExternalLink className="h-3 w-3" />
          Public community + pods view
        </Link>
        <Link
          href={`/cohort/${cohort.slug}/meeting`}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 hover:border-rose-300 hover:bg-rose-50/30"
        >
          <ExternalLink className="h-3 w-3" />
          Meeting tab
        </Link>
      </div>

      <p className="mt-6 text-[11px] text-slate-400">
        Tracking starts at first signin after the DB migration (firstSignInAt + lastSignInAt fields
        added). Builders who signed in before that point will show as &ldquo;active&rdquo; on their
        next signin, not retroactively.
      </p>
    </div>
  );
}
