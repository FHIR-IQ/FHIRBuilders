# Session 1 · Study Guide — Design Spec

**Date:** 2026-06-07  
**Route:** `/cohort/[slug]/session-1/learn`  
**Status:** Approved by user

---

## Purpose

A structured learning reference for Cohort 00 Session 1. Builders use it during and after the session to look up the "why" behind each workflow block, get concrete examples to copy-paste, and check off their understanding. Not a replacement for the live session — a companion to it.

---

## Format per Block

**Objectives → FAQ → Examples → Try it** (standard LMS pattern, Anthropic docs style)

Each of the 10 Session 1 blocks gets exactly:
- **2 learning objectives** — what the builder can do after this block (imperative, specific)
- **3 FAQ items** — accordion expand/collapse, questions written as a builder would actually ask them, answers are direct and short
- **2 code/command examples** — language-tagged `<pre>` blocks, each with a one-line title and optional note
- **1 Try this** card — a single concrete action with a checkbox (localStorage-persisted per block)
- **Official docs links** — only link to real URLs (Anthropic docs, MCP spec, GitHub Cookbook)

---

## Page Layout

```
┌─────────────────────────────────────────────────────┐
│  Session 1 · Study Guide            [← Session 1]   │
│  "Reference this during and after Session 1"         │
├──────────────────┬──────────────────────────────────┤
│  Block index     │  ## 01 · Claude Code Basics       │
│  (sticky, left)  │  After this block you will…       │
│                  │                                   │
│  01 Basics       │  **Objectives**                   │
│  02 Skills       │  • …                              │
│  03 Usage        │                                   │
│  04 Auto         │  **FAQ**  [accordion]             │
│  05 GitHub       │  ▶ Q: How is CC diff from …?      │
│  06 Vercel       │  ▶ Q: Can CC edit files I …?      │
│  07 Stack        │  ▶ Q: What is the permission …?   │
│  08 MCP          │                                   │
│  09 Security     │  **Examples**                     │
│  10 Design       │  ```bash                          │
│                  │  cd my-project && claude          │
│  ── progress ──  │  ```                              │
│  3 / 10 done     │                                   │
│                  │  **Try this**  [checkbox]         │
└──────────────────┴──────────────────────────────────┘
```

On mobile: block index collapses to a top horizontal scroll strip; main content stacks full-width.

---

## Architecture

### Files

```
src/app/cohort/[slug]/session-1/learn/
  page.tsx                        # server component — layout, renders all blocks
  _data/
    curriculum.ts                 # all 10 blocks' content (type CurriculumBlock[])
  _components/
    learn-block.tsx               # client component — FAQ accordion + try-it checkbox
    block-nav.tsx                 # client component — sticky left index + progress
```

### Data shape (`curriculum.ts`)

```typescript
type DocLink = { label: string; href: string };

type Example = {
  title: string;
  lang: "bash" | "typescript" | "markdown" | "json" | "text";
  code: string;
  note?: string;
};

type CurriculumBlock = {
  id: string;           // "cc-basics", "skills", etc.
  n: number;            // 1–10
  title: string;        // matches session-1 step title exactly
  objectives: [string, string];          // exactly 2
  faq: [FAQ, FAQ, FAQ];                  // exactly 3
  examples: [Example, Example];          // exactly 2
  tryIt: string;        // one concrete action sentence
  docs: DocLink[];      // official links only
};
```

Data lives in `_data/curriculum.ts` (pure TypeScript, no imports). Page imports it and passes blocks to components as props — no client-side data fetching.

### Components

**`learn-block.tsx`** (client)
- Receives a `CurriculumBlock` and `cohortSlug` as props
- FAQ rendered as Radix Accordion (shadcn `<Accordion>`) — three items, single expand at a time
- Try-it rendered as a checkbox button — state in `localStorage` at key `cohort:{slug}:learn:session1:{blockId}`
- No other state

