#!/usr/bin/env bash
# Build an Academy release on the server, as the application account.
# Mirrors the Hetzner build-release.py: build-time env = NEXT_PUBLIC_*, CONTENT_MODE, PROPHOTO_SITE.
set -Eeuo pipefail
sha="$1"; archive="$2"
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || { echo "Expected full SHA" >&2; exit 2; }
release=/srv/prophotoacademy/releases/$sha
[[ ! -L "$release" && ! -f "$release/.next/BUILD_ID" ]] || { echo "Never rebuild a completed production release" >&2; exit 2; }
[[ "$(readlink -f /srv/prophotoacademy/current)" != "$release" ]] || exit 2
exec 9>/run/lock/academy-build.lock
flock -n 9 || { echo "Another Academy build is running" >&2; exit 2; }
if [[ ! -d "$release" ]]; then
    install -d -m 750 -o prophotoacademy -g prophotoacademy "$release"
    runuser -u prophotoacademy -- tar -xzf "$archive" -C "$release" --no-same-owner
fi
build_env=(PATH=/opt/ps-booking-node/bin:/usr/bin:/bin HOME=/srv/prophotoacademy NEXT_TELEMETRY_DISABLED=1
    NODE_OPTIONS=--max-old-space-size=2048 npm_config_cache=/srv/prophotoacademy/.cache/npm)
while IFS= read -r line; do
    [[ "$line" =~ ^(NEXT_PUBLIC_[A-Z0-9_]*|CONTENT_MODE|PROPHOTO_SITE)=(.*)$ ]] || continue
    value="${BASH_REMATCH[2]}"; value="${value%\"}"; value="${value#\"}"; value="${value%\'}"; value="${value#\'}"
    build_env+=("${BASH_REMATCH[1]}=$value")
done < /etc/prophotoacademy/runtime.env
pnpm=(/opt/ps-booking-node/bin/npm exec --yes --package=pnpm@11.25.0 -- pnpm)
cd "$release"
runuser -u prophotoacademy -- env -i "${build_env[@]}" nice -n 10 "${pnpm[@]}" install --frozen-lockfile
runuser -u prophotoacademy -- env -i "${build_env[@]}" nice -n 10 "${pnpm[@]}" build --webpack
test -f "$release/.next/BUILD_ID"
echo "Release build complete: $sha"
