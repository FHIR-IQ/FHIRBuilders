---
name: fhir-medication-reconciliation
description: Compare medication lists from multiple sources, flag duplicates and potential drug interactions, and produce a reconciliation summary for clinical review
version: 1.0.0
author: FHIRBuilders Community
homepage: https://fhirbuilders.com/openclaw
metadata: {"openclaw":{"emoji":"💊","tags":["fhir","clinical-workflows","medications","reconciliation","r4"],"requires":{"env":["FHIR_BASE_URL","FHIR_AUTH_TOKEN"]},"primaryEnv":"FHIR_BASE_URL"}}
---

# FHIR Medication Reconciliation

You perform medication reconciliation for a patient by pulling all medication sources from a FHIR R4 endpoint, identifying duplicates, therapeutic duplicates, and high-risk combinations, then producing a clean reconciliation summary for clinical review.

## Configuration

- `FHIR_BASE_URL` — Base URL of your FHIR R4 endpoint
- `FHIR_AUTH_TOKEN` — Bearer token for authentication

## How to perform reconciliation

### Step 1 — Resolve the patient

Accept patient name, MRN, or FHIR ID. Resolve to a patient ID using:
```
GET {FHIR_BASE_URL}/Patient?name=<name>&_count=5
```
or
```
GET {FHIR_BASE_URL}/Patient?identifier=<mrn>
```

### Step 2 — Pull all medication sources

Fetch both prescriber-ordered and reported/historical medications:

**MedicationRequest** (prescriber orders):
```
GET {FHIR_BASE_URL}/MedicationRequest?patient=<id>&status=active,on-hold&_count=50
```

**MedicationStatement** (patient-reported, home meds, OTC):
```
GET {FHIR_BASE_URL}/MedicationStatement?patient=<id>&status=active,intended&_count=50
```

For each medication resource, extract:
- `medicationCodeableConcept.coding` — look for RxNorm (`http://www.nlm.nih.gov/research/umls/rxnorm`) code
- `medicationCodeableConcept.text` — display name
- Dose: from `dosageInstruction[0]`
- Prescriber/source: from `requester` (MedicationRequest) or `informationSource` (MedicationStatement)

### Step 3 — Identify flags

**Exact duplicates:** Same RxNorm code appearing in both MedicationRequest and MedicationStatement, or from two different prescribers.

**Therapeutic duplicates (same drug class):** Check for these common pairs:
- Two statins (atorvastatin + simvastatin, etc.)
- Two ACE inhibitors or two ARBs
- Two beta-blockers
- Two SSRIs
- Two PPIs (omeprazole + pantoprazole, etc.)
- Two oral anticoagulants

**High-risk combinations (flag for urgent clinical review):**
- Warfarin + NSAIDs (ibuprofen, naproxen, aspirin >81mg)
- Warfarin + fluoroquinolones
- ACE inhibitor + ARB + diuretic (triple whammy)
- Two anticoagulants concurrently (warfarin + rivaroxaban, etc.)
- Opioid + benzodiazepine
- SSRI + tramadol (serotonin syndrome risk)
- Metformin + IV contrast (not direct interaction but flag for procedure risk)
- Lithium + NSAIDs or thiazides

For matching, use RxNorm codes when available. When only display text is available, use name matching (case-insensitive substring match on generic name).

### Step 4 — Return the reconciliation summary

```
💊 **Medication Reconciliation — [Patient Name]**
Generated: [timestamp]
Sources: MedicationRequest ([n] records) + MedicationStatement ([n] records)

━━━━ RECONCILED MEDICATION LIST ━━━━

[#] [Medication name] [dose] [frequency]
    Source: [prescriber/reported]
    RxNorm: [code]

... (all active meds, de-duplicated)

━━━━ FLAGS FOR CLINICAL REVIEW ━━━━

🔴 HIGH-RISK COMBINATION:
   Warfarin 5mg QD + Ibuprofen 400mg TID
   Risk: Increased bleeding. Review with prescribing provider.

⚠️ THERAPEUTIC DUPLICATE:
   Atorvastatin 40mg (prescribed by Dr. Lee, Nov 2023)
   Simvastatin 20mg (patient-reported, OTC)
   Recommend: Confirm which statin to continue.

📝 NOTE: [n] medications match across sources (likely same drug) — included once in list above.

Total medications after reconciliation: [n]
Flags requiring review: [count]
```

If no flags are found: "✅ No duplicates or high-risk combinations identified."

## Error handling

- If no MedicationRequest or MedicationStatement resources exist for the patient: "No medication records found for this patient in the FHIR endpoint."
- If RxNorm codes are missing for most medications: warn that matching accuracy is reduced and name-based matching was used.

## Examples

**Example 1 — Basic reconciliation**

User: Reconcile meds for patient MRN 55312

You: [fetch Patient, MedicationRequest x8, MedicationStatement x3]

Reply:
```
💊 **Medication Reconciliation — David Kim** (MRN: 55312)
Generated: 2025-03-16 10:04
Sources: MedicationRequest (8) + MedicationStatement (3)

━━━━ RECONCILED LIST (9 medications) ━━━━
1. Warfarin 5mg QD — Dr. Roberts (Cardiology)
2. Metformin 1000mg BID — Dr. Patel (PCP)
3. Lisinopril 10mg QD — Dr. Patel
4. Atorvastatin 40mg QHS — Dr. Patel
5. Aspirin 325mg QD — patient-reported
6. Ibuprofen 400mg PRN — patient-reported (OTC)
7. Omeprazole 20mg QD — Dr. Roberts
8. Furosemide 40mg QD — Dr. Roberts
9. Potassium chloride 20mEq QD — Dr. Roberts

━━━━ FLAGS ━━━━

🔴 HIGH-RISK: Warfarin + Aspirin 325mg + Ibuprofen
   Triple anticoagulation/anti-platelet risk. Urgent review recommended.

Total after reconciliation: 9 | Flags: 1
```

---

**Example 2 — Clean list**

User: Do a med rec on Maria Santos

Reply:
```
💊 **Medication Reconciliation — Maria Santos**
...
━━━━ FLAGS ━━━━
✅ No duplicates or high-risk combinations identified.

Total after reconciliation: 4 | Flags: 0
```
