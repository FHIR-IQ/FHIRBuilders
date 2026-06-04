#!/usr/bin/env bash
# setup-cohort-slack.sh — idempotent one-shot setup for the Cohort 00 Slack workspace.
#
# Creates the 10 cohort-wide channels, sets topics + purposes, posts the
# pinned welcome message in each, and pins it. Safe to re-run — channels
# that already exist are skipped and only missing pieces are added.
#
# What this script CAN do (with the bot scopes below):
#   - Create public + private channels
#   - Set channel topic + purpose
#   - Post messages
#   - Pin messages
#
# What this script CANNOT do on a standard Slack plan:
#   - Invite external users to the workspace by email (admin/SCIM-gated).
#     Builders join via the workspace shared-invite URL — already in their
#     email from the Cohort 00 invite blast.
#
# ─── REQUIRED SETUP ──────────────────────────────────────────────────────────
#
# 1. api.slack.com/apps → Create New App → From scratch
#      Name: "FHIRBuilders Cohort Bot"
#      Workspace: fhirbuilders
#
# 2. Sidebar: OAuth & Permissions → "Bot Token Scopes" → add:
#      channels:manage       channels:read         chat:write
#      chat:write.public     groups:write          groups:read
#      pins:write            users:read
#
# 3. "Install to Workspace" → copy the Bot User OAuth Token (xoxb-…)
#
# 4. Export the token in your shell and run:
#      export SLACK_BOT_TOKEN="xoxb-..."
#      bash scripts/setup-cohort-slack.sh
#
# Optional: --dry-run prints the planned actions without hitting the API.
#
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

DRY_RUN=0
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=1
  echo "→ DRY RUN — no API calls will be made"
fi

if [[ -z "${SLACK_BOT_TOKEN:-}" && $DRY_RUN -eq 0 ]]; then
  echo "error: SLACK_BOT_TOKEN is not set."
  echo "       See the comment block at the top of this script for setup."
  exit 1
fi

API="https://slack.com/api"
WORKSHOP_AGENDA_URL="https://fhiriq.com/workshop-agenda"
COHORT_HOME_URL="https://fhirbuilders.com/cohort/cohort-00"
CHANNELS_DIR_URL="https://fhirbuilders.com/cohort/cohort-00/channels"
PREREQS_URL="https://fhirbuilders.com/cohort/cohort-00/prereqs"

# ─── API helpers ─────────────────────────────────────────────────────────────

slack_post() {
  # slack_post <method> <json_body>
  local method=$1
  local body=$2
  curl -sS -X POST "${API}/${method}" \
    -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" \
    -H "Content-Type: application/json; charset=utf-8" \
    --data "${body}"
}

create_channel() {
  # create_channel <name> <is_private(true|false)>
  # Returns channel ID on stdout. Exits with 0 even if channel exists.
  local name=$1
  local is_private=${2:-false}

  if [[ $DRY_RUN -eq 1 ]]; then
    echo "DRY-${name}"
    return 0
  fi

  local resp
  resp=$(slack_post conversations.create \
    "{\"name\":\"${name}\",\"is_private\":${is_private}}")

  local ok
  ok=$(echo "$resp" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('ok'))")

  if [[ "$ok" == "True" ]]; then
    echo "$resp" | python3 -c "import sys,json;print(json.load(sys.stdin)['channel']['id'])"
    return 0
  fi

  local err
  err=$(echo "$resp" | python3 -c "import sys,json;print(json.load(sys.stdin).get('error',''))")

  if [[ "$err" == "name_taken" ]]; then
    # Look up the existing channel by name
    local list
    list=$(slack_post conversations.list \
      '{"limit":1000,"types":"public_channel,private_channel","exclude_archived":true}')
    echo "$list" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for c in data.get('channels', []):
    if c.get('name') == '${name}':
        print(c.get('id'))
        sys.exit(0)
sys.exit(1)
"
    return 0
  fi

  echo "  ✗ create_channel '${name}' failed: ${err}" >&2
  return 1
}

set_topic_and_purpose() {
  local id=$1
  local topic=$2
  local purpose=$3
  [[ $DRY_RUN -eq 1 ]] && return 0

  slack_post conversations.setTopic \
    "$(python3 -c "import json; print(json.dumps({'channel':'${id}','topic':'''${topic}'''}))")" >/dev/null
  slack_post conversations.setPurpose \
    "$(python3 -c "import json; print(json.dumps({'channel':'${id}','purpose':'''${purpose}'''}))")" >/dev/null
}

