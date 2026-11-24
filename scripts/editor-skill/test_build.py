import hashlib
import json
import tarfile
import tempfile
import unittest
import zipfile
from pathlib import Path

from build import FILES, PUBLIC_URL, SKILL, build


class EditorSkillDownloads(unittest.TestCase):
    def test_advertised_downloads_match_the_canonical_skill(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            command = build(directory)
            manifest = (directory / "checksums.json").read_bytes()
            release = json.loads(manifest)
            tar_name = release["version"] + ".tgz"
            self.assertEqual(set(release["files"]), {"index.html", "prophoto-editor.zip", tar_name})
            for name, expected in release["files"].items():
                self.assertEqual(hashlib.sha256((directory / name).read_bytes()).hexdigest(), expected)
            self.assertEqual(command, "npx --yes " + PUBLIC_URL + tar_name)
            self.assertIn(command, (directory / "index.html").read_text(encoding="utf-8"))
            with zipfile.ZipFile(directory / "prophoto-editor.zip") as manual:
                with tarfile.open(directory / tar_name) as cli:
                    self.assertEqual(set(manual.namelist()), {"prophoto-editor/" + f for f in FILES})
                    self.assertEqual(
                        set(cli.getnames()),
                        {"package/skill/" + f for f in FILES}
                        | {"package/install.cjs", "package/skill-manifest.json", "package/package.json"},
                    )
                    self.assertEqual(cli.getmember("package/install.cjs").mode, 0o755)
                    manifest_files = json.load(cli.extractfile("package/skill-manifest.json"))["files"]
                    for name in FILES:
                        data = (SKILL / name).read_text(encoding="utf-8").encode()
                        self.assertEqual(manual.read("prophoto-editor/" + name), data)
                        self.assertEqual(cli.extractfile("package/skill/" + name).read(), data)
                        self.assertEqual(manifest_files[name], hashlib.sha256(data).hexdigest())
            build(directory / "rebuild")
            self.assertEqual((directory / "rebuild/checksums.json").read_bytes(), manifest)


if __name__ == "__main__":
    unittest.main()
