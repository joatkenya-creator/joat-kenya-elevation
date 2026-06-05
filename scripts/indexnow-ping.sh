#!/usr/bin/env bash
# Ping the IndexNow API after a deploy so Bing / Yandex / Naver / Seznam /
# Mojeek re-crawl joatkenya.com immediately (instead of waiting days).
#
# Usage:
#   bash scripts/indexnow-ping.sh             # ping the sitemap roots
#   bash scripts/indexnow-ping.sh /news/X     # ping a specific path
#
# The IndexNow protocol works for: Bing (which feeds ChatGPT Search,
# Perplexity, You.com, DuckDuckGo, Copilot), Yandex, Naver, Seznam,
# Mojeek and others. Submitting once pings every participating engine.

set -euo pipefail

HOST="joatkenya.com"
KEY="5ceed5108110e5cbf985ad0c264fc4bcda5508720d7145cfd5328e6a74a0c979"
KEY_LOCATION="https://${HOST}/${KEY}.txt"

if [ "$#" -gt 0 ]; then
  # Custom paths passed as args
  URLS=()
  for path in "$@"; do
    URLS+=("\"https://${HOST}${path}\"")
  done
else
  # Default sweep — everything that's in the sitemap plus the article hub
  URLS=(
    "\"https://${HOST}/\""
    "\"https://${HOST}/about\""
    "\"https://${HOST}/services\""
    "\"https://${HOST}/products\""
    "\"https://${HOST}/careers\""
    "\"https://${HOST}/articles\""
    "\"https://${HOST}/contact\""
    "\"https://${HOST}/work-with-us\""
    "\"https://${HOST}/llms.txt\""
    "\"https://${HOST}/llms-full.txt\""
  )
fi

URL_LIST=$(IFS=,; echo "${URLS[*]}")

PAYLOAD="{\"host\":\"${HOST}\",\"key\":\"${KEY}\",\"keyLocation\":\"${KEY_LOCATION}\",\"urlList\":[${URL_LIST}]}"

echo "Pinging IndexNow with ${#URLS[@]} URL(s)..."
echo "${PAYLOAD}" | jq -c . 2>/dev/null || echo "${PAYLOAD}"

curl -sS -X POST "https://api.indexnow.org/IndexNow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "${PAYLOAD}" \
  -o /tmp/indexnow.response \
  -w "HTTP %{http_code}\n"

cat /tmp/indexnow.response 2>/dev/null || true
echo
echo "Done. 200 = success, 202 = accepted/queued."
