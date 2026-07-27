#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import subprocess
import sys

ANSI_ESCAPE = re.compile(r"\x1b\[[0-?]*[ -/]*[@-~]")
PLAIN_TEXT_SUCCESS = "No schema errors found"


def _json_result_count(output: str) -> int | None:
    clean_output = ANSI_ESCAPE.sub("", output).strip()
    candidates = [clean_output, *reversed(clean_output.splitlines())]

    for candidate in candidates:
        try:
            payload = json.loads(candidate)
        except json.JSONDecodeError:
            continue
        if isinstance(payload, dict) and isinstance(payload.get("results"), list):
            return len(payload["results"])

    return None


def assess_lint_output(output: str) -> tuple[str, int | None]:
    result_count = _json_result_count(output)
    if result_count is not None:
        return ("ok", 0) if result_count == 0 else ("issues", result_count)

    clean_lines = {
        line.strip() for line in ANSI_ESCAPE.sub("", output).splitlines() if line.strip()
    }
    if PLAIN_TEXT_SUCCESS in clean_lines:
        return "ok", 0

    return "invalid", None


def main() -> int:
    result = subprocess.run(
        ["supabase", "db", "lint", "--level", "warning"],
        check=False,
        capture_output=True,
        text=True,
    )

    if result.stderr:
        print(result.stderr, file=sys.stderr, end="")
    if result.stdout:
        print(result.stdout, end="")

    if result.returncode != 0:
        return result.returncode

    status, issue_count = assess_lint_output(result.stdout)
    if status == "issues":
        print(f"DB_LINT_INVALID: {issue_count} issue(s) found.", file=sys.stderr)
        return 1
    if status == "invalid":
        print(
            "DB_LINT_INVALID: Supabase returned neither structured results "
            "nor its exact no-errors marker.",
            file=sys.stderr,
        )
        return 1

    print("DB_LINT_OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
