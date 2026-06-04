#!/usr/bin/env bash
# slack-invite-self.sh — invites a Slack user to all 10 Cohort 00 channels.
#
# Slack hides channels you're not a member of in the sidebar. The setup
# script creates the channels but the bot is the only initial member.
# Run this once with your Slack member ID to add yourself everywhere.
#
# How to find your Slack member ID:
#   Slack → click your avatar (top-right) → Profile
#   → three-dot ⋮ "More" menu → "Copy member ID"
#   Looks like U01ABC23DEF
#
# Usage:
#   export SLACK_BOT_TOKEN="xoxb-..."
#   export SLACK_USER_ID="U01ABC23DEF"
#   bash scripts/slack-invite-self.sh
#
#   # Also takes the user ID as the first arg:
#   bash scripts/slack-invite-self.sh U01ABC23DEF

set -euo pipefail

USER_ID="${SLACK_USER_ID:-${1:-}}"

if [[ -z "${SLACK_BOT_TOKEN:-}" ]]; then
  echo "error: SLACK_BOT_TOKEN is not set." >&2
  exit 1
fi
if [[ -z "${USER_ID}" ]]; then
  echo "error: SLACK_USER_ID is not set (or pass as first arg)." >&2
  echo "       Find yours: Slack → Profile → three-dot ⋮ More → Copy member ID" >&2
  exit 1
fi

API="https://slack.com/api"

CHANNELS=(
  announcements
  general
  wins
  ship-log
  demos
  help-build
  help-fhir
  workshops
  random
  mentors
)

slack_post() {
  curl -sS -X POST "${API}/$1" \
    -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" \
    -H "Content-Type: application/json; charset=utf-8" \
    --data "$2"
}

# Fetch all channels once, then look up IDs locally.
echo "→ Fetching channel list…"
LIST=$(slack_post conversations.list \
  '{"limit":1000,"types":"public_channel,private_channel","exclude_archived":true}')

LIST_OK=$(JSON="$LIST" python3 <<'PYEOF'
import json, os
try:
    print(json.loads(os.environ["JSON"]).get("ok", False))
except Exception:
    print(False)
PYEOF
)

if [[ "$LIST_OK" != "True" ]]; then
  echo "  ✗ conversations.list failed:" >&2
  JSON="$LIST" python3 <<'PYEOF' >&2
import json, os
print(json.loads(os.environ["JSON"]).get("error", "(no error field)"))
PYEOF
  exit 1
fi

echo "→ Inviting ${USER_ID} to ${#CHANNELS[@]} channels"
echo ""

for name in "${CHANNELS[@]}"; do
  CHANNEL_ID=$(JSON="$LIST" NAME="$name" python3 <<'PYEOF'
import json, os
for c in json.loads(os.environ["JSON"]).get("channels", []):
    if c.get("name") == os.environ["NAME"]:
        print(c.get("id", ""))
        break
PYEOF
)

  if [[ -z "$CHANNEL_ID" ]]; then
    echo "→ #${name}  ✗ not found (re-run setup-cohort-slack.sh first?)"
    continue
  fi

  BODY=$(CHANNEL="$CHANNEL_ID" USER="$USER_ID" python3 <<'PYEOF'
import json, os
print(json.dumps({"channel": os.environ["CHANNEL"], "users": os.environ["USER"]}))
PYEOF
)

  RESP=$(slack_post conversations.invite "$BODY")
  OK=$(JSON="$RESP" python3 <<'PYEOF'
import json, os
print(json.loads(os.environ["JSON"]).get("ok", False))
PYEOF
)

  if [[ "$OK" == "True" ]]; then
    echo "→ #${name}  ✓ invited"
  else
    ERR=$(JSON="$RESP" python3 <<'PYEOF'
import json, os
print(json.loads(os.environ["JSON"]).get("error", "?"))
PYEOF
)
    case "$ERR" in
      already_in_channel) echo "→ #${name}  ✓ already a member" ;;
      cant_invite_self)   echo "→ #${name}  ⚠ bot can't invite itself (expected if you used the bot's ID)" ;;
      *)                  echo "→ #${name}  ✗ ${ERR}" ;;
    esac
  fi
done

echo ""
echo "✓ Done. Reload Slack (Cmd-R) and the channels should now show in your sidebar."
