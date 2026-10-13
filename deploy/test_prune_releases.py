import importlib.util
from pathlib import Path
import tempfile
import unittest


spec = importlib.util.spec_from_file_location(
    "prune_releases", Path(__file__).with_name("prune-releases.py")
)
cleanup = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cleanup)


class ReleaseCleanupTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="academy-release-test-")
        self.addCleanup(self.temporary.cleanup)
        self.base = Path(self.temporary.name).resolve()
        self.releases = self.base / "releases"
        self.releases.mkdir()
        self.old = self.make_release("a" * 40)
        self.previous = self.make_release("b" * 40)
        self.active = self.make_release("c" * 40)
        try:
            (self.base / "current").symlink_to(self.active, target_is_directory=True)
        except OSError as error:
            self.skipTest(f"Symlink support required; run on the Linux host: {error}")

    def make_release(self, revision):
        directory = self.releases / revision
        (directory / ".next").mkdir(parents=True)
        (directory / ".next/BUILD_ID").write_text("test", encoding="utf-8")
        return directory

    def test_preview_does_not_delete_and_apply_retains_two_builds(self):
        unknown = self.releases / "notes"
        unknown.mkdir()
        active, rollback, obsolete = cleanup.plan_cleanup(self.base, self.previous.name)
        self.assertEqual((active, rollback, obsolete), (self.active, self.previous, [self.old]))
        self.assertTrue(self.old.exists())
        cleanup.apply_cleanup(self.base, self.previous.name, active, obsolete)
        self.assertFalse(self.old.exists())
        self.assertTrue(self.active.is_dir() and self.previous.is_dir() and unknown.is_dir())
        self.assertEqual(cleanup.plan_cleanup(self.base, self.previous.name)[2], [])

    def test_invalid_or_missing_rollback_prevents_cleanup(self):
        for revision in ("../outside", "d" * 40, self.active.name):
            with self.subTest(revision=revision), self.assertRaises(ValueError):
                cleanup.plan_cleanup(self.base, revision)
        self.assertTrue(self.old.exists())

    def test_missing_rollback_build_prevents_cleanup(self):
        (self.previous / ".next/BUILD_ID").unlink()
        with self.assertRaises(ValueError):
            cleanup.plan_cleanup(self.base, self.previous.name)

    def test_symlink_candidate_prevents_cleanup(self):
        (self.releases / ("d" * 40)).symlink_to(self.old, target_is_directory=True)
        with self.assertRaises(ValueError):
            cleanup.plan_cleanup(self.base, self.previous.name)
        self.assertTrue(self.old.exists())

    def test_active_target_outside_releases_prevents_cleanup(self):
        outside = self.base / ("d" * 40)
        outside.mkdir()
        (self.base / "current").unlink()
        (self.base / "current").symlink_to(outside, target_is_directory=True)
        with self.assertRaises(ValueError):
            cleanup.plan_cleanup(self.base, self.previous.name)

    def test_new_active_release_invalidates_existing_plan(self):
        active, _, obsolete = cleanup.plan_cleanup(self.base, self.previous.name)
        new = self.make_release("d" * 40)
        (self.base / "current").unlink()
        (self.base / "current").symlink_to(new, target_is_directory=True)
        with self.assertRaises(RuntimeError):
            cleanup.apply_cleanup(self.base, self.previous.name, active, obsolete)
        self.assertTrue(self.old.exists())


if __name__ == "__main__":
    unittest.main()
