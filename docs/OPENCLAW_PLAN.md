# OpenClaw: AI-Powered FHIR App Builder

## Vision

OpenClaw is an AI-powered platform that enables anyone to build fully functional, compliant healthcare applications through natural language instructions. It combines conversational AI with deep FHIR expertise, regulatory awareness, and patient-centered design to generate production-ready apps on Medplum + SMART on FHIR rails.

**Core Principles:**
1. **Learn while building** - Every generated artifact includes explanations
2. **Patient-first** - Consent, privacy, and accessibility are foundational
3. **Clinician workflow** - CDS Hooks and in-EHR integration, not app fatigue
4. **Regulatory clarity** - Know your FDA/HIPAA status before you deploy
5. **Investment-ready** - Business model and market validation built-in

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           OpenClaw Platform                                 │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    LOCAL-FIRST PHI GATEWAY                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐     │   │
│  │  │   Docker     │  │   E2E        │  │   On-Premise           │     │   │
│  │  │   Sandboxes  │  │   Encryption │  │   Deployment Option    │     │   │
│  │  └──────────────┘  └──────────────┘  └────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────┼───────────────────────────────────┐   │
│  │              MULTI-AGENT SYSTEM │                                    │   │
│  │                                 ▼                                    │   │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐   │   │
│  │  │   Learning   │    │   FHIR       │    │   Regulatory         │   │   │
│  │  │   Agent      │    │   Expert     │    │   Compliance         │   │   │
│  │  │              │    │   Agent      │    │   Agent              │   │   │
│  │  │ • Explains   │    │              │    │                      │   │   │
│  │  │ • Teaches    │    │ • Resources  │    │ • FDA classification │   │   │
│  │  │ • Debugs     │    │ • Profiles   │    │ • HIPAA assessment   │   │   │
│  │  └──────────────┘    │ • Extensions │    │ • State requirements │   │   │
│  │                      └──────────────┘    └──────────────────────┘   │   │
│  │                             │                      │                 │   │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐   │   │
│  │  │   Code Gen   │    │   CDS Hooks  │    │   Accessibility      │   │   │
│  │  │   Agent      │    │   Agent      │    │   Agent              │   │   │
│  │  │              │    │              │    │                      │   │   │
│  │  │ • Scaffold   │    │ • In-EHR     │    │ • WCAG 2.1 AA        │   │   │
│  │  │ • Components │    │ • Cards      │    │ • Screen readers     │   │   │
│  │  │ • Tests      │    │ • Alerts     │    │ • i18n               │   │   │
│  │  └──────────────┘    └──────────────┘    └──────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────┼───────────────────────────────────┐   │
│  │              KNOWLEDGE LAYER    │                                    │   │
│  │                                 ▼                                    │   │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐   │   │
│  │  │ fhir-community│   │   HL7 IGs    │    │   EHR-Specific       │   │   │
│  │  │ search        │   │   US Core    │    │   Quirks DB          │   │   │
│  │  │ (Jira/Zulip) │    │   Profiles   │    │   (Epic/Cerner)      │   │   │
│  │  └──────────────┘    └──────────────┘    └──────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────┼───────────────────────────────────┐   │
│  │         FHIRBUILDERS MARKETPLACE                                     │   │
│  │                                 ▼                                    │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────────┐  │   │
│  │  │  Patient   │ │ Clinician  │ │  Investor  │ │    Developer     │  │   │
│  │  │  Reviews   │ │  Workflow  │ │  Metrics   │ │    Community     │  │   │
│  │  │  & Consent │ │  Feedback  │ │  & Deals   │ │    & Learning    │  │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └──────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Developer Experience: Learn While Building

### Two Modes of Operation

