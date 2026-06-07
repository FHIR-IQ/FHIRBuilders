# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FHIRBuilders is a Next.js healthcare application marketplace and sandbox platform for building, sharing, and collaborating on AI-powered FHIR (Fast Healthcare Interoperability Resources) applications. All application code lives in the `fhirbuilders-app/` directory.

## Development Commands

All commands should be run from the `fhirbuilders-app/` directory:

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Generate Prisma client and build for production
npm run lint         # Run ESLint
npm run test         # Run tests in watch mode (vitest)
npm run test:run     # Run tests once
npm run test:run -- src/lib/openclaw/schema.test.ts  # Run a single test file
npm run test:coverage  # Run tests with coverage (scoped to src/lib/openclaw/)

# E2E tests (Playwright) — require a running dev server:
npx playwright test          # Run all e2e tests (tests/e2e/)
npx playwright test landing  # Run a single spec file

npx prisma studio    # Open Prisma database GUI
npx prisma db push   # Push schema changes to database
npx prisma generate  # Generate Prisma client
npx tsx prisma/seed.ts         # Seed projects
npx tsx prisma/seed-problems.ts  # Seed clinical problems

# One-off cohort tooling (require SLACK_BOT_TOKEN env var):
bash scripts/setup-cohort-slack.sh             # idempotent: create 10 cohort channels + topics + pinned welcomes
bash scripts/setup-cohort-slack.sh --dry-run   # preview without API calls
bash scripts/slack-invite-self.sh "$SLACK_USER_ID"     # invite a user to all cohort channels (bot can't auto-add the workspace owner)
bash scripts/reconcile-cohort-slack.sh         # diff workspace against /cohort/cohort-00/channels canonical list
bash scripts/reconcile-cohort-slack.sh --apply # archive extras (never archives #general or pod-N)

# Nudge never-signed-in cohort builders (Resend transactional email):
DATABASE_URL=$(grep ^DATABASE_URL .env.local | sed 's/^DATABASE_URL=//' | tr -d '"') \
RESEND_API_KEY=$(grep ^RESEND_API_KEY .env.local | sed 's/^RESEND_API_KEY=//' | tr -d '"') \
  npx tsx scripts/send-cohort-nudge.ts              # dry-run, prints recipients
  npx tsx scripts/send-cohort-nudge.ts --send       # actually fire
  npx tsx scripts/send-cohort-nudge.ts --send --include-all  # everyone, not just non-signed-in
