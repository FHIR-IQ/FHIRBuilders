// Healthcare AI Builders Wiki — graph schema + seed data.
//
// Inspired by Karpathy's LLM-wiki concept (gist 442a6bf555914893e9891c11519de94f):
// an index-of-topics + chronological log, intentionally co-built with an LLM
// agent over time. Cross-references are first-class. Each topic has a status
// (seed / draft / stable) so readers know what's tested vs. what's a stub.
//
// To extend: append nodes/edges below, and add a WikiLogEntry capturing what
// changed and why. Future renderers can build an interactive graph from this
// without touching markdown.

export type WikiCategory =
  | "fhir-core"
  | "fhir-ig"
  | "terminology"
  | "data-quality"
  | "regulation"
  | "ai-healthcare"
  | "cms-initiative"
  | "community";

export type WikiStatus = "seed" | "draft" | "stable";

export type WikiNode = {
  slug: string;
  title: string;
  category: WikiCategory;
  /** 1–2 line summary shown on index cards. */
  summary: string;
  /** Markdown body. Empty = pure stub; the topic exists in the graph but text TBD. */
  body?: string;
  /** External authoritative links (HL7 spec, CMS docs, GitHub repo, etc.). */
  externalLinks?: Array<{ label: string; href: string }>;
  /** Other node slugs this topic depends on / extends / sees-also. */
  related?: string[];
  /** Source(s) the content came from for credit + future re-verification. */
  source?: string;
  /** ISO date of last meaningful review. Helps surface stale content. */
  lastReviewed?: string;
  status: WikiStatus;
};

export type WikiEdgeKind =
  | "depends-on"     // A requires B (US Core depends-on FHIR R4)
  | "extends"        // A profiles/specializes B (DaVinci PAS extends US Core)
  | "see-also"       // related / often confused
  | "alternative"    // pick one or the other
  | "produces"       // A generates B (CQL produces quality measures)
  | "discusses";     // community node discusses this topic

export type WikiEdge = {
  from: string;  // slug
  to: string;    // slug
  kind: WikiEdgeKind;
  /** Short why-this-edge note. */
  note?: string;
};

export type WikiLogEntry = {
  date: string;          // ISO date
  summary: string;       // one line
  changes: string[];     // node slugs added/edited
  by: string;            // human or "Claude" or "Claude + Eugene"
};

