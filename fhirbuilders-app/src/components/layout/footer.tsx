import Link from "next/link";
import { Github } from "lucide-react";

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
              The home for FHIR builders
            </span>
          </div>

          {/* Links — mirror primary nav */}
          <div className="flex items-center gap-6 text-sm">
            <Link href="/problems" className="text-muted-foreground hover:text-foreground transition-colors">
              Problems
            </Link>
            <Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">
              Projects
            </Link>
            <Link href="/mcp" className="text-muted-foreground hover:text-foreground transition-colors">
              MCP
            </Link>
            <Link href="/openclaw" className="text-muted-foreground hover:text-foreground transition-colors">
              Agent Skills
            </Link>
            <Link href="/sandbox/demo" className="text-muted-foreground hover:text-foreground transition-colors">
              Sandbox
            </Link>
            <Link href="/learn" className="text-muted-foreground hover:text-foreground transition-colors">
              Learn
            </Link>
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