#### Learn Mode (Default for New Developers)
```
User: "Build me a medication adherence tracker"

OpenClaw (Learn Mode):
┌─────────────────────────────────────────────────────────────────────┐
│ 📚 LEARNING: Why I'm choosing these FHIR resources                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ For medication adherence, we need to track:                         │
│                                                                      │
│ 1. MedicationRequest (not MedicationOrder - that's DSTU2!)          │
│    → What was prescribed and when                                   │
│    → Links to: Medication, Patient, Practitioner                    │
│    → US Core profile: us-core-medicationrequest                     │
│                                                                      │
│ 2. MedicationStatement vs MedicationAdministration                  │
│    → Statement = patient-reported ("I took my meds")                │
│    → Administration = observed ("Nurse gave injection")             │
│    → For adherence tracking, we want Statement                      │
│                                                                      │
│ 3. Why not use Observation?                                         │
│    → Some systems track adherence as Observation                    │
│    → But MedicationStatement is semantically correct                │
│    → See: chat.fhir.org thread #medication-adherence-2023           │
│                                                                      │
│ [Continue] [Show me the code] [Ask a question]                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Build Mode (Experienced Developers)
```
User: "/build medication adherence tracker --fast"

OpenClaw (Build Mode):
→ Generating scaffold... done
→ Creating components... done
→ Adding tests... done
→ Deploying to sandbox... done
→ URL: https://sandbox.fhirbuilders.com/app/med-adherence-abc123
```

### Debugging & Validation Support

```
User: "My app is failing with 'Invalid reference'"

OpenClaw Debugger:
┌─────────────────────────────────────────────────────────────────────┐
│ 🔍 FHIR VALIDATION ERROR ANALYSIS                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Error: Invalid reference at MedicationRequest.subject               │
│                                                                      │
│ Your code:                                                          │
│   subject: { reference: "12345" }                                   │
│                                                                      │
│ Problem: References must be relative URLs or absolute URLs          │
│                                                                      │
│ Fix:                                                                │
│   subject: { reference: "Patient/12345" }                           │
│                                                                      │
│ 💡 Epic quirk: Epic sometimes returns references without            │
│    the resource type. You may need to normalize incoming data.      │
│                                                                      │
│ Related HL7 Jira: FHIR-12345 "Reference format inconsistency"       │
│                                                                      │
│ [Apply fix] [Explain more] [Show Epic workaround]                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Local Development Environment

```bash
# OpenClaw CLI
npx openclaw init my-fhir-app

# Creates:
my-fhir-app/
├── .openclaw/
│   ├── config.yaml          # OpenClaw settings
│   └── knowledge-cache/     # Cached FHIR knowledge
├── docker-compose.yml        # Local Medplum + PostgreSQL
├── src/
│   ├── fhir/                 # Generated FHIR resources
│   ├── components/           # React components
│   └── hooks/                # CDS Hooks (if applicable)
├── tests/
│   ├── fhir-validation/      # FHIR conformance tests
│   ├── integration/          # EHR integration tests
│   └── accessibility/        # WCAG compliance tests
├── .github/
│   └── workflows/
│       ├── fhir-validate.yml # FHIR validation CI
│       └── deploy.yml        # Deployment pipeline
└── COMPLIANCE.md             # Regulatory classification

# Run locally
npx openclaw dev

# Starts:
# - Local Medplum FHIR server (Docker)
# - Next.js dev server
# - FHIR request inspector (localhost:3001)
# - Hot reload with validation
```

### EHR-Specific Quirks Database

```yaml
# .openclaw/ehr-quirks.yaml (auto-maintained)
epic:
  references:
    - issue: "Returns bare IDs without resource type prefix"
      workaround: "Normalize all incoming references"
      affected_resources: ["Patient", "Practitioner", "Organization"]

  pagination:
    - issue: "Uses non-standard _page parameter"
      workaround: "Check for Link header, fall back to _page"

  extensions:
    - url: "http://open.epic.com/FHIR/StructureDefinition/..."
      description: "Epic-specific patient preferences"
      handling: "Safe to ignore for interoperability"

cerner:
  terminology:
    - issue: "Uses proprietary codes alongside standard"
      workaround: "Filter by system URL, prefer SNOMED/LOINC"
```

---

## Clinical Integration: Workflow-First Design

### CDS Hooks Integration

Instead of standalone apps, generate in-EHR clinical decision support:

```
User: "Alert clinicians when a diabetic patient hasn't had an A1C in 6 months"

OpenClaw generates:
```

