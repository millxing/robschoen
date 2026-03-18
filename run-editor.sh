#!/bin/zsh

set -euo pipefail

SCRIPT_DIR="${0:A:h}"
URL="http://127.0.0.1:4173/post-studio.html"

cd "$SCRIPT_DIR"

echo "Starting the Site Editor..."
echo "Opening $URL"

node tools/post_studio_server.mjs &
SERVER_PID=$!

cleanup() {
  if kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

for _ in {1..50}; do
  if curl -fsS "http://127.0.0.1:4173/api/site-content" >/dev/null 2>&1; then
    break
  fi
  sleep 0.1
done

if command -v open >/dev/null 2>&1; then
  open "$URL"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" >/dev/null 2>&1 &
else
  echo "Browser could not be opened automatically."
  echo "Open $URL"
fi

wait "$SERVER_PID"
