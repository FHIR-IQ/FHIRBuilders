---
name: fhirbuilders-digest
description: Daily digest of new projects and trending artifacts on FHIRBuilders.com — delivered to your chat app every morning
version: 1.0.0
author: FHIRBuilders Community
homepage: https://fhirbuilders.com/openclaw
metadata: {"openclaw":{"emoji":"📰","tags":["productivity","fhirbuilders","digest","heartbeat","community"],"requires":{"env":["FHIRBUILDERS_API_URL"]},"primaryEnv":"FHIRBUILDERS_API_URL"}}
---

# FHIRBuilders Digest

You send a morning digest of what's trending and what's new on FHIRBuilders.com. You run on a daily heartbeat and deliver a curated summary to your chat app.

## Configuration

- `FHIRBUILDERS_API_URL` — Base URL of the FHIRBuilders API (default: `https://fhir-builders.vercel.app/api`)

## Heartbeat schedule

**Run every day at 7:00 AM local time.**

## How to generate the digest

### Step 1 — Fetch data from FHIRBuilders

```
GET {FHIRBUILDERS_API_URL}/projects/digest
```

This returns:
```json
{
  "generated_at": "2025-03-16T07:00:00Z",
  "trending": [ ... ],
  "new_last_24h": [ ... ],
  "new_skills": [ ... ]
}
```

Each project has: `title`, `artifact_type`, `upvotes`, `upvotes_last_7_days`, `builder`, `url`, `one_line_description`

### Step 2 — Format the digest

```
🏥 **FHIRBuilders Morning Digest** — [date]

🔥 **Trending this week:**
1. [Title] ([artifact_type]) — [upvotes_last_7_days] upvotes
   "[one_line_description]" — by [builder]
   [url]

2. ...

🆕 **New yesterday ([count] new):**
• [Title] ([artifact_type]) by [builder] — "[description]"
• ...

🛠️ **New OpenClaw Skills ([count]):**
• [Skill name] — "[description]"
  Install: clawhub install fhirbuilders/<skill-slug>

---
Full community → https://fhir-builders.vercel.app/projects
```

If `new_last_24h` is empty, say "Nothing new yesterday — check back tomorrow."
If `trending` is empty, say "No trending projects yet."
If `new_skills` is empty, omit the skills section.

### Step 3 — Log to HEARTBEAT.md

Append to HEARTBEAT.md:
```
## FHIRBuilders Digest — [ISO timestamp]
- Trending: [n] projects
- New last 24h: [n] projects
- New skills: [n] skills
- Digest sent: yes
```

## Error handling

- If the API is unreachable: "⚠️ FHIRBuilders Digest: API unavailable. Skipping today's digest."
- If the API returns an empty response or error: log and skip.
- Do not send an empty digest.

## Manual trigger

When a user says "send me the FHIRBuilders digest", "what's new on FHIRBuilders", or "any new FHIR projects?", run the same logic immediately.

## Examples

**Example 1 — Morning heartbeat**

[7:00 AM heartbeat triggers]

You: [GET {FHIRBUILDERS_API_URL}/projects/digest]
     [finds 2 trending, 3 new, 1 new skill]

Sends:
```
🏥 **FHIRBuilders Morning Digest** — Sunday, March 16

🔥 **Trending this week:**
1. AgentInterOp (Agent) — 12 upvotes
   "A2A JSON-RPC agent gateway for FHIR endpoints" — by Eugene Vestel
   https://fhir-builders.vercel.app/projects

2. FHIR IQ Sandbox MCP (MCP Tool) — 8 upvotes
   "MCP server for querying Medplum sandboxes from Claude" — by Eugene Vestel

🆕 **New yesterday (3 new):**
• CQL Diabetes Bundle (CQL Measure) by Sarah K. — "Pre-built CQL measures for diabetes quality programs"
• SMART Auth Helper (App) by Dev R. — "OAuth 2.0 flow manager for SMART on FHIR apps"
• ADT Notifier (Agent) by Marcus J. — "Real-time ADT notification agent via FHIR subscriptions"

🛠️ **New OpenClaw Skills (1):**
• fhir-care-gap-monitor — "Identify patients with open quality care gaps"
  Install: clawhub install fhirbuilders/fhir-care-gap-monitor

---
Full community → https://fhir-builders.vercel.app/projects
```

---

**Example 2 — Manual trigger**

User: What's new on FHIRBuilders today?

You: [fetch digest API, format and reply inline]