#### CDS Hook Service
```typescript
// src/hooks/a1c-reminder.ts
export const hook: CDSHook = {
  id: "a1c-reminder",
  hook: "patient-view",
  title: "A1C Reminder for Diabetic Patients",
  description: "Alerts when diabetic patient needs A1C check",

  prefetch: {
    patient: "Patient/{{context.patientId}}",
    conditions: "Condition?patient={{context.patientId}}&code=http://snomed.info/sct|73211009",
    labs: "Observation?patient={{context.patientId}}&code=http://loinc.org|4548-4&_sort=-date&_count=1"
  },

  async handler(request: CDSRequest): Promise<CDSResponse> {
    const hasDiabetes = request.prefetch.conditions?.total > 0;
    const lastA1C = request.prefetch.labs?.entry?.[0]?.resource;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    if (hasDiabetes && (!lastA1C || new Date(lastA1C.effectiveDateTime) < sixMonthsAgo)) {
      return {
        cards: [{
          summary: "A1C overdue for diabetic patient",
          indicator: "warning",
          detail: `Last A1C: ${lastA1C ? formatDate(lastA1C.effectiveDateTime) : 'None on record'}`,
          suggestions: [{
            label: "Order A1C",
            actions: [{
              type: "create",
              resource: generateA1CServiceRequest(request.context.patientId)
            }]
          }]
        }]
      };
    }
    return { cards: [] };
  }
};
```

### MCP Tools for CDS Hooks

```
cds://hook/patient-view     - Generate patient chart cards
cds://hook/order-select     - Drug interaction/duplicate alerts
cds://hook/order-sign       - Prior auth requirements
cds://hook/appointment-book - Scheduling recommendations
cds://hook/encounter-start  - Care gap reminders
```

### Clinician Feedback: 30-Second Capture

```
┌─────────────────────────────────────────────────────────────────────┐
│ Quick Feedback (tap to rate)                          [x] Dismiss   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Did this alert help with patient care?                              │
│                                                                      │
│   👍 Yes, I acted on it                                             │
│   👎 No, not relevant                                               │
│   🔇 Alert fatigue - too many of these                              │
│                                                                      │
│ ────────────────────────────────────────────────────                │
│ 🎤 [Record 30-sec voice note]                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Auto-captured metrics (no clinician action needed):**
- Alert shown → action taken (order placed, note added)
- Time from alert to action
- Alert dismissed without action
- Same alert shown multiple times for same patient

---

## Patient-Centered Design

### Patient Consent Framework

Every generated app includes granular consent management:

```typescript
// Generated: src/consent/ConsentManager.tsx
export function ConsentManager({ patientId }: Props) {
  return (
    <ConsentUI
      categories={[
        {
          id: "medications",
          label: "Medications & Prescriptions",
          description: "Your current and past medications",
          default: true
        },
        {
          id: "conditions",
          label: "Health Conditions",
          description: "Diagnoses and health problems",
          default: true
        },
        {
          id: "mental-health",
          label: "Mental Health Records",
          description: "Therapy notes, psychiatric medications",
          default: false,  // Sensitive - opt-in
          warning: "These records have additional protections under 42 CFR Part 2"
        },
        {
          id: "reproductive",
          label: "Reproductive Health",
          description: "Pregnancy, contraception, fertility",
          default: false,  // Sensitive - opt-in
          warning: "Protected under state privacy laws"
        }
      ]}
      onConsentChange={handleConsentUpdate}
      showDataPreview={true}  // Let patient see what will be shared
    />
  );
}
```

### Patient Data Rights (GDPR/CCPA/HIPAA)

```typescript
// Generated: src/api/patient-rights.ts
export const patientRightsAPI = {
  // Right to access
  async downloadMyData(patientId: string): Promise<Bundle> {
    // Returns all FHIR resources for patient in downloadable format
  },

  // Right to deletion
  async requestDeletion(patientId: string): Promise<void> {
    // Initiates deletion workflow with audit trail
    // Note: Some data may be retained for legal/medical requirements
  },

  // Right to revoke
  async revokeAccess(patientId: string, appId: string): Promise<void> {
    // Immediately revokes app access, deletes cached data
  },

  // Right to portability
  async exportToAnotherApp(patientId: string, targetApp: string): Promise<void> {
    // FHIR $export to another authorized app
  },

  // Transparency
  async getAccessLog(patientId: string): Promise<AuditEvent[]> {
    // Who accessed my data and when
  }
};
```

### Accessibility by Default

All generated apps include:

```typescript
// Generated: next.config.ts
export default {
  // Accessibility linting in development
  experimental: {
    axeCore: true  // Throws errors for a11y violations
  }
};

