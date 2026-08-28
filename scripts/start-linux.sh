#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_NAME="prelegal"
CONTAINER_NAME="prelegal-app"

cd "$REPO_ROOT"

docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true

docker build -t "$IMAGE_NAME" .

ENV_FILE_ARGS=()
if [ -f "$REPO_ROOT/.env" ]; then
  ENV_FILE_ARGS=(--env-file "$REPO_ROOT/.env")
fi

docker run -d \
  --name "$CONTAINER_NAME" \
  -p 8000:8000 \
  "${ENV_FILE_ARGS[@]}" \
  "$IMAGE_NAME"

echo "Prelegal is starting at http://localhost:8000"
xdg-open "http://localhost:8000" >/dev/null 2>&1 || true
