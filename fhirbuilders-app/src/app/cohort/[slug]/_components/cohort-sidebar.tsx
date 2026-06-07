"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Calendar,
  CircleHelp,
  Flame,
  FlaskConical,
  GraduationCap,
  Home,
  ListChecks,
  MessageSquare,
  Newspaper,
  NotebookPen,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

const NAV = [
  { label: "Home", href: "", icon: Home },
  { label: "Pre-flight", href: "/prereqs", icon: ListChecks },
  { label: "Session 1", href: "/session-1", icon: BookOpen },
  { label: "Bulletin", href: "/bulletin", icon: Newspaper },
  { label: "Reflect", href: "/reflect", icon: NotebookPen },
  { label: "Plan", href: "/plan", icon: Sparkles },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Community", href: "/community", icon: Users },
  { label: "Channels", href: "/channels", icon: MessageSquare },
  { label: "Messages", href: "external:slack", icon: MessageSquare },
  { label: "Meeting", href: "/meeting", icon: Video },
  { label: "Workshops", href: "/workshops", icon: GraduationCap },
  { label: "The Lab", href: "/lab", icon: FlaskConical },
] as const;

const SLACK_URL =
  "https://join.slack.com/t/fhirbuilders/shared_invite/zt-405j5tykg-T9v8~nNaX9tFZZgzaj37Ow";

export function CohortSidebar() {
  const pathname = usePathname();
  const slug = pathname?.split("/")[2] ?? "cohort-00";
  const base = `/cohort/${slug}`;

  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      {/* Brand */}
      <div className="border-b border-slate-200 px-6 py-6">
        <Link
          href={base}
          className="flex items-baseline gap-1 font-serif text-2xl font-bold tracking-tight text-slate-900"
        >
          FHIRBuilders<span className="text-rose-600">.</span>
        </Link>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Cohort 00 · Active
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isExternal = item.href.startsWith("external:");
          const href = isExternal ? SLACK_URL : `${base}${item.href}`;
          const isActive =
            !isExternal &&
            (item.href === "" ? pathname === base : pathname === `${base}${item.href}`);
          const className = `group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
            isActive
              ? "bg-slate-100 font-medium text-slate-900 ring-1 ring-inset ring-slate-200"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`;
          return isExternal ? (
            <a
              key={item.label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-rose-500" : "text-slate-400 group-hover:text-slate-600"}`} />
              <span>{item.label}</span>
              <span className="ml-auto text-xs text-slate-400">↗</span>
            </a>
          ) : (
            <Link key={item.label} href={href} className={className}>
              <Icon className={`h-4 w-4 ${isActive ? "text-rose-500" : "text-slate-400 group-hover:text-slate-600"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-2 border-t border-slate-200 px-3 py-4">
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-amber-600" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-amber-900">
              Streak
            </span>
          </div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">0</div>
          <div className="text-[11px] text-slate-500">weeks shipping</div>
        </div>
        <a
          href="mailto:gene@fhiriq.com"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <CircleHelp className="h-4 w-4 text-slate-400" />
          <span>Help &amp; Support</span>
        </a>
      </div>
    </aside>
  );
}
