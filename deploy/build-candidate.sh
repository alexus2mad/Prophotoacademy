#!/usr/bin/env bash
# Produce a Linux release artifact. Never activate a release or read runtime secrets.
set -Eeuo pipefail
umask 027

fail() { printf '%s\n' "$*" >&2; exit 2; }
[[ "$EUID" == 0 ]] || fail 'Run as root'
[[ "$#" == 1 && "$1" =~ ^[0-9a-f]{40}$ ]] || fail 'Usage: build-candidate.sh FULL_GIT_SHA'
readonly sha="$1" base=/srv/prophotoacademy-build builder=prophotoacademy-staging
readonly archive="$base/incoming/$sha.tar.gz" public_env="$base/incoming/$sha.public.env"
readonly candidate="$base/$sha" artifact="$base/output/$sha.tar.gz"
readonly node_bin=/opt/ps-booking-node/bin

for command in python3 systemd-run runuser flock tar sha256sum; do
    command -v "$command" >/dev/null || fail "Missing command: $command"
done
[[ -x "$node_bin/node" && -x "$node_bin/npm" ]] || fail 'Missing approved Node installation'
id "$builder" >/dev/null 2>&1 || fail 'Missing isolated build account'
exec 9>/run/lock/academy-build.lock
flock -n 9 || fail 'Another Academy build is running'

# Validate all input before creating a writable build tree. The incoming directory
# and files must be root-owned, so the build account cannot replace validated input.
python3 - "$sha" "$base" <<'PY'
import os
from pathlib import Path, PurePosixPath
import re
import sys
import tarfile

sha, base = sys.argv[1], Path(sys.argv[2])
def reject(message):
    raise SystemExit(message)

for directory in (base.parent, base, base / 'incoming'):
    if not directory.is_dir() or directory.resolve() != directory:
        reject(f'Expected a canonical directory: {directory}')
    info = directory.stat()
    if info.st_uid != 0 or info.st_mode & 0o022:
        reject(f'Directory must be root-owned and not group/world writable: {directory}')

for suffix in ('.tar.gz', '.public.env'):
    file = base / 'incoming' / (sha + suffix)
    if file.is_symlink() or not file.is_file():
        reject(f'Expected a regular input file: {file}')
    info = file.stat()
    if info.st_uid != 0 or info.st_mode & 0o022:
        reject(f'Input must be root-owned and not group/world writable: {file}')

for target in (base / sha, base / 'output' / (sha + '.tar.gz')):
    if os.path.lexists(target):
        reject(f'Never overwrite a candidate or artifact: {target}')
output = base / 'output'
if os.path.lexists(output):
    if not output.is_dir() or output.resolve() != output or output.stat().st_uid != 0 or output.stat().st_mode & 0o022:
        reject('Output directory must be canonical, root-owned and not group/world writable')

seen = set()
environment = (base / 'incoming' / (sha + '.public.env')).read_bytes().decode('utf-8')
if len(environment.encode()) > 32768:
    reject('Public environment file is unexpectedly large')
if '\r' in environment.replace('\r\n', '') or any(ord(char) < 32 and char not in '\r\n' for char in environment):
    reject('Invalid control character in public environment file')
for number, line in enumerate(environment.splitlines(), 1):
    line = line.strip()
    if not line or line.startswith('#'):
        continue
    match = re.fullmatch(r'(NEXT_PUBLIC_[A-Z0-9_]+|CONTENT_MODE|PROPHOTO_SITE)=(.*)', line)
    if not match or any(ord(char) < 32 or ord(char) == 127 for char in line):
        reject(f'Invalid or non-public environment entry on line {number}')
    key, value = match.groups()
    if key in seen:
        reject(f'Duplicate public environment key: {key}')
    seen.add(key)
    if value.startswith(('"', "'")) and (len(value) < 2 or value[-1] != value[0]):
        reject(f'Unclosed environment quote on line {number}')

with tarfile.open(base / 'incoming' / (sha + '.tar.gz'), 'r:gz') as archive:
    if archive.pax_headers.get('comment') != sha:
        reject('Archive must come from git archive of the supplied commit, without a path prefix')
    names = set()
    for member in archive:
        path = PurePosixPath(member.name)
        if path.is_absolute() or '..' in path.parts or '\\' in member.name:
            reject(f'Unsafe archive path: {member.name}')
        if not (member.isfile() or member.isdir()):
            reject(f'Source archive may not contain links or special files: {member.name}')
        if path.parts and path.parts[0] in {'.git', '.data', '.next', 'node_modules', '.cache'}:
            reject(f'Generated or private source path: {member.name}')
        if any(part.startswith('.env') and part != '.env.example' for part in path.parts):
            reject(f'Environment files may not enter the source archive: {member.name}')
        if member.name in names:
            reject(f'Duplicate archive member: {member.name}')
        names.add(member.name)
    if not {'package.json', 'pnpm-lock.yaml', 'next.config.ts', 'content/academy.json', 'deploy/deliver-email.mjs'} <= names:
        reject('Archive is missing required application files')
