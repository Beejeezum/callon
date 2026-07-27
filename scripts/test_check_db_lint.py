from __future__ import annotations

import unittest

from scripts.check_db_lint import assess_lint_output


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


if __name__ == "__main__":
    unittest.main()
