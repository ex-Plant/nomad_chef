#!/usr/bin/env bash
# Tails the Vercel deployment triggered by the current `git push` and prints
# its state until READY / ERROR / CANCELED.
#
# Started (backgrounded) from .husky/pre-push, which runs BEFORE git transmits
# the push — so the newest deployment at startup is the PRE-push one. We capture
# that as the baseline, then wait for a newer deployment (the one this push
# creates on Vercel via the Git integration) and report its state transitions.
#
# Reads projectId/orgId from .vercel/project.json, so it's project-agnostic.
# Run as:  ( bash scripts/watch-deploy.sh & )   — detached so push returns.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .vercel/project.json ]; then
  echo "watch-deploy: .vercel/project.json missing — run 'vercel link' first" >&2
  exit 1
fi

PROJECT_ID="$(jq -r .projectId .vercel/project.json)"
TEAM_ID="$(jq -r .orgId .vercel/project.json)"
API_PATH="/v6/deployments?projectId=$PROJECT_ID&teamId=$TEAM_ID&limit=1"

# `vercel api` (beta) prints a banner to stderr on every call — drop it so only
# the JSON reaches jq and the banner doesn't flood the terminal.
fetch() { vercel api --raw "$API_PATH" 2>/dev/null; }

# Baseline: the latest deployment that exists right now, i.e. BEFORE this push
# has created a new one. We then watch for a uid different from this.
baseline_uid="$(fetch | jq -r '.deployments[0].uid')"
prev_state=""
attempts=0
MAX_ATTEMPTS=90 # ~15 min (90 × 10s) then give up, so this can never hang forever

# NOTE: do NOT name the read target UID — it's a read-only bash builtin, and with
# `set -e` the failed assignment would kill the watcher on the first iteration.
while [ "$attempts" -lt "$MAX_ATTEMPTS" ]; do
  attempts=$((attempts + 1))
  IFS=$'\t' read -r dep_uid STATE URL < <(
    fetch | jq -r '.deployments[0] | "\(.uid)\t\(.state)\t\(.url)"'
  )
  if [ -n "$dep_uid" ] && [ "$dep_uid" != "$baseline_uid" ]; then
    if [ "$STATE" != "$prev_state" ]; then
      echo "  vercel: $STATE  https://$URL"
      prev_state="$STATE"
    fi
    case "$STATE" in
      READY) exit 0 ;;
      ERROR | CANCELED) exit 1 ;;
    esac
  fi
  sleep 10
done

echo "  vercel: watch-deploy gave up after ~15 min without a terminal state" >&2
exit 1
