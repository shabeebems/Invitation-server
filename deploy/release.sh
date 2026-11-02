#!/usr/bin/env bash
# Activates an unpacked release on the server. Run from CI as:
#   bash /var/www/invitation-api/releases/<name>/deploy/release.sh
set -euo pipefail

APP_ROOT=/var/www/invitation-api
SHARED_ENV="$APP_ROOT/shared/.env"
HEALTH_URL=http://127.0.0.1:5000/health
KEEP_RELEASES=5
RELEASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ ! -f "$SHARED_ENV" ]; then
  echo "Missing $SHARED_ENV" >&2
  exit 1
fi

cd "$RELEASE_DIR"
ln -sfn "$SHARED_ENV" .env
npm ci --omit=dev --no-audit --no-fund

previous=""
if [ -L "$APP_ROOT/current" ]; then
  previous="$(readlink -f "$APP_ROOT/current")"
fi

activate() {
  ln -sfn "$1" "$APP_ROOT/current.next"
  mv -Tf "$APP_ROOT/current.next" "$APP_ROOT/current"
  pm2 startOrReload "$APP_ROOT/current/deploy/ecosystem.config.cjs" --update-env
}

healthy() {
  for _ in $(seq 1 30); do
    if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  return 1
}

activate "$RELEASE_DIR"

if ! healthy; then
  echo "Health check failed for $(basename "$RELEASE_DIR")" >&2
  pm2 logs invitation-api --lines 40 --nostream >&2 || true

  if [ -n "$previous" ] && [ "$previous" != "$RELEASE_DIR" ]; then
    echo "Rolling back to $(basename "$previous")" >&2
    activate "$previous"
    healthy || echo "Previous release is not healthy either" >&2
  fi

  exit 1
fi

pm2 save >/dev/null

active="$(readlink -f "$APP_ROOT/current")"
find "$APP_ROOT/releases" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
  | sort -rn \
  | tail -n +$((KEEP_RELEASES + 1)) \
  | cut -d' ' -f2- \
  | while read -r dir; do
      [ "$dir" = "$active" ] || rm -rf "$dir"
    done

echo "Deployed $(basename "$RELEASE_DIR")"
