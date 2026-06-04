#!/usr/bin/env bash
# slack-post.sh — post a message to a Slack channel via the bot's API.
#
# Usage:
#   export SLACK_BOT_TOKEN=xoxb-...
#
#   # Inline message:
#   bash scripts/slack-post.sh announcements "Quick reminder — see you tonight at 8."
#
#   # From a file (preserves markdown / multi-line cleanly):
#   bash scripts/slack-post.sh announcements --file /tmp/note.md
#
#   # From stdin:
#   cat /tmp/note.md | bash scripts/slack-post.sh announcements -
#
# Multiple channels (will post the same message to each):
#   bash scripts/slack-post.sh "announcements,general" "..."
#
# Slack markdown reminder:
#   *bold*   _italic_   `code`   ```block```   <url|label>   :emoji:

set -euo pipefail

if [[ -z "${SLACK_BOT_TOKEN:-}" ]]; then
  echo "error: SLACK_BOT_TOKEN is not set." >&2
  exit 1
fi

if [[ $# -lt 2 ]]; then
  echo "usage: bash scripts/slack-post.sh <channel[,channel2,...]> <message | --file path | ->" >&2
  exit 1
fi

CHANNELS=$1
shift

if [[ "$1" == "--file" ]]; then
  shift
  [[ -f "$1" ]] || { echo "error: file not found: $1" >&2; exit 1; }
  TEXT=$(cat "$1")
elif [[ "$1" == "-" ]]; then
  TEXT=$(cat)
else
  TEXT="$1"
fi

API="https://slack.com/api"

IFS=',' read -ra CHANNEL_ARRAY <<< "$CHANNELS"
for CH in "${CHANNEL_ARRAY[@]}"; do
  CH=$(echo "$CH" | xargs)  # trim whitespace
  [[ -z "$CH" ]] && continue

  BODY=$(CHANNEL="$CH" TEXT="$TEXT" python3 <<'PYEOF'
import json, os
print(json.dumps({
    "channel": os.environ["CHANNEL"],
    "text": os.environ["TEXT"],
    "unfurl_links": True,
    "unfurl_media": True,
}))
PYEOF
)

  RESP=$(curl -sS -X POST "$API/chat.postMessage" \
    -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
    -H "Content-Type: application/json; charset=utf-8" \
    --data "$BODY")

  OK=$(JSON="$RESP" python3 <<'PYEOF'
import json, os
print(json.loads(os.environ["JSON"]).get("ok"))
PYEOF
)
  if [[ "$OK" == "True" ]]; then
    TS=$(JSON="$RESP" python3 -c '
import json, os
print(json.loads(os.environ["JSON"]).get("ts", ""))
')
    echo "  ✓ #$CH posted (ts $TS)"
  else
    ERR=$(JSON="$RESP" python3 -c '
import json, os
print(json.loads(os.environ["JSON"]).get("error", "?"))
')
    case "$ERR" in
      channel_not_found)
        echo "  ✗ #$CH: channel not found (check name or invite the bot first)" >&2 ;;
      not_in_channel)
        echo "  ✗ #$CH: bot is not in this channel — /invite @YourBotName in Slack" >&2 ;;
      *)
        echo "  ✗ #$CH: $ERR" >&2 ;;
    esac
  fi
done
