---
name: fhir-care-gap-monitor
description: Identify patients with open quality care gaps — missing preventive screenings, overdue labs, or unfulfilled care plan goals
version: 1.0.0
author: FHIRBuilders Community
homepage: https://fhirbuilders.com/openclaw
metadata: {"openclaw":{"emoji":"📋","tags":["fhir","clinical-workflows","quality","care-gaps","r4"],"requires":{"env":["FHIR_BASE_URL","FHIR_AUTH_TOKEN","PANEL_SIZE_LIMIT"]},"primaryEnv":"FHIR_BASE_URL"}}
---

# FHIR Care Gap Monitor

You can identify patients with open quality care gaps by querying a FHIR R4 endpoint. A care gap is an evidence-based preventive service or chronic disease management action that is overdue for a patient.

## Configuration

- `FHIR_BASE_URL` — Base URL of your FHIR R4 endpoint
- `FHIR_AUTH_TOKEN` — Bearer token for authentication
- `PANEL_SIZE_LIMIT` — Maximum number of patients to scan (default: 500)

All requests must include: `Authorization: Bearer <FHIR_AUTH_TOKEN>`

## Supported care gap types

You handle these gap types. When a user asks about care gaps, identify which type they mean and apply the appropriate logic:

### 1. HbA1c Overdue (Diabetes)
**Criteria:** Patient has Type 2 diabetes (SNOMED: 44054006 or ICD-10: E11) AND no HbA1c observation (LOINC: 4548-4 or 17856-6) in the last 12 months.

Query:
```
GET {FHIR_BASE_URL}/Condition?code=44054006&clinical-status=active&_count={PANEL_SIZE_LIMIT}
```
For each patient found, check:
```
GET {FHIR_BASE_URL}/Observation?patient=<id>&code=4548-4&_sort=-date&_count=1
```
Flag as gap if no result or most recent result is older than 365 days.

### 2. Mammogram Overdue
**Criteria:** Female patient age 40–74 with no mammography procedure (LOINC: 24606-6 or SNOMED: 71651007) in the last 24 months.

Query patients:
```
GET {FHIR_BASE_URL}/Patient?gender=female&birthdate=lt<cutoff_year>&birthdate=gt<lower_cutoff_year>&_count={PANEL_SIZE_LIMIT}
```
For each, check:
```
GET {FHIR_BASE_URL}/Procedure?patient=<id>&code=71651007&_sort=-date&_count=1
```

### 3. Colorectal Cancer Screening Overdue
**Criteria:** Patient age 45–75 with no colorectal screening in the last 12 months (flexible; depends on test type). Check for FOBT (LOINC: 2335-8), FIT (LOINC: 57905-2), or colonoscopy (SNOMED: 73761001) in the appropriate lookback period.

### 4. Blood Pressure Uncontrolled
**Criteria:** Patient has hypertension (ICD-10: I10 or SNOMED: 38341003) AND most recent systolic BP reading (LOINC: 8480-6) > 140 mmHg.

Query:
```
GET {FHIR_BASE_URL}/Condition?code=38341003&clinical-status=active&_count={PANEL_SIZE_LIMIT}
```
For each, check most recent BP:
```
GET {FHIR_BASE_URL}/Observation?patient=<id>&code=8480-6&_sort=-date&_count=1
```

## Output format

When presenting care gaps, use this format:

```
📋 **Care Gap Report: [Gap Type]**
Generated: [timestamp]
Patients scanned: [n] | Gaps found: [count]

**Patients with open gaps:**

1. [Patient Name] | DOB: [date] | MRN: [mrn]
   Last [relevant service]: [date or "Never"] — [days] days overdue

2. ...

---
Top priority: [Name of longest-overdue patient]
```

If the panel is large, process in batches using `_page` or cursor-based pagination.

## Error handling

- If FHIR returns a 401, tell the user to check their FHIR_AUTH_TOKEN.
- If the panel size exceeds PANEL_SIZE_LIMIT, tell the user and offer to process in batches.
- If no patients are found for a condition code, suggest the user verify which code system their EHR uses.

## Examples

**Example 1 — HbA1c gaps**

User: Which diabetic patients haven't had an HbA1c in the last year?

You: [query Condition?code=44054006, get 47 diabetic patients]
     [check Observation?code=4548-4 for each]

Reply:
```
📋 **Care Gap Report: HbA1c Overdue (Diabetes)**
Generated: 2025-03-16 09:14
Patients scanned: 47 | Gaps found: 8

1. Robert Chen | DOB: 1952-08-21 | MRN: 4421
   Last HbA1c: 2024-01-08 — 432 days overdue

2. Linda Park | DOB: 1967-11-03 | MRN: 7812
   Last HbA1c: Never — no record found

... (6 more)

Top priority: Linda Park (no HbA1c on record)
```

---

**Example 2 — Mammogram gaps**

User: Who needs a mammogram on Dr. Johnson's panel?

You: [determine female patients age 40-74, check procedures]

Reply:
```
📋 **Care Gap Report: Mammogram Overdue**
Generated: 2025-03-16 09:22
Patients scanned: 89 | Gaps found: 12

1. Susan Martinez | DOB: 1973-05-17 | MRN: 9933
   Last mammogram: 2022-11-30 — 836 days overdue
...
```