post_and_pin() {
  local id=$1
  local text=$2
  [[ $DRY_RUN -eq 1 ]] && return 0

  local resp ts ok
  resp=$(slack_post chat.postMessage \
    "$(python3 -c "import json,sys; print(json.dumps({'channel':'${id}','text':'''${text}'''}))")")
  ok=$(echo "$resp" | python3 -c "import sys,json;print(json.load(sys.stdin).get('ok'))")
  if [[ "$ok" != "True" ]]; then
    local err
    err=$(echo "$resp" | python3 -c "import sys,json;print(json.load(sys.stdin).get('error',''))")
    echo "    ✗ postMessage failed: ${err}" >&2
    return 1
  fi
  ts=$(echo "$resp" | python3 -c "import sys,json;print(json.load(sys.stdin)['ts'])")

  slack_post pins.add \
    "{\"channel\":\"${id}\",\"timestamp\":\"${ts}\"}" >/dev/null
}

# ─── Channel definitions ─────────────────────────────────────────────────────
# Format: name|is_private|topic|purpose|pinned_message
# Use \n in messages for line breaks (printf %b expands).

declare -a CHANNELS=(

"announcements|false|\
Read-only. Eugene posts session recaps + schedule.|\
Eugene-only posts: session recaps, schedule changes, pinned reminders.|\
📌 *Pinned: Cohort 00 schedule*\n\n\
📅 Mon Jun 8, 1 PM ET — Session 1 (Setup)\n\
📅 Mon Jun 15, 1 PM ET — Session 2 (MCP + vector DB)\n\
📅 Mon Jun 22, 1 PM ET — Session 3 (FHIR-native workflows)\n\
📅 Mon Jun 29, 1 PM ET — Session 4 (Ship one real slice) ⚠️ Mandatory live\n\
📅 Fri Jul 3, 1 PM ET — Session 5 (Demo Day) ⚠️ Mandatory live\n\n\
Recordings posted in #demos within 24h of each session.\n\
Full calendar: ${COHORT_HOME_URL}/calendar"

"general|false|\
Open chat. Threads encouraged. No program questions — use #help-*.|\
Open chat — intros, FYIs, water-cooler stuff that isn't pod-specific.|\
👋 *Welcome to FHIR IQ Cohort 00.*\n\n\
This is the room I told you about — 14 builders, 6 weeks, 5 sessions, one demo day.\n\n\
*How we use Slack:*\n\
• #announcements — session recaps from me (read-only)\n\
• #general — open chat (you're here)\n\
• #wins — celebrate small ships\n\
• #ship-log — your Friday written reports\n\
• #demos — Friday demos + recordings\n\
• #help-build, #help-fhir — ask in public, help the next builder\n\
• #workshops — drop-in Wed sessions\n\
• #pod-* — your private pod channel (Fri Jun 5 EOD)\n\n\
*Two rules that matter:*\n\
1. Default-public. No DMs to me for program questions.\n\
2. Each channel has one job. If it can wait 4 hours, it goes in Slack — not WhatsApp.\n\n\
Bookmark the full channel map: ${CHANNELS_DIR_URL}\n\
Cohort home: ${COHORT_HOME_URL}\n\
Pre-flight checklist: ${PREREQS_URL}\n\
Workshop agenda: ${WORKSHOP_AGENDA_URL}\n\n\
See you Mon Jun 8 at 1 PM ET for Session 1.\n\n— Eugene"

"wins|false|\
Small celebrations. First deploy, first FHIR read, first mentor-approved commit.|\
Small celebrations — small wins, big effect. React don't moderate.|\
🎉 *Small celebrations land here.*\n\n\
✅ First commit pushed\n\
✅ First Medplum login\n\
✅ First FHIR read deployed\n\
✅ Mentor 👍'd your code\n\
✅ Pod-mate unblocked you\n\n\
Low bar to post. React don't moderate."

"ship-log|false|\
Friday written report-outs. Auto-cross-posted from ${COHORT_HOME_URL}/reflect.|\
Your written Friday report-outs cross-posted from /reflect.|\
📝 *Friday written reports cross-post here.*\n\n\
Submit your reflection at:\n\
👉 ${COHORT_HOME_URL}/reflect\n\n\
*Three prompts, five sentences minimum:*\n\
1. What you shipped\n\
2. What got stuck\n\
3. What you'd ask the group\n\n\
These roll up to the public Cohort 00 ship log on fhirbuilders.com/showcase/cohort-00."

"demos|false|\
Friday demos. Recording link drops within 24h of each call.|\
Friday live demo prep + recordings + post-demo discussion.|\
🎥 *Friday demos + recordings live here.*\n\n\
Every Friday at 1 PM ET each pod shows what they shipped:\n\
• 90-second pitch\n\
• 3-minute demo\n\
• 2-minute Q&A with the senior leader on call\n\n\
Recording link drops in this channel within 24h."

"help-build|false|\
Claude Code, MCP, Git, GitHub, Vercel, env vars. Default-public. Code blocks for errors.|\
Claude Code, agent loops, MCP, Git, GitHub, Vercel, env vars, build errors.|\
👋 *Ask anything here:* Claude Code, MCP, Git, GitHub, Vercel.\n\n\
*When you post an error, include:*\n\
• What you ran (code block)\n\
• What you expected\n\
• What happened (paste the actual error, not paraphrase)\n\
• OS + Node version if relevant\n\n\
Help is a thread sport — start the question in the channel, follow up in the thread."

"help-fhir|false|\
FHIR resources, Medplum, terminology, SMART. Mention FHIR version + server in first message.|\
FHIR resources, Medplum, HAPI, terminology, SMART on FHIR, search params.|\
👋 *FHIR questions land here.*\n\n\
*When you post:*\n\
• FHIR version (R4 / R5 / R6)\n\
• Server you're hitting (Medplum sandbox, HAPI public, Aidbox)\n\
• Resource type + a real example payload if possible\n\n\
*Useful starters:*\n\
• Medplum docs → https://www.medplum.com/docs\n\
• HAPI public test → https://hapi.fhir.org\n\
• FHIRBuilders sandbox → https://fhirbuilders.com/sandbox/demo"

"workshops|false|\
Drop-in Wed workshops. Each scheduled workshop gets a pinned thread.|\
Coordination + recordings for the drop-in Wed workshops.|\
🎓 *Drop-in workshops — Wednesdays at noon ET between main sessions.*\n\n\
*Scheduled so far:*\n\
• Wed Jun 17 — Claude Code + FHIR R6 (Eugene)\n\
• Wed Jun 24 — CQL → SQL on FHIR (Eugene)\n\
• Wed Jul 1 — Voice agents (guest TBD)\n\n\
Full list: ${COHORT_HOME_URL}/workshops"

"random|false|\
Off-topic. Don't ask program questions here.|\
Off-topic. Memes, side-projects, healthcare news.|\
👋 *Off-topic lives here.* Memes, side-projects, healthcare news.\n\n\
*Don't ask program questions here* — use #help-build or #help-fhir.\n\
If you DM me, you rob the cohort of the answer."

"mentors|true|\
Mentor-only coordination + calibration.|\
Private channel for the 5 pod mentors + Eugene.|\
👋 *Mentor coordination lives here.*\n\n\
*Cadence:*\n\
• 30-min mentor sync every Friday at 12 PM ET (right before the cohort demo)\n\
• Async check-ins in this channel as needed\n\
• Pod calibration after Session 1\n\n\
*Your weekly commitment:*\n\
• One 45-min pod call/week (you pick the time with your pod)\n\
• Async Slack triage in your pod channel\n\n\
Pod assignments + mentor pairings drop Fri Jun 5 EOD."

)

