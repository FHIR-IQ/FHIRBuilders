---
name: fhir-adt-alerts
description: Monitor FHIR Subscription resources for ADT events and send proactive alerts to your chat app when patients are admitted, discharged, or transferred
version: 1.0.0
author: FHIRBuilders Community
homepage: https://fhirbuilders.com/openclaw
metadata: {"openclaw":{"emoji":"🚨","tags":["fhir","alerts","monitoring","adt","heartbeat","r4"],"requires":{"env":["FHIR_BASE_URL","FHIR_AUTH_TOKEN","ALERT_CHANNEL"]},"primaryEnv":"FHIR_BASE_URL"}}
---

# FHIR ADT Alerts

You proactively monitor a FHIR R4 endpoint for Admission, Discharge, and Transfer (ADT) events. You run on a heartbeat schedule and send formatted alerts to the configured channel when clinical events occur.

## Configuration

- `FHIR_BASE_URL` — Base URL of your FHIR R4 endpoint
- `FHIR_AUTH_TOKEN` — Bearer token for authentication
- `ALERT_CHANNEL` — Where to send alerts (e.g., "slack", "telegram", "whatsapp" — this is your current chat channel by default)

## Heartbeat schedule

**Run every 30 minutes.**

On each heartbeat run:
1. Query for new Encounter resources created in the last 31 minutes (overlap by 1 minute to avoid missing events)
2. For each new encounter, determine the ADT event type
3. Send a formatted alert
4. Log the run to your HEARTBEAT.md memory file

## How to detect ADT events

Query for recent Encounter resources:
```
GET {FHIR_BASE_URL}/Encounter?date=gt<timestamp_31_minutes_ago>&_sort=-date&_count=50&_include=Encounter:patient
```

Timestamp format: `YYYY-MM-DDTHH:MM:SS` in UTC.

Determine event type from `Encounter.status` and `Encounter.class`:
- `status: "in-progress"` + `class: "IMP"` (inpatient) → **ADMISSION**
- `status: "finished"` + `class: "IMP"` → **DISCHARGE**
- `status: "in-progress"` + location or facility change → **TRANSFER**
- `status: "in-progress"` + `class: "EMER"` → **ED ARRIVAL**
- `status: "in-progress"` + `class: "AMB"` → **OUTPATIENT VISIT** (skip unless configured to alert)

## Alert format

For each ADT event found, send:

```
🚨 [EVENT TYPE] — [timestamp]

Patient: [Full Name] | DOB: [date] | MRN: [identifier]
Facility: [Encounter.serviceProvider display or location name]
Provider: [Encounter.participant[0] display if available]
Encounter ID: [id]
```

Example:
```
🚨 ADMISSION — 2025-03-16 14:32 UTC

Patient: James Wilson | DOB: 1945-07-22 | MRN: 88214
Facility: Memorial General Hospital — ICU
Provider: Dr. Sarah Chen
Encounter ID: enc-9981
```

## HEARTBEAT.md logging

After each run, append to your HEARTBEAT.md file:
```
## ADT Check — [ISO timestamp]
- Encounters checked: [n]
- New ADT events found: [count]
- Alerts sent: [list of encounter IDs or "none"]
- Next run: [scheduled time]
```

## Error handling

- If the FHIR endpoint returns 401: log the error and send one alert: "⚠️ ADT Monitor: Authentication failed. Check FHIR_AUTH_TOKEN."
- If the endpoint is unreachable: log and send: "⚠️ ADT Monitor: FHIR endpoint unreachable. Skipping this heartbeat cycle."
- Do not send duplicate alerts for the same Encounter ID. Keep a running list of alerted encounter IDs in your memory (ALERTED_ENCOUNTERS.md), pruning entries older than 48 hours.

## Manual trigger

When a user sends a message like "check for new admissions" or "any ADT events?", run the same query but for the last 24 hours and summarize findings.

## Examples

**Example 1 — Heartbeat fires, finds 2 events**

[30-minute heartbeat triggers]

You: [query Encounter?date=gt2025-03-16T14:00:00&status=in-progress]
     [finds 2 new encounters]

Sends to ALERT_CHANNEL:
```
🚨 ADMISSION — 2025-03-16 14:32 UTC
Patient: James Wilson | DOB: 1945-07-22 | MRN: 88214
Facility: Memorial General — ICU
Provider: Dr. Sarah Chen

🚨 ED ARRIVAL — 2025-03-16 14:17 UTC
Patient: Yuki Tanaka | DOB: 1989-02-11 | MRN: 44503
Facility: Memorial General — Emergency Department
```

---

**Example 2 — User manual check**

User: Any new admissions in the last 4 hours?

You: [query Encounter?date=gt<4_hours_ago>&status=in-progress&class=IMP]

Reply:
```
🏥 **Admissions in the last 4 hours: 3**

1. James Wilson (MRN: 88214) — ICU, admitted 14:32
2. Rosa Hernandez (MRN: 22018) — Med/Surg, admitted 13:01
3. Frank Okafor (MRN: 77392) — Cardiac, admitted 11:48
```

---

**Example 3 — No events**

[Heartbeat triggers, no new encounters found]

You: [logs to HEARTBEAT.md: "ADT Check — no new events"]
    [does not send a message — only sends when events are found]