// Generated: tests/accessibility/wcag.test.ts
describe('WCAG 2.1 AA Compliance', () => {
  test('all pages pass axe-core', async () => {
    for (const page of getAllPages()) {
      const results = await axe(page);
      expect(results.violations).toHaveLength(0);
    }
  });

  test('color contrast meets AA standard', async () => { /* ... */ });
  test('all images have alt text', async () => { /* ... */ });
  test('keyboard navigation works', async () => { /* ... */ });
  test('screen reader announcements are correct', async () => { /* ... */ });
});

// Generated: src/components/ui/ (all components)
// - ARIA labels on all interactive elements
// - Focus management for modals/dialogs
// - Skip links for main content
// - Reduced motion support
```

### Multi-Language Support

```typescript
// Generated: src/i18n/config.ts
export const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'zh', name: '中文' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'ko', name: '한국어' },
  // Top languages for US patient population
];

// OpenClaw auto-generates translations for:
// - UI labels and buttons
// - Error messages
// - Consent forms (legally reviewed templates)
// - Patient education content
```

### Patient Reviews on Marketplace

```prisma
model PatientReview {
  id              String   @id @default(cuid())
  appId           String
  app             App      @relation(fields: [appId], references: [id])

  // Anonymous by default
  anonymous       Boolean  @default(true)
  verifiedPatient Boolean  @default(false)  // Connected via SMART on FHIR

  // Ratings
  easeOfUse       Int      // 1-5: Was the app easy to use?
  helpfulness     Int      // 1-5: Did it help manage your health?
  privacy         Int      // 1-5: Did you feel your data was protected?
  wouldRecommend  Boolean  // Would you recommend to other patients?

  // Qualitative
  review          String?  @db.Text

  createdAt       DateTime @default(now())

  @@index([appId])
}
```

---

## Regulatory Compliance Agent

### Automatic Classification

```
User: "Build an app that recommends insulin doses based on glucose readings"

OpenClaw Regulatory Agent:
┌─────────────────────────────────────────────────────────────────────┐
│ ⚠️  REGULATORY CLASSIFICATION REQUIRED                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ This app appears to be Clinical Decision Support (CDS) that:        │
│                                                                      │
│ ❌ Provides specific treatment recommendations (insulin dosing)     │
│ ❌ Is not intended for clinician review before action               │
│ ❌ Could cause patient harm if incorrect                            │
│                                                                      │
│ FDA Classification: Software as Medical Device (SaMD)               │
│ Risk Category: Class II (Moderate Risk)                             │
│ Pathway: 510(k) premarket notification likely required              │
│                                                                      │
│ Options:                                                            │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ [A] Modify to require clinician review (may qualify for CDS     │ │
│ │     exemption under 21st Century Cures Act)                     │ │
│ │                                                                  │ │
│ │ [B] Proceed with SaMD pathway (I have regulatory support)       │ │
│ │                                                                  │ │
│ │ [C] Build as educational tool only (no treatment recommendations)│ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│ 📚 Learn more: FDA Digital Health Policy Navigator                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Generated Compliance Documentation

```markdown
# COMPLIANCE.md (auto-generated)

## Regulatory Classification

| Criterion | Assessment |
|-----------|------------|
| Provides diagnosis/treatment recommendation | Yes / No |
| Intended for clinician review | Yes / No |
| Could cause harm if incorrect | Low / Medium / High |
| Uses AI/ML for clinical decisions | Yes / No |

**Classification**: [CDS Exempt / Class I / Class II / Class III]

## HIPAA Assessment

| Requirement | Status |
|-------------|--------|
| PHI encrypted in transit | ✅ TLS 1.3 |
| PHI encrypted at rest | ✅ AES-256 |
| Access controls | ✅ Role-based |
| Audit logging | ✅ All access logged |
| BAA with subprocessors | ⚠️ Required for: [list] |

## State-Specific Requirements

| State | Additional Requirements |
|-------|------------------------|
| California | CCPA: Delete data on request, no sale of health data |
| New York | Requires state-specific consent for HIV/mental health |
| Texas | Requires explicit consent for biometric data |

## Reimbursement Eligibility

| Code Type | Potential Codes | Notes |
|-----------|-----------------|-------|
| CPT | 99453, 99454 | Remote Patient Monitoring setup/transmission |
| CPT | 99457, 99458 | RPM treatment management |
| CPT | 99490, 99491 | Chronic Care Management |
```

