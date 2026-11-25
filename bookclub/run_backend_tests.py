"""Run the backend suite in a private Docker Compose project on a POSIX host."""

import json
import os
from pathlib import Path
import shutil
import signal
import subprocess
import sys
from tempfile import mkdtemp
from uuid import uuid4

from stage_test_context import ROOT, stage


def exit_status(returncode):
    return returncode if returncode >= 0 else 128 - returncode


def main():
    project = f"bookclub-test-{uuid4().hex}"
    command = [
        "docker", "compose", "--env-file", os.devnull,
        "-p", project, "-f", str(ROOT / "docker-compose.test.yml"),
    ]
    destination = None
    started = False
    child = None
    child_interrupted = False
    interruption = None
    status = 0
    cleanup_failed = False

    def interrupt(signum, _frame):
        nonlocal child_interrupted, interruption
        if interruption is None:
            interruption = signum
        if child is not None and child.poll() is None:
            child_interrupted = True
            try:
                os.killpg(child.pid, signum)
            except ProcessLookupError:
                pass

    def compose(args, *, capture=False):
        nonlocal child, child_interrupted
        if interruption is not None:
            return 0, None
        child_interrupted = False
        with subprocess.Popen(
            [*command, *args],
            env=env,
            cwd=ROOT,
            start_new_session=True,
            stdout=subprocess.PIPE if capture else None,
            text=True,
        ) as child:
            if interruption is not None:
                interrupt(interruption, None)
            stdout, _ = child.communicate()
            returncode = child.returncode
        child = None
        if child_interrupted:
            return 0, stdout
        return exit_status(returncode), stdout

    handlers = {
        signum: signal.signal(signum, interrupt)
        for signum in (signal.SIGINT, signal.SIGTERM, signal.SIGHUP)
    }
    try:
        destination = Path(mkdtemp(prefix=f"{project}-")).resolve()
        env = {**os.environ, "BOOKCLUB_TEST_CONTEXT": str(destination)}
        print(f"Compose project: {project}\nStaged context: {destination}", flush=True)
        stage(destination)
        status, output = compose(["config", "--format", "json"], capture=True)
        if not status and interruption is None:
            build = json.loads(output)["services"]["tests"]["build"]
            if (
                Path(build["context"]) != destination
                or build["dockerfile"] != "Dockerfile.test"
                or build.get("additional_contexts")
            ):
                raise ValueError("Compose did not select the verified test build context.")
            started = True
            status, _ = compose(
                ["up", "--build", "--abort-on-container-exit", "--exit-code-from", "tests"]
            )
    except (OSError, ValueError, subprocess.SubprocessError) as error:
        print(f"Backend test launcher failed: {error}", file=sys.stderr)
        status = 1 if interruption is None else 0
    finally:
        child = None
        if started:
            try:
                result = subprocess.run(
                    [*command, "down", "--volumes", "--rmi", "local"],
                    env=env,
                    cwd=ROOT,
                    start_new_session=True,
                )
                if result.returncode:
                    cleanup_failed = True
                    print(
                        f"Compose cleanup failed for {project} (exit {exit_status(result.returncode)}).",
                        file=sys.stderr,
                    )
            except OSError as error:
                cleanup_failed = True
                print(f"Compose cleanup failed for {project}: {error}", file=sys.stderr)
        if destination is not None:
            try:
                shutil.rmtree(destination)
            except OSError as error:
                cleanup_failed = True
                print(f"Staged context cleanup failed for {destination}: {error}", file=sys.stderr)
        for signum, handler in handlers.items():
            signal.signal(signum, handler)

    if status:
        return status
    if interruption is not None:
        return 128 + interruption
    return int(cleanup_failed)


if __name__ == "__main__":
    sys.exit(main())
