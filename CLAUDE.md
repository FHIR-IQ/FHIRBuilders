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
npx prisma studio    # Open Prisma database GUI
npx prisma db push   # Push schema changes to database
npx prisma generate  # Generate Prisma client
npx tsx prisma/seed.ts         # Seed projects
npx tsx prisma/seed-problems.ts  # Seed clinical problems
```

## Tech Stack

- **Framework**: Next.js 16 with App Router, React 19, TypeScript 5
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Auth**: NextAuth.js v5 beta (GitHub, Google OAuth, Credentials) with JWT sessions
- **UI**: TailwindCSS 4, shadcn/ui (Radix UI), lucide-react icons
- **FHIR**: Medplum SDK (@medplum/core, @medplum/react) for healthcare data
- **AI**: Anthropic SDK (@anthropic-ai/sdk) for AI analysis features
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

### Key Modules

- `lib/auth.config.ts` - Edge-compatible NextAuth config (used by middleware). Contains GitHub, Google, and Credentials providers. Has `allowDangerousEmailAccountLinking: true` on OAuth providers.
- `lib/auth.ts` - Full NextAuth config with PrismaAdapter (Node.js only). Overrides Credentials provider from auth.config with real bcrypt logic. Exports `{ handlers, signIn, signOut, auth }`.
- `lib/medplum.ts` - Medplum FHIR client setup, FHIR_RESOURCES list, SYNTHEA_MODULES for synthetic data
- `lib/prisma.ts` - Singleton Prisma client
- `lib/ai-service.ts` - Anthropic SDK integration for AI features
- `lib/openclaw/` - Full AI code generation pipeline: schema validation (Zod), orchestrator, code-generator, templates, channels, scaffold. This is the most tested module in the codebase.
- `prisma/schema.prisma` - Database schema with all models and enums

### Auth Split: Edge vs Node.js

Auth is split into two files because Next.js middleware runs in the Edge runtime (no Prisma):
- `lib/auth.config.ts` — Edge-safe config used by `middleware.ts`. No Prisma imports.
- `lib/auth.ts` — Full config with PrismaAdapter, used by API routes and server components.

The middleware (`middleware.ts`) protects `/dashboard/*`, `/profile/*`, and `/admin/*` routes using the Edge-compatible config.

### Navigation Structure

Primary nav is defined in `components/layout/header.tsx` as a `navigation` array. Footer (`components/layout/footer.tsx`) mirrors the same links. When adding/removing nav items, update both files.

Current nav: Problems | Projects | MCP | Agent Skills | Sandbox | Learn

### API Routes

- `/api/auth/[...nextauth]` - NextAuth handlers
- `/api/apps/[id]/` - App CRUD, comments, ratings, sharing, upvotes, crossposting
- `/api/openclaw/` - AI generation channels, status, webhooks
- `/api/ai/analyze` - AI analysis endpoint
- `/api/projects` - GET/POST SharedProject records
- `/api/projects/[id]` - Single project, upvote, fork
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

### Problem-Project Linking

Problems and projects are linked via `ClinicalProblem.linkedProjects` (a `String[]` of SharedProject IDs). The PATCH endpoint at `/api/problems/[id]` appends project IDs and sets status to "being-built". This is bidirectional in the UI: project detail pages show related problems, problem detail pages show linked builders.

### Authentication Flow

OAuth providers (GitHub, Google) -> NextAuth with PrismaAdapter -> JWT session enriched with user persona, role, skills, interests -> Sign-in redirects to `/login`, new users to `/onboarding`, success redirects to `/dashboard`

## Environment Variables

Required (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `NEXTAUTH_URL` - Must match production domain (https://fhirbuilders.com)
- `NEXTAUTH_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` - GitHub OAuth app callback: `https://fhirbuilders.com/api/auth/callback/github`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Google OAuth redirect: `https://fhirbuilders.com/api/auth/callback/google`
- `MEDPLUM_BASE_URL`, `MEDPLUM_CLIENT_ID`, `MEDPLUM_CLIENT_SECRET`
- `NEXT_PUBLIC_MEDPLUM_BASE_URL`, `NEXT_PUBLIC_MEDPLUM_CLIENT_ID`
- `ANTHROPIC_API_KEY` - For AI features

## Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json)
