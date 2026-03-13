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
```

## Tech Stack

- **Framework**: Next.js 16 with App Router, React 19, TypeScript 5
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js v5 beta (GitHub, Google OAuth) with JWT sessions
- **UI**: TailwindCSS 4, shadcn/ui (Radix UI), lucide-react icons
- **FHIR**: Medplum SDK (@medplum/core, @medplum/react) for healthcare data
- **AI**: Anthropic SDK (@anthropic-ai/sdk) for AI analysis features
- **Testing**: Vitest with @vitejs/plugin-react, coverage via v8
- **State**: React Query (@tanstack/react-query)
- **Validation**: Zod v4

## Architecture

### Directory Structure (fhirbuilders-app/src/)

- `app/` - Next.js App Router pages and API routes
- `components/` - React components (shadcn/ui components in `components/ui/`)
- `lib/` - Core utilities and services
- `lib/openclaw/` - AI-powered FHIR app generation system (orchestrator, code-generator, templates, schema validation)

### Key Modules

- `lib/auth.ts` - NextAuth configuration with PrismaAdapter, JWT sessions, enriched session with persona/role/skills. Exports `{ handlers, signIn, signOut, auth }`.
- `lib/medplum.ts` - Medplum FHIR client setup, FHIR_RESOURCES list, SYNTHEA_MODULES for synthetic data
- `lib/prisma.ts` - Singleton Prisma client
- `lib/ai-service.ts` - Anthropic SDK integration for AI features
- `lib/openclaw/` - Full AI code generation pipeline: schema validation (Zod), orchestrator, code-generator, templates, channels, scaffold. This is the most tested module in the codebase.
- `prisma/schema.prisma` - Database schema with all models and enums

### Middleware

`middleware.ts` uses NextAuth's `auth()` wrapper to protect `/dashboard/*`, `/profile/*`, and `/admin/*` routes, redirecting unauthenticated users to `/login`.

### API Routes

- `/api/auth/[...nextauth]` - NextAuth handlers
- `/api/apps/[id]/` - App CRUD, comments, ratings, sharing, upvotes, crossposting
- `/api/openclaw/` - AI generation channels, status, webhooks
- `/api/ai/analyze` - AI analysis endpoint
- `/api/waitlist` - GET (counts), POST (join with upsert logic)
- `/api/admin/waitlist/[id]` - Admin CRUD for waitlist entries
- `/api/projects` - GET/POST projects
- `/api/dashboard` - Dashboard data aggregation
- `/api/profile` - User profile management
- `/api/feedback` - POST feedback

### Database Models (Prisma)

**Core**: User (with Persona enum: BUILDER, INVESTOR, SUPPORTER, USER), Organization, Account, Session

**Marketplace**: App (with Category, AppStatus, FHIR resources), Rating, Comment, Upvote

**Collaboration**: Project (with Visibility: PRIVATE, PUBLIC, ORGANIZATION), ProjectMember (with MemberRole), Discussion, Pitch

**FHIR**: Sandbox (Medplum integration with patient count and data modules)

**Early Access**: Waitlist, Feedback, SharedProject

### Authentication Flow

OAuth providers (GitHub, Google) -> NextAuth with PrismaAdapter -> JWT session enriched with user persona, role, skills, interests -> Sign-in redirects to `/login`, new users to `/onboarding`, success redirects to `/dashboard`

## Environment Variables

Required (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `MEDPLUM_BASE_URL`, `MEDPLUM_CLIENT_ID`, `MEDPLUM_CLIENT_SECRET`
- `NEXT_PUBLIC_MEDPLUM_BASE_URL`, `NEXT_PUBLIC_MEDPLUM_CLIENT_ID`
- `ANTHROPIC_API_KEY` - For AI features

## Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json)
