# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FHIRBuilders is a Next.js healthcare application marketplace and sandbox platform for building, sharing, and collaborating on AI-powered FHIR (Fast Healthcare Interoperability Resources) applications. The main application code is located in the `fhirbuilders-app/` directory.

## Development Commands

All commands should be run from the `fhirbuilders-app/` directory:

```bash
npm run dev       # Start development server (localhost:3000)
npm run build     # Generate Prisma client and build for production
npm run lint      # Run ESLint
npm run start     # Start production server
npx prisma studio # Open Prisma database GUI
npx prisma db push # Push schema changes to database
npx prisma generate # Generate Prisma client
```

## Tech Stack

- **Framework**: Next.js 16 with App Router, React 19, TypeScript 5
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js v5 (GitHub, Google OAuth)
- **UI**: TailwindCSS 4, shadcn/ui (Radix UI), lucide-react icons
- **FHIR**: Medplum SDK (@medplum/core, @medplum/react) for healthcare data
- **State**: React Query (@tanstack/react-query)
- **Analytics**: Vercel Analytics

## Architecture

### Directory Structure (fhirbuilders-app/src/)

- `app/` - Next.js App Router pages and API routes
- `components/` - React components (shadcn/ui components in `components/ui/`)
- `lib/` - Core utilities: auth.ts, medplum.ts, prisma.ts, analytics.ts, utils.ts

### Key Files

- `lib/auth.ts` - NextAuth configuration with PrismaAdapter, JWT sessions, enriched session with persona/role/skills
- `lib/medplum.ts` - Medplum FHIR client setup, FHIR_RESOURCES list, SYNTHEA_MODULES for synthetic data
- `lib/prisma.ts` - Singleton Prisma client
- `prisma/schema.prisma` - Database schema with all models and enums

### Database Models (Prisma)

**Core**: User (with Persona enum: BUILDER, INVESTOR, SUPPORTER, USER), Organization, Account, Session

**Marketplace**: App (with Category, AppStatus, FHIR resources), Rating, Comment

**Collaboration**: Project (with Visibility: PRIVATE, PUBLIC, ORGANIZATION), ProjectMember (with MemberRole), Discussion, Pitch

**FHIR**: Sandbox (Medplum integration with patient count and data modules)

**Early Access**: Waitlist, Feedback, SharedProject

### API Routes

- `/api/auth/[...nextauth]` - NextAuth handlers
- `/api/waitlist` - GET (counts), POST (join with upsert logic)
- `/api/admin/waitlist/[id]` - Admin CRUD for waitlist entries
- `/api/projects` - GET/POST projects
- `/api/feedback` - POST feedback

### Authentication Flow

OAuth providers (GitHub, Google) → NextAuth with PrismaAdapter → JWT session enriched with user persona, role, skills, interests → Sign-in redirects to `/login`, success redirects to `/dashboard`

## Environment Variables

Required (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `MEDPLUM_BASE_URL`, `MEDPLUM_CLIENT_ID`, `MEDPLUM_CLIENT_SECRET`
- `NEXT_PUBLIC_MEDPLUM_BASE_URL`, `NEXT_PUBLIC_MEDPLUM_CLIENT_ID`

## Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json)