PY

install -d -m 750 -o "$builder" -g "$builder" "$candidate"
runuser -u "$builder" -- tar -xzf - -C "$candidate" --no-same-owner --no-same-permissions < "$archive"
install -d -m 750 -o "$builder" -g "$builder" "$candidate/.cache" "$candidate/.config" "$candidate/.local"
install -m 640 -o "$builder" -g "$builder" /dev/null "$candidate/.config/npm-user"
install -m 640 -o "$builder" -g "$builder" /dev/null "$candidate/.config/npm-global"

build_env=("PATH=$node_bin:/usr/bin:/bin" NEXT_TELEMETRY_DISABLED=1
    NODE_OPTIONS=--max-old-space-size=1536
    "npm_config_cache=$candidate/.cache/npm"
    "npm_config_userconfig=$candidate/.config/npm-user"
    "npm_config_globalconfig=$candidate/.config/npm-global"
    "XDG_CACHE_HOME=$candidate/.cache" "XDG_CONFIG_HOME=$candidate/.config"
    "XDG_DATA_HOME=$candidate/.local")
# Input has already been validated. Quotes are optional delimiters, never shell code.
while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ "$line" =~ ^[[:space:]]*(NEXT_PUBLIC_[A-Z0-9_]+|CONTENT_MODE|PROPHOTO_SITE)=(.*)$ ]] || continue
    key="${BASH_REMATCH[1]}"; value="${BASH_REMATCH[2]}"
    value="${value%"${value##*[![:space:]]}"}"
    if [[ "$value" == \"*\" || "$value" == \'*\' ]]; then value="${value:1:${#value}-2}"; fi
    build_env+=("$key=$value")
done < "$public_env"

systemd-run --quiet --wait --pipe --collect --unit="academy-candidate-$sha" \
    --uid="$builder" --gid="$builder" --working-directory="$candidate" \
    -p CPUQuota=100% -p MemoryMax=2200M -p MemorySwapMax=1536M -p Nice=15 \
    -p RuntimeMaxSec=5400 -p TimeoutStopSec=30 -p KillMode=control-group \
    -p NoNewPrivileges=true -p ProtectSystem=strict -p ProtectHome=true -p PrivateTmp=true \
    -p "ReadWritePaths=$candidate" \
    -p "InaccessiblePaths=-/srv/prophotoacademy -/srv/prophotoacademy-staging -/srv/ps-booking -/etc/prophotoacademy -/etc/prophotoacademy-staging -/etc/ps-booking -/etc/prophoto-backup -/srv/prophoto-backups -/var/lib/prophoto-backup" \
    /usr/bin/env -i "${build_env[@]}" /bin/bash -euc \
    'npm exec --yes --package=pnpm@11.25.0 -- pnpm install --frozen-lockfile --store-dir .cache/pnpm-store
     npm exec --yes --package=pnpm@11.25.0 -- pnpm build --webpack'

[[ -s "$candidate/.next/BUILD_ID" ]] || fail 'Build produced no Next.js BUILD_ID'
[[ -f "$candidate/deploy/deliver-email.mjs" && -s "$candidate/deploy/deliver-email.mjs" && ! -L "$candidate/deploy/deliver-email.mjs" ]] \
    || fail 'Release is missing the email timer worker'
install -d -m 750 -o root -g root "$base/output"
temporary="$(mktemp "$base/output/$sha.tar.gz.XXXXXX")"
trap 'rm -f -- "$temporary"' EXIT
# No dereference: pnpm links must survive transport to the Linux application host.
tar -czf "$temporary" -C "$candidate" --exclude='.next/cache' --exclude='.next/dev' \
    --exclude='.git' --exclude='.data' --exclude='.cache' --exclude='.env*' \
    .next public node_modules package.json pnpm-lock.yaml next.config.ts content/academy.json deploy/deliver-email.mjs
mv -T -- "$temporary" "$artifact"
trap - EXIT
sha256sum "$archive" "$public_env" "$artifact" > "$artifact.sha256"
printf 'Linux candidate ready: %s\nArtifact: %s\nNo application services were started or changed\n' "$sha" "$artifact"
