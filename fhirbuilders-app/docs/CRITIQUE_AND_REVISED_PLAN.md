# FHIRBuilders Plan Critique & Agile Revision

## Executive Summary

The current plan is **ambitious but unfocused**. It tries to be everything at once: a marketplace, sandbox, collaboration tool, pitch platform, and matchmaking service. This violates the core agile principle of **delivering value incrementally**.

---

## PART 1: Product Manager Critique

### What's Wrong

#### 1. Feature Bloat Before Validation
The plan includes 9 sprints of features before we know if anyone wants this. We're building:
- 4 different persona dashboards
- A full pitch/funding platform
- Smart matching algorithms
- 8+ external integrations

**PM Verdict:** We're solving problems we *assume* exist, not validated problems.

#### 2. No Clear User Journey
The plan lists features, not outcomes. Questions unanswered:
- What does a user do in their **first 5 minutes**?
- What's the **one thing** that makes them come back?
- What's the **activation metric**?

#### 3. Competing Value Propositions
Are we:
- A **marketplace** (like Product Hunt for FHIR)?
- A **sandbox provider** (like Postman for FHIR)?
- A **community** (like Discord for FHIR)?
- A **pitch platform** (like AngelList for health tech)?

**PM Verdict:** Pick ONE to nail first.

#### 4. Wrong Success Metrics
Current metrics are vanity metrics:
- "500 registered users" - Registration is not engagement
- "50 apps in marketplace" - Quantity over quality
- "200 active sandboxes" - Active how? For how long?

**Better Metrics:**
- **Activation Rate:** % of signups who create a sandbox within 7 days
- **Retention:** % of users returning weekly
- **Value Delivered:** # of FHIR queries executed per sandbox
- **Virality:** # of apps submitted by invited users

#### 5. Technical Overkill
Building everything from scratch when alternatives exist:
- Why build a sandbox when [SMART Health IT Sandbox](https://launch.smarthealthit.org/) exists?
- Why build forums when Discord/Slack are free?
- Why build pitch pages when Notion works?

---

## PART 2: User Critique

### Builder Persona (Primary User)

**What I actually want:**

1. **Get FHIR data in 30 seconds** - Not signup forms, not tutorials. Give me data NOW.
2. **See working examples** - Don't make me read docs. Show me code that works.
3. **Connect with 1-2 people** - Not a social network. Just find me someone who solved my problem.

**What the plan gives me:**
- 6 sprints before I can even test my app
- Complex persona selection during onboarding
- A marketplace with 0 apps (chicken-and-egg problem)

**User Verdict:** I'll just use the Medplum playground directly.

### Investor Persona (Secondary)

**What I actually want:**
1. See what's being built in FHIR/AI healthcare
2. Find founders who are shipping
3. Minimal friction to connect

**What the plan gives me:**
- A separate dashboard I have to learn
- Pitch decks I could find on LinkedIn
- No signal on who's actually building vs. talking

**User Verdict:** I'll just browse GitHub and ProductHunt.

### Healthcare Org Persona (Tertiary)

**What I actually want:**
1. Apps that are already working
2. Proof of security/compliance
3. Easy evaluation

**What the plan gives me:**
- A marketplace with unverified apps
- No compliance documentation
- No trial/demo flow

**User Verdict:** I'll go to established vendors.

---

## PART 3: Agile Principles Applied

### Principle 1: Deliver Working Software Frequently
**Current Plan Violation:** 9 sprints before "launch-ready"
**Fix:** Launch after Sprint 1 with a single, complete use case

### Principle 2: Welcome Changing Requirements
**Current Plan Violation:** Detailed schema for features we haven't validated
**Fix:** Start with minimal schema, evolve based on usage

### Principle 3: Working Software is the Primary Measure of Progress
**Current Plan Violation:** Progress measured in features built
**Fix:** Progress measured in user problems solved

### Principle 4: Simplicity—Maximizing Work Not Done
**Current Plan Violation:** Building sandbox, marketplace, forums, pitches, matching
**Fix:** Build ONE thing that's 10x better than alternatives

### Principle 5: Build Projects Around Motivated Individuals
**Current Plan Violation:** Plan assumes a team to build all features
**Fix:** Focus on what one person can ship and iterate on

---

## PART 4: Revised MVP Strategy

### The One Thing: "FHIR in 30 Seconds"

**Core Insight:** The biggest friction in FHIR development is getting started.

**MVP:** A single page where you can:
1. Click a button
2. Get a sandbox URL with 100 patients
3. Start querying immediately

That's it. No signup required for basic use.

### Revised User Journey

```
Landing Page
    ↓
[Create Free Sandbox] button
    ↓
Sandbox created (no auth required)
    ↓
API Explorer with sample queries
    ↓
"Save this sandbox" → prompts signup
    ↓
Dashboard with saved sandboxes
    ↓
"Share your app" → first marketplace entry
```

### Revised Sprints

#### Sprint 1: Zero-Friction Sandbox (2 weeks)
**Goal:** Anyone can have FHIR data in 30 seconds

- [ ] Landing page with ONE clear CTA
- [ ] Anonymous sandbox creation (rate-limited)
- [ ] Pre-loaded Synthea data (100 patients)
- [ ] Embedded FHIR API explorer
- [ ] "Save sandbox" triggers auth

**Success Metric:** 100 sandboxes created in first week

#### Sprint 2: Sandbox Persistence (1 week)
**Goal:** Users return because their data persists

- [ ] Auth with GitHub (one provider only)
- [ ] Dashboard showing saved sandboxes
- [ ] Sandbox naming and basic management
- [ ] Usage stats (queries, resources)

**Success Metric:** 30% of sandbox creators sign up

#### Sprint 3: Share Your Work (1 week)
**Goal:** First "marketplace" entries via organic sharing

- [ ] "I built something" simple form
- [ ] Public project page (not app listing)
- [ ] GitHub repo linking
- [ ] Upvote button

**Success Metric:** 10 projects shared

#### Sprint 4: Discovery (1 week)
**Goal:** Users find each other's work

- [ ] Simple project list (newest, most upvoted)
- [ ] Category tags (user-generated)
- [ ] Profile pages for builders

**Success Metric:** 50% of visitors view a shared project

#### Sprint 5: Collaboration Lite (1 week)
**Goal:** Connect builders without building full forums

- [ ] Comment on projects
- [ ] "Want to collaborate" button (sends email)
- [ ] Weekly digest of new projects

**Success Metric:** 5 collaboration connections made

---

## PART 5: What We're NOT Building (Yet)

### Deliberately Deferred

| Feature | Why Defer | Revisit When |
|---------|-----------|--------------|
| Multiple personas | Creates complexity before we have users | 1000+ users |
| Pitch/funding | Not core to sandbox/builder use case | Investors ask for it |
| Smart matching | Need data on what users actually need | 100+ projects |
| Hugging Face integration | Shiny but not essential | AI use cases emerge |
| FHIR IG browser | Already exists at hl7.org | Users request it |
| Terminology server | Specialized need | Clinical users onboard |
| Organization features | B2B comes after B2D (developer) | Enterprise interest |
| Admin dashboard | Premature optimization | Scale requires it |

### Use External Tools Instead

| Need | Use Instead of Building |
|------|-------------------------|
| Community chat | Discord server (free) |
| Documentation | GitHub README + simple /docs page |
| Pitch decks | Notion templates |
| Email notifications | Resend or simple SMTP |
| Analytics | Plausible (privacy-focused) |

---

## PART 6: Revised Technical Approach

### Minimal Schema (Start Here)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  githubId      String?   @unique
  sandboxes     Sandbox[]
  projects      Project[]
  upvotes       Upvote[]
  createdAt     DateTime  @default(now())
}

