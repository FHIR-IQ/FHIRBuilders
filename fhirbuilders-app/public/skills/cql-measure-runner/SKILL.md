---
name: cql-measure-runner
description: Run a CQL quality measure against your FHIR endpoint and return population results — initial population, denominator, numerator, and performance rate
version: 1.0.0
author: FHIRBuilders Community
homepage: https://fhirbuilders.com/openclaw
metadata: {"openclaw":{"emoji":"📊","tags":["fhir","quality-measures","cql","hedis","r4"],"requires":{"env":["FHIR_BASE_URL","FHIR_AUTH_TOKEN"]},"primaryEnv":"FHIR_BASE_URL"}}
---

# CQL Measure Runner

You can execute FHIR quality measures using the `$evaluate-measure` operation and return population-level results including initial population, denominator, numerator, exclusions, and performance rate.

## Configuration

- `FHIR_BASE_URL` — Base URL of your FHIR R4 endpoint (must support the `$evaluate-measure` operation)
- `FHIR_AUTH_TOKEN` — Bearer token for authentication

## How to run a measure

### Step 1 — Identify the measure

Accept the measure in any of these forms:
- A canonical URL: `http://hl7.org/fhir/us/cqfmeasures/Measure/EXM130`
- A measure name/title: "Colorectal Cancer Screening", "CMS130"
- A local FHIR Measure ID: `Measure/cms130`

If the user gives a name, first search for the measure:
```
GET {FHIR_BASE_URL}/Measure?title:contains=<name>&_count=5
```
If multiple measures match, show the list and ask the user to confirm.

### Step 2 — Execute the measure

POST to the `$evaluate-measure` operation:
```
POST {FHIR_BASE_URL}/Measure/<id>/$evaluate-measure
Content-Type: application/fhir+json

{
  "resourceType": "Parameters",
  "parameter": [
    { "name": "periodStart", "valueDate": "<start>" },
    { "name": "periodEnd", "valueDate": "<end>" },
    { "name": "reportType", "valueCode": "summary" }
  ]
}
```

Default period: the current calendar year (January 1 to December 31).
If the user specifies a period (e.g., "Q1 2024", "last year"), parse it accordingly.

### Step 3 — Parse the MeasureReport

The response is a `MeasureReport` resource. Extract from `MeasureReport.group[0].population[]`:

- Find the entry where `code.coding[0].code = "initial-population"` → get `count`
- Find `code = "denominator"` → get `count`
- Find `code = "denominator-exclusion"` → get `count`
- Find `code = "numerator"` → get `count`
- Calculate performance rate: `(numerator / (denominator - denominator-exclusion)) * 100`

### Step 4 — Return results

```
📊 **[Measure Title]**
Period: [start] – [end]
Measure URL: [canonical URL]

Population Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Initial Population:        [n]
Denominator:               [n]
Denominator Exclusions:    [n]
Numerator:                 [n]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Performance Rate:          [XX.X]%

[Compare to benchmark if known: e.g., "HEDIS 2024 national average: 72.3%"]
```

## Common measure reference

| Common Name | CMS ID | Canonical URL Pattern |
|---|---|---|
| Colorectal Cancer Screening | CMS130 | EXM130 |
| Breast Cancer Screening | CMS125 | EXM125 |
| Diabetes HbA1c Control | CMS122 | EXM122 |
| Controlling High Blood Pressure | CMS165 | EXM165 |
| Childhood Immunization Status | CMS117 | EXM117 |

## Error handling

- If `$evaluate-measure` returns 404: "Measure not found at [id]. Use `GET {FHIR_BASE_URL}/Measure` to list available measures."
- If 501 (not implemented): "This FHIR endpoint does not support the $evaluate-measure operation. You may need a CQL execution engine (e.g., HAPI FHIR with CQL support)."
- If the MeasureReport is missing expected population codes: report what was found and note what's missing.
- If performance rate denominator is 0: "Denominator is 0 — no patients qualify for this measure in the given period."

## Examples

**Example 1 — Run by name**

User: Run the colorectal cancer screening measure for 2024

You: [search Measure?title:contains=colorectal]
     [POST $evaluate-measure with periodStart=2024-01-01, periodEnd=2024-12-31]

Reply:
```
📊 **Colorectal Cancer Screening (CMS130)**
Period: 2024-01-01 – 2024-12-31

Population Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Initial Population:        1,247
Denominator:               1,102
Denominator Exclusions:    38
Numerator:                 751
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Performance Rate:          70.6%

HEDIS 2024 national average: 68.8% ✅ Above benchmark
```

---

**Example 2 — Run for specific quarter**

User: What's our HbA1c control rate for Q3 2024?

You: [POST $evaluate-measure with periodStart=2024-07-01, periodEnd=2024-09-30]

Reply:
```
📊 **Diabetes: HbA1c Poor Control (CMS122)**
Period: 2024-07-01 – 2024-09-30

Performance Rate: 62.1%
(257 / 414 patients with HbA1c < 9%)
```
