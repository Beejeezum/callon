#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
import sys

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
    sys.exit(result.returncode)

payload = None
for line in reversed(result.stdout.splitlines()):
    try:
        candidate = json.loads(line)
    except json.JSONDecodeError:
        continue
    if isinstance(candidate, dict) and isinstance(candidate.get("results"), list):
        payload = candidate
        break

if payload is None:
    print("DB_LINT_INVALID: Supabase did not return a machine-readable result.", file=sys.stderr)
    sys.exit(1)

if payload["results"]:
    print(f"DB_LINT_INVALID: {len(payload['results'])} issue(s) found.", file=sys.stderr)
    sys.exit(1)

print("DB_LINT_OK")
