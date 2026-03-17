import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wrench, ArrowRight, Github, ExternalLink, Zap, Database, Stethoscope, Bot } from "lucide-react";

const MCP_TOOLS = [
  {
    name: "FHIR R4 Server Tool",
    author: "FHIRBuilders Community",
    description:
      "Give Claude direct access to any FHIR R4 server. Query patients, create resources, run searches, and execute operations — all from a conversation.",
    tags: ["FHIR R4", "Read/Write", "Search"],
    icon: Database,
    color: "text-blue-500",
    bg: "bg-blue-100/60",
    border: "border-blue-200",
    githubUrl: "https://github.com/fhirbuilders",
  },
  {
    name: "SMART on FHIR Launcher",
    author: "FHIRBuilders Community",
    description:
      "Launch SMART apps in EHR context with a pre-loaded patient. Works with Epic, Cerner, and any SMART on FHIR-compliant EHR.",
    tags: ["SMART", "EHR", "OAuth"],
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-100/60",
    border: "border-amber-200",
    githubUrl: "https://github.com/fhirbuilders",
  },
  {
    name: "CQL Measure Runner",
    author: "FHIRBuilders Community",
    description:
      "Execute HEDIS and CMS quality measures against live patient data. Ask Claude to run a gap-in-care analysis and get structured results back.",
    tags: ["CQL", "Quality", "HEDIS"],
    icon: Stethoscope,
    color: "text-teal-500",
    bg: "bg-teal-100/60",
    border: "border-teal-200",
    githubUrl: "https://github.com/fhirbuilders",
  },
  {
    name: "Clinical Terminology Lookup",
    author: "FHIRBuilders Community",
    description:
      "Resolve SNOMED, LOINC, RxNorm, and ICD codes inside Claude. Translate between code systems, expand value sets, and validate clinical codes.",
    tags: ["SNOMED", "LOINC", "RxNorm"],
    icon: Bot,
    color: "text-violet-500",
    bg: "bg-violet-100/60",
    border: "border-violet-200",
    githubUrl: "https://github.com/fhirbuilders",
  },
];

const WHAT_IS_MCP = [
  {
    title: "Tools for AI models",
    desc: "MCP lets Claude (and other AI models) call external functions — like querying a FHIR API — directly during a conversation.",
  },
  {
    title: "Standardized protocol",
    desc: "The Model Context Protocol is an open standard by Anthropic. Any MCP-compatible AI can use tools built to the spec.",
  },
  {
    title: "Healthcare use case",
    desc: "Healthcare is a perfect fit: structured data (FHIR), clear access patterns, and high value from AI reasoning over clinical data.",
  },
];

export default function McpPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b bg-gradient-to-br from-blue-50 via-background to-blue-50/30 py-14">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              <Wrench className="mr-1 h-3 w-3" />
              Model Context Protocol
            </Badge>
            <h1 className="text-3xl font-bold sm:text-4xl mb-3">MCP Tools for Healthcare AI</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-7">
              Connect Claude and other AI models directly to FHIR servers, EHR systems, and clinical databases.
              Browse tools built by the community or submit your own.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <a href="https://github.com/fhirbuilders" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  Submit a tool on GitHub
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/projects">
                  Browse all projects
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What is MCP */}
      <section className="border-b py-12 bg-muted/20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-lg font-semibold mb-6 text-center">What is the Model Context Protocol?</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {WHAT_IS_MCP.map((item) => (
                <div key={item.title} className="p-4 rounded-xl border bg-white">
                  <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tool directory */}
      <section className="py-14">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Community MCP Tools</h2>
                <p className="text-muted-foreground mt-1">
                  Open-source tools built for healthcare AI use cases
                </p>
              </div>
              <Badge variant="outline" className="text-blue-700 border-blue-200">
                {MCP_TOOLS.length} tools
              </Badge>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {MCP_TOOLS.map((tool) => (
                <Card key={tool.name} className={`border-2 ${tool.border} hover:shadow-md transition-shadow`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tool.bg}`}>
                        <tool.icon className={`h-5 w-5 ${tool.color}`} />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base leading-snug">{tool.name}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">{tool.author}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tool.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={tool.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 h-3.5 w-3.5" />
                        View on GitHub
                        <ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA to submit */}
            <div className="mt-12 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 p-8 text-center">
              <Wrench className="h-10 w-10 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Built an MCP tool for healthcare?</h3>
              <p className="text-muted-foreground text-sm mb-5 max-w-md mx-auto">
                Submit a PR to the FHIRBuilders GitHub org. We review and list all open-source MCP tools built for FHIR and clinical data.
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <a href="https://github.com/fhirbuilders" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  Submit your tool
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
