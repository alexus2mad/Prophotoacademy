"""Atomically publish one verified public skill bundle to the staging static host."""

import argparse
from contextlib import contextmanager
import hashlib
import json
import os
from pathlib import Path
import re
import tempfile
from urllib.request import urlopen


ROOT = Path('/var/www/prophoto-editor-skill')
BASE_URL = 'https://staging.prophotoacademy.com.ua/skills/prophoto-editor/'
PORTAL_FILES = ('checksums.json', 'index.html', 'prophoto-editor.zip')


def digest(data):
    return hashlib.sha256(data).hexdigest()


def read_bundle(source, manifest_digest):
    paths = {path.name: path for path in source.iterdir()}
    if any(path.is_symlink() or not path.is_file() for path in paths.values()):
        raise ValueError('The public bundle must contain only regular files')
    manifest = paths['checksums.json'].read_bytes()
    if digest(manifest) != manifest_digest:
        raise ValueError('The transferred manifest differs from the verified local manifest')
    checksums = json.loads(manifest)
    version = checksums['version']
    if not re.fullmatch(r'[0-9]+\.[0-9]+\.[0-9]+', version):
        raise ValueError('Invalid package version')
    archive = f'{version}.tgz'
    expected = {archive, 'index.html', 'prophoto-editor.zip'}
    if set(paths) != expected | {'checksums.json'} or set(checksums['files']) != expected:
        raise ValueError('Unexpected public files or checksums')
    files = {'checksums.json': manifest}
    for name in expected:
        files[name] = paths[name].read_bytes()
        if digest(files[name]) != checksums['files'][name]:
            raise ValueError(f'Invalid digest for {name}')
    return archive, files


@contextmanager
def release_lock(root):
    import fcntl  # The staging host is Linux.

    root.mkdir(parents=True, exist_ok=True, mode=0o755)
    with (root / 'publish.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        yield


def publish(root, archive, files):
    with release_lock(root):
        packages, releases = root / 'packages', root / 'releases'
        for directory in (packages, releases):
            directory.mkdir(exist_ok=True, mode=0o755)
        release = releases / digest(files['checksums.json'])
        with tempfile.TemporaryDirectory(dir=root) as temporary:
            work = Path(temporary)
            package = packages / archive
            if package.exists():
                if package.read_bytes() != files[archive]:
                    raise ValueError(f'{archive} is already published with different bytes')
            else:
                incoming = work / archive
                incoming.write_bytes(files[archive])
                incoming.chmod(0o644)
                incoming.replace(package)

            if not release.exists():
                incoming = work / 'release'
                incoming.mkdir(mode=0o755)
                for name in PORTAL_FILES:
                    asset = incoming / name
                    asset.write_bytes(files[name])
                    asset.chmod(0o644)
                incoming.replace(release)
            pointer = work / 'current'
            pointer.symlink_to(release.relative_to(root), target_is_directory=True)
            pointer.replace(root / 'current')
    return release


def verify_public(files):
    for name, data in files.items():
        url = BASE_URL if name == 'index.html' else BASE_URL + name
        with urlopen(url, timeout=20) as response:
            if response.status != 200 or response.read(len(data) + 1) != data:
                raise RuntimeError(f'Staging bytes differ for {name}; no releases removed')


def retain_verified(root, verified_digest):
    with release_lock(root):
        releases = root / 'releases'
        current = root / 'current'
        if (not current.is_symlink() or releases.is_symlink() or
                current.resolve(strict=True) != releases / verified_digest):
            raise RuntimeError('Active release differs from the verified release; cleanup stopped')
        history = root / 'verified.json'
        previous = json.loads(history.read_text()) if history.exists() else []
        retained = [verified_digest, *(value for value in previous if value != verified_digest)][:2]
        directories = list(releases.iterdir())
        if not set(retained).issubset({path.name for path in directories}):
            raise ValueError('Missing a retained release')
        for directory in directories:
            if (not re.fullmatch(r'[0-9a-f]{64}', directory.name) or directory.is_symlink() or
                    directory.is_mount() or not directory.is_dir()):
                raise ValueError('Unexpected release directory; cleanup stopped')
            children = list(directory.iterdir())
            if ({path.name for path in children} != set(PORTAL_FILES) or
                    any(path.is_symlink() or not path.is_file() for path in children) or
                    digest((directory / 'checksums.json').read_bytes()) != directory.name):
                raise ValueError('Unexpected portal release contents; cleanup stopped')
        with tempfile.TemporaryDirectory(dir=root) as temporary:
            record = Path(temporary) / 'verified.json'
            record.write_text(json.dumps(retained))
            record.replace(history)
        for directory in directories:
            if directory.name not in retained:
                for name in PORTAL_FILES:
                    (directory / name).unlink()
                directory.rmdir()
    return retained


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path, help='Directory containing only the four release files')
    parser.add_argument('manifest_sha256', help='SHA-256 of the verified local checksums.json')
    parser.add_argument('--verify-and-prune', action='store_true',
                        help='After activation, verify every public file and keep the prior verified portal')
    args = parser.parse_args()
    os.umask(0o022)
    package, contents = read_bundle(args.source, args.manifest_sha256)
    if args.verify_and_prune:
        verify_public(contents)
        print('Verified staging and retained portal releases:', *retain_verified(ROOT, args.manifest_sha256))
    else:
        print(publish(ROOT, package, contents))
