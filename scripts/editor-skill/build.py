"""Build the assets for the staging editor skill download page."""

import argparse
import gzip
import hashlib
import html
import io
import json
import re
import tarfile
import zipfile
from pathlib import Path


SOURCE = Path(__file__).resolve().parent
ROOT = SOURCE.parents[1]
SKILL = ROOT / ".agents" / "skills" / "prophoto-editor"
FILES = ("SKILL.md", "agents/openai.yaml")
PUBLIC_URL = "https://staging.prophotoacademy.com.ua/skills/prophoto-editor/"
DEFAULT_OUTPUT = ROOT / ".data" / "editor-skill-release" / "public"


def text_bytes(path):
    return path.read_text(encoding="utf-8").encode("utf-8")


def json_bytes(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def hashes(files):
    return {name: hashlib.sha256(data).hexdigest() for name, data in sorted(files.items())}


def skill_zip(files):
    output = io.BytesIO()
    with zipfile.ZipFile(output, "w") as archive:
        for name, data in files.items():
            entry = zipfile.ZipInfo("prophoto-editor/" + name, (1980, 1, 1, 0, 0, 0))
            entry.create_system = 3
            entry.external_attr = 0o100644 << 16
            archive.writestr(entry, data, compress_type=zipfile.ZIP_DEFLATED)
    return output.getvalue()


def npm_package(files):
    output = io.BytesIO()
    with gzip.GzipFile(fileobj=output, mode="wb", filename="", mtime=0) as compressed:
        with tarfile.open(fileobj=compressed, mode="w|", format=tarfile.USTAR_FORMAT) as archive:
            for name, data in files.items():
                entry = tarfile.TarInfo("package/" + name)
                entry.size = len(data)
                entry.mode = 0o755 if name == "install.cjs" else 0o644
                archive.addfile(entry, io.BytesIO(data))
    return output.getvalue()


def build(directory):
    metadata = json.loads((SOURCE / "package.json").read_text(encoding="utf-8"))
    version = metadata["version"]
    if not re.fullmatch(r"(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*)){2}", version):
        raise ValueError("Expected a numeric major.minor.patch release version")
    bundled = {name: text_bytes(SKILL / name) for name in FILES}
    package = {
        "package.json": json_bytes(metadata),
        "install.cjs": text_bytes(SOURCE / "install.cjs"),
        "skill-manifest.json": json_bytes({"files": hashes(bundled)}),
        **{"skill/" + name: data for name, data in bundled.items()},
    }
    filename = version + ".tgz"
    command = "npx --yes " + PUBLIC_URL + filename
    template = (SOURCE / "index.html").read_text(encoding="utf-8")
    if template.count("{{INSTALL_COMMAND}}") != 1:
        raise ValueError("The install page must have one copyable command")
    output = {
        filename: npm_package(package),
        "prophoto-editor.zip": skill_zip(bundled),
        "index.html": template.replace("{{INSTALL_COMMAND}}", html.escape(command)).encode("utf-8"),
    }
    output["checksums.json"] = json_bytes({"version": version, "files": hashes(output)})
    directory.mkdir(parents=True, exist_ok=True)
    for name, data in output.items():
        (directory / name).write_bytes(data)
    return command


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    print(build(args.output))
