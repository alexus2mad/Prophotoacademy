#!/usr/bin/env bash
# Build only staging. This command never activates a release or touches production.
set -Eeuo pipefail
[[ "$EUID" == 0 ]] || { echo "Run as root" >&2; exit 2; }
sha="${1:-}"
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || { echo "Expected full Git SHA" >&2; exit 2; }
base=/srv/prophotoacademy-staging
archive="$base/incoming/$sha.tar.gz"
release="$base/releases/$sha"
python3 /usr/local/lib/prophotoacademy/validate-staging.py
[[ -f "$archive" && ! -L "$archive" ]] || { echo "Missing staging archive" >&2; exit 2; }
[[ ! -L "$release" && ! -f "$release/.next/BUILD_ID" ]] || { echo "Never rebuild a completed release" >&2; exit 2; }
[[ "$(readlink -f "$base/current" 2>/dev/null || true)" != "$release" ]] || { echo "Never rebuild the active release" >&2; exit 2; }
exec 9>/run/lock/academy-build.lock
flock -n 9 || { echo "Another Academy build is running" >&2; exit 2; }
install -d -m 750 -o prophotoacademy-staging -g prophotoacademy-staging "$release"
runuser -u prophotoacademy-staging -- tar -xzf "$archive" -C "$release" --no-same-owner
build_env=(PATH=/opt/ps-booking-node/bin:/usr/bin:/bin HOME="$base" NEXT_TELEMETRY_DISABLED=1
    NODE_OPTIONS=--max-old-space-size=2048 npm_config_cache="$base/.cache/npm")
while IFS= read -r line; do
    [[ "$line" =~ ^(NEXT_PUBLIC_[A-Z0-9_]*|CONTENT_MODE|PROPHOTO_SITE)=(.*)$ ]] || continue
    value="${BASH_REMATCH[2]}"; value="${value%\"}"; value="${value#\"}"; value="${value%\'}"; value="${value#\'}"
    build_env+=("${BASH_REMATCH[1]}=$value")
done < /etc/prophotoacademy-staging/runtime.env
systemd-run --quiet --wait --pipe --collect --unit="academy-staging-build-$sha"     --uid=prophotoacademy-staging --gid=prophotoacademy-staging     --working-directory="$release"     -p CPUQuota=100% -p MemoryMax=2200M -p MemorySwapMax=1536M     -p Nice=15 -p NoNewPrivileges=true -p ProtectSystem=strict -p ProtectHome=true     -p PrivateTmp=true -p "ReadWritePaths=$base"     -p "InaccessiblePaths=/srv/prophotoacademy /etc/prophotoacademy"     /usr/bin/env -i "${build_env[@]}" /bin/bash -c     '/opt/ps-booking-node/bin/npm exec --yes --package=pnpm@11.25.0 -- pnpm install --frozen-lockfile && /opt/ps-booking-node/bin/npm exec --yes --package=pnpm@11.25.0 -- pnpm build --webpack'
test -f "$release/.next/BUILD_ID"
echo "Staging build ready: $sha (not activated)"
