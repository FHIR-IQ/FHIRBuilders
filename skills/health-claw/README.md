# Health CLAW - OpenClaw Healthcare Skills

A collection of 6 OpenClaw-compatible healthcare agent skills that turn Claude into an always-on health assistant. Built on [SmartHealthConnect](https://github.com/aks129/SmartHealthConnect) with SMART on FHIR integration, MCP guardrails, and PHI redaction.

## What is Health CLAW?

Health CLAW (Connected Longitudinal Agent for Wellness) implements the vision described in ["The Patient Has an Operating System Now"](https://fhirbuilders.com) — giving patients a fully capable, always-on, skills-based AI agent with access to their complete health data.

These skills follow the [OpenClaw Skills specification](https://docs.openclaw.ai/tools/skills) and can be installed into any OpenClaw-compatible agent.

## Skills

| Skill | Description | MCP Tools |
|-------|-------------|-----------|
| [medication-refills](./medication-refills/) | Monitor refill windows, request refills, track timelines | `check_refill_status`, `request_medication_refill`, `get_refill_timeline` |
| [care-completion](./care-completion/) | Track HEDIS care gaps, referrals, overdue screenings | `get_care_completion_summary`, `track_referral`, `get_overdue_items` |
| [diet-exercise](./diet-exercise/) | Log activities, correlate exercise with vitals | `log_activity`, `get_activity_correlations`, `get_diet_exercise_summary` |
| [kids-health](./kids-health/) | CDC immunization schedule, well-child visits, school compliance | `get_immunization_schedule`, `get_wellchild_visits`, `check_school_health_compliance` |
| [healthy-habits](./healthy-habits/) | Health operating picture, habit logging, streaks | `get_health_operating_picture`, `log_habit`, `get_habit_streaks` |
| [research-monitor](./research-monitor/) | Monitor bioRxiv/medRxiv, clinical trials, trial eligibility | `monitor_research_for_conditions`, `get_research_digest`, `check_trial_eligibility` |

## Prerequisites

1. **SmartHealthConnect backend** running (provides the MCP server and API endpoints)
2. **Node.js 18+**
3. **Claude Desktop** or any MCP-compatible client

## Quick Start

```bash
# 1. Clone and start SmartHealthConnect
git clone https://github.com/aks129/SmartHealthConnect.git
cd SmartHealthConnect
npm install
cd mcp-server && npm install && npm run build && cd ..
npm run dev

# 2. Add to Claude Desktop config (~/.config/Claude/claude_desktop_config.json)
```

```json
{
  "mcpServers": {
    "smarthealthconnect": {
      "command": "node",
      "args": ["/path/to/SmartHealthConnect/mcp-server/dist/index.js"],
      "env": {
        "SMARTHEALTHCONNECT_API_URL": "http://localhost:5050",
        "DEMO_PASSWORD": "SmartHealth2025"
      }
    }
  }
}
```

```bash
# 3. Copy skills to your OpenClaw skills directory
cp -r skills/health-claw/* ~/.openclaw/skills/
```

## Architecture

```
Patient <-> Claude (with Health CLAW skills)
                |
                v
         MCP Server (18 tools)
           |         |
           v         v
      FHIR Server   External APIs
      (EHR data)    (NPI, OpenFDA, ClinicalTrials.gov, bioRxiv)
```

Each skill defines:
- **SKILL.md** with YAML frontmatter (name, description, metadata)
- **Behavior instructions** for how the agent should use the tools
- **Safety guidelines** for responsible health data interaction

## Guardrails

All tools run through the MCP guardrails layer which provides:
- **PHI Redaction** — names, identifiers, addresses, and birth dates are masked
- **Audit Logging** — every tool call is logged with timestamp, action, and outcome
- **Human-in-the-Loop** — write operations (refill requests, referrals, journal entries) require explicit confirmation
- **Medical Disclaimers** — clinical data responses include appropriate disclaimers

## Data Sources

| Source | What It Provides |
|--------|-----------------|
| FHIR Server | Patient demographics, conditions, medications, allergies, immunizations, vitals |
| NPI Registry | Provider/specialist search |
| OpenFDA | Drug interactions, adverse events |
| ClinicalTrials.gov | Clinical trial search and eligibility |
| bioRxiv/medRxiv | Medical research preprints |
| HEDIS/CareGaps | Preventive care gap evaluation |
| CDC ACIP | Immunization schedule data |

## Contributing

This is an open project. Contributions welcome:
- Additional skills (insurance navigation, appointment scheduling, etc.)
- State-specific school immunization requirements
- Additional clinical guideline integrations
- Wearable device integrations (Apple Health, Fitbit, Oura)

## License

MIT — See [SmartHealthConnect](https://github.com/aks129/SmartHealthConnect) for full license.
