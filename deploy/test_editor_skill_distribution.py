import importlib.util
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import MagicMock, patch


spec = importlib.util.spec_from_file_location('publisher', Path(__file__).with_name('publish-editor-skill.py'))
publisher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(publisher)


def example_bundle(directory, version='1.0.0', archive=b'npm package'):
    assets = {f'{version}.tgz': archive, 'index.html': b'portal', 'prophoto-editor.zip': b'zip'}
    checksums = {'version': version, 'files': {name: publisher.digest(data) for name, data in assets.items()}}
    assets['checksums.json'] = json.dumps(checksums).encode()
    directory.mkdir()
    for name, data in assets.items():
        (directory / name).write_bytes(data)
    return publisher.digest(assets['checksums.json'])


class EditorSkillDistribution(unittest.TestCase):
    def test_only_exact_verified_files_are_accepted(self):
        with tempfile.TemporaryDirectory() as temporary:
            source = Path(temporary) / 'public'
            manifest = example_bundle(source)
            self.assertEqual(publisher.read_bundle(source, manifest)[0], '1.0.0.tgz')
            with self.assertRaisesRegex(ValueError, 'manifest'):
                publisher.read_bundle(source, '0' * 64)
            extra = source / 'other.html'
            extra.touch()
            with self.assertRaisesRegex(ValueError, 'Unexpected public files'):
                publisher.read_bundle(source, manifest)
            extra.unlink()
            (source / 'index.html').write_bytes(b'tampered')
            with self.assertRaisesRegex(ValueError, 'Invalid digest'):
                publisher.read_bundle(source, manifest)

    @unittest.skipUnless(os.name == 'posix', 'The staging publisher uses Linux file locks')
    def test_republish_upgrade_and_rollback_preserve_pinned_packages(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / 'deployment'

            def deploy(folder, version, package):
                source = root.parent / folder
                checksum = example_bundle(source, version, package)
                return publisher.publish(root, *publisher.read_bundle(source, checksum))

            first = deploy('first', '1.0.0', b'one')
            publisher.retain_verified(root, first.name)
            self.assertEqual(deploy('repeat', '1.0.0', b'one'), first)
            second = deploy('second', '1.0.1', b'two')
            with self.assertRaisesRegex(RuntimeError, 'Active release differs'):
                publisher.retain_verified(root, first.name)
            publisher.retain_verified(root, second.name)
            with self.assertRaisesRegex(ValueError, 'different bytes'):
                deploy('conflict', '1.0.0', b'different')
            self.assertEqual((root / 'current').resolve(), second)
            third = deploy('third', '1.0.2', b'three')
            publisher.retain_verified(root, third.name)
            self.assertEqual(set((root / 'releases').iterdir()), {second, third})
            self.assertEqual(deploy('rollback', '1.0.0', b'one'), first)
            publisher.retain_verified(root, first.name)
            self.assertEqual(set((root / 'releases').iterdir()), {third, first})
            self.assertEqual((root / 'current').resolve(), first)
            self.assertEqual((root / 'packages/1.0.0.tgz').read_bytes(), b'one')
            self.assertEqual((root / 'packages/1.0.1.tgz').read_bytes(), b'two')
            self.assertEqual((root / 'packages/1.0.2.tgz').read_bytes(), b'three')

    def test_verification_fails_on_unexpected_public_content(self):
        response = MagicMock(status=200)
        response.read.return_value = b'other'
        with patch.object(publisher, 'urlopen') as connection:
            connection.return_value.__enter__.return_value = response
            with self.assertRaisesRegex(RuntimeError, 'Staging bytes differ'):
                publisher.verify_public({'index.html': b'expected'})
            connection.assert_called_once_with(publisher.BASE_URL, timeout=20)

    def test_route_is_staging_only(self):
        config = Path(__file__).with_name('nginx-environments.conf').read_text()
        servers = config.split('\nserver {')
        (skill_server,) = (server for server in servers if '/skills/prophoto-editor' in server)
        self.assertIn('server_name staging.prophotoacademy.com.ua;', skill_server)
        self.assertIn('listen 443 ssl;', skill_server)
        self.assertIn('limit_except GET', skill_server)
        self.assertIn('autoindex off;', skill_server)
        self.assertIn('application/gzip tgz;', skill_server)
        self.assertIn('alias /var/www/prophoto-editor-skill/packages/$skill_archive;', skill_server)


if __name__ == '__main__':
    unittest.main()