```

**No per-pod Slack channels.** Pods coordinate via the website (`/cohort/cohort-00/community`) and the Monday call. Earlier scaffolding (setup-cohort-slack.sh, reconcile script, cohort-00.ts) reserved `pod-1`…`pod-5` namespace; we ripped those out 2026-06-05 — fewer channels = more signal, easier for Eugene to monitor. The reconcile script still safe-lists `pod-N` so it won't archive any ad-hoc pod channel a builder creates.

The scripts use a strict env-var-via-quoted-heredoc pattern for JSON bodies because macOS bash 3.2 does brace expansion on `{...}` literals inside nested `$(python3 -c "...")`, mangling dict literals. Don't refactor to the simpler `python3 -c "json.dumps({...})"` style — it will silently break on macOS.

## Tech Stack

- **Framework**: Next.js 16 with App Router, React 19, TypeScript 5
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Auth**: NextAuth.js v5 beta (GitHub, Google OAuth, Credentials) with JWT sessions
- **UI**: TailwindCSS 4, shadcn/ui (Radix UI), lucide-react icons
- **FHIR**: Medplum SDK (@medplum/core, @medplum/react) for healthcare data
- **AI**: Anthropic SDK (@anthropic-ai/sdk) for analysis features; OpenClaw generation uses a BYOK multi-provider client (`lib/openclaw/ai-client.ts`) duck-typing the Anthropic SDK interface to support both Anthropic (Claude) and OpenAI (GPT-4o/Codex)
- **Testing**: Vitest with @vitejs/plugin-react, coverage via v8
- **State**: React Query (@tanstack/react-query)
- **Validation**: Zod v4
- **Deployment**: Vercel (project: fhir-builders, domain: fhirbuilders.com)

## Architecture

### Directory Structure (fhirbuilders-app/src/)

- `app/` - Next.js App Router pages and API routes
- `components/` - React components (shadcn/ui components in `components/ui/`)
- `components/layout/` - Header and Footer (shared nav structure)
- `lib/` - Core utilities and services
- `lib/openclaw/` - AI-powered FHIR app generation system (orchestrator, code-generator, templates, schema validation)
- `lib/cohort/` - Cohort experience seed data: `cohort-00.ts` (sessions, signups, helpers like `nextSession`, `formatSessionTime`) and `prereqs.ts` (priority-banded readiness checklist). Phase 1 — hardcoded; future `Cohort`, `CohortEvent`, `WeeklyCommitment`, `PreReqCheck` Prisma models will replace these.

### Key Modules

- `lib/auth.config.ts` - Edge-compatible NextAuth config (used by middleware). Contains GitHub, Google, and Credentials providers. Has `allowDangerousEmailAccountLinking: true` on OAuth providers.
- `lib/auth.ts` - Full NextAuth config with PrismaAdapter (Node.js only). Overrides Credentials provider from auth.config with real bcrypt logic. Exports `{ handlers, signIn, signOut, auth }`.
- `lib/medplum.ts` - Medplum FHIR client setup, FHIR_RESOURCES list, SYNTHEA_MODULES for synthetic data
- `lib/prisma.ts` - Singleton Prisma client
- `lib/ai-service.ts` - Anthropic SDK integration for AI features
- `lib/openclaw/` - Full AI code generation pipeline: schema validation (Zod), orchestrator, code-generator, templates, channels, scaffold. This is the most tested module in the codebase.
- `lib/admin-auth.ts` - `requireAdminAuth()` — discriminated-union helper (`{ success: true, userId, role } | { success: false, response }`) used by all admin API routes. Queries the DB directly (not the JWT) so role changes take effect immediately.
- `lib/rate-limit.ts` - In-memory rate limiter with pre-configured `RATE_LIMITS` constants (waitlist/feedback/api/generate/demo tiers). Resets on redeploy; not suitable for multi-instance unless replaced with Redis.
- `lib/demo-user.ts` - Sentinel `DEMO_USER_ID = 'demo-anonymous-user'` used by anonymous OpenClaw generation routes. Lazily upserted on first request.
- `lib/zulip.ts` - `postToZulip()` for cross-posting to chat.fhir.org (stream+topic+content). Guarded by `ZULIP_*` env vars — silently no-ops if unconfigured.
- `lib/analytics.ts` - Thin wrapper around `@vercel/analytics` `track()` for custom events (sandbox_create, early_access_submit, etc.).
- `lib/wiki/graph.ts` - Schema (`WikiNode`, `WikiEdge`, `WikiLogEntry`) and seed data for the knowledge graph. Every renderer depends on this contract; see `lib/wiki/README.md` for the full forking guide.
- `prisma/schema.prisma` - Database schema with all models and enums

### Auth Split: Edge vs Node.js

Auth is split into two files because Next.js middleware runs in the Edge runtime (no Prisma):
- `lib/auth.config.ts` — Edge-safe config used by `middleware.ts`. No Prisma imports.
- `lib/auth.ts` — Full config with PrismaAdapter, used by API routes and server components.

The middleware (`middleware.ts`) protects `/dashboard/*`, `/profile/*`, and `/admin/*` routes using the Edge-compatible config.

### Navigation Structure

Primary nav is defined in `components/layout/header.tsx` as a `navigation` array. Footer (`components/layout/footer.tsx`) mirrors the same links. When adding/removing nav items, update both files.

Current nav: Problems | Projects | MCP | Agent Skills | Sandbox | Learn

Other notable pages not in the primary nav: `showcase/` (with `[slug]` detail and `submit/`), `u/[id]` (public user profiles), `get-started/`, `faq/`, `early-access/`.

**Cohort routes own their own chrome.** Both `Header` and `Footer` are client components that read `usePathname()` and return `null` when the path starts with `/cohort`. The cohort subtree (`app/cohort/[slug]/layout.tsx`) wraps its children in a left-sidebar shell (Accountable-style). When debugging "where did the top nav go" — that's by design on cohort pages, not a bug.

### Cohort experience (`/cohort/[slug]`)

Inside-the-house surface for active cohort members, modeled on Accountable. Architecture:

- **`app/cohort/[slug]/layout.tsx`** — server component, renders the persistent sidebar + main content area. Bg `bg-slate-50`.
- **`app/cohort/[slug]/_components/cohort-sidebar.tsx`** — client component (needs `usePathname` for active state). 11 nav entries: Home, Pre-flight, Bulletin, Reflect, Plan, Calendar, Community, Channels, Messages (external Slack), Meeting, Workshops, The Lab. Brand chip top-left, streak widget + Help/Support bottom-left.
- **Sub-route pages** — each tab is its own server component under `app/cohort/[slug]/<name>/page.tsx`. All read data from `lib/cohort/cohort-00.ts` and `lib/cohort/prereqs.ts`.
- **Two client islands** —
  - `_components/commitments-widget.tsx` (3-slot weekly commitments + streak, localStorage-backed; Phase 2 → `WeeklyCommitment` Prisma model).
  - `prereqs/_components/prereqs-checklist.tsx` (priority-banded checkboxes, localStorage-backed; Phase 2 → `PreReqCheck` Prisma model).

**Adding a new tab:** create `app/cohort/[slug]/<name>/page.tsx` (server component) AND add a `{ label, href: "/<name>", icon }` entry to the `NAV` array in `_components/cohort-sidebar.tsx`. The sidebar handles active highlighting from `pathname === \`${base}${item.href}\``.

**Pod channels** are intentionally deferred — pod-1 through pod-5 will be created Fri before Session 1 once pod assignments are finalized. The `/channels` directory page (`app/cohort/[slug]/channels/page.tsx`) and the `setup-cohort-slack.sh` script both reflect this — neither creates `pod-N` channels yet.

### API Routes

- `/api/auth/[...nextauth]` - NextAuth handlers
- `/api/auth/register` - Credentials sign-up (bcrypt)
- `/api/apps/[id]/` - App CRUD, comments, ratings, sharing, upvotes, crossposting
- `/api/openclaw/` - AI generation channels, status, webhooks
- `/api/openclaw/generate`, `/api/openclaw/generate-skill` - BYOK app/skill generation (Anthropic or OpenAI)
- `/api/ai/analyze` - AI analysis endpoint
- `/api/projects` - GET/POST SharedProject records
- `/api/projects/[id]` - Single project, upvote, fork
- `/api/projects/digest` - Project digest aggregation
- `/api/users/[id]` - Public user data
- `/api/problems` - GET (with category/status/sort filters), POST clinical problems
- `/api/problems/[id]` - GET single, PATCH to link projects
- `/api/problems/[id]/support` - POST increment supportCount
- `/api/activity` - GET live activity stats (projects/problems this week, total upvotes)
- `/api/waitlist` - GET (counts), POST (join with upsert logic)
- `/api/admin/waitlist/[id]` - Admin CRUD for waitlist entries
- `/api/dashboard` - Dashboard data aggregation
- `/api/profile` - User profile management
- `/api/feedback` - POST feedback

### Database Models (Prisma)

**Core**: User (with Persona enum: BUILDER, INVESTOR, SUPPORTER, USER), Organization, Account, Session

**Marketplace**: App (with Category, AppStatus, FHIR resources), Rating, Comment, Upvote

**Collaboration**: Project (with Visibility: PRIVATE, PUBLIC, ORGANIZATION), ProjectMember (with MemberRole), Discussion, Pitch

**Community**: SharedProject (lightweight project sharing with makerComment, trendingScore, artifactType, upvoteCount), UpvoteEvent (for velocity-based trending), ClinicalProblem (problem board with supportCount, linkedProjects array)

**FHIR**: Sandbox (Medplum integration with patient count and data modules)

**OpenClaw**: GeneratedApp, MessagingChannel, AppChannel, ChannelMessage

**Early Access**: Waitlist, Feedback

### Wiki module (`/wiki`)

A reusable LLM-curated knowledge graph (inspired by Karpathy's wiki concept). Architecture:

- **`lib/wiki/graph.ts`** — schema + seed data. The contract: `WikiNode` (slug, category, status, body/useMdx), `WikiEdge` (from/to slugs), `WikiLogEntry`. Every renderer depends on this; don't change the schema without updating all pages.
- **`app/wiki/page.tsx`** — categorized index with Live Signal cards.
- **`app/wiki/[slug]/page.tsx`** — topic detail with MDX body (opt-in via `useMdx: true`), external links, related topics.
- **`app/wiki/graph/page.tsx`** — force-directed SVG graph (d3-force).
- **`app/wiki/log/page.tsx`** — chronological change log.
- **`lib/wiki/signal.ts`** — read helpers for the `WikiSignal` table (populated by the cron job).
- **`/api/cron/wiki-slack-digest`** — Vercel Cron (daily 14:00 UTC, declared in `vercel.json`). Ingests Slack messages from FHIRBuilders workspace into `WikiSignal`. Requires `Authorization: Bearer <CRON_SECRET>` in production; dev accepts anything.
- **`/api/admin/wiki-signal`** — manual signal entry for external workspaces where we lack bot access.

### Problem-Project Linking

Problems and projects are linked via `ClinicalProblem.linkedProjects` (a `String[]` of SharedProject IDs). The PATCH endpoint at `/api/problems/[id]` appends project IDs and sets status to "being-built". This is bidirectional in the UI: project detail pages show related problems, problem detail pages show linked builders.

### Authentication Flow

OAuth providers (GitHub, Google) -> NextAuth with PrismaAdapter -> JWT session enriched with user persona, role, skills, interests -> Sign-in redirects to `/login`, new users to `/onboarding`, success redirects to `/dashboard`

## Environment Variables

Required (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `NEXTAUTH_URL` - Must match production domain (https://fhirbuilders.com)
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_URL` - Public base URL (e.g. `https://fhirbuilders.com`)
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` - GitHub OAuth app callback: `https://fhirbuilders.com/api/auth/callback/github`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Google OAuth redirect: `https://fhirbuilders.com/api/auth/callback/google`
- `MEDPLUM_BASE_URL`, `MEDPLUM_CLIENT_ID`, `MEDPLUM_CLIENT_SECRET`
- `NEXT_PUBLIC_MEDPLUM_BASE_URL`, `NEXT_PUBLIC_MEDPLUM_CLIENT_ID`
- `ANTHROPIC_API_KEY` - For AI features (server-side; also the default BYOK provider)
- `OPENAI_API_KEY` - Optional; enables OpenAI as a BYOK provider in OpenClaw
- `RESEND_API_KEY` - Transactional email (cohort nudges via `scripts/send-cohort-nudge.ts`)
- `ADMIN_EMAILS` - Comma-separated list of emails that receive `ADMIN` role on sign-in
- `CRON_SECRET` - Bearer token Vercel Cron sends to `/api/cron/*` routes
- `SLACK_BOT_TOKEN` - For cohort Slack scripts and wiki digest cron
- `ZULIP_SITE_URL`, `ZULIP_API_KEY`, `ZULIP_EMAIL` - Optional; cross-posting to chat.fhir.org

## Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json)

## Security notes

- `.claude/settings.local.json` is **gitignored** as of `d5b5d38` after Neon flagged an exposed DATABASE_URL token in an earlier commit of that file. The Neon role password was rotated; old credential is dead. Don't re-add the file to the index even if `git add -A` tries to.
- Cohort + workspace bootstrap scripts (`scripts/*.sh`) need `SLACK_BOT_TOKEN` exported in the calling shell — they don't read from `.env*` to avoid that file being on disk in a shell with `set -x` or being scraped by an MCP server.
- Rotation playbook for Neon (since `neonctl 2.21.x` doesn't expose `roles reset-password`): `POST https://console.neon.tech/api/v2/projects/{id}/branches/{id}/roles/{role}/reset_password` with the bearer token from `~/.config/neonctl/credentials.json`. Then update all three Vercel env scopes (Production, Preview, Development) — Vercel CLI refuses to add to "all preview branches" non-interactively, so use the API endpoint `POST /v10/projects/{id}/env?teamId=...&upsert=true` for that one scope.
