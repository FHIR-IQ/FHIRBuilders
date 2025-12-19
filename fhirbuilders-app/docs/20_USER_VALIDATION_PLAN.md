# 20-User Validation Plan

## Objective
Validate the core hypothesis: **FHIR developers want instant sandbox access** before building full automation.

---

## Phase 1: Attract (Week 1)

### Goal: Get 50+ waitlist signups

### Channels
| Channel | Action | Target |
|---------|--------|--------|
| FHIR Zulip | Post in #implementers, #general | 20 signups |
| Reddit r/healthIT | Share with value-first post | 10 signups |
| LinkedIn | Personal posts in FHIR groups | 10 signups |
| Twitter/X | Thread on FHIR dev pain points | 5 signups |
| Hacker News | Show HN post (if ready) | 5 signups |

### Landing Page Metrics to Track
- [ ] Unique visitors
- [ ] "Create Sandbox" button clicks
- [ ] Waitlist form submissions
- [ ] Bounce rate
- [ ] Time on page

### Waitlist Form Fields
1. Email (required)
2. "What are you building?" (required, short text)
3. "Biggest FHIR pain point?" (optional, dropdown)
4. "Can we interview you?" (checkbox)

---

## Phase 2: Activate (Week 2)

### Goal: Manually onboard first 20 users

### Selection Criteria (from 50+ waitlist)
Prioritize users who:
1. Answered "Can we interview you?" = Yes
2. Have a specific project in mind
3. Represent diverse use cases (clinical, research, startup, enterprise)

### Manual Onboarding Process

```
Day 1: Selection
├── Review all waitlist submissions
├── Score by engagement potential (1-5)
├── Select top 20
└── Send personalized acceptance email

Day 2-3: Sandbox Creation
├── Create Medplum project for each user
├── Load 100 Synthea patients
├── Generate API credentials
└── Document sandbox URL + credentials

Day 4: Welcome Email
├── Send credentials + quick start guide
├── Include 3 sample queries to try
├── Schedule optional 15-min call
└── Set expectation: feedback in 7 days

Day 7-10: Follow-up
├── Check sandbox usage (queries made)
├── Send feedback request
├── Conduct interviews with willing users
└── Document learnings
```

### Welcome Email Template

```
Subject: Your FHIRBuilders Sandbox is Ready 🚀

Hi [NAME],

Your personal FHIR sandbox is live! Here's everything you need:

**Your Sandbox**
- URL: https://api.medplum.com/fhir/R4/[PROJECT_ID]
- Client ID: [CLIENT_ID]
- Client Secret: [CLIENT_SECRET]

**Quick Start**
Try these queries right now:

1. Get all patients:
   curl "[URL]/Patient" -H "Authorization: Bearer [TOKEN]"

2. Search by condition:
   curl "[URL]/Condition?code=44054006" -H "Authorization: Bearer [TOKEN]"

3. Recent observations:
   curl "[URL]/Observation?_sort=-date&_count=10" -H "Authorization: Bearer [TOKEN]"

**What's Included**
- 100 synthetic patients (Synthea-generated)
- Full FHIR R4 support
- Read/write access
- 30-day sandbox lifetime (extendable)

**One Ask**
I'd love to hear what you're building and how the sandbox helps (or doesn't).
Reply to this email or book a 15-min call: [CALENDLY_LINK]

Happy building!
[YOUR_NAME]
```

---

## Phase 3: Learn (Week 3)

### Goal: Understand what works and what doesn't

### Metrics to Collect

| Metric | How to Measure | Target |
|--------|----------------|--------|
| Activation rate | Users who made 1+ query | 80% |
| Engagement | Queries per active user | 10+ |
| Retention | Users active after 7 days | 50% |
| NPS | Survey question | 40+ |
| Referrals | "How did you hear about us?" | Track |

### Interview Questions (15 minutes)

**Opening (2 min)**
- What are you currently working on?
- How did you hear about FHIRBuilders?

**Problem Exploration (5 min)**
- Walk me through your last FHIR development experience
- What was the hardest part of getting started?
- How do you currently get test data?

**Solution Validation (5 min)**
- How was the sandbox setup experience?
- What did you build/test with it?
- What's missing that you need?

**Closing (3 min)**
- Would you recommend this to a colleague?
- What would make you pay for this?
- Any other feedback?

### Feedback Survey (sent Day 7)

```
1. How easy was it to get started? (1-5)
2. Did the sandbox have the data you needed? (Y/N/Partially)
3. What did you build or test? (open text)
4. What's the #1 thing we should add? (open text)
5. How likely to recommend? (0-10 NPS)
6. Can we share your project on our site? (Y/N)
```

