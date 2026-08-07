"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github } from "lucide-react";

const COLUMNS = [
  {
    label: "Build",
    links: [
      { title: "Sandbox", href: "/sandbox/demo" },
      { title: "Agent Skills", href: "/openclaw" },
      { title: "MCP", href: "/mcp" },
      { title: "Projects", href: "/projects" },
    ],
  },
  {
    label: "Learn",
    links: [
      { title: "Wiki", href: "/wiki" },
      { title: "Problems", href: "/problems" },
      { title: "Learn", href: "/learn" },
    ],
  },
  {
    label: "Cohort",
    links: [
      { title: "Cohort 01", href: "/cohort-01" },
      { title: "Enroll", href: "/cohort-01#enroll" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();

  // Mirror header: cohort member routes own their own chrome.
  if (pathname?.startsWith("/cohort/")) return null;

  return (
    <footer className="ed-surface border-t border-e-line bg-e-paper">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Masthead + line */}
          <div>
            <Link href="/" className="flex items-baseline gap-0.5">
              <span className="ed-display text-xl text-e-ink">Healthcare AI Builders</span>
              <span className="text-xl leading-none text-e-accent">.</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-e-ink-soft">
              A build cohort for healthcare AI on real FHIR data. Twelve weeks, weekly demos, your
              own agents.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.label}>
              <div className="ed-kicker mb-4">{col.label}</div>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.title}>
                    <Link
                      href={l.href}
                      className="text-sm text-e-ink-soft transition-colors hover:text-e-ink"
                    >
                      {l.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Baseline */}
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-e-line pt-6 text-xs text-e-ink-faint sm:flex-row sm:items-center">
          <span className="font-mono">FHIR IQ · Built for the FHIR community · MIT licensed</span>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="transition-colors hover:text-e-ink">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-e-ink">
              Terms
            </Link>
            <Link href="/security" className="transition-colors hover:text-e-ink">
              Security
            </Link>
            <a
              href="https://github.com/aks129/HealthClawGuardrails"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-e-ink"
            >
              <Github className="h-3.5 w-3.5" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