**`block-nav.tsx`** (client)
- Reads all block IDs + try-it state from localStorage to show `{n} / 10 done` progress
- Intersection Observer on each `section[id="block-{n}"]` to highlight the active nav item
- Each nav item is an `<a href="#block-{n}">` — no JS navigation, just scroll

**`page.tsx`** (server)
- Static — no auth gate, no DB calls
- Reads `params.slug` to pass `cohortSlug` down to client components
- Renders `<BlockNav>` (sticky left) + all 10 `<LearnBlock>` sections

### Sidebar

Add to `cohort-sidebar.tsx` NAV array after the Session 1 entry:
```typescript
{ label: "Learn", href: "/session-1/learn", icon: GraduationCap }
```

### Entry point on session-1 page

Add a "Study Guide →" ghost button to the session-1 page header row (next to the Meet + NotebookLM buttons), linking to `/cohort/${slug}/session-1/learn`.

---

## Content: 10 Blocks

### 01 · Claude Code Basics
**Objectives:** Run `claude` in any project directory and understand what it reads on startup. Use Ctrl+C to interrupt and know when to restart vs. continue.  
**FAQ:** (1) How is CC different from claude.ai? (2) What does CC read when it starts? (3) What happens if I say no to a tool call?  
**Examples:** `cd my-project && claude` | sample startup context summary CC produces  
**Try it:** Open CC in your FHIR project repo and ask it to summarize what the project does.  
**Docs:** [Claude Code overview](https://docs.anthropic.com/en/docs/claude-code/overview), [Setup](https://docs.anthropic.com/en/docs/claude-code/setup)

### 02 · Starter Skills
**Objectives:** Install the FHIR IQ skill pack. Invoke a skill with `/skill-name` and understand where skills live.  
**FAQ:** (1) What's the difference between a skill and a regular prompt? (2) How do I install skills? (3) Can I write my own?  
**Examples:** `claude skills install <url>` | custom skill file structure  
**Try it:** Run `/security-review` in your project. If it fires, skills are live.  
**Docs:** [Claude Code skills](https://docs.anthropic.com/en/docs/claude-code/skills)

### 03 · Managing Usage — Credits and Models
**Objectives:** State your plan's message limit and default model. Know when to switch to Opus vs. Sonnet.  
**FAQ:** (1) What happens when I hit my limit? (2) Is Pro enough or do I need Max? (3) When should I use `/fast`?  
**Examples:** `/fast` toggle | checking remaining usage in the CC UI  
**Try it:** Check your current plan at claude.ai/settings → Billing. Write it on a sticky note.  
**Docs:** [Claude Code pricing](https://docs.anthropic.com/en/docs/claude-code/costs), [Models overview](https://docs.anthropic.com/en/docs/about-claude/models/overview)

### 04 · Auto Mode
**Objectives:** Enable auto mode with `--auto`. Distinguish tasks that are safe in auto mode from those that aren't.  
**FAQ:** (1) Is auto mode safe on a real codebase? (2) How do I stop CC mid-auto-mode? (3) What's the diff between auto mode and just saying "go ahead"?  
**Examples:** `claude --auto "refactor the auth module"` | `Ctrl+C` interrupt pattern  
**Try it:** Run CC in auto mode on a throwaway file. Watch it work without asking. Then try Ctrl+C.  
**Docs:** [Auto mode / settings](https://docs.anthropic.com/en/docs/claude-code/settings)

### 05 · Projects + GitHub Repos
**Objectives:** Create a GitHub repo with CLAUDE.md for your project. Make your first AI-assisted commit.  
**FAQ:** (1) What should I put in CLAUDE.md? (2) Should I commit `.claude/`? (3) How often should I commit?  
**Examples:** Minimal CLAUDE.md template | `gh repo create` + first push  
**Try it:** Create a GitHub repo for your cohort project. Add a CLAUDE.md and push.  
**Docs:** [CLAUDE.md reference](https://docs.anthropic.com/en/docs/claude-code/memory), [GitHub CLI](https://cli.github.com)

### 06 · Connect Vercel
**Objectives:** Import a GitHub repo into Vercel. Trigger a deploy by pushing a commit.  
**FAQ:** (1) My Vercel build fails but it works locally — why? (2) How do I add env vars? (3) Can CC deploy to Vercel directly?  
**Examples:** Vercel import flow (CLI) | `.env.local` vs. Vercel dashboard env vars  
**Try it:** Import your project repo into Vercel. Confirm the first deploy succeeds.  
**Docs:** [Vercel CLI](https://vercel.com/docs/cli), [Environment variables](https://vercel.com/docs/projects/environment-variables)

### 07 · Agentic Dev Stack
**Objectives:** Name the role each tool plays (Supabase, Railway, Wispr Flow, Google Cloud, Resend). Pick the one your project needs first.  
**FAQ:** (1) Which DB should I use for my FHIR app? (2) When is Railway better than Vercel? (3) Do I need all of these now?  
**Examples:** Supabase MCP setup command | Resend SDK call in a Next.js API route  
**Try it:** Sign up for the one tool your project needs first. Get to the dashboard.  
**Docs:** [Supabase MCP](https://supabase.com/docs/guides/getting-started/mcp), [Resend SDK](https://resend.com/docs/send-with-nextjs)

### 08 · Claude API · MCP · CLI Principles
**Objectives:** Add one MCP server to Claude Code with `claude mcp add`. Explain the auth pattern: you auth, CC operates.  
**FAQ:** (1) What's MCP and how is it different from an API? (2) How do I add an MCP server? (3) What does "CC can auth itself" mean?  
**Examples:** `claude mcp add` for GitHub | `npx @modelcontextprotocol/server-filesystem .`  
**Try it:** Add the GitHub MCP server to your CC setup. Ask CC to list your repos.  
**Docs:** [MCP introduction](https://modelcontextprotocol.io/introduction), [Claude Code MCP](https://docs.anthropic.com/en/docs/claude-code/mcp), [Anthropic Cookbook](https://github.com/anthropics/anthropic-cookbook)

### 09 · Security Zone
**Objectives:** Run `/security-review` and interpret the output. Identify what belongs in `.gitignore` vs. what can be public.  
**FAQ:** (1) What counts as a "secret" in a repo? (2) Can I trust CC not to leak my keys? (3) What should be in `.gitignore`?  
**Examples:** `.gitignore` template for a CC project | what a clean vs. flagged `/security-review` output looks like  
**Try it:** Run `/security-review` on your project. Fix any flags before your next commit.  
**Docs:** [Claude Code security](https://docs.anthropic.com/en/docs/claude-code/security), [GitHub secret scanning](https://docs.github.com/en/code-security/secret-scanning)

### 10 · Claude Design + Special Tools
**Objectives:** Generate a UI mockup in Claude Design and hand it off to CC via screenshot. Connect one visual tool (Excalidraw or Playwright MCP).  
**FAQ:** (1) Is Claude Design the same as claude.ai? (2) Can I paste a Figma screenshot? (3) How do I connect Excalidraw MCP?  
**Examples:** Claude Design → CC handoff workflow (screenshot as context) | `claude mcp add` for Excalidraw  
**Try it:** Design one UI component in claude.ai/design. Paste the result as context in CC and ask it to build it.  
**Docs:** [Claude Design](https://claude.ai/design), [Excalidraw MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/everything)

---

## What this spec does NOT cover

- Quiz / multiple-choice assessment (deferred — no Prisma model for quiz responses yet)
- Per-builder completion tracking in the DB (localStorage only, Phase 1 pattern)
- Session 2–5 content (separate spec per session)

---

## Constraints

- All content is hardcoded in `_data/curriculum.ts` — no CMS, no DB reads, Phase 1
- Official doc links must resolve (verified before ship)
- No new shadcn components beyond `Accordion` (already in the project) and `Button`, `Badge`, `Card` (existing)
- Mobile-first: block nav becomes a horizontal scroll strip below 768px
