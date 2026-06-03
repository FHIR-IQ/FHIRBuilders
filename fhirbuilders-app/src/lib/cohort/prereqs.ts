// Cohort 00 pre-flight checklist data. Each item below appears on the
// /cohort/cohort-00/prereqs page as either a checkable action item or a
// read-only info card. Phase 1 stores checkbox state in localStorage;
// Phase 2 will persist to a PreReqCheck Prisma model so pod-mates can
// see each other's readiness.

export type PreReqLink = {
  label: string;
  href: string;
  /** Open in same tab (e.g. /sandbox/demo). Default opens new tab. */
  internal?: boolean;
};

export type PreReqItem = {
  id: string;
  title: string;
  description: string;
  links?: PreReqLink[];
  /** Italic notes from Eugene, displayed below description. */
  notes?: string;
  /** "verify" = checkable action item. "info" = read-only reference card. */
  kind: "verify" | "info";
  /** TODO marker — content placeholder for Eugene to expand. */
  todo?: boolean;
};

export type PreReqGroup = {
  id: string;
  title: string;
  description: string;
  /** Drives the badge color + sort order. */
  priority: "required" | "recommended" | "cohort" | "advanced" | "publishing";
  items: PreReqItem[];
};

export const PREREQS: PreReqGroup[] = [
  {
    id: "required",
    title: "Required before Session 1",
    description:
      "Walk into Mon Jun 8 with these green. Without them, the first session's setup phase becomes troubleshooting.",
    priority: "required",
    items: [
      {
        id: "github",
        title: "GitHub account",
        description:
          "Personal account for committing and forking. Add an SSH key so pushes don't prompt for credentials.",
        kind: "verify",
        links: [
          { label: "Sign up", href: "https://github.com/signup" },
          { label: "Add SSH key", href: "https://github.com/settings/keys" },
          { label: "Generate SSH key (docs)", href: "https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent" },
        ],
      },
      {
        id: "git",
        title: "Git installed + configured",
        description:
          "Most laptops already have it. Run `git --version` to verify. Set `user.name` and `user.email` once after install.",
        kind: "verify",
        links: [{ label: "Install Git", href: "https://git-scm.com/downloads" }],
      },
      {
        id: "node",
        title: "Node.js 20 or newer",
        description:
          "We'll use Node-based agentic tooling and FHIR clients. Use the LTS installer or nvm.",
        kind: "verify",
        links: [
          { label: "Install Node.js", href: "https://nodejs.org" },
          { label: "Or use nvm", href: "https://github.com/nvm-sh/nvm" },
        ],
      },
      {
        id: "vscode",
        title: "VS Code (or your editor of choice)",
        description:
          "We'll work in VS Code on the call so screen-shares match. Cursor, Zed, or vim also fine — Claude Code attaches to all of them.",
        kind: "verify",
        links: [{ label: "Install VS Code", href: "https://code.visualstudio.com" }],
      },
      {
        id: "claude-code",
        title: "Claude Code CLI installed",
        description:
          "The agent that does the work. Install once, log in once, and you're set.",
        kind: "verify",
        links: [
          { label: "Install Claude Code", href: "https://docs.anthropic.com/en/docs/claude-code/setup" },
        ],
      },
      {
        id: "claude-plan",
        title: "Claude paid plan — Pro or Max",
        description:
          "Free tier hits limits fast on sustained agentic work. Pro ($20/mo) is fine for most pods; Max ($100/mo or $200/mo) is what you want if you're shipping daily.",
        notes:
          "Tip: Max comes with included Claude Code usage that more than pays for itself if you're coding 4+ hours/day.",
        kind: "verify",
        links: [{ label: "Pick a plan", href: "https://claude.com/upgrade" }],
      },
      {
        id: "anthropic-api-key",
        title: "Anthropic API key",
        description:
          "Separate from your Claude plan — needed for BYOK agent generation in FHIRBuilders OpenClaw and for the Anthropic SDK directly.",
        kind: "verify",
        links: [
          { label: "Get a key", href: "https://console.anthropic.com/settings/keys" },
          { label: "API docs", href: "https://docs.anthropic.com" },
        ],
      },
    ],
  },
  {
    id: "recommended",
    title: "Recommended before Session 1",
    description:
      "Not blockers, but you'll want them within the first two weeks. Knock them out now if you have time.",
    priority: "recommended",
    items: [
      {
        id: "fhirbuilders-sandbox",
        title: "FHIRBuilders sandbox account",
        description:
          "Medplum-backed FHIR R4 sandbox with synthetic Synthea patients. We'll use it Session 1.",
        kind: "verify",
        links: [{ label: "Open the sandbox", href: "/sandbox/demo", internal: true }],
      },
      {
        id: "vercel",
        title: "Vercel account",
        description:
          "Deployments. Connect your GitHub once and pushes auto-deploy. Free tier covers the cohort.",
        kind: "verify",
        links: [{ label: "Sign up", href: "https://vercel.com/signup" }],
      },
      {
        id: "openai-api-key",
        title: "OpenAI API key (optional)",
        description:
          "Useful for multi-provider workflows — FHIRBuilders OpenClaw supports BYOK for both Anthropic and OpenAI side-by-side.",
        kind: "verify",
        links: [{ label: "Get a key", href: "https://platform.openai.com/api-keys" }],
      },
      {
        id: "loom",
        title: "Loom (or CleanShot, Quicktime)",
        description:
          "Demo Day asks for a 60-second video testimonial and a 90-sec project demo. Pick the tool you already use.",
        kind: "verify",
        links: [
          { label: "Loom (free)", href: "https://www.loom.com/signup" },
          { label: "CleanShot X", href: "https://cleanshot.com" },
        ],
      },
    ],
  },
  {
    id: "fhir-layer",
    title: "FHIR servers you'll meet",
    description:
      "You won't pick one until your pod problem is locked. Pre-read so the choice is informed.",
    priority: "cohort",
    items: [
      {
        id: "medplum",
        title: "Medplum",
        description:
          "Our primary FHIR backend. Open-source, TypeScript-first, with React components, OAuth, and a hosted option. The FHIRBuilders sandbox runs on Medplum.",
        kind: "info",
        links: [
          { label: "Medplum docs", href: "https://www.medplum.com/docs" },
          { label: "GitHub", href: "https://github.com/medplum/medplum" },
          { label: "Hosted signup", href: "https://app.medplum.com/register" },
        ],
      },
      {
        id: "hapi",
        title: "HAPI FHIR",
        description:
          "The reference Java FHIR server — what most health systems run internally. Heavier but you'll see it in real-world pilots.",
        kind: "info",
        links: [
          { label: "HAPI public test server", href: "https://hapi.fhir.org" },
          { label: "Docs", href: "https://hapifhir.io" },
        ],
      },
      {
        id: "aidbox",
        title: "Health Samurai · Aidbox",
        description:
          "Production-grade FHIR server with SDC, terminology, and clinical workflows out of the box. Commercial; free dev tier.",
        kind: "info",
        links: [
          { label: "Aidbox", href: "https://aidbox.app" },
          { label: "Devbox (free)", href: "https://aidbox.app/?utm_source=fhiriq" },
        ],
      },
      {
        id: "synthea",
        title: "Synthea — synthetic patient data",
        description:
          "Generates realistic FHIR R4 bundles for development. We seed the FHIRBuilders sandbox from Synthea.",
        kind: "info",
        links: [{ label: "Synthea on GitHub", href: "https://github.com/synthetichealth/synthea" }],
      },
    ],
  },
  {
    id: "claude-code-toolkit",
    title: "Claude Code skills, MCP tools, and patterns",
    description:
      "Eugene's curated set — what we'll install in Sessions 1 and 2 to get every laptop building at the same level.",
    priority: "cohort",
    items: [
      {
        id: "skills-list",
        title: "Eugene's Claude Code skills",
        description:
          "Curated skills for healthcare FHIR work — FHIR resource scaffolding, SMART-on-FHIR auth, Medplum patterns, terminology lookups.",
        notes: "TODO: Eugene to publish the exact skill list before Session 1.",
        todo: true,
        kind: "info",
        links: [
          { label: "Claude Code skills docs", href: "https://docs.anthropic.com/en/docs/claude-code/skills" },
        ],
      },
      {
        id: "mcp-tools",
        title: "MCP servers we'll wire up",
        description:
          "Model Context Protocol servers that give your agent live hands — FHIR REST client, Medplum client, GitHub, file system, and a vector DB tool.",
        notes: "TODO: Eugene to share the specific MCP server configs we'll install Session 2.",
        todo: true,
        kind: "info",
        links: [
          { label: "MCP spec", href: "https://modelcontextprotocol.io" },
          { label: "MCP server registry", href: "https://github.com/modelcontextprotocol/servers" },
        ],
      },
      {
        id: "patterns",
        title: "Optimizations + patterns",
        description:
          "Caching strategy for FHIR reads, vector-store retrieval tuning, prompt patterns for clinical reasoning, agent-loop guardrails.",
        notes: "TODO: Eugene to publish the patterns doc before Session 3.",
        todo: true,
        kind: "info",
      },
    ],
  },
  {
    id: "ai-tools",
    title: "Other AI tools we'll touch",
    description:
      "Claude is the primary builder. These come up as supporting tools.",
    priority: "cohort",
    items: [
      {
        id: "claude-design",
        title: "Claude Design",
        description:
          "claude.ai/design — for mocking up UI in HTML/CSS/JS before handing off to Claude Code. We used this to design the workshop carousel.",
        kind: "info",
        links: [{ label: "Try it", href: "https://claude.ai/design" }],
      },
      {
        id: "google-ai-studio",
        title: "Google AI Studio + Gemini",
        description:
          "Useful for long-context PDF extraction (e.g. clinical guidelines) and multimodal work where Gemini's window helps. Gemini API key optional.",
        kind: "info",
        links: [
          { label: "AI Studio", href: "https://aistudio.google.com" },
          { label: "Gemini", href: "https://gemini.google.com" },
        ],
      },
      {
        id: "antigravity",
        title: "Google Antigravity",
        description:
          "Google's new agent IDE. If you want to compare its loop to Claude Code's, sign up for the preview.",
        kind: "info",
        links: [{ label: "Antigravity", href: "https://antigravity.google.com" }],
      },
    ],
  },
  {
    id: "advanced",
    title: "Advanced — covered later or self-paced",
    description:
      "Don't worry about these for Session 1. They appear in weeks 3–6 or post-Demo-Day.",
    priority: "advanced",
    items: [
      {
        id: "openclaw",
        title: "OpenClaw — agent OS for healthcare",
        description:
          "Open-source agent framework Eugene contributes to. We'll use the OpenClaw client in the FHIRBuilders generator. Reference material now; deeper dive Week 4+.",
        kind: "info",
        links: [
          { label: "OpenClaw on FHIRBuilders", href: "/openclaw", internal: true },
          { label: "HealthClaw Guardrails", href: "https://github.com/aks129/HealthClawGuardrails" },
        ],
      },
      {
        id: "hermes",
        title: "Hermes Agent OS",
        description:
          "Anthropic's reference agentic OS framework. Optional — useful if you outgrow the basic Claude Code loop.",
        notes: "TODO: Eugene to share Hermes notes when relevant.",
        todo: true,
        kind: "info",
      },
      {
        id: "voice-agents",
        title: "Voice agents",
        description:
          "Patient-facing or scribe workflows: LiveKit Agents + Anthropic, Vapi, Retell. Touched in Session 3 if a pod chooses a voice problem.",
        kind: "info",
        links: [
          { label: "LiveKit Agents", href: "https://docs.livekit.io/agents" },
          { label: "Vapi", href: "https://vapi.ai" },
        ],
      },
      {
        id: "form-fillers",
        title: "Form fillers + clinical capture",
        description:
          "FHIR Questionnaire + SDC (Structured Data Capture) + an LLM front-end. Pattern for prior auth, SDoH screening, intake.",
        kind: "info",
        links: [
          { label: "FHIR SDC", href: "https://hl7.org/fhir/us/sdc/" },
          { label: "Medplum Questionnaire", href: "https://www.medplum.com/docs/api/fhir/resources/questionnaire" },
        ],
      },
      {
        id: "cql-sql",
        title: "Quality measures · CQL + SQL on FHIR",
        description:
          "Eugene's wheelhouse — compiling HEDIS/quality measures from CQL to native SQL on FHIR-flat tables. The fhiriq.com primary product line.",
        kind: "info",
        links: [
          { label: "CQL to SQL talk (Analytics on FHIR, Dec 2025)", href: "https://fhiriq.com/cql-to-sql" },
          { label: "ViewDefinition library", href: "https://fhir-viewdefinition-builder.vercel.app" },
          { label: "SQL on FHIR spec", href: "https://sql-on-fhir.org" },
        ],
      },
    ],
  },
  {
    id: "publishing",
    title: "Publishing your app",
    description:
      "Where Cohort 00 projects can land after Demo Day. Most pods will deploy to web first.",
    priority: "publishing",
    items: [
      {
        id: "web-vercel",
        title: "Web — Vercel (default)",
        description:
          "Push to GitHub → Vercel deploys. Sub-second TLS-secured URL ready for clinicians to test. This is what Demo Day expects.",
        kind: "info",
        links: [{ label: "Vercel docs", href: "https://vercel.com/docs" }],
      },
      {
        id: "ios",
        title: "iOS — App Store",
        description:
          "Apple Developer Program ($99/yr). Patient-facing apps go through privacy review; clinician tools can use TestFlight for pilots.",
        kind: "info",
        links: [{ label: "Apple Developer", href: "https://developer.apple.com" }],
      },
      {
        id: "android",
        title: "Android — Google Play",
        description:
          "$25 one-time. Easier review than iOS but the same health-data privacy declarations.",
        kind: "info",
        links: [{ label: "Play Console", href: "https://play.google.com/console" }],
      },
      {
        id: "fhir-app-gallery",
        title: "SMART on FHIR App Gallery",
        description:
          "Once you're SMART-on-FHIR launched and SOC 2-aligned, list on the SMART App Gallery so health systems can discover you.",
        kind: "info",
        links: [{ label: "SMART App Gallery", href: "https://gallery.smarthealthit.org" }],
      },
    ],
  },
];

export function getAllVerifyItemIds(): string[] {
  return PREREQS.flatMap((g) => g.items.filter((i) => i.kind === "verify").map((i) => i.id));
}
