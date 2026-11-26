"""Stage a verified source-only Docker context for the backend tests."""

from hashlib import sha256
from pathlib import Path
import shutil
import subprocess


ROOT = Path(__file__).resolve().parent
REQUIRED = {
    Path("Dockerfile.test"),
    Path("manage.py"),
    Path("requirements/django.txt"),
    Path("mysite/settings/test.py"),
    Path("library/templates/emails/welcome.html"),
    Path("library/templates/emails/welcome.txt"),
}


def source_manifest():
    tracked = subprocess.check_output(["git", "ls-files", "-z", "--", "."], cwd=ROOT)
    python_sources = set()
    for name in tracked.decode().split("\0"):
        path = Path(name)
        if (
            path.parts
            and path.parts[0] in {"ai", "library", "mysite"}
            and path.suffix == ".py"
            and all(not part.startswith(".") for part in path.parts)
        ):
            python_sources.add(path)
    return sorted(REQUIRED | python_sources)


def fingerprint(path):
    return path.stat().st_size, sha256(path.read_bytes()).digest()


def stage(destination):
    if not destination.is_dir() or any(destination.iterdir()):
        raise SystemExit("The destination must be an existing empty directory.")
    if destination.resolve().is_relative_to(ROOT):
        raise SystemExit("Stage the test context outside the backend checkout.")

    manifest = {}
    for path in source_manifest():
        source = ROOT / path
        if not source.is_file() or source.resolve() != source:
            raise SystemExit(f"Expected a regular, non-symlink source file: {path}")
        manifest[path] = fingerprint(source)

    for path in manifest:
        target = destination / path
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / path, target)

    staged = {
        path.relative_to(destination): fingerprint(path)
        for path in destination.rglob("*")
        if path.is_file()
    }
    if staged != manifest:
        raise SystemExit("Staged files differ from the approved source manifest.")
    for path, (size, _) in manifest.items():
        print(f"{size:>8}  {path.as_posix()}")
    print(f"{len(staged)} files, {sum(size for size, _ in staged.values())} bytes", flush=True)
