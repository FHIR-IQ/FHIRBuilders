export type DocLink = { label: string; href: string };

export type Example = {
  title: string;
  lang: "bash" | "typescript" | "markdown" | "json" | "text";
  code: string;
  note?: string;
};

export type FAQ = { q: string; a: string };

export type CurriculumBlock = {
  id: string;
  n: number;
  title: string;
  objectives: [string, string];
  faq: [FAQ, FAQ, FAQ];
  examples: [Example, Example];
  tryIt: string;
  docs: DocLink[];
};

export const CURRICULUM: CurriculumBlock[] = [
  {
    id: "cc-basics",
    n: 1,
    title: "Claude Code Basics",
    objectives: [
      "Run `claude` in any project directory and describe what it reads on startup.",
      "Use Ctrl+C to interrupt a task and know when to restart vs. continue.",
    ],
    faq: [
      {
        q: "How is Claude Code different from using claude.ai in the browser?",
        a: "claude.ai is a chat interface — you type, Claude responds, nothing happens to your filesystem. Claude Code is an agentic CLI that runs inside your terminal, reads your project files, executes shell commands, edits code, and commits changes. It operates on your actual codebase, not in a sandbox.",
      },
      {
        q: "What does Claude Code read when it starts up?",
        a: "On launch, CC reads: (1) CLAUDE.md in the current directory and any parent directories, (2) the directory tree up to a depth limit, (3) your recent git log, and (4) any open files you have in VS Code if the editor extension is active. CLAUDE.md is the primary way to give CC persistent project context.",
      },
      {
        q: "What happens if I say 'No' to a tool call permission?",
        a: "CC skips that tool call and tells you it was blocked. It then tries to continue the task without that capability. For most tasks, a blocked file-write means CC explains what it would have written instead. You can always say 'Go ahead' to retry, or rephrase the request to avoid the blocked action.",
      },
    ],
    examples: [
      {
        title: "Start Claude Code in your project",
        lang: "bash",
        code: `# Navigate to your project root, then launch
cd ~/projects/my-fhir-app
claude

# CC prints a startup summary:
# ✓ Read CLAUDE.md (247 tokens)
# ✓ Indexed 34 files
# ✓ Last commit: "feat: add patient search" (2h ago)
# > What would you like to do?`,
      },
      {
        title: "Interrupt mid-task and restart clean",
        lang: "bash",
        code: `# If CC is running a long task and you want to stop it:
Ctrl+C          # interrupt the current tool call

# CC asks: "Task interrupted. Continue from here or start fresh?"
# Type "start fresh" to clear context and begin a new conversation
# Type "continue" to pick up from where it stopped`,
        note: "Ctrl+C once interrupts; Ctrl+C twice in quick succession exits CC entirely.",
      },
    ],
    tryIt:
      "Open Claude Code in your FHIR project repo (`cd your-project && claude`) and ask it: 'Summarize what this project does in two sentences.' Verify it reads your CLAUDE.md.",
    docs: [
      { label: "Claude Code overview", href: "https://docs.anthropic.com/en/docs/claude-code/overview" },
      { label: "Setup guide", href: "https://docs.anthropic.com/en/docs/claude-code/setup" },
      { label: "CLAUDE.md reference", href: "https://docs.anthropic.com/en/docs/claude-code/memory" },
    ],
  },
  {
    id: "skills",
    n: 2,
    title: "Claude Code Starter Skills",
    objectives: [
      "Install the FHIR IQ skill pack and invoke a skill with `/skill-name`.",
      "Explain where skills live in a project and how to write a simple custom skill.",
    ],
    faq: [
      {
        q: "What's the difference between a skill and a regular prompt?",
        a: "A regular prompt lives only in your current conversation and disappears when you close CC. A skill is a reusable slash command stored in `.claude/skills/` — it persists across sessions, can be shared via git, and runs with full CC context including file reads and tool calls. Think of it as a macro with superpowers.",
      },
      {
        q: "How do I install a skill pack?",
        a: "There is no `claude skills install` command — a skill is a directory with a SKILL.md file, distributed either by committing it to `.claude/skills/` or bundling it in a plugin. The FHIRBuilders pack ships as a plugin: run `claude plugin marketplace add fhir-iq/fhirbuilders` then `claude plugin install fhirbuilders-cohort@fhirbuilders` in your terminal, then invoke it inside Claude Code as `/fhirbuilders-cohort:security-review`.",
      },
      {
        q: "Can I write my own skill?",
        a: "Yes — create a directory `.claude/skills/<name>/` with a `SKILL.md` file inside. Give it YAML frontmatter (a `name` and a `description` of when to use it) followed by your instructions in markdown. CC discovers it automatically and you invoke it with `/<name>`. Commit `.claude/skills/` to git to share skills with your pod.",
      },
    ],
    examples: [
      {
        title: "Install a skill and invoke it",
        lang: "bash",
        code: `# Add the cohort marketplace + install the pack (run in your terminal)
claude plugin marketplace add fhir-iq/fhirbuilders
claude plugin install fhirbuilders-cohort@fhirbuilders

# Then, inside Claude Code, invoke the skill:
/fhirbuilders-cohort:security-review

# CC runs the skill: scans for leaked secrets, API keys, and PHI in your changes
# Output: list of findings with file:line references`,
      },
      {
        title: "Minimal custom skill (directory + SKILL.md)",
        lang: "markdown",
        code: `---
name: fhir-check
description: Check that every .json file in the project is a valid FHIR resource. Use before committing FHIR fixtures.
---

You are checking FHIR resource validity. When invoked:

1. Read every .json file in the current directory
2. For each file, check that it has a resourceType field
3. Report any files missing resourceType with their path
4. If all files are valid, print "All FHIR resources valid ✓"`,
        note: "Save as `.claude/skills/fhir-check/SKILL.md`. Invoke with `/fhir-check`.",
      },
    ],
    tryIt:
      "Run `/fhirbuilders-cohort:security-review` in your project. If it fires without an error, the plugin is installed correctly. If it's missing, run `claude plugin list` in your terminal to confirm `fhirbuilders-cohort` is enabled.",
    docs: [
      { label: "Claude Code skills", href: "https://docs.anthropic.com/en/docs/claude-code/skills" },
      { label: "Slash commands", href: "https://docs.anthropic.com/en/docs/claude-code/slash-commands" },
    ],
  },
  {
    id: "usage",
    n: 3,
    title: "Managing Usage — Credits and Models",
    objectives: [
      "State your plan's message limit and default model without looking it up.",
      "Switch to fast mode with `/fast` and explain when Opus vs. Sonnet is the right choice.",
    ],
    faq: [
      {
        q: "What happens when I hit my message limit?",
        a: "CC stops accepting new messages until your 5-hour window resets. The window is rolling — it doesn't reset at midnight, it resets 5 hours after your first message in that window. If you hit the limit mid-task, CC saves context so you can resume when the window resets. Max plan users rarely hit the limit during normal building.",
      },
      {
        q: "Is Pro enough or do I need Max?",
        a: "Pro ($20/mo) is enough for Sessions 1–2 and most light builders. You'll feel the limit if you're doing long refactors, running /security-review repeatedly, or using CC 4+ hours a day. Max ($100/mo) pays for itself fast if you're shipping daily — the 10× message limit and Opus availability are the difference between 'tool I use' and 'pair I rely on'.",
      },
      {
        q: "When should I use Opus vs. Sonnet?",
        a: "Sonnet (default) handles ~90% of tasks: writing code, fixing bugs, answering questions. Use Opus (via `/fast` or model picker) for: complex architectural decisions, understanding an unfamiliar large codebase, multi-step reasoning tasks, or when Sonnet keeps getting something wrong. Opus costs more credits per message, so don't default to it.",
      },
    ],
    examples: [
      {
        title: "Toggle fast mode (Opus with lower latency)",
        lang: "bash",
        code: `# Inside a CC session, type:
/fast

# CC confirms: "Switched to claude-opus-4-8 (fast mode)"
# Your next messages use Opus until you toggle off
/fast   # toggle back to Sonnet`,
      },
      {
        title: "Check remaining usage",
        lang: "bash",
        code: `# Run this in any CC session:
/status

# Output:
# Plan: Claude Pro
# Model: claude-sonnet-4-6 (default)
# Messages this window: 47 / ~200
# Window resets: ~2h 14m`,
        note: "The message count is approximate — complex tasks consume more than simple ones.",
      },
    ],
    tryIt:
      "Check your current plan at claude.ai/settings → Billing. Note your plan tier. Then open CC and run `/status` to see your current window usage.",
    docs: [
      { label: "Claude Code costs", href: "https://docs.anthropic.com/en/docs/claude-code/costs" },
      { label: "Models overview", href: "https://docs.anthropic.com/en/docs/about-claude/models/overview" },
    ],
  },
  {
    id: "auto-mode",
    n: 4,
    title: "Auto Mode",
    objectives: [
      "Enable auto mode with `--auto` and run a task without permission prompts.",
      "List two task types that are safe in auto mode and two that are not.",
    ],
    faq: [
      {
        q: "Is auto mode safe to use on a real production codebase?",
        a: "It depends on the task. Auto mode is safe for: writing new files, refactoring within a module, running read-only commands (grep, ls, tests). It's risky for: tasks that touch DB migrations, tasks that delete files, tasks you haven't reviewed the scope of, and anything in a prod branch without a backup. Default rule: use auto mode after you've seen what CC wants to do, not before.",
      },
      {
        q: "How do I stop Claude Code mid-auto-mode?",
        a: "Ctrl+C interrupts the current tool call immediately. CC will ask if you want to continue or start fresh. If CC is running a shell command that has side effects (npm publish, git push), Ctrl+C stops CC but may not undo the command already sent to the shell — be aware of this for irreversible operations.",
      },
      {
        q: "What's the difference between auto mode and just saying 'go ahead, don't ask'?",
        a: "Saying 'go ahead' in a normal session grants permission for that one action. Auto mode (`--auto` flag) disables the permission dialog for the entire session — CC acts on all tool calls without pausing. This is a session-level setting; starting a new CC session resets it to the default (permission prompts on).",
      },
    ],
    examples: [
      {
        title: "Launch CC in auto mode for a safe refactor",
        lang: "bash",
        code: `# Auto mode for a clearly-scoped task on a feature branch
git checkout -b refactor/extract-auth
claude --auto "Extract the auth logic from app/api/route.ts into lib/auth-helpers.ts. Don't touch anything else."

# CC works without asking: reads files, writes, moves logic
# Review the diff when it's done:
git diff`,
      },
      {
        title: "Safe vs. unsafe tasks for auto mode",
        lang: "text",
        code: `SAFE IN AUTO MODE
✓ "Add TypeScript types to all functions in lib/utils.ts"
✓ "Write tests for the PatientSearch component"
✓ "Fix the ESLint errors in the files I just changed"
✓ "Rename variable fhirClient to medplumClient across lib/"

NOT SAFE IN AUTO MODE (use prompted mode)
✗ "Update the Prisma schema and run the migration"
✗ "Delete the deprecated endpoints and clean up callers"
✗ "Refactor the entire auth flow"
✗ Any task touching .env files or secrets`,
      },
    ],
    tryIt:
      "Create a throwaway file (`touch test-auto.ts`), then run `claude --auto \"Add a hello world function to test-auto.ts and then delete the file\"`. Watch it work without asking. Then confirm the file is gone.",
    docs: [
      { label: "Claude Code settings", href: "https://docs.anthropic.com/en/docs/claude-code/settings" },
      { label: "Permissions model", href: "https://docs.anthropic.com/en/docs/claude-code/security" },
    ],
  },
  {
    id: "github-repos",
    n: 5,
    title: "Projects + GitHub Repos",
    objectives: [
      "Create a GitHub repo for your project with CLAUDE.md and push it.",
      "Write a commit message with Claude Code and explain what makes a good CLAUDE.md.",
    ],
    faq: [
      {
        q: "What should I put in CLAUDE.md?",
        a: "The minimum useful CLAUDE.md has: (1) what the project does in one sentence, (2) how to run it locally (exact commands), (3) how to run tests, (4) anything CC must not do (e.g. 'never modify prisma/schema.prisma directly'). Don't put secrets, internal URLs, or personal emails. Think of it as onboarding a new engineer who has never seen the codebase.",
      },
      {
        q: "Should I commit the `.claude/` directory?",
        a: "Commit `.claude/skills/` (your skill files — you want these in git for the team). Do NOT commit `.claude/settings.local.json` (it may contain API keys) — add it to .gitignore. The `.claude/` directory itself is fine in public repos as long as settings.local.json is excluded.",
      },
      {
        q: "How often should I commit when working with CC?",
        a: "After every meaningful unit of work — same discipline as without CC, but easier because CC writes the commit message. A good signal: commit when you'd want to be able to `git reset --hard` back to this state. CC changes can be fast and wide; small commits make review and rollback manageable.",
      },
    ],
    examples: [
      {
        title: "Create a repo and push with GitHub CLI",
        lang: "bash",
        code: `# In your project directory:
git init
git add .
git commit -m "chore: initial project setup"

# Create GitHub repo and push in one command:
gh repo create my-fhir-app --public --source=. --push

# Verify:
gh repo view --web   # opens your new repo in browser`,
        note: "Requires `gh` CLI: brew install gh && gh auth login",
      },
      {
        title: "Minimal CLAUDE.md for a FHIR project",
        lang: "markdown",
        code: `# CLAUDE.md

This file provides guidance to Claude Code when working in this repo.

## What this project does
Patient medication reconciliation tool — reads FHIR MedicationRequest
resources from Medplum and flags potential drug interactions.

## Run locally
\`\`\`bash
npm install
npm run dev   # localhost:3000
\`\`\`

## Run tests
\`\`\`bash
npm run test:run
\`\`\`

## Do not
- Modify prisma/schema.prisma without running npx prisma generate after
- Commit .env.local or any file containing API keys`,
      },
    ],
    tryIt:
      "Create a GitHub repo for your cohort project. Add a CLAUDE.md with at least: what you're building, how to run it, and one 'do not' rule. Push to main.",
    docs: [
      { label: "CLAUDE.md reference", href: "https://docs.anthropic.com/en/docs/claude-code/memory" },
      { label: "GitHub CLI", href: "https://cli.github.com/manual/gh_repo_create" },
      { label: "Anthropic Cookbook", href: "https://github.com/anthropics/anthropic-cookbook" },
    ],
  },
  {
    id: "vercel",
    n: 6,
    title: "Connect Vercel",
    objectives: [
      "Import your GitHub repo into Vercel and confirm the first deploy succeeds.",
      "Add an environment variable in Vercel and access it in a Next.js API route.",
    ],
    faq: [
      {
        q: "My Vercel build fails but it works locally — why?",
        a: "Almost always one of: (1) missing environment variable — Vercel doesn't read your .env.local, you must add vars in the Vercel dashboard or via `vercel env add`; (2) a Node.js API used in a file that runs on the Edge runtime (Vercel's middleware runs on Edge, which has no Node.js globals); (3) a package that only works on the server being imported in a client component. Check the Vercel build log — the error is almost always on the first line of the red section.",
      },
      {
        q: "How do I add environment variables to Vercel?",
        a: "Three ways: (1) Vercel dashboard → Project → Settings → Environment Variables; (2) `vercel env add VARIABLE_NAME` in the CLI (prompts for value and scope); (3) `vercel env pull .env.local` to download current Vercel vars into your local .env.local. For the cohort, use the dashboard — it's the clearest for managing multiple vars across Production/Preview/Development scopes.",
      },
      {
        q: "Can Claude Code deploy to Vercel directly?",
        a: "Yes — if you have the Vercel CLI installed and authenticated, CC can run `vercel --prod` to deploy. Add the Vercel MCP server and CC can also check deployment status, read build logs, and inspect env var names (not values). Values stay private — CC can see that DATABASE_URL exists but not its content.",
      },
    ],
    examples: [
      {
        title: "Import and deploy with Vercel CLI",
        lang: "bash",
        code: `# Install and authenticate once:
npm i -g vercel
vercel login   # opens browser for OAuth

# In your project root:
vercel         # interactive: links to existing project or creates new
               # select your GitHub repo when prompted

# After linking, deploy to production:
vercel --prod

# Output includes your live URL:
# ✓ Production: https://my-fhir-app.vercel.app [3s]`,
      },
      {
        title: "Read an env var in a Next.js API route",
        lang: "typescript",
        code: `// src/app/api/health/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Server-only vars (no NEXT_PUBLIC_ prefix) — never sent to browser
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" });
}`,
        note: "Variables prefixed NEXT_PUBLIC_ are bundled into the client. All others are server-only.",
      },
    ],
    tryIt:
      "Import your project repo into Vercel (vercel.com/new or `vercel` CLI). Confirm the deployment URL loads. If the build fails, read the first error line in the build log.",
    docs: [
      { label: "Vercel CLI", href: "https://vercel.com/docs/cli" },
      { label: "Environment variables", href: "https://vercel.com/docs/projects/environment-variables" },
      { label: "Vercel MCP", href: "https://vercel.com/docs/mcp" },
    ],
  },
  {
    id: "stack",
    n: 7,
    title: "Agentic Dev Stack",
    objectives: [
      "Name the role each tool plays: Supabase, Railway, Wispr Flow, Google Cloud, Resend.",
      "Set up an account for the tool your project needs first.",
    ],
    faq: [
      {
        q: "Which database should I use for my FHIR app?",
        a: "If you need a general-purpose Postgres DB (for user accounts, app state, non-FHIR data), use Supabase — it has an MCP server CC can query directly. For the FHIR clinical data itself, use Medplum (the cohort sandbox) or your own Medplum instance. Don't store FHIR resources in Supabase unless you have a specific reason — Medplum's FHIR API handles search, versioning, and subscriptions that raw Postgres won't.",
      },
      {
        q: "When is Railway better than Vercel?",
        a: "Vercel is for frontend and serverless API routes (short-lived, stateless). Railway is for processes that need to run continuously: a FastAPI backend, a websocket server, a background job worker, a Python data pipeline. If you find yourself fighting Vercel's 60-second function timeout or need persistent memory between requests, move that service to Railway.",
      },
      {
        q: "Do I need all of these tools right now?",
        a: "No — pick the one your project needs first and ignore the rest. Most Session 1 projects only need: Vercel (deploy) + Medplum (FHIR data). Supabase comes in Week 2 when you add user auth or app state. Railway, Google Cloud, and Resend come later if your project needs them. Don't set up tools you don't have a concrete reason to use yet.",
      },
    ],
    examples: [
      {
        title: "Add Supabase MCP to Claude Code",
        lang: "bash",
        code: `# Install the Supabase MCP server:
claude mcp add supabase

# CC prompts for your Supabase project URL and anon key
# (find both in your Supabase dashboard → Settings → API)

# Now CC can query your Supabase DB directly:
# "Show me the schema for the users table"
# "Insert a test row into profiles"`,
        note: "The anon key is safe to use here — it respects your Row Level Security policies.",
      },
      {
        title: "Send an email with Resend in a Next.js route",
        lang: "typescript",
        code: `// src/app/api/notify/route.ts
import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { to, subject, html } = await req.json();

  const { data, error } = await resend.emails.send({
    from: "FHIR IQ <noreply@fhiriq.com>",
    to,
    subject,
    html,
  });

  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ id: data?.id });
}`,
        note: "Install: `npm install resend`. RESEND_API_KEY goes in Vercel env vars.",
      },
    ],
    tryIt:
      "Pick the one tool your project needs first (Supabase, Railway, or Resend). Create an account and reach the dashboard. You don't need to wire it up today — just have the account ready for Week 2.",
    docs: [
      { label: "Supabase MCP", href: "https://supabase.com/docs/guides/getting-started/mcp" },
      { label: "Railway deploy", href: "https://docs.railway.com/quick-start" },
      { label: "Resend + Next.js", href: "https://resend.com/docs/send-with-nextjs" },
      { label: "Wispr Flow", href: "https://wisprflow.com" },
    ],
  },
  {
    id: "mcp",
    n: 8,
    title: "Claude API · MCP · CLI Principles",
    objectives: [
      "Add one MCP server to Claude Code with `claude mcp add` and use it in a task.",
      "Explain the auth pattern: you provide credentials, CC operates the service.",
    ],
    faq: [
      {
        q: "What's MCP and how is it different from a regular API?",
        a: "A regular API is something you call from your code. MCP (Model Context Protocol) is a standard that lets CC call a service on your behalf during a conversation — as a tool, not as code you write. When you add a Supabase MCP server, CC can query your database mid-conversation without you writing any fetch() calls. The MCP server handles the protocol; you just auth it once.",
      },
      {
        q: "How do I add an MCP server to Claude Code?",
        a: "`claude mcp add <server-name>` — CC walks you through the setup interactively, asking for credentials. Alternatively, edit `.claude/settings.json` directly to add the server config. Installed servers persist across sessions and are available in every CC session in that project. Run `claude mcp list` to see what's installed.",
      },
      {
        q: "What does 'CC can auth itself to any service' actually mean?",
        a: "It means CC can read the docs, write the SDK calls, and execute them — but the credentials still come from you. You put an API key in an env var or hand it to CC in the session; CC reads it from the env and uses it. CC doesn't have its own identity with third-party services. The pattern is always: you auth → CC operates.",
      },
    ],
    examples: [
      {
        title: "Add GitHub MCP and ask CC to list your repos",
        lang: "bash",
        code: `# Add the official GitHub MCP server:
claude mcp add github

# CC prompts: "Enter your GitHub personal access token"
# Create one at: github.com/settings/tokens (needs repo scope)

# Now in any CC session:
# "List my last 5 GitHub repos sorted by updated date"
# "Create a new issue in my-fhir-app titled 'Add patient search'"

# Verify it's installed:
claude mcp list
# github   ✓ connected`,
      },
      {
        title: "Start a local MCP server with npx",
        lang: "bash",
        code: `# The filesystem MCP server gives CC read/write access to a specific path
# Useful for letting CC work in a directory outside your current project

npx @modelcontextprotocol/server-filesystem /Users/you/data

# In a separate terminal, tell CC about it:
claude mcp add filesystem --url http://localhost:3001

# CC can now read/write /Users/you/data as a tool call`,
        note: "npx starts the server; leave that terminal open while CC uses it.",
      },
    ],
    tryIt:
      "Add the GitHub MCP server to your CC setup (`claude mcp add github`). Then ask CC: 'List the last 3 commits in my cohort project repo.' If it works, MCP is wired correctly.",
    docs: [
      { label: "MCP introduction", href: "https://modelcontextprotocol.io/introduction" },
      { label: "Claude Code + MCP", href: "https://docs.anthropic.com/en/docs/claude-code/mcp" },
      { label: "MCP server registry", href: "https://github.com/modelcontextprotocol/servers" },
      { label: "Anthropic Cookbook", href: "https://github.com/anthropics/anthropic-cookbook" },
    ],
  },
  {
    id: "security",
    n: 9,
    title: "Security Zone",
    objectives: [
      "Run `/security-review` on your project and interpret the output.",
      "Configure `.gitignore` to exclude secrets and AI planning artifacts.",
    ],
    faq: [
      {
        q: "What counts as a 'secret' in a repo?",
        a: "Anything that grants access to a system: API keys, database connection strings, OAuth client secrets, private keys (.pem files), JWT secrets, Stripe keys, Slack bot tokens. Also watch for: personal emails in config files, internal service URLs that reveal your infrastructure, and hardcoded test credentials that look real. The `/security-review` skill catches most of these — run it before every push.",
      },
      {
        q: "Can I trust Claude Code not to leak my keys?",
        a: "CC reads your env vars to use them (e.g., your Anthropic API key to make calls) but does not send them to external services beyond what's needed for the task. However, if you paste a key directly in the chat, it becomes part of the conversation context — avoid this. The safe pattern: put keys in .env.local (gitignored), CC reads them from the env. Never paste a live key into the CC prompt.",
      },
      {
        q: "What should be in .gitignore for a CC project?",
        a: ".env.local, .env*.local, .claude/settings.local.json (may contain keys), any AI planning docs you don't want public (critique outputs, beta simulation files, strategy docs), build artifacts (build_output.txt, lint_output.txt). The .claude/skills/ directory should be committed — your skills are team assets.",
      },
    ],
    examples: [
      {
        title: "Standard .gitignore additions for a CC project",
        lang: "text",
        code: `# Secrets — never commit these
.env.local
.env*.local
.claude/settings.local.json

# AI planning artifacts — keep private
docs/ai-critique-*.md
docs/beta-simulation-*.md
*-PLAN.md
*-CRITIQUE.md
build_output.txt
lint_output.txt

# Standard Node
node_modules/
.next/
dist/`,
      },
      {
        title: "What a clean /security-review output looks like",
        lang: "text",
        code: `> /security-review

Scanning staged files for secrets, keys, and PII...

Checked: 12 files
✓ No API keys found
✓ No connection strings found
✓ No .env files staged
✓ No PII patterns detected

Clean — safe to commit.

---
# vs. a flagged output:

⚠ ANTHROPIC_API_KEY found in src/lib/ai.ts:14
  sk-ant-api03-... (redacted in this output)
  → Move to .env.local and read via process.env.ANTHROPIC_API_KEY`,
      },
    ],
    tryIt:
      "Run `/security-review` on your cohort project right now. If it flags anything, fix it before your next commit. Add `.claude/settings.local.json` to your .gitignore if it isn't already there.",
    docs: [
      { label: "Claude Code security", href: "https://docs.anthropic.com/en/docs/claude-code/security" },
      { label: "GitHub secret scanning", href: "https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning" },
    ],
  },
  {
    id: "claude-design",
    n: 10,
    title: "Claude Design + Special Tools",
    objectives: [
      "Generate a UI component in Claude Design and hand the mockup to CC via screenshot.",
      "Add one visual tool (Excalidraw or Playwright MCP) to your CC setup.",
    ],
    faq: [
      {
        q: "Is Claude Design the same as claude.ai?",
        a: "Claude Design (claude.ai/design) is a mode inside claude.ai that's optimized for generating HTML/CSS/JS UI mockups. You describe a component, Claude renders it in a live preview pane, and you can iterate. It's not a separate product — it's a specialized interface for design work that produces copy-pasteable code and screenshots you can hand to CC.",
      },
      {
        q: "Can I paste a Figma screenshot or competitor screenshot as context?",
        a: "Yes — Claude is multimodal. In either claude.ai or CC, you can attach an image file or paste a screenshot and say 'Build something that looks like this' or 'Match this design pattern.' CC reads the image and uses it as a reference. This is one of the fastest ways to get a component that looks right on the first try.",
      },
      {
        q: "How do I connect the Excalidraw MCP?",
        a: "The Excalidraw MCP server lets CC create and modify architecture diagrams during a session — useful for FHIR data flow diagrams, system architecture, and pod planning. Install it with `claude mcp add excalidraw` if it's in the registry, or follow the server's README to start it with npx and add it manually. CC can then produce an .excalidraw file you open in the Excalidraw desktop app or excalidraw.com.",
      },
    ],
    examples: [
      {
        title: "Claude Design → CC handoff workflow",
        lang: "bash",
        code: `# 1. Go to claude.ai/design
# 2. Describe your component:
#    "A patient search bar with a dropdown showing name, DOB, and MRN.
#     Healthcare UI, clean, accessible."
# 3. Claude renders a live HTML preview
# 4. Take a screenshot (Cmd+Shift+4 on Mac)
# 5. In CC, attach the screenshot and say:
#    "Build this component in React + Tailwind matching this design.
#     Use our existing shadcn Input and Card components."`,
      },
      {
        title: "Add Playwright MCP for visual testing",
        lang: "bash",
        code: `# Add Playwright MCP — lets CC take screenshots and click through your UI
claude mcp add playwright

# CC can now:
# "Take a screenshot of localhost:3000/dashboard"
# "Click the 'Create Patient' button and verify the modal opens"
# "Check that the patient list loads correctly after login"

# This is particularly useful for:
# - Verifying UI changes without switching windows
# - Catching visual regressions
# - Demo Day prep (automated smoke tests)`,
        note: "Requires Playwright installed: npm install -D @playwright/test && npx playwright install chromium",
      },
    ],
    tryIt:
      "Go to claude.ai/design and describe one UI component from your project. Take a screenshot of the result. Then paste it into a CC session and ask CC to build it in your stack.",
    docs: [
      { label: "Claude Design", href: "https://claude.ai/design" },
      { label: "Claude vision (images as input)", href: "https://docs.anthropic.com/en/docs/build-with-claude/vision" },
      { label: "Playwright MCP", href: "https://github.com/modelcontextprotocol/servers/tree/main/src/playwright" },
    ],
  },
];
