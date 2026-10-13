"""Keep the active Academy deployment and its explicitly selected rollback release."""

import argparse
import json
from pathlib import Path
import re
import shutil
import urllib.request


def release_directory(releases, revision):
    if not re.fullmatch(r"[0-9a-f]{40}", revision):
        raise ValueError("Expected a full Git revision")
    directory = releases / revision
    if directory.is_symlink() or directory.is_mount():
        raise ValueError("Release must not be a symlink or mount")
    if not directory.is_dir() or directory.resolve() != directory:
        raise ValueError("Release must be a direct directory inside releases")
    return directory


def plan_cleanup(base, previous):
    base = base.resolve(strict=True)
    releases = base / "releases"
    if releases.is_symlink() or not releases.is_dir():
        raise ValueError("Expected an ordinary releases directory")
    current = base / "current"
    if not current.is_symlink():
        raise ValueError("Expected an active-release symlink")
    active = current.resolve(strict=True)
    if active != release_directory(releases, active.name):
        raise ValueError("Active release is outside the releases directory")
    rollback = release_directory(releases, previous)
    if active == rollback:
        raise ValueError("Rollback release must differ from the active release")
    for retained in (active, rollback):
        if not (retained / ".next/BUILD_ID").is_file():
            raise ValueError("Both retained releases must contain a completed build")
    obsolete = [
        release_directory(releases, entry.name)
        for entry in sorted(releases.iterdir())
        if re.fullmatch(r"[0-9a-f]{40}", entry.name) and entry not in (active, rollback)
    ]
    return active, rollback, obsolete


def apply_cleanup(base, previous, expected_active, expected_obsolete):
    active, _, obsolete = plan_cleanup(base, previous)
    if active != expected_active or obsolete != expected_obsolete:
        raise RuntimeError("Release state changed; inspect a fresh cleanup plan")
    for directory in obsolete:
        if (base / "current").resolve(strict=True) != active:
            raise RuntimeError("Active release changed during cleanup")
        release_directory(base.resolve() / "releases", directory.name)
        shutil.rmtree(directory)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("previous", help="Full SHA of the previous verified deployment")
    parser.add_argument("--apply", action="store_true", help="Delete listed obsolete releases")
    args = parser.parse_args()
    base = Path("/srv/prophotoacademy")
    active, rollback, obsolete = plan_cleanup(base, args.previous)
    print(json.dumps({"active": str(active), "rollback": str(rollback),
                      "remove": [str(path) for path in obsolete]}, indent=2), flush=True)
    if args.apply:
        with urllib.request.urlopen("http://127.0.0.1:3140/api/health", timeout=10) as response:
            if response.status != 200 or json.load(response).get("ok") is not True:
                raise RuntimeError("Health check failed; no releases removed")
        apply_cleanup(base, args.previous, active, obsolete)
        print(f"Removed {len(obsolete)} obsolete releases; retained active and rollback")


if __name__ == "__main__":
    main()