# ─── Main loop ───────────────────────────────────────────────────────────────

echo "→ Setting up Cohort 00 Slack workspace"
echo "  Token: ${SLACK_BOT_TOKEN:0:12}…"
echo ""

for entry in "${CHANNELS[@]}"; do
  name=$(echo "$entry"      | cut -d'|' -f1)
  is_private=$(echo "$entry" | cut -d'|' -f2)
  topic=$(echo "$entry"     | cut -d'|' -f3)
  purpose=$(echo "$entry"   | cut -d'|' -f4)
  pin_message=$(echo "$entry" | cut -d'|' -f5)

  echo "→ #${name}"
  id=$(create_channel "$name" "$is_private") || continue
  echo "    id: ${id}"

  set_topic_and_purpose "$id" "$topic" "$purpose"
  echo "    ✓ topic + purpose set"

  # Expand \n escape sequences for the welcome message
  expanded=$(printf '%b' "$pin_message")
  post_and_pin "$id" "$expanded"
  echo "    ✓ welcome posted + pinned"
  echo ""
done

echo "✓ Done."
echo ""
echo "Next manual steps in Slack admin UI:"
echo "  1. #announcements → Settings → Posting permissions → Specific people → only you"
echo "  2. Workspace settings → Default channels for new joiners:"
echo "     #general, #announcements, #help-build"
echo "  3. Workspace icon + name: FHIRBuilders Cohort 00"
echo ""
echo "Pod channels (#pod-1 … #pod-5) get created Fri Jun 5 EOD after pod assignment."
echo "Rerun this script anytime — already-created channels are detected + skipped."