---

## Investor-Ready Marketplace

### Enhanced App Metrics

```prisma
model AppMetrics {
  id              String   @id @default(cuid())
  appId           String   @unique
  app             App      @relation(fields: [appId], references: [id])

  // Usage (real signals, not vanity)
  monthlyActiveUsers    Int      @default(0)
  avgSessionDuration    Float    @default(0)
  retentionDay7         Float    @default(0)
  retentionDay30        Float    @default(0)

  // Clinical validation
  clinicalReviewCount   Int      @default(0)
  avgClinicalRating     Float    @default(0)
  ehrIntegrations       Int      @default(0)  // How many EHRs connected

  // Patient validation
  patientReviewCount    Int      @default(0)
  avgPatientRating      Float    @default(0)
  patientNPS            Float?   // Net Promoter Score

  // Market validation
  pilotAgreements       Int      @default(0)  // LOIs, pilots
  paidCustomers         Int      @default(0)
  mrr                   Float?   // Monthly recurring revenue (optional disclosure)

  // Compliance
  fhirComplianceScore   Float    @default(0)  // 0-100
  accessibilityScore    Float    @default(0)  // WCAG compliance %
  securityAuditDate     DateTime?
  hipaaAttested         Boolean  @default(false)

  updatedAt             DateTime @updatedAt
}
```

### Business Model Templates

```prisma
model AppBusinessModel {
  id              String   @id @default(cuid())
  appId           String   @unique
  app             App      @relation(fields: [appId], references: [id])

  model           BusinessModelType

  // Pricing details
  pricingTiers    Json?    // [{name, price, features}]

  // Market sizing
  targetMarket    String?  // e.g., "Endocrinologists managing T2DM"
  tamEstimate     Float?   // Total addressable market
  samEstimate     Float?   // Serviceable addressable market

  // Go-to-market
  salesCycle      String?  // e.g., "3-6 months for health system"
  channelStrategy String?  // e.g., "Direct to health system IT"

  // Reimbursement
  reimbursementEligible  Boolean @default(false)
  cptCodes              String[] // Applicable CPT codes

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum BusinessModelType {
  SAAS_PER_SEAT         // Per clinician/user
  SAAS_PER_PATIENT      // Per patient managed
  TRANSACTION_FEE       // Per transaction/API call
  HEALTH_SYSTEM_LICENSE // Enterprise license
  PAYER_CONTRACT        // Payer/insurer contract
  RPM_REIMBURSEMENT     // Revenue from CPT codes
  FREEMIUM              // Free tier + paid features
  OPEN_SOURCE_SUPPORT   // Free software, paid support
}
```

### Investor Dashboard

```typescript
// src/app/investor/dashboard/page.tsx
export default function InvestorDashboard() {
  return (
    <Dashboard>
      {/* Thesis Matching */}
      <ThesisConfig
        categories={["AI/ML in Healthcare", "Patient Engagement", "Clinical Workflow"]}
        stages={["Pre-seed", "Seed", "Series A"]}
        checkSize={{ min: 100000, max: 2000000 }}
      />

      {/* Matched Apps */}
      <MatchedApps
        sortBy="traction"
        filters={{
          hasLOI: true,
          clinicalRating: { min: 4.0 },
          fhirCompliance: { min: 80 }
        }}
      />

      {/* Pipeline Tracking */}
      <DealPipeline
        stages={["Watching", "Reached Out", "First Call", "DD", "Term Sheet", "Closed"]}
      />

      {/* Portfolio */}
      <Portfolio
        metrics={["MRR Growth", "User Growth", "Clinical Adoption"]}
      />

      {/* Comparable Exits */}
      <ComparableExits
        categories={selectedCategories}
        timeframe="5y"
      />
    </Dashboard>
  );
}
```

