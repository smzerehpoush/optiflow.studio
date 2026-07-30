#!/usr/bin/env bash
# Deploy the static site to production.
#
# Connection details come from .env.deploy (gitignored, not committed) or
# from the environment. Copy .env.deploy.example to .env.deploy and fill in
# your server once; after that just run ./deploy.sh.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

if [ -f .env.deploy ]; then
  # shellcheck source=/dev/null
  source .env.deploy
fi

: "${DEPLOY_HOST:?Set DEPLOY_HOST (e.g. user@host) in .env.deploy or the environment — see .env.deploy.example}"
DEPLOY_PATH="${DEPLOY_PATH:-/srv/optiflow-studio/}"
SITE_URL="${SITE_URL:-https://optiflow.studio/}"

if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
  echo "Warning: uncommitted changes present — deploying the working tree as-is." >&2
fi

echo "Deploying to ${DEPLOY_HOST}:${DEPLOY_PATH} ..."
rsync -avz index.html style.css main.js "${DEPLOY_HOST}:${DEPLOY_PATH}"

echo "Verifying ${SITE_URL} ..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 15 "$SITE_URL")
echo "HTTP ${CODE}"
if [ "$CODE" != "200" ]; then
  echo "Warning: expected HTTP 200 from ${SITE_URL}, got ${CODE}" >&2
  exit 1
fi
echo "Deployed."
