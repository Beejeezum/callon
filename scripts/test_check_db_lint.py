from __future__ import annotations

import io
import unittest
from contextlib import redirect_stderr, redirect_stdout
from subprocess import CompletedProcess
from unittest.mock import patch

from scripts.check_db_lint import assess_lint_output, main


class AssessLintOutputTest(unittest.TestCase):
    def test_accepts_empty_json_results(self) -> None:
        self.assertEqual(assess_lint_output('{"results": []}'), ("ok", 0))

    def test_rejects_nonempty_json_results(self) -> None:
        output = '{"results": [{"level": "warning", "message": "unsafe function"}]}'
        self.assertEqual(assess_lint_output(output), ("issues", 1))

    def test_accepts_supabase_plain_text_success(self) -> None:
        self.assertEqual(assess_lint_output("No schema errors found\n"), ("ok", 0))

    def test_accepts_ansi_wrapped_plain_text_success(self) -> None:
        output = "\x1b[32mNo schema errors found\x1b[0m\n"
        self.assertEqual(assess_lint_output(output), ("ok", 0))

    def test_rejects_unknown_success_shaped_output(self) -> None:
        self.assertEqual(assess_lint_output("Lint completed successfully\n"), ("invalid", None))

    def test_json_findings_take_precedence_over_plain_text(self) -> None:
        output = 'No schema errors found\n{"results": [{"level": "warning"}]}\n'
        self.assertEqual(assess_lint_output(output), ("issues", 1))

    @patch("scripts.check_db_lint.subprocess.run")
    def test_main_accepts_success_marker_from_stderr(self, run_mock) -> None:
        run_mock.return_value = CompletedProcess(
            args=["supabase", "db", "lint"],
            returncode=0,
            stdout="",
            stderr="Connecting to local database...\nNo schema errors found\n",
        )

        with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
            self.assertEqual(main(), 0)


if __name__ == "__main__":
    unittest.main()
