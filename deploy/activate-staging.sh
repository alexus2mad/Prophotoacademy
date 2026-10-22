#!/usr/bin/env bash
# Activate an already-built staging release, with health-gated rollback.
set -Eeuo pipefail
[[ "$EUID" == 0 ]] || exit 2
sha="${1:-}"
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || exit 2
base=/srv/prophotoacademy-staging
release="$base/releases/$sha"
python3 /usr/local/lib/prophotoacademy/validate-staging.py
[[ -d "$release" && ! -L "$release" && -f "$release/.next/BUILD_ID" ]] || exit 2
[[ "$(realpath "$release")" == "$release" ]] || exit 2
exec 9>/run/lock/academy-staging-deploy.lock
flock -n 9 || exit 2
previous=""; if [[ -L "$base/current" ]]; then previous="$(readlink -f "$base/current")"; fi
ln -s "$release" "$base/current.next"
mv -Tf "$base/current.next" "$base/current"
systemctl restart prophotoacademy-staging
healthy=0
for attempt in {1..20}; do
    if curl --fail --silent --max-time 5 http://127.0.0.1:3141/api/health | python3 -c 'import json,sys; sys.exit(0 if json.load(sys.stdin).get("ok") is True else 1)' 2>/dev/null; then
        healthy=1; break
    fi
    sleep 2
done
if [[ "$healthy" != 1 ]]; then
    if [[ -n "$previous" && -f "$previous/.next/BUILD_ID" ]]; then
        ln -s "$previous" "$base/current.rollback"
        mv -Tf "$base/current.rollback" "$base/current"
        systemctl restart prophotoacademy-staging
    else
        systemctl stop prophotoacademy-staging
    fi
    echo "Staging health check failed; production was not touched" >&2
    exit 1
fi
systemctl enable prophotoacademy-staging
echo "Staging active: $sha; previous: ${previous:-none}"
