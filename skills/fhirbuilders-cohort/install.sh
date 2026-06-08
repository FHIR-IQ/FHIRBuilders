#!/usr/bin/env bash
#
# install.sh — copy the FHIRBuilders cohort skills into a Claude Code skills dir.
#
# Usage:
#   bash skills/fhirbuilders-cohort/install.sh --personal        # ~/.claude/skills
#   bash skills/fhirbuilders-cohort/install.sh --project         # ./.claude/skills
#   bash skills/fhirbuilders-cohort/install.sh --personal --dry-run
#
# This is the manual fallback. The recommended path is the plugin marketplace:
#   /plugin marketplace add fhir-iq/fhirbuilders
#   /plugin install fhirbuilders-cohort@fhirbuilders
#
set -euo pipefail

SCOPE=""
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --personal) SCOPE="personal" ;;
    --project)  SCOPE="project" ;;
    --dry-run)  DRY_RUN=1 ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *)
      echo "Unknown argument: $arg" >&2
      echo "Use --personal or --project (optionally --dry-run)." >&2
      exit 1 ;;
  esac
done

if [[ -z "$SCOPE" ]]; then
  echo "Pick a scope: --personal (~/.claude/skills) or --project (./.claude/skills)." >&2
  exit 1
fi

# Resolve the directory that holds this script's skills/ subtree.
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/skills" && pwd)"

if [[ "$SCOPE" == "personal" ]]; then
  DEST_DIR="$HOME/.claude/skills"
else
  DEST_DIR="$(pwd)/.claude/skills"
fi

echo "FHIRBuilders cohort skills installer"
echo "  source: $SRC_DIR"
echo "  dest:   $DEST_DIR"
echo "  scope:  $SCOPE${DRY_RUN:+ (dry-run)}"
echo

for skill in "$SRC_DIR"/*/; do
  name="$(basename "$skill")"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "would copy: $name -> $DEST_DIR/$name"
  else
    mkdir -p "$DEST_DIR"
    cp -R "$skill" "$DEST_DIR/$name"
    echo "installed: $name"
  fi
done

echo
if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "Dry run only — nothing copied. Re-run without --dry-run to install."
else
  echo "Done. Skills are picked up in the current Claude Code session (no restart)."
  echo "Try: /security-review (built-in) vs the cohort secrets+PHI pass in this pack."
fi