---

## Phase 4: Decide (Week 4)

### Go/No-Go Criteria

| Signal | Go | Pivot | Stop |
|--------|-----|-------|------|
| Activation (1+ query) | >70% | 40-70% | <40% |
| Week 1 retention | >40% | 20-40% | <20% |
| NPS score | >30 | 0-30 | <0 |
| Interview sentiment | Enthusiastic | Mixed | Negative |
| Referral requests | >5 | 1-5 | 0 |

### If GO: Build automation
- Implement self-service sandbox creation
- Add usage dashboard
- Launch to waitlist

### If PIVOT: Adjust offering
- Interview churned users
- Identify missing features
- Test new hypothesis

### If STOP: Learn and move on
- Document learnings
- Share post-mortem
- Consider adjacent problems

---

## Tools Needed

### For Phase 1 (Attract)
- [x] Landing page with CTA (built)
- [ ] Waitlist form (Tally.so or built-in)
- [ ] Analytics (Plausible or Vercel Analytics)

### For Phase 2 (Activate)
- [ ] Medplum account with project creation access
- [ ] Synthea data bundles (pre-generated)
- [ ] Email sending (Resend or personal email)
- [ ] Spreadsheet to track users

### For Phase 3 (Learn)
- [ ] Calendly for interview scheduling
- [ ] Tally.so for feedback survey
- [ ] Notion for documenting learnings

---

## User Tracking Spreadsheet

| Email | Signed Up | Sandbox Created | First Query | Queries (7d) | Interview | NPS | Notes |
|-------|-----------|-----------------|-------------|--------------|-----------|-----|-------|
| user1@example.com | 2025-01-15 | 2025-01-16 | 2025-01-16 | 23 | Yes | 9 | Building patient portal |
| user2@example.com | 2025-01-15 | 2025-01-16 | - | 0 | No | - | No activity, follow up |

---

## Success Stories Template

For users who consent to sharing:

```markdown
## [Project Name]

**Builder:** [Name], [Role] at [Company]

**Problem:** [One sentence problem they were solving]

**Solution:** [How they used the sandbox]

**Quote:** "[Their words about the experience]"

**Built with:** FHIRBuilders Sandbox + [their stack]
```

---

## Budget

| Item | Cost | Notes |
|------|------|-------|
| Medplum Cloud | $0 | Free tier for dev |
| Vercel hosting | $0 | Free tier |
| Plausible analytics | $9/mo | Privacy-focused |
| Resend email | $0 | Free tier (3k/mo) |
| Calendly | $0 | Free tier |
| Tally.so | $0 | Free tier |
| **Total** | **$9/mo** | |

---

## Timeline

```
Week 1: Attract
├── Mon: Launch landing page
├── Tue: Post to FHIR Zulip
├── Wed: Reddit + LinkedIn posts
├── Thu: Monitor signups, engage comments
└── Fri: Select first 20 users

Week 2: Activate
├── Mon-Tue: Create 20 sandboxes manually
├── Wed: Send welcome emails
├── Thu-Fri: Support users, answer questions
└── Weekend: Let users explore

Week 3: Learn
├── Mon-Wed: Conduct interviews (aim for 10)
├── Thu: Send feedback survey
├── Fri: Compile survey results
└── Weekend: Synthesize learnings

Week 4: Decide
├── Mon: Team review of all data
├── Tue: Go/Pivot/Stop decision
├── Wed-Fri: Execute on decision
└── Document and share learnings
```

---

## Appendix: Synthea Data Generation

Pre-generate these bundles for quick sandbox setup:

```bash
# Generate 100 patients with common conditions
java -jar synthea-with-dependencies.jar \
  -p 100 \
  -m "diabetes*,hypertension*,covid19*" \
  --exporter.fhir.export true \
  --exporter.fhir.bulk_data true

# Output: 100 patient bundles ready to upload
```

### Data Modules to Include
- Allergies
- Asthma
- Diabetes (Type 1 & 2)
- Hypertension
- COVID-19
- Heart Disease
- Pregnancy (subset)

---

## Contact Points

- **FHIR Zulip:** https://chat.fhir.org
- **Reddit:** r/healthIT, r/FHIR
- **LinkedIn:** FHIR, HL7, Health IT groups
- **Twitter:** #FHIR #HealthIT #DigitalHealth

---

## Notes

This is a **manual-first approach**. The goal is learning, not scaling.

We're trading efficiency for insight. A spreadsheet beats a database when you have 20 users. Personal emails beat automated sequences when you need real feedback.

Once we validate the hypothesis, we'll automate everything.