model Sandbox {
  id            String    @id @default(cuid())
  name          String    @default("My Sandbox")
  medplumProjectId String?
  userId        String?   // Nullable for anonymous
  user          User?     @relation(fields: [userId])
  queryCount    Int       @default(0)
  lastAccessedAt DateTime @default(now())
  createdAt     DateTime  @default(now())
}

model Project {
  id          String   @id @default(cuid())
  title       String
  description String
  repoUrl     String?
  demoUrl     String?
  tags        String[]
  userId      String
  user        User     @relation(fields: [userId])
  upvotes     Upvote[]
  upvoteCount Int      @default(0)
  createdAt   DateTime @default(now())
}

model Upvote {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId])
  projectId String
  project   Project  @relation(fields: [projectId])
  createdAt DateTime @default(now())
  @@unique([userId, projectId])
}
```

That's it. 4 models. Add more when needed.

### Pages (Minimal)

```
/                       # Landing + sandbox creation
/sandbox/[id]           # Sandbox explorer
/dashboard              # My sandboxes (auth required)
/projects               # Community projects
/projects/new           # Share your work
/projects/[id]          # Project detail
/[username]             # Profile page
```

7 pages. Not 30+.

---

## PART 7: Validation Before Building

### Week 1: Landing Page Test
Before building anything else, deploy the homepage and track:
- Visits from FHIR community (Zulip, Reddit, HN)
- "Create Sandbox" button clicks
- Email signups for waitlist

**Go/No-Go:** 50+ waitlist signups = proceed

### Week 2: Manual Sandbox Test
For first 20 signups:
- Manually create Medplum sandboxes
- Send personalized emails with credentials
- Interview: What did you build? What's missing?

**Go/No-Go:** 5+ users actively using = proceed with automation

### Week 3: Automate What Works
Only automate the flows that manual testing validated.

---

## PART 8: Updated Success Metrics

### North Star Metric
**FHIR Queries Executed Per Week**

This measures actual value delivered. More queries = more building happening.

### Supporting Metrics

| Metric | Target (Month 1) | Target (Month 3) |
|--------|------------------|------------------|
| Sandboxes created | 200 | 1000 |
| Auth conversion | 20% | 30% |
| Weekly active sandboxes | 50 | 200 |
| Projects shared | 10 | 50 |
| Return visitors (weekly) | 30% | 40% |

---

## PART 9: Honest Assessment

### What FHIRBuilders Could Be
A focused tool that makes FHIR development delightful, with a community that emerges organically.

### What the Original Plan Would Create
A complex platform with many features, few users, and unclear value proposition.

### The Hard Truth
The FHIR developer community is small. Maybe 10,000 people worldwide actively build with FHIR. Of those, maybe 1,000 would consider a new platform. Of those, maybe 100 would try it. Of those, maybe 10 would stick.

**We need to be incredibly valuable to those 10 to grow to 100.**

---

## Conclusion

The revised approach:
1. **Focuses on one thing:** Fastest path to FHIR data
2. **Validates before building:** Test assumptions with real users
3. **Grows organically:** Community features emerge from usage
4. **Stays lean:** Uses external tools where possible
5. **Measures what matters:** Value delivered, not features shipped

**Next Action:** Build the landing page with sandbox creation flow. Get it in front of 50 FHIR developers. Learn.
