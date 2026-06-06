#!/usr/bin/env bash
# reconcile-cohort-slack.sh — diff Slack workspace against /channels page
#
# Canonical source of truth: fhirbuilders.com/cohort/cohort-00/channels
#
# Default behavior is dry-run — prints the diff between what's in Slack
# and what the public page lists, with no changes. Pass --apply to:
#   • Archive any "extra" channel that isn't in the canonical list
#   • Print the next step for any missing channels (re-run setup script)
#
# Usage:
#   export SLACK_BOT_TOKEN="xoxb-..."
#   bash scripts/reconcile-cohort-slack.sh            # dry-run (default)
#   bash scripts/reconcile-cohort-slack.sh --apply    # archive extras
#
# Safety rails:
#   • #general is never archived (Slack treats it specially; can't be done
#     by bot tokens on most plans).
#   • Any channel matching pod-N is preserved (never archived) on the off
#     chance a builder created one ad-hoc, but we don't create them ourselves
#     — pods live on the website (fhirbuilders.com/cohort/cohort-00/community).
#   • Anything in PROTECTED below is preserved.

set -euo pipefail

APPLY=0
if [[ "${1:-}" == "--apply" ]]; then APPLY=1; fi

if [[ -z "${SLACK_BOT_TOKEN:-}" ]]; then
  echo "error: SLACK_BOT_TOKEN is not set." >&2
  exit 1
fi

API="https://slack.com/api"

# Canonical channel list — must mirror /cohort/cohort-00/channels page exactly.
# No per-pod channels by design; pods coordinate via the website + Monday call.
CANONICAL=(
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

# Never archive these even if they appear as "extras":
PROTECTED=(
  general
  all-fhirbuilders   # paid-plan default
)

slack_post() {
  curl -sS -X POST "${API}/$1" \
    -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" \
    -H "Content-Type: application/json; charset=utf-8" \
    --data "$2"
}

extract_ok() {
  JSON="$1" python3 <<'PYEOF'
import json, os
try:
    print(json.loads(os.environ["JSON"]).get("ok", False))
except Exception:
    print(False)
PYEOF
}

extract_error() {
  JSON="$1" python3 <<'PYEOF'
import json, os
try:
    print(json.loads(os.environ["JSON"]).get("error", ""))
except Exception:
    print("")
PYEOF
}

# Fetch all channels
LIST=$(slack_post conversations.list \
  '{"limit":1000,"types":"public_channel,private_channel","exclude_archived":true}')

LIST_OK=$(extract_ok "$LIST")
if [[ "$LIST_OK" != "True" ]]; then
  echo "error: conversations.list failed: $(extract_error "$LIST")" >&2
  exit 1
fi

# Parse current channel names
CURRENT_NAMES=$(JSON="$LIST" python3 <<'PYEOF'
import json, os
data = json.loads(os.environ["JSON"])
for c in data.get("channels", []):
    n = c.get("name")
    if n:
        print(n)
PYEOF
)

# Build sets
declare -A CANONICAL_SET
for c in "${CANONICAL[@]}"; do CANONICAL_SET[$c]=1; done
declare -A PROTECTED_SET
for c in "${PROTECTED[@]}"; do PROTECTED_SET[$c]=1; done

declare -A CURRENT_SET
while IFS= read -r name; do
  [[ -n "$name" ]] && CURRENT_SET[$name]=1
done <<< "$CURRENT_NAMES"

# Compute MISSING = canonical \ current
MISSING=()
for c in "${CANONICAL[@]}"; do
  if [[ -z "${CURRENT_SET[$c]:-}" ]]; then MISSING+=("$c"); fi
done

# Compute EXTRAS = current \ (canonical ∪ protected ∪ pod-N pattern)
EXTRAS=()
while IFS= read -r name; do
  [[ -z "$name" ]] && continue
  [[ -n "${CANONICAL_SET[$name]:-}" ]] && continue
  [[ -n "${PROTECTED_SET[$name]:-}" ]] && continue
  [[ "$name" =~ ^pod-[0-9]+$ ]] && continue
  EXTRAS+=("$name")
done <<< "$CURRENT_NAMES"

# ─── Report ──────────────────────────────────────────────────────────────────

echo "═══ Current Slack channels ═══"
echo "$CURRENT_NAMES" | sort | sed 's/^/  #/'
echo ""
echo "═══ Canonical (from /cohort/cohort-00/channels) ═══"
for c in "${CANONICAL[@]}"; do echo "  #$c"; done
echo "  (no per-pod channels — pods live on the website)"
echo ""
echo "═══ Diff ═══"

if [[ ${#MISSING[@]} -eq 0 ]]; then
  echo "✓ Missing: none"
else
  echo "  Missing in Slack:"
  for m in "${MISSING[@]}"; do echo "    + #$m"; done
fi

if [[ ${#EXTRAS[@]} -eq 0 ]]; then
  echo "✓ Extras:  none"
else
  echo "  Extra in Slack (not on the page):"
  for e in "${EXTRAS[@]}"; do echo "    - #$e"; done
fi
echo ""

if [[ ${#MISSING[@]} -eq 0 && ${#EXTRAS[@]} -eq 0 ]]; then
  echo "✓ Workspace matches the /channels page. Nothing to do."
  exit 0
fi

if [[ $APPLY -eq 0 ]]; then
  echo "→ Dry-run only. Re-run with --apply to:"
  [[ ${#EXTRAS[@]} -gt 0 ]] && echo "   • archive ${#EXTRAS[@]} extra channel(s)"
  [[ ${#MISSING[@]} -gt 0 ]] && echo "   • see next step for ${#MISSING[@]} missing channel(s)"
  exit 0
fi

# ─── Apply ───────────────────────────────────────────────────────────────────

if [[ ${#EXTRAS[@]} -gt 0 ]]; then
  echo "→ Archiving extras…"
  for name in "${EXTRAS[@]}"; do
    ID=$(JSON="$LIST" NAME="$name" python3 <<'PYEOF'
import json, os
for c in json.loads(os.environ["JSON"]).get("channels", []):
    if c.get("name") == os.environ["NAME"]:
        print(c.get("id", ""))
        break
PYEOF
)
    if [[ -z "$ID" ]]; then
      echo "  ✗ #$name: not found"
      continue
    fi
    RESP=$(slack_post conversations.archive "{\"channel\":\"$ID\"}")
    OK=$(extract_ok "$RESP")
    if [[ "$OK" == "True" ]]; then
      echo "  ✓ #$name archived"
    else
      ERR=$(extract_error "$RESP")
      case "$ERR" in
        cant_archive_general)  echo "  ⚠ #$name: Slack won't let bots archive #general (skip)" ;;
        already_archived)      echo "  ✓ #$name already archived" ;;
        not_in_channel)        echo "  ⚠ #$name: bot must be a member to archive (add bot first)" ;;
        *)                     echo "  ✗ #$name: $ERR" ;;
      esac
    fi
  done
  echo ""
fi

if [[ ${#MISSING[@]} -gt 0 ]]; then
  echo "→ ${#MISSING[@]} channel(s) missing. Run the setup script to create them:"
  echo ""
  echo "    bash scripts/setup-cohort-slack.sh"
  echo ""
  echo "   (idempotent — channels that already exist are skipped)"
fi
