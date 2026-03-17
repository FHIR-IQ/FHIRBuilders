---
name: fhir-patient-query
description: Query any FHIR R4 endpoint for patient demographics, conditions, medications, and recent labs from a single natural language request
version: 1.0.0
author: FHIRBuilders Community
homepage: https://fhirbuilders.com/openclaw
metadata: {"openclaw":{"emoji":"🔍","tags":["fhir","clinical","data-access","r4"],"requires":{"env":["FHIR_BASE_URL","FHIR_AUTH_TOKEN"]},"primaryEnv":"FHIR_BASE_URL"}}
---

# FHIR Patient Query

You can query a FHIR R4 endpoint to retrieve comprehensive patient information. When a user asks about a patient — by name, MRN, or FHIR ID — you will look up their demographics, active conditions, current medications, and three most recent lab results, then return a structured summary.

## Configuration

You need two environment variables configured:

- `FHIR_BASE_URL` — The base URL of the FHIR R4 endpoint, e.g. `https://api.medplum.com/fhir/R4`
- `FHIR_AUTH_TOKEN` — A Bearer token for authenticating to the FHIR endpoint

All FHIR requests must include the header: `Authorization: Bearer <FHIR_AUTH_TOKEN>`

## How to query patients

### Step 1 — Resolve the patient

If the user gives you a patient name, search first:
```
GET {FHIR_BASE_URL}/Patient?name=<name>&_count=5
```
If the user gives you an MRN (medical record number), search by identifier:
```
GET {FHIR_BASE_URL}/Patient?identifier=<mrn>
```
If the user gives you a FHIR ID directly, fetch directly:
```
GET {FHIR_BASE_URL}/Patient/<id>
```

If multiple patients match a name search, ask the user to clarify (show name, birthdate, MRN).

### Step 2 — Fetch clinical data in parallel

Once you have the patient ID, fetch the following in parallel:

**Active conditions:**
```
GET {FHIR_BASE_URL}/Condition?patient=<id>&clinical-status=active&_count=20
```

**Active medications:**
```
GET {FHIR_BASE_URL}/MedicationRequest?patient=<id>&status=active&_count=20
```

**Recent labs (last 10 Observation resources sorted by date):**
```
GET {FHIR_BASE_URL}/Observation?patient=<id>&category=laboratory&_sort=-date&_count=3
```

### Step 3 — Format and return the summary

Return a structured summary in this format:

```
👤 **[Patient Name]** | DOB: [date] | MRN: [identifier]

🏥 **Active Conditions** ([count]):
• [Condition display name] — since [onset date]
• ...

💊 **Current Medications** ([count]):
• [Medication name] [dose] [frequency] — since [authored date]
• ...

🔬 **Recent Labs**:
• [LOINC display] ([code]): [value] [unit] — [date]
• ...
```

If any section returns no results, say "None on record."

## Error handling

- If the patient is not found, reply: "No patient found matching '[query]'. Please check the name or MRN and try again."
- If authentication fails (401), reply: "FHIR authentication failed. Please check your FHIR_AUTH_TOKEN."
- If the FHIR endpoint is unreachable, reply: "Could not connect to the FHIR endpoint at [FHIR_BASE_URL]. Please verify the URL and your network connection."

## Examples

**Example 1 — Query by name**

User: Pull up John Smith's current meds

You: [fetch Patient?name=John+Smith] → finds patient ID `patient-101`
     [fetch MedicationRequest?patient=patient-101&status=active]

Reply:
```
💊 **John Smith's Current Medications** (3):
• Metformin 500mg BID — since Jan 2023
• Lisinopril 10mg QD — since Jun 2022
• Atorvastatin 40mg QHS — since Jun 2022
```

---

**Example 2 — Full summary**

User: Give me a full workup on patient MRN 7834521

You: [fetch Patient?identifier=7834521]
     [fetch Condition, MedicationRequest, Observation in parallel]

Reply:
```
👤 **Maria Garcia** | DOB: 1968-03-14 | MRN: 7834521

🏥 **Active Conditions** (2):
• Type 2 diabetes mellitus — since Mar 2019
• Essential hypertension — since Nov 2017

💊 **Current Medications** (3):
• Metformin 1000mg BID — since Mar 2019
• Amlodipine 5mg QD — since Nov 2017
• Aspirin 81mg QD — since Nov 2017

🔬 **Recent Labs**:
• HbA1c (4548-4): 7.2% — 2024-11-15
• Fasting glucose (1558-6): 128 mg/dL — 2024-11-15
• Creatinine (2160-0): 0.9 mg/dL — 2024-10-02
```

---

**Example 3 — No results**

User: Look up patient 99999

Reply: "No patient found with FHIR ID 99999. Please check the ID and try again."
