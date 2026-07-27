#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GENERATED_DIRS = {
    ".git",
    ".next",
    ".supabase",
    "coverage",
    "node_modules",
    "out",
    "playwright-report",
    "test-results",
}


def is_generated(path: Path) -> bool:
    return any(part in GENERATED_DIRS for part in path.relative_to(ROOT).parts)

REQUIRED = [
    "AGENTS.md",
    "README_START_HERE.md",
    "CODEX_START_PROMPT.md",
    "CODEX_AUTONOMOUS_BUILD_PROMPT.md",
    "BUILD_STATUS.md",
    "package.json",
    "pnpm-workspace.yaml",
    ".env.example",
    "docs/00_EXECUTIVE_DECISIONS.md",
    "docs/01_FULL_PRD.md",
    "docs/02_P0_BUILD_CONTRACT.md",
    "docs/03_SERVICE_ACCOUNTS_AND_ENVIRONMENTS.md",
    "docs/05_DESIGN_SYSTEM.md",
    "docs/07_DOMAIN_MODEL_AND_STATE_MACHINES.md",
    "docs/08_DATABASE_SCHEMA_AND_RLS.md",
    "docs/15_SECURITY_PRIVACY_AND_SAFETY.md",
    "docs/18_ROADMAP_AND_TASK_SEQUENCE.md",
    "visuals/00_CANONICAL_UI_DIRECTION.png",
    "visuals/canonical-screen-crops-contact-sheet.png",
    "apps/web/package.json",
    "apps/web/src/app/page.tsx",
    "apps/web/src/app/asks/new/page.tsx",
    "apps/web/src/app/share/[token]/page.tsx",
    "packages/contracts/src/index.ts",
    "supabase/migrations/202607260001_extensions_types.sql",
    "supabase/migrations/202607260002_core_tables.sql",
    "supabase/migrations/202607260003_helpers_transactions.sql",
    "supabase/migrations/202607260004_rls.sql",
    "supabase/migrations/202607260005_storage.sql",
    "supabase/tests/001_rls_isolation.sql",
    "schemas/ai-ask-draft.schema.json",
]

errors: list[str] = []
for relative in REQUIRED:
    if not (ROOT / relative).is_file():
        errors.append(f"MISSING {relative}")

for image in ROOT.rglob("*.png"):
    if is_generated(image) or not image.is_file():
        continue
    if image.read_bytes()[:8] != b"\x89PNG\r\n\x1a\n":
        errors.append(f"INVALID_PNG {image.relative_to(ROOT)}")

for json_file in [ROOT / "package.json", ROOT / "apps/web/package.json", ROOT / "packages/contracts/package.json", ROOT / "schemas/ai-ask-draft.schema.json"]:
    try:
        json.loads(json_file.read_text())
    except Exception as exc:
        errors.append(f"INVALID_JSON {json_file.relative_to(ROOT)}: {exc}")

# Catch common secret patterns without treating documented environment names as secrets.
secret_value_patterns = [
    re.compile(r"sk-[A-Za-z0-9_-]{20,}"),
    re.compile(r"sbp_[A-Za-z0-9]{20,}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
]
text_suffixes = {".md", ".ts", ".tsx", ".js", ".mjs", ".json", ".sql", ".toml", ".yaml", ".yml", ".example"}
for path in ROOT.rglob("*"):
    if is_generated(path) or not path.is_file() or path.suffix.lower() not in text_suffixes:
        continue
    if path.name in {"MANIFEST.json"}:
        continue
    text = path.read_text(errors="ignore")
    for pattern in secret_value_patterns:
        if pattern.search(text):
            errors.append(f"POSSIBLE_SECRET {path.relative_to(ROOT)} pattern={pattern.pattern}")

migration_names = [p.name for p in sorted((ROOT / "supabase/migrations").glob("*.sql"))]
if migration_names != sorted(migration_names) or len(migration_names) < 6:
    errors.append("MIGRATION_SEQUENCE_INVALID")

if errors:
    print("BUNDLE_INVALID")
    print("\n".join(errors))
    sys.exit(1)

files = [p for p in ROOT.rglob("*") if p.is_file() and not is_generated(p)]
print("BUNDLE_OK")
print(f"ROOT {ROOT}")
print(f"FILES {len(files)}")
print(f"BYTES {sum(p.stat().st_size for p in files)}")
for relative in REQUIRED:
    data = (ROOT / relative).read_bytes()
    print(f"{hashlib.sha256(data).hexdigest()[:12]}  {relative}")
