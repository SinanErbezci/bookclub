"""Host-side exit status regressions for the backend test launcher."""

from contextlib import ExitStack, redirect_stderr, redirect_stdout
from io import StringIO
import json
import os
from pathlib import Path
import signal
from subprocess import CompletedProcess
from unittest import TestCase
from unittest.mock import MagicMock, patch

import run_backend_tests as launcher


class LauncherExitStatusTests(TestCase):
    def run_launcher(
        self, test_status=0, cleanup_status=0, *, signal_execution=False, signal_cleanup=False
    ):
        paths = []

        def compose_child(command, *, env, **kwargs):
            child = MagicMock()
            child.__enter__.return_value = child
            if "config" in command:
                paths.append(Path(env["BOOKCLUB_TEST_CONTEXT"]))
                config = {"services": {"tests": {"build": {
                    "context": str(paths[0]),
                    "dockerfile": "Dockerfile.test",
                }}}}
                child.communicate.return_value = json.dumps(config), None
                child.returncode = 0
            else:
                self.assertIn("up", command)
                def run_tests():
                    if signal_execution:
                        os.kill(os.getpid(), signal.SIGTERM)
                    return None, None

                child.communicate.side_effect = run_tests
                child.poll.return_value = None
                child.returncode = test_status
            return child

        def compose_down(command, **kwargs):
            self.assertIn("down", command)
            if signal_cleanup:
                os.kill(os.getpid(), signal.SIGTERM)
            return CompletedProcess(command, cleanup_status)

        errors = StringIO()
        with ExitStack() as stack:
            stack.enter_context(patch.object(launcher, "stage"))
            stack.enter_context(patch.object(launcher.os, "killpg"))
            stack.enter_context(patch.object(launcher.subprocess, "Popen", side_effect=compose_child))
            down = stack.enter_context(
                patch.object(launcher.subprocess, "run", side_effect=compose_down)
            )
            stack.enter_context(redirect_stdout(StringIO()))
            stack.enter_context(redirect_stderr(errors))
            status = launcher.main()
        down.assert_called_once()
        self.assertEqual(len(paths), 1)
        self.assertFalse(paths[0].exists(), "staged context cleanup must still run")
        return status, errors.getvalue()

    def test_cleanup_failure_turns_success_into_failure(self):
        status, errors = self.run_launcher(cleanup_status=41)
        self.assertNotEqual(status, 0)
        self.assertIn("Compose cleanup failed", errors)
        self.assertIn("exit 41", errors)

    def test_sigterm_during_cleanup_takes_precedence_over_cleanup_failure(self):
        status, errors = self.run_launcher(cleanup_status=41, signal_cleanup=True)
        self.assertEqual(status, 128 + signal.SIGTERM)
        self.assertIn("Compose cleanup failed", errors)

    def test_existing_test_failure_takes_precedence(self):
        status, errors = self.run_launcher(
            test_status=23, cleanup_status=41, signal_cleanup=True
        )
        self.assertEqual(status, 23)
        self.assertIn("Compose cleanup failed", errors)

    def test_sigterm_during_execution_uses_signal_status(self):
        status, _ = self.run_launcher(test_status=1, signal_execution=True)
        self.assertEqual(status, 128 + signal.SIGTERM)