### Warm Intro Facilitation

```prisma
model IntroRequest {
  id              String   @id @default(cuid())

  investorId      String
  investor        User     @relation("InvestorIntros", fields: [investorId], references: [id])

  founderId       String
  founder         User     @relation("FounderIntros", fields: [founderId], references: [id])

  appId           String
  app             App      @relation(fields: [appId], references: [id])

  // Mutual connection (if any)
  mutualConnectionId String?
  mutualConnection   User?  @relation("MutualIntros", fields: [mutualConnectionId], references: [id])

  status          IntroStatus @default(REQUESTED)
  message         String?  @db.Text

  createdAt       DateTime @default(now())
  respondedAt     DateTime?

  @@unique([investorId, founderId, appId])
}

enum IntroStatus {
  REQUESTED
  ACCEPTED
  DECLINED
  COMPLETED
}
```

---

## MCP Tools (Revised)

### Core Generation Tools
```
app://scaffold             - Generate Next.js + Medplum project with local dev setup
app://component            - Create accessible, FHIR-aware React components
app://api-route            - Generate API endpoints with auth + audit logging
app://test                 - Generate FHIR validation + accessibility tests
app://deploy               - Deploy to sandbox with compliance checks
```

### FHIR Knowledge Tools
```
fhir://resource/explain    - Explain resource purpose and relationships
fhir://resource/create     - Generate FHIR resource with profile conformance
fhir://resource/validate   - Validate against US Core / custom profiles
fhir://resource/transform  - Map between HL7v2, CDA, FHIR
fhir://search/build        - Build SearchParameter queries with explanation
fhir://quirks/[ehr]        - Get EHR-specific workarounds (Epic, Cerner, etc.)
```

### CDS Hooks Tools
```
cds://hook/patient-view    - Generate patient chart cards
cds://hook/order-select    - Drug interaction/duplicate alerts
cds://hook/order-sign      - Prior auth / coverage checks
cds://hook/encounter-start - Care gap reminders
cds://hook/test            - Test hooks against sandbox EHR
```

### SMART on FHIR Tools
```
smart://launch/[ehr]       - Generate launch flow for specific EHR
smart://scope/configure    - Configure minimal required scopes
smart://context/handle     - Handle launch context (patient, encounter, user)
smart://register/[ehr]     - Generate EHR app registration documentation
```

### Compliance Tools
```
compliance://fda/classify  - FDA SaMD classification assessment
compliance://hipaa/assess  - HIPAA compliance checklist
compliance://state/[state] - State-specific requirements
compliance://reimbursement - CPT code eligibility assessment
compliance://accessibility - WCAG 2.1 AA audit
```

### Knowledge Tools
```
knowledge://jira           - Search HL7 specification issues
knowledge://zulip          - Search community discussions
knowledge://ig/[name]      - Query specific Implementation Guide
knowledge://compare        - Compare approaches with pros/cons
```

---

## Implementation Phases (Revised)

### Phase 0: Foundation (Weeks 1-2)

**Objective**: Core infrastructure for patient safety and compliance

- [ ] Patient consent framework (granular, revocable)
- [ ] Accessibility baseline (WCAG 2.1 AA components)
- [ ] Regulatory classification system
- [ ] PHI-safe local development environment (Docker)
- [ ] End-to-end encryption for all patient data paths

### Phase 1: Developer Experience (Weeks 3-6)

**Objective**: Learn-while-building for new FHIR developers

- [ ] Learning Agent with step-by-step explanations
- [ ] Debugging Agent with EHR quirks database
- [ ] Local development CLI (`npx openclaw init/dev`)
- [ ] FHIR validation and testing tools
- [ ] fhir-community-search integration
- [ ] Basic `app://scaffold` MCP tool
- [ ] Medplum sandbox deployment

### Phase 2: Clinical Integration (Weeks 7-10)

**Objective**: CDS Hooks and workflow-first design

- [ ] CDS Hooks generation tools
- [ ] In-EHR card/alert templates
- [ ] 30-second clinician feedback capture
- [ ] Auto-captured usage metrics
- [ ] SMART on FHIR launch generators (Epic, Cerner)
- [ ] Clinical safety documentation generator