export type WikiGraph = {
  version: string;
  /** When the graph itself was last touched. */
  updatedAt: string;
  nodes: WikiNode[];
  edges: WikiEdge[];
  log: WikiLogEntry[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Seed graph — Healthcare AI Builders v0.1
// ─────────────────────────────────────────────────────────────────────────────

const NODES: WikiNode[] = [
  // ═══════════════════════════════════ FHIR CORE ═══════════════════════════════════
  {
    slug: "fhir-overview",
    title: "FHIR — Fast Healthcare Interoperability Resources",
    category: "fhir-core",
    status: "stable",
    summary:
      "HL7's modern interoperability standard. Resource-based, REST-first, JSON-default. The default substrate for almost every healthcare AI app that touches real clinical data.",
    body: `FHIR (pronounced "fire") is the way healthcare apps in 2026 read and write clinical data. It defines ~150 *resources* (Patient, Observation, Encounter, MedicationRequest, Condition, etc.) and a RESTful API over them.

Why builders care:
- It's the only standard with widespread adoption from EHRs (Epic, Cerner/Oracle, athenahealth, Meditech), payers (CMS Blue Button, CARIN), and aggregators (Particle, Health Gorilla, Datavant, Innovaccer).
- The 21st Century Cures Act + ONC Information Blocking rule mandates patient-app access via FHIR for US providers and payers.
- JSON-default means your LLM can read and write it without exotic parsing.

Pick R4 unless you have a reason not to.`,
    externalLinks: [
      { label: "HL7 FHIR R4 spec", href: "https://hl7.org/fhir/R4/" },
      { label: "FHIR overview", href: "https://hl7.org/fhir/overview.html" },
    ],
    related: ["fhir-versions", "fhir-rest-api", "smart-on-fhir"],
    source: "HL7",
    lastReviewed: "2026-06-05",
  },
  {
    slug: "fhir-versions",
    title: "FHIR Versions — R4, R4B, R5, R6",
    category: "fhir-core",
    status: "stable",
    summary:
      "R4 is the production standard most US implementers use. R5 ships profile-level breaking changes. R6 (2026+) is starting to land in early implementations.",
    body: `**R4** (2019) is the version US Core 6+, Blue Button 2.0, DaVinci IGs, and most production EHR endpoints target. Default to R4 unless your stakeholder specifically asks for R5.

**R4B** (2022) is a maintenance update — wire-compatible with R4 for most apps. Backports the SubscriptionTopic resource.

**R5** (2023) introduces structural changes — different MedicationRequest model, restructured Reference handling, new resources. Adoption is patchy as of 2026.

**R6** (in ballot 2026) is being driven by US ONC, CMS, and the FHIR-at-Scale Taskforce (FAST). Watch for early implementations in late 2026.

Implementation tip: design your code with a thin FHIR-version adapter layer (e.g., \`getPatientName(patient: Patient): string\`) so you can swap versions without rewriting your app.`,
    externalLinks: [
      { label: "FHIR R4 (use this)", href: "https://hl7.org/fhir/R4/" },
      { label: "FHIR R5", href: "https://hl7.org/fhir/R5/" },
    ],
    related: ["fhir-overview"],
  },
  {
    slug: "fhir-rest-api",
    title: "FHIR REST API",
    category: "fhir-core",
    status: "draft",
    summary:
      "GET / POST / PUT / DELETE against /[Resource]/[id]. Search via /[Resource]?param=value. Bundles for atomic batches/transactions. Capability statement at /metadata.",
    body: `Every FHIR server exposes the same surface:

\`\`\`
GET    /Patient/123                 read
POST   /Patient                     create
PUT    /Patient/123                 update (replace)
PATCH  /Patient/123                 partial update
DELETE /Patient/123                 delete
GET    /Patient?name=Smith&_count=10   search
POST   /                            transaction bundle
GET    /metadata                    capability statement
\`\`\`

For agentic builders, the bundle pattern is gold: assemble multiple resource creates/updates with cross-references using \`urn:uuid:...\` and send as one transaction.

Pagination: response Bundles include \`link\` entries with \`relation: "next"\`. Always follow until empty.

Auth: in production almost always SMART-on-FHIR OAuth 2.0. Synthea / Medplum sandboxes are open for dev.`,
    externalLinks: [
      { label: "FHIR HTTP interactions", href: "https://hl7.org/fhir/R4/http.html" },
      { label: "Search params", href: "https://hl7.org/fhir/R4/search.html" },
    ],
    related: ["fhir-overview", "smart-on-fhir", "bulk-data", "medplum"],
  },
  {
    slug: "fhir-profiles",
    title: "Profiles + Extensions",
    category: "fhir-core",
    status: "draft",
    summary:
      "Profiles narrow base FHIR resources for a specific use case. Extensions add fields the base spec doesn't have. Implementation Guides bundle profiles + value sets + examples.",
    body: `A *profile* is a StructureDefinition that constrains a base FHIR resource: which fields are required, which value sets they bind to, what extensions are allowed.

An *extension* adds a typed field outside the base spec. Identified by URL.

An *Implementation Guide (IG)* is a bundle of profiles + value sets + capability statements + examples for a specific use case (US Core, DaVinci PAS, mCODE, etc.).

Validation: use \`$validate\` operation on a profile-supporting server or run [HL7 Validator](https://github.com/hapifhir/org.hl7.fhir.core) locally.`,
    externalLinks: [
      { label: "Profiling overview", href: "https://hl7.org/fhir/R4/profiling.html" },
    ],
    related: ["us-core", "fhirspective", "fhir-validation"],
  },
  {
    slug: "smart-on-fhir",
    title: "SMART on FHIR",
    category: "fhir-core",
    status: "stable",
    summary:
      "OAuth 2.0 + OpenID Connect profile for FHIR apps. Defines launch flows (standalone, EHR-embedded), scopes (patient/*.read, user/*.write), and the capability statement extensions.",
    body: `SMART on FHIR is how a patient-facing or clinician-facing app gets a per-user access token to an EHR's FHIR API without seeing the user's password.

Two launch modes:
1. **Standalone launch** — your app lives at its own URL; user signs in via the EHR's OAuth.
2. **EHR launch** — your app is embedded in the EHR (Epic AppMarket, Cerner Code, etc.) and gets a launch token.

Scope syntax: \`patient/Observation.read\`, \`user/MedicationRequest.write\`, \`launch/patient\`, \`offline_access\`.

For Cohort 00 builders: Medplum's sandbox supports SMART out of the box. For real EHRs, register at Epic's [fhir.epic.com](https://fhir.epic.com) or Cerner's Code Console.`,
    externalLinks: [
      { label: "SMART App Launch spec", href: "https://hl7.org/fhir/smart-app-launch/" },
      { label: "Epic FHIR docs", href: "https://fhir.epic.com" },
    ],
    related: ["fhir-rest-api", "smart-app-gallery"],
  },
  {
    slug: "bulk-data",
    title: "Bulk Data — FHIR Async Export",
    category: "fhir-core",
    status: "draft",
    summary:
      "FHIR's $export operation for population-level data. NDJSON output, signed URLs, asynchronous. The backbone of payer / provider bulk handoffs and CMS-mandated APIs.",
    body: `Designed for "give me all of this group's Observations from the last year as files." Returns links to NDJSON files in object storage.

\`\`\`
POST /Group/123/$export?_type=Patient,Observation
→ 202 + Content-Location header pointing at status URL
GET <status_url>
→ 202 (in progress) or 200 with NDJSON file URLs
\`\`\`

Used by:
- CMS Blue Button 2.0 (Medicare claims at population scale)
- Payer-to-payer data exchange (DaVinci PDex)
- Analytics handoffs to data warehouses (often paired with SQL-on-FHIR)`,
    externalLinks: [
      { label: "Bulk Data IG", href: "https://hl7.org/fhir/uv/bulkdata/" },
    ],
    related: ["fhir-rest-api", "sql-on-fhir", "carin-blue-button"],
  },

  // ═══════════════════════════════════ FHIR IGs ═══════════════════════════════════
  {
    slug: "us-core",
    title: "US Core",
    category: "fhir-ig",
    status: "stable",
    summary:
      "Minimum FHIR profile set ONC requires US-certified EHRs to expose. The baseline every US healthcare app should design against.",
    body: `US Core defines profiles for the FHIR resources that US-certified EHRs must expose: Patient, AllergyIntolerance, CarePlan, Condition, Coverage, DocumentReference, Encounter, Goal, Immunization, Location, Medication, MedicationRequest, Observation (Lab/Vital), Organization, Practitioner, Procedure, etc.

Current version (mid-2026): **US Core 7.0.0** on FHIR R4. Each US Core release ratchets up required fields + must-support markers.

If your app ingests EHR data, code against US Core profiles — that's what Epic, Cerner, athenahealth, etc. publish.`,
    externalLinks: [
      { label: "US Core IG", href: "https://hl7.org/fhir/us/core/" },
      { label: "ONC USCDI", href: "https://www.healthit.gov/isa/united-states-core-data-interoperability-uscdi" },
    ],
    related: ["fhir-profiles", "fhir-versions", "onc-certification"],
  },
  {
    slug: "blue-button-2",
    title: "Blue Button 2.0 (CMS)",
    category: "fhir-ig",
    status: "stable",
    summary:
      "CMS's FHIR API exposing Medicare claims data to ~60M beneficiaries via patient-authorized apps. The reference implementation for patient-mediated claims exchange.",
    body: `Run by CMS at [bluebutton.cms.gov](https://bluebutton.cms.gov). Patients authorize an app via Medicare.gov login; app gets FHIR access to:
- ExplanationOfBenefit (claims)
- Patient
- Coverage

Built on the CARIN Blue Button IG profile set.

Status note: CMS announced plans in 2025 to rebrand and modernize Blue Button as part of the broader Interoperability Roadmap. Builders should track CMS announcements on rebranding/deprecation timelines.`,
    externalLinks: [
      { label: "Blue Button 2.0 docs", href: "https://bluebutton.cms.gov" },
      { label: "Sandbox", href: "https://sandbox.bluebutton.cms.gov" },
    ],
    related: ["carin-blue-button", "cms-9115", "cms-blue-button-rebrand"],
  },
  {
    slug: "carin-blue-button",
    title: "CARIN Blue Button IG",
    category: "fhir-ig",
    status: "draft",
    summary:
      "Profile set for consumer-directed payer claims data. The blueprint payers must implement under CMS Interoperability Rule for member-app access to claims.",
    related: ["blue-button-2", "cms-9115"],
    externalLinks: [
      { label: "CARIN Blue Button IG", href: "https://hl7.org/fhir/us/carin-bb/" },
    ],
  },
  {
    slug: "davinci-pdex",
    title: "DaVinci PDex — Payer Data Exchange",
    category: "fhir-ig",
    status: "draft",
    summary:
      "Payer-to-payer FHIR exchange of member clinical + claims history at plan change. Required by CMS-9115 for participating payers.",
    related: ["cms-9115", "davinci-hrex", "blue-button-2"],
    externalLinks: [
      { label: "DaVinci PDex IG", href: "https://hl7.org/fhir/us/davinci-pdex/" },
    ],
  },
  {
    slug: "davinci-dtr",
    title: "DaVinci DTR — Documentation Templates and Rules",
    category: "fhir-ig",
    status: "draft",
    summary:
      "Embeds payer documentation rules into the provider workflow at point-of-order. The 'fill out the prior auth form using the EHR data you already have' pattern.",
    body: `DTR pairs with CRD (Coverage Requirements Discovery) and PAS (Prior Auth Support). The flow:

1. CRD: provider system asks payer "does this order need authorization?"
2. DTR: payer returns CQL-driven Questionnaire — DTR app prefills using FHIR data
3. PAS: completed bundle sent for auth decision

Why builders care: it's where CQL meets FHIR meets payer-side automation. The Cohort 00 prior-auth pod will live here.`,
    externalLinks: [
      { label: "DaVinci DTR IG", href: "https://hl7.org/fhir/us/davinci-dtr/" },
    ],
    related: ["davinci-crd", "davinci-pas", "cql", "prior-auth-cms-0057"],
  },
  {
    slug: "davinci-crd",
    title: "DaVinci CRD — Coverage Requirements Discovery",
    category: "fhir-ig",
    status: "seed",
    summary: "CDS Hooks pattern that asks the payer 'is this order covered, and what documentation is needed?' at the moment of ordering.",
    related: ["davinci-dtr", "davinci-pas"],
    externalLinks: [{ label: "DaVinci CRD IG", href: "https://hl7.org/fhir/us/davinci-crd/" }],
  },
  {
    slug: "davinci-pas",
    title: "DaVinci PAS — Prior Authorization Support",
    category: "fhir-ig",
    status: "draft",
    summary: "FHIR-native prior auth submission. Required for some payer scenarios under CMS-0057 ePA Final Rule.",
    related: ["davinci-dtr", "davinci-crd", "prior-auth-cms-0057"],
    externalLinks: [{ label: "DaVinci PAS IG", href: "https://hl7.org/fhir/us/davinci-pas/" }],
  },
  {
    slug: "davinci-hrex",
    title: "DaVinci HRex — Health Record Exchange",
    category: "fhir-ig",
    status: "seed",
    summary: "Foundation for payer/provider FHIR exchanges. Defines $member-match and the operations that PDex, CDex, etc. build on.",
    related: ["davinci-pdex", "davinci-cdex"],
    externalLinks: [{ label: "DaVinci HRex IG", href: "https://hl7.org/fhir/us/davinci-hrex/" }],
  },
  {
    slug: "davinci-cdex",
    title: "DaVinci CDex — Clinical Data Exchange",
    category: "fhir-ig",
    status: "seed",
    summary: "Provider-to-payer clinical attachments via FHIR (Task + DocumentReference). Replaces faxing chart notes for claims attachments.",
    related: ["davinci-pdex", "davinci-pas"],
    externalLinks: [{ label: "DaVinci CDex IG", href: "https://hl7.org/fhir/us/davinci-cdex/" }],
  },
  {
    slug: "sdoh-clinical-care",
    title: "SDOH Clinical Care IG",
    category: "fhir-ig",
    status: "draft",
    summary:
      "Profile set for social determinants of health — screening, observation, intervention, referral. The substrate for FHIR-native depression / SDoH workflows (a Cohort 00 theme).",
    related: ["us-core", "questionnaire-sdc"],
    externalLinks: [
      { label: "SDOH-CC IG", href: "https://hl7.org/fhir/us/sdoh-clinicalcare/" },
    ],
  },
  {
    slug: "mcode",
    title: "mCODE — Minimal Common Oncology Data Elements",
    category: "fhir-ig",
    status: "seed",
    summary: "Standard FHIR profiles for cancer care — diagnosis, staging, treatment, outcomes. The substrate for oncology AI work.",
    externalLinks: [{ label: "mCODE IG", href: "https://hl7.org/fhir/us/mcode/" }],
  },
  {
    slug: "questionnaire-sdc",
    title: "Structured Data Capture (SDC)",
    category: "fhir-ig",
    status: "draft",
    summary:
      "FHIR profile for forms: Questionnaire + QuestionnaireResponse with prepopulation from FHIR data + extraction back to discrete resources. The pattern behind every FHIR-native intake form.",
    related: ["davinci-dtr", "sdoh-clinical-care"],
    externalLinks: [{ label: "SDC IG", href: "https://hl7.org/fhir/uv/sdc/" }],
  },
  {
    slug: "smart-app-gallery",
    title: "SMART App Gallery",
    category: "fhir-ig",
    status: "seed",
    summary: "Public catalog of SMART-on-FHIR apps. Once your Cohort 00 build is SMART-launched + reviewed, list here for health-system discovery.",
    related: ["smart-on-fhir"],
    externalLinks: [{ label: "SMART App Gallery", href: "https://gallery.smarthealthit.org" }],
  },

  // ═══════════════════════════════════ TERMINOLOGY ═══════════════════════════════════
  {
    slug: "snomed-ct",
    title: "SNOMED CT",
    category: "terminology",
    status: "stable",
    summary:
      "Clinical terminology used for conditions, procedures, body sites, findings. ~360K active concepts. The US edition is free-to-use; international edition requires SNOMED International license.",
    body: `SNOMED CT codes look like \`38341003\` (Hypertensive disorder). Used in:
- Condition.code
- Observation.code (sometimes; LOINC more common for labs/vitals)
- ProcedureRequest.code
- AllergyIntolerance.code

Use a terminology service for $lookup, $expand, $validate.

US National Library of Medicine distributes the US edition free at [terminology.nlm.nih.gov](https://www.nlm.nih.gov/healthit/snomedct/).`,
    externalLinks: [
      { label: "NLM SNOMED CT", href: "https://www.nlm.nih.gov/healthit/snomedct/" },
      { label: "SNOMED Browser", href: "https://browser.ihtsdotools.org/" },
    ],
    related: ["icd-10-cm", "loinc", "terminology-services"],
  },
  {
    slug: "loinc",
    title: "LOINC",
    category: "terminology",
    status: "stable",
    summary:
      "Universal codes for labs, vitals, clinical observations, and surveys. Free, maintained by Regenstrief.",
    body: `LOINC codes look like \`8480-6\` (Systolic BP) or \`72514-3\` (PHQ-9 total).

Used heavily in:
- Observation.code (the dominant use case)
- DiagnosticReport.code
- Questionnaire.item.code (for standardized assessments like PHQ-9, AUDIT, etc.)

Pair with UCUM for units (\`mm[Hg]\`, \`mg/dL\`).`,
    externalLinks: [
      { label: "LOINC site", href: "https://loinc.org" },
      { label: "Browser", href: "https://loinc.org/search/" },
    ],
    related: ["snomed-ct", "ucum", "questionnaire-sdc"],
  },
  {
    slug: "rxnorm",
    title: "RxNorm",
    category: "terminology",
    status: "stable",
    summary:
      "US medication terminology — normalizes drug names across NDC, brand, generic. Used in MedicationRequest.medicationCodeableConcept.",
    externalLinks: [{ label: "RxNorm", href: "https://www.nlm.nih.gov/research/umls/rxnorm/" }],
    related: ["icd-10-cm"],
  },
  {
    slug: "icd-10-cm",
    title: "ICD-10-CM",
    category: "terminology",
    status: "stable",
    summary:
      "US clinical diagnosis codes used for billing + claims. Often paired with SNOMED in Condition.code (claims-aligned use cases).",
    externalLinks: [{ label: "CMS ICD-10", href: "https://www.cms.gov/medicare/coding-billing/icd-10-codes" }],
    related: ["snomed-ct", "cpt"],
  },
  {
    slug: "cpt",
    title: "CPT — Current Procedural Terminology",
    category: "terminology",
    status: "stable",
    summary: "AMA-owned procedure codes used for billing. Required for claims + many quality measures.",
    externalLinks: [{ label: "AMA CPT", href: "https://www.ama-assn.org/practice-management/cpt" }],
    related: ["icd-10-cm", "hcpcs"],
  },
  {
    slug: "hcpcs",
    title: "HCPCS",
    category: "terminology",
    status: "seed",
    summary: "Healthcare Common Procedure Coding System — supplements CPT for Medicare/Medicaid (durable equipment, ambulance, etc.).",
    related: ["cpt"],
  },
  {
    slug: "ucum",
    title: "UCUM — Units of Measure",
    category: "terminology",
    status: "stable",
    summary:
      "Code system for units. \`mm[Hg]\`, \`mg/dL\`, \`L/min\`. Used with LOINC in Observation.valueQuantity.unit.",
    externalLinks: [{ label: "UCUM", href: "https://ucum.org/" }],
    related: ["loinc"],
  },
  {
    slug: "terminology-services",
    title: "Terminology Services",
    category: "terminology",
    status: "draft",
    summary:
      "$lookup / $expand / $validate operations against ValueSets and CodeSystems. Run your own or use SNOMED Snowstorm, NLM VSAC, Ontoserver, Aidbox terminology.",
    related: ["snomed-ct", "loinc"],
    externalLinks: [
      { label: "FHIR Terminology Module", href: "https://hl7.org/fhir/R4/terminology-module.html" },
      { label: "NLM VSAC", href: "https://vsac.nlm.nih.gov/" },
    ],
  },

  // ═══════════════════════════════════ DATA QUALITY ═══════════════════════════════════
  {
    slug: "fhir-validation",
    title: "FHIR Validation",
    category: "data-quality",
    status: "draft",
    summary:
      "Server $validate, HL7 Validator CLI, or in-app validation against profiles. Required before claiming conformance with US Core, DaVinci, etc.",
    related: ["fhir-profiles", "fhirspective"],
    externalLinks: [
      { label: "HL7 Validator (jar)", href: "https://github.com/hapifhir/org.hl7.fhir.core" },
      { label: "Inferno", href: "https://inferno.healthit.gov" },
    ],
  },
  {
    slug: "fhirspective",
    title: "FHIRspective — Data Quality Analyzer",
    category: "data-quality",
    status: "stable",
    summary:
      "Eugene's open data-quality analyzer for FHIR bundles. Surfaces conformance issues, profile mismatches, terminology binding gaps.",
    related: ["fhir-validation", "fhir-iq"],
    externalLinks: [
      { label: "FHIRspective", href: "https://fhirspective.vercel.app" },
    ],
    source: "FHIR IQ",
  },
  {
    slug: "cql",
    title: "CQL — Clinical Quality Language",
    category: "data-quality",
    status: "draft",
    summary:
      "Author-once quality-measure logic that runs against FHIR data. The substrate for HEDIS, eCQMs, DTR rules.",
    body: `CQL looks like SQL but for clinical logic:

\`\`\`
define "HasDiabetes":
  exists ([Condition: "Diabetes mellitus"])

define "InMeasurePopulation":
  AgeInYearsAt(start of "Measurement Period") >= 18
  and "HasDiabetes"
\`\`\`

Runs on a CQL engine (Java reference impl, JavaScript via [cql-execution](https://github.com/cqframework/cql-execution), or compiled to SQL — see SQL-on-FHIR).

Used by:
- CMS digital quality measures (eCQMs)
- HEDIS measures
- DaVinci DTR rules
- Clinical decision support`,
    externalLinks: [
      { label: "CQL spec", href: "https://cql.hl7.org/" },
      { label: "Eugene's CQL→SQL talk", href: "https://fhiriq.com/cql-to-sql" },
    ],
    related: ["sql-on-fhir", "digital-quality-measures", "davinci-dtr"],
  },
  {
    slug: "sql-on-fhir",
    title: "SQL on FHIR",
    category: "data-quality",
    status: "draft",
    summary:
      "Map FHIR resources to flat columnar tables via ViewDefinition. Run measures + analytics with normal SQL instead of CQL engines.",
    body: `Defines a "view definition" — a portable spec that says "from each Patient resource, extract these columns into a flat table." The data engineer's escape hatch from FHIR's nested JSON.

Backed by Google, Microsoft, Smile, several payers. Adopted by the HL7 SQL on FHIR sub-group.

Eugene's ViewDefinition Builder + Cohort 00 work intersects here.`,
    externalLinks: [
      { label: "SQL on FHIR spec", href: "https://sql-on-fhir.org" },
      { label: "ViewDefinition Builder", href: "https://fhir-viewdefinition-builder.vercel.app" },
    ],
    related: ["cql", "viewdefinition"],
  },
  {
    slug: "viewdefinition",
    title: "FHIR ViewDefinition",
    category: "data-quality",
    status: "draft",
    summary:
      "Portable spec mapping FHIR resources to flat columns. The contract layer in SQL-on-FHIR. Eugene maintains a public builder + library.",
    related: ["sql-on-fhir"],
    externalLinks: [
      { label: "ViewDefinition Library", href: "https://fhir-viewdefinition-builder.vercel.app" },
    ],
  },
  {
    slug: "digital-quality-measures",
    title: "Digital Quality Measures (dQMs)",
    category: "data-quality",
    status: "draft",
    summary:
      "CMS's term for FHIR + CQL-based quality measures (replacing HQMF + QRDA). The future of MIPS, HEDIS, etc.",
    related: ["cql", "sql-on-fhir"],
    externalLinks: [
      { label: "CMS dQM Strategic Roadmap", href: "https://ecqi.healthit.gov/dqms" },
    ],
  },

  // ═══════════════════════════════════ REGULATION ═══════════════════════════════════
  {
    slug: "hipaa",
    title: "HIPAA",
    category: "regulation",
    status: "stable",
    summary:
      "US Privacy + Security Rules for Protected Health Information. Compliance is a deployment concern, not a code concern — but you must understand BA obligations before going to prod.",
    body: `Two rules every builder must know:

- **Privacy Rule** — what counts as PHI, who can access it (covered entities + business associates), patient rights.
- **Security Rule** — administrative, physical, technical safeguards (encryption at rest + in transit, audit logging, access controls).

For builders:
- Synthetic / Synthea data is **not** PHI → safe for dev + demos
- Real patient data → covered + you need a Business Associate Agreement (BAA) with anyone handling it (cloud provider, AI vendor)
- Anthropic offers a BAA for enterprise customers — talk to your account team

Reference: HHS [HIPAA for Professionals](https://www.hhs.gov/hipaa/for-professionals/index.html).`,
    externalLinks: [
      { label: "HHS HIPAA", href: "https://www.hhs.gov/hipaa/for-professionals/index.html" },
    ],
    related: ["info-blocking", "onc-certification"],
  },
  {
    slug: "21st-century-cures-act",
    title: "21st Century Cures Act",
    category: "regulation",
    status: "stable",
    summary:
      "Landmark 2016 law. Authorized ONC's Information Blocking rule + the API certification criteria (US Core + Bulk Data) every certified EHR must expose.",
    related: ["info-blocking", "onc-certification", "us-core"],
    externalLinks: [
      { label: "ONC Cures Act overview", href: "https://www.healthit.gov/topic/oncs-cures-act-final-rule" },
    ],
  },
  {
    slug: "info-blocking",
    title: "Information Blocking Rule",
    category: "regulation",
    status: "stable",
    summary:
      "ONC's rule prohibiting healthcare actors (providers, EHRs, HIEs) from blocking electronic health information exchange. Enforcement live since 2024.",
    related: ["21st-century-cures-act", "onc-certification"],
    externalLinks: [
      { label: "ONC Info Blocking", href: "https://www.healthit.gov/topic/information-blocking" },
    ],
  },
  {
    slug: "onc-certification",
    title: "ONC Certification (HTI-1/2)",
    category: "regulation",
    status: "draft",
    summary:
      "ONC's certification framework for EHRs. HTI-1 (2023) brought US Core 3.1.1+, decision support transparency. HTI-2 (2025+) adds Bulk FHIR, patient app endpoints, AI transparency requirements.",
    related: ["us-core", "21st-century-cures-act"],
    externalLinks: [
      { label: "ONC HTI-2", href: "https://www.healthit.gov/topic/hti-2" },
    ],
  },
  {
    slug: "cms-9115",
    title: "CMS-9115-F — Interoperability and Patient Access",
    category: "regulation",
    status: "stable",
    summary:
      "CMS final rule requiring payers (Medicare Advantage, Medicaid, CHIP, QHPs) to expose patient + provider + payer-to-payer FHIR APIs. The reason CARIN Blue Button and DaVinci PDex exist.",
    related: ["carin-blue-button", "davinci-pdex", "blue-button-2"],
    externalLinks: [
      { label: "CMS-9115 fact sheet", href: "https://www.cms.gov/newsroom/fact-sheets/interoperability-and-patient-access-fact-sheet" },
    ],
  },
  {
    slug: "prior-auth-cms-0057",
    title: "CMS-0057-F — Prior Authorization API",
    category: "regulation",
    status: "draft",
    summary:
      "2024 CMS rule requiring payers to expose FHIR-based prior auth APIs (CRD, DTR, PAS) and disclose PA metrics. Phased compliance through 2027.",
    related: ["davinci-crd", "davinci-dtr", "davinci-pas"],
    externalLinks: [
      { label: "CMS-0057 final rule", href: "https://www.federalregister.gov/documents/2024/02/08/2024-00895" },
    ],
  },
  {
    slug: "tefca",
    title: "TEFCA",
    category: "regulation",
    status: "draft",
    summary:
      "Trusted Exchange Framework and Common Agreement. The federal network-of-networks for health data exchange. QHINs are the on-ramps; treaty-level rules govern data flow between them.",
    related: ["qhin"],
    externalLinks: [
      { label: "TEFCA / RCE", href: "https://rce.sequoiaproject.org/" },
    ],
  },
  {
    slug: "qhin",
    title: "QHIN — Qualified Health Information Network",
    category: "regulation",
    status: "seed",
    summary: "On-ramp networks to TEFCA. eHealth Exchange, CommonWell, Epic Nexus, Carequality, Health Gorilla, KONZA, MedAllies are designated QHINs.",
    related: ["tefca"],
  },

  // ═══════════════════════════════════ AI · HEALTHCARE ═══════════════════════════════════
  {
    slug: "llms-in-healthcare",
    title: "LLMs in Healthcare",
    category: "ai-healthcare",
    status: "draft",
    summary:
      "Patterns where LLMs help: clinical scribes, prior auth automation, patient intake, terminology mapping, quality measure narration. Patterns where they don't: deterministic clinical decisions, autonomous prescribing.",
    related: ["agent-loops-fhir", "claude-code-fhir", "prompt-injection-clinical"],
  },
  {
    slug: "agent-loops-fhir",
    title: "Agent Loops over FHIR",
    category: "ai-healthcare",
    status: "draft",
    summary:
      "Tool-using LLM agents reading/writing FHIR via REST. Loop pattern: read context → reason → call FHIR tool → observe → repeat. Where Claude Code + MCP fits.",
    related: ["mcp-for-healthcare", "claude-code-fhir"],
  },
  {
    slug: "mcp-for-healthcare",
    title: "MCP — Model Context Protocol for Healthcare",
    category: "ai-healthcare",
    status: "draft",
    summary:
      "Anthropic's open protocol for connecting LLM agents to external tools/data. Natural fit for FHIR: one MCP server exposes Patient.read, Observation.search, etc. Eugene's HealthClaw + Cohort 00 build on this.",
    related: ["agent-loops-fhir", "healthclaw", "claude-code-fhir"],
    externalLinks: [
      { label: "MCP spec", href: "https://modelcontextprotocol.io" },
      { label: "MCP servers registry", href: "https://github.com/modelcontextprotocol/servers" },
    ],
  },
  {
    slug: "healthclaw",
    title: "HealthClaw + HealthClaw Guardrails",
    category: "ai-healthcare",
    status: "draft",
    summary:
      "Open security layer between AI agents and clinical data. PHI redaction, MCP tool gating, FHIR R4/R6 support. Eugene's project.",
    related: ["mcp-for-healthcare", "prompt-injection-clinical"],
    externalLinks: [
      { label: "HealthClaw site", href: "https://healthclaw.io" },
      { label: "GitHub", href: "https://github.com/aks129/HealthClawGuardrails" },
    ],
    source: "FHIR IQ",
  },
  {
    slug: "claude-code-fhir",
    title: "Claude Code + FHIR",
    category: "ai-healthcare",
    status: "draft",
    summary:
      "Pattern: Claude Code as the IDE-resident agent that scaffolds a FHIR-reading app, wires MCP servers for live tools, and ships to Vercel. The Cohort 00 backbone.",
    related: ["agent-loops-fhir", "mcp-for-healthcare", "fhirbuilders"],
    externalLinks: [
      { label: "Claude Code docs", href: "https://docs.anthropic.com/en/docs/claude-code/setup" },
    ],
  },
  {
    slug: "prompt-injection-clinical",
    title: "Prompt Injection in Clinical Workflows",
    category: "ai-healthcare",
    status: "draft",
    summary:
      "Untrusted clinical text (notes, claims, intake forms) can include prompt-injection payloads. Pattern: never let raw clinical text drive agent tool calls without an allow-list + structured output check.",
    related: ["healthclaw", "llms-in-healthcare"],
    source: "Anthropic + Eugene",
  },

  // ═══════════════════════════════════ CMS INITIATIVES ═══════════════════════════════════
  {
    slug: "npd",
    title: "NPD — National Provider Directory",
    category: "cms-initiative",
    status: "draft",
    summary:
      "CMS-led modernization of the national provider directory (replacing NPPES). Eugene's AINPI project tracks the ecosystem players + FHIR-based architecture.",
    related: ["ainpi"],
    externalLinks: [
      { label: "CMS NPD", href: "https://www.cms.gov/data-research/cms-data/national-plan-and-provider-enumeration-system-nppes" },
      { label: "AINPI (Eugene's analysis)", href: "https://ainpi.dev" },
    ],
  },
  {
    slug: "ainpi",
    title: "AINPI",
    category: "cms-initiative",
    status: "draft",
    summary:
      "Open analysis of the CMS health tech ecosystem + NPD modernization effort — players, standards, FHIR architecture. Eugene's project.",
    related: ["npd"],
    externalLinks: [{ label: "ainpi.dev", href: "https://ainpi.dev" }],
    source: "FHIR IQ",
  },
  {
    slug: "cms-blue-button-rebrand",
    title: "CMS Blue Button — Rebrand + Modernization",
    category: "cms-initiative",
    status: "seed",
    summary:
      "CMS announced (2025) a rebrand + modernization of Blue Button 2.0. Watch for new branding, expanded data sources (claims + clinical), updated API surface.",
    related: ["blue-button-2", "carin-blue-button"],
  },
  {
    slug: "cms-health-tech-ecosystem",
    title: "CMS Health Tech Ecosystem (program)",
    category: "cms-initiative",
    status: "draft",
    summary:
      "CMS's umbrella for the open-innovation initiatives — NPD, Blue Button modernization, ePA, dQM. Coordinated via the CMS Health Tech Ecosystem Slack (see communities).",
    related: ["npd", "cms-blue-button-rebrand", "prior-auth-cms-0057", "digital-quality-measures", "cms-health-tech-slack"],
  },

  // ═══════════════════════════════════ COMMUNITY ═══════════════════════════════════
  {
    slug: "cms-health-tech-slack",
    title: "CMS Health Tech Ecosystem Slack",
    category: "community",
    status: "stable",
    summary:
      "Enterprise Slack where CMS staff + the broader health-tech ecosystem coordinate on NPD, ePA, Blue Button, dQM and other CMS-driven open-innovation initiatives.",
    body: `Workspace: \`cms-health-tech.enterprise.slack.com\`

This is the watering hole for CMS Health Tech Ecosystem program updates. Topics that live here:
- NPD (National Provider Directory) modernization
- Blue Button rebrand timeline
- Prior auth (CMS-0057) implementation chatter
- TEFCA QHIN onboarding
- Digital quality measure (dQM) sandbox progress
- ONC HTI-2 rulemaking discussion
- FHIR Connectathon coordination

Access is by invite — request via CMS Health Tech contacts or through your participation in CMS Connectathons / workshops.`,
    externalLinks: [
      { label: "CMS Health Tech program", href: "https://www.cms.gov/data-research/data-systems/cms-health-tech-modernization" },
    ],
    related: ["npd", "cms-blue-button-rebrand", "prior-auth-cms-0057", "cms-health-tech-ecosystem"],
    source: "CMS",
  },
  {
    slug: "health-tech-nerds-slack",
    title: "Health Tech Nerds (HTN) Slack",
    category: "community",
    status: "stable",
    summary:
      "~25K+ member community of healthtech operators, founders, investors, and engineers. The other watering hole — broader than CMS, deeper on industry signal.",
    body: `Workspace: \`healthtechnerds.slack.com\` (Slack Business+ plan, paid-membership community).

What's good here:
- #share-your-stuff — public BD + build announcements
- Channels for prior auth, claims, patient apps, AI, payer interop
- Healthtech operator + investor conversations you don't find on LinkedIn
- Regular member-driven AMAs

Run by Trevor McLaughlin. Paid membership (low-cost) gates spam.`,
    externalLinks: [
      { label: "Health Tech Nerds", href: "https://www.healthtechnerds.com" },
    ],
    related: ["out-of-pocket-health"],
    source: "HTN",
  },
  {
    slug: "out-of-pocket-health",
    title: "Out of Pocket Health",
    category: "community",
    status: "draft",
    summary:
      "Nikhil Krishnan's healthtech publication + community. Pizza newsletters, Ship It summit, curated cohorts. Eugene's FHIR IQ Cohort 00 borrows the OOP operating system.",
    externalLinks: [
      { label: "Out of Pocket", href: "https://www.outofpocket.health" },
    ],
    related: ["health-tech-nerds-slack"],
  },
  {
    slug: "fhirbuilders",
    title: "FHIRBuilders",
    category: "community",
    status: "stable",
    summary:
      "Eugene's platform for building, sharing, and collaborating on AI-powered FHIR apps. Hosts the Cohort 00 experience, the sandbox, Problem Board, OpenClaw skills.",
    related: ["fhir-iq", "claude-code-fhir"],
    externalLinks: [{ label: "fhirbuilders.com", href: "https://fhirbuilders.com" }],
    source: "FHIR IQ",
  },
  {
    slug: "fhir-iq",
    title: "FHIR IQ + Out of the FHIR podcast",
    category: "community",
    status: "stable",
    summary:
      "Eugene's brand. The semantic intelligence layer for healthcare data (product), the Out of the FHIR podcast (content), and the cohort program (training).",
    related: ["fhirbuilders", "fhirspective", "healthclaw"],
    externalLinks: [
      { label: "FHIR IQ", href: "https://fhiriq.com" },
      { label: "Substack", href: "https://evestel.substack.com" },
    ],
    source: "FHIR IQ",
  },
  {
    slug: "hl7-fhir-community",
    title: "HL7 FHIR Community + chat.fhir.org",
    category: "community",
    status: "stable",
    summary:
      "Official FHIR community on Zulip (chat.fhir.org). Sub-streams by IG (#argonaut, #davinci, #us-core, #payer/provider). The reference forum for FHIR spec questions.",
    externalLinks: [
      { label: "chat.fhir.org", href: "https://chat.fhir.org" },
      { label: "HL7 FHIR community", href: "https://www.hl7.org/Special/committees/fhir/" },
    ],
    related: ["devdays", "fhir-connectathons"],
  },
  {
    slug: "devdays",
    title: "FHIR DevDays",
    category: "community",
    status: "draft",
    summary:
      "Annual hands-on FHIR conferences (Amsterdam, Boston). Tutorials + Connectathon + speaker tracks. Eugene records Side Chats here with Firely.",
    externalLinks: [{ label: "FHIR DevDays", href: "https://www.devdays.com" }],
    related: ["fhir-connectathons", "hl7-fhir-community"],
  },
  {
    slug: "fhir-connectathons",
    title: "FHIR Connectathons (HL7 + CMS)",
    category: "community",
    status: "draft",
    summary:
      "Three-day hands-on events where implementers test FHIR profiles against real reference servers. HL7 runs WGM connectathons; CMS runs an annual one (July) plus the FHIR-at-Scale Taskforce track.",
    externalLinks: [
      { label: "HL7 Connectathons", href: "https://confluence.hl7.org/display/FHIR/Connectathons" },
    ],
    related: ["devdays", "hl7-fhir-community"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Edges — explicit relationships beyond the per-node `related` list. Use these
// for higher-fidelity graph rendering (depends-on vs. extends, etc.).
// ─────────────────────────────────────────────────────────────────────────────
const EDGES: WikiEdge[] = [
  { from: "us-core", to: "fhir-versions", kind: "depends-on", note: "US Core 6+ targets FHIR R4" },
  { from: "blue-button-2", to: "carin-blue-button", kind: "extends" },
  { from: "davinci-pas", to: "davinci-dtr", kind: "depends-on" },
  { from: "davinci-pas", to: "davinci-crd", kind: "depends-on" },
  { from: "davinci-pdex", to: "davinci-hrex", kind: "depends-on" },
  { from: "davinci-cdex", to: "davinci-hrex", kind: "depends-on" },
  { from: "davinci-dtr", to: "cql", kind: "depends-on", note: "DTR rules are CQL-driven" },
  { from: "davinci-dtr", to: "questionnaire-sdc", kind: "depends-on" },
  { from: "prior-auth-cms-0057", to: "davinci-crd", kind: "produces" },
  { from: "prior-auth-cms-0057", to: "davinci-dtr", kind: "produces" },
  { from: "prior-auth-cms-0057", to: "davinci-pas", kind: "produces" },
  { from: "cms-9115", to: "carin-blue-button", kind: "produces" },
  { from: "cms-9115", to: "davinci-pdex", kind: "produces" },
  { from: "21st-century-cures-act", to: "info-blocking", kind: "produces" },
  { from: "21st-century-cures-act", to: "onc-certification", kind: "produces" },
  { from: "21st-century-cures-act", to: "us-core", kind: "produces", note: "ONC certification requires US Core" },
  { from: "cql", to: "digital-quality-measures", kind: "produces" },
  { from: "sql-on-fhir", to: "cql", kind: "alternative", note: "Compiled-to-SQL vs. CQL engine; same goal, different runtime" },
  { from: "fhirspective", to: "fhir-validation", kind: "extends" },
  { from: "claude-code-fhir", to: "mcp-for-healthcare", kind: "depends-on" },
  { from: "healthclaw", to: "mcp-for-healthcare", kind: "extends", note: "Security layer for MCP tools touching clinical data" },
  { from: "agent-loops-fhir", to: "fhir-rest-api", kind: "depends-on" },
  { from: "cms-health-tech-slack", to: "cms-health-tech-ecosystem", kind: "discusses" },
  { from: "cms-health-tech-slack", to: "npd", kind: "discusses" },
  { from: "cms-health-tech-slack", to: "prior-auth-cms-0057", kind: "discusses" },
  { from: "health-tech-nerds-slack", to: "llms-in-healthcare", kind: "discusses" },
  { from: "fhirbuilders", to: "claude-code-fhir", kind: "discusses" },
  { from: "fhirbuilders", to: "fhirspective", kind: "discusses" },
];

const LOG: WikiLogEntry[] = [
  {
    date: "2026-06-05",
    summary:
      "v0.1 seed — 50 nodes across 8 categories. Karpathy-inspired index + log scaffold. Wired CMS Health Tech Ecosystem Slack + HTN Slack as live community sources.",
    changes: NODES.map((n) => n.slug),
    by: "Claude + Eugene",
  },
];

export const WIKI: WikiGraph = {
  version: "0.1.0",
  updatedAt: "2026-06-05",
  nodes: NODES,
  edges: EDGES,
  log: LOG,
};

// ─────────────────────────────────────────────────────────────────────────────
// Lookup helpers — used by the /wiki pages.
// ─────────────────────────────────────────────────────────────────────────────

export function getNode(slug: string): WikiNode | undefined {
  return WIKI.nodes.find((n) => n.slug === slug);
}

export function getNodesByCategory(category: WikiCategory): WikiNode[] {
  return WIKI.nodes.filter((n) => n.category === category);
}

export function getRelated(slug: string): WikiNode[] {
  const node = getNode(slug);
  if (!node) return [];
  const relatedSlugs = new Set<string>(node.related ?? []);
  // pull in edges in both directions
  for (const e of WIKI.edges) {
    if (e.from === slug) relatedSlugs.add(e.to);
    if (e.to === slug) relatedSlugs.add(e.from);
  }
  relatedSlugs.delete(slug);
  return [...relatedSlugs].map(getNode).filter((n): n is WikiNode => !!n);
}

export const CATEGORY_META: Record<
  WikiCategory,
  { label: string; description: string; accentClass: string }
> = {
  "fhir-core": {
    label: "FHIR Core",
    description: "Versions, REST API, profiles, SMART, bulk data.",
    accentClass: "border-blue-200 bg-blue-50/40 text-blue-900",
  },
  "fhir-ig": {
    label: "Implementation Guides",
    description: "US Core, DaVinci, Blue Button, SDOH, mCODE.",
    accentClass: "border-violet-200 bg-violet-50/40 text-violet-900",
  },
  terminology: {
    label: "Terminology",
    description: "SNOMED, LOINC, RxNorm, ICD-10, CPT, UCUM.",
    accentClass: "border-amber-200 bg-amber-50/40 text-amber-900",
  },
  "data-quality": {
    label: "Data Quality + Measures",
    description: "Validation, CQL, SQL-on-FHIR, digital quality measures.",
    accentClass: "border-emerald-200 bg-emerald-50/40 text-emerald-900",
  },
  regulation: {
    label: "Regulation (US)",
    description: "HIPAA, Cures Act, info blocking, CMS-9115, CMS-0057, TEFCA.",
    accentClass: "border-rose-200 bg-rose-50/40 text-rose-900",
  },
  "ai-healthcare": {
    label: "AI · Healthcare",
    description: "LLMs, agent loops, MCP, Claude Code, prompt-injection in clinical workflows.",
    accentClass: "border-fuchsia-200 bg-fuchsia-50/40 text-fuchsia-900",
  },
  "cms-initiative": {
    label: "CMS Initiatives",
    description: "NPD modernization, Blue Button rebrand, ePA, dQM.",
    accentClass: "border-teal-200 bg-teal-50/40 text-teal-900",
  },
  community: {
    label: "Communities + Sources",
    description: "CMS Health Tech Slack, HTN, HL7 FHIR, OOP, DevDays.",
    accentClass: "border-slate-300 bg-slate-50 text-slate-900",
  },
};

export const CATEGORY_ORDER: WikiCategory[] = [
  "fhir-core",
  "fhir-ig",
  "terminology",
  "data-quality",
  "regulation",
  "ai-healthcare",
  "cms-initiative",
  "community",
];

export const STATUS_META: Record<WikiStatus, { label: string; className: string }> = {
  seed: { label: "Seed", className: "border-slate-300 bg-slate-50 text-slate-600" },
  draft: { label: "Draft", className: "border-amber-300 bg-amber-50 text-amber-800" },
  stable: { label: "Stable", className: "border-emerald-300 bg-emerald-50 text-emerald-800" },
};
