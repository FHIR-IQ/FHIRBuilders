import Link from "next/link";
import { Github, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground font-bold text-xs">
                FB
              </div>
              <span className="font-semibold">FHIRBuilders</span>
            </Link>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              FHIR data in 30 seconds
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/sandbox/demo"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Sandbox
            </Link>
            <Link
              href="/projects"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Projects
            </Link>
            <a
              href="https://chat.fhir.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Zulip</span>
            </a>
            <a
              href="https://github.com/fhirbuilders"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-6 pt-6 border-t text-center text-xs text-muted-foreground">
          Open source under MIT License. Built for the FHIR community.
        </div>
      </div>
    </footer>
  );
}