### Phase 3: Patient & Community (Weeks 11-14)

**Objective**: Patient-centered features and trust signals

- [ ] Patient consent management UI
- [ ] Patient data rights (download, delete, revoke)
- [ ] Patient reviews on marketplace
- [ ] Accessibility compliance scanning
- [ ] Multi-language support (top 5 patient languages)
- [ ] Privacy/security certification badges
- [ ] Community contribution tracking

### Phase 4: Investment Readiness (Weeks 15-18)

**Objective**: Metrics and tools for fundable apps

- [ ] Business model templates
- [ ] Market validation metrics (beyond vanity)
- [ ] Investor thesis matching
- [ ] Warm intro facilitation
- [ ] Comparable exits database
- [ ] Reimbursement eligibility tracking
- [ ] Due diligence document generation

---

## Validation Plan

Before building each phase, validate with real users:

### Phase 0-1 Validation
| Stakeholder | Question | Target |
|-------------|----------|--------|
| 5 new FHIR developers | "Would this help you learn FHIR?" | 4/5 yes |
| 3 experienced developers | "Would you use Build mode for production apps?" | 2/3 yes |

### Phase 2 Validation
| Stakeholder | Question | Target |
|-------------|----------|--------|
| 5 clinicians | "Would you use CDS Hooks over standalone apps?" | 4/5 yes |
| 3 CMIO/clinical informatics | "Does 30-sec feedback capture work in your workflow?" | 2/3 yes |

### Phase 3 Validation
| Stakeholder | Question | Target |
|-------------|----------|--------|
| 5 patients | "Would you trust an app with this consent flow?" | 4/5 yes |
| 3 patient advocates | "Does this respect patient data rights?" | 3/3 yes |

### Phase 4 Validation
| Stakeholder | Question | Target |
|-------------|----------|--------|
| 3 healthcare VCs | "Would you use this for deal sourcing?" | 2/3 interested |
| 3 founders | "Would you share metrics here for investor discovery?" | 2/3 yes |

---

## Success Metrics (Revised)

### Developer Success
- Time from zero to understanding first FHIR app: <2 hours (Learn mode)
- Time from idea to working sandbox: <30 minutes (Build mode)
- FHIR validation errors explained and fixed: >90%
- Apps that pass US Core conformance: >95%

### Clinical Success
- CDS Hooks deployed to production EHRs: 10+ in year 1
- Clinician feedback response rate: >20%
- Alert-to-action rate: >30%
- "Alert fatigue" complaints: <10%

### Patient Success
- Patients who complete consent flow: >80%
- Patients who understand what data is shared: >70% (tested via quiz)
- WCAG 2.1 AA compliance: 100% of generated apps
- Patient NPS for generated apps: >40

### Investment Success
- Apps with complete business model: >50%
- Apps with regulatory classification: 100%
- Investor-founder intros facilitated: 50+ in year 1
- Apps that receive funding: 5+ in year 1

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| AI generates unsafe clinical code | Mandatory compliance scan before deploy; clinical review for CDS |
| Patients don't understand consent | User testing; plain language; show-don't-tell data previews |
| Clinicians ignore feedback requests | Auto-capture metrics; make feedback optional but visible |
| Investors see vanity metrics | Require validation signals (LOIs, pilots) for "investment ready" badge |
| FDA considers platform a medical device | Clear disclaimers; generated apps are developer responsibility |
| EHR vendors block integrations | Early partnership discussions; open standard compliance |

---

## References

- [OpenClaw](https://github.com/openclaw/openclaw) - Multi-channel AI assistant platform
- [fhir-community-search](https://github.com/jmandel/fhir-community-search) - FHIR knowledge base search
- [health-skillz](https://github.com/jmandel/health-skillz) - SMART on FHIR Claude Skill
- [Medplum](https://www.medplum.com/) - Open source healthcare platform
- [SMART on FHIR](https://docs.smarthealthit.org/) - Healthcare app authorization
- [CDS Hooks](https://cds-hooks.org/) - Clinical decision support standard
- [US Core IG](https://hl7.org/fhir/us/core/) - US Core Implementation Guide
- [FDA Digital Health](https://www.fda.gov/medical-devices/digital-health-center-excellence) - FDA digital health guidance
