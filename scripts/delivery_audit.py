#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []
warnings: list[str] = []
GENERATED_DIRS = {
    ".git",
    ".next",
    ".netlify",
    ".supabase",
    "coverage",
    "node_modules",
    "out",
    "playwright-report",
    "test-results",
}


def is_generated(path: Path) -> bool:
    return any(part in GENERATED_DIRS for part in path.relative_to(ROOT).parts)

required_routes = [
    "apps/web/src/app/page.tsx",
    "apps/web/src/app/asks/new/page.tsx",
    "apps/web/src/app/asks/[askId]/page.tsx",
    "apps/web/src/app/asks/[askId]/offers/page.tsx",
    "apps/web/src/app/share/[token]/page.tsx",
    "apps/web/src/app/offers/[offerId]/page.tsx",
    "apps/web/src/app/commitments/[commitmentId]/page.tsx",
    "apps/web/src/app/loans/[loanId]/page.tsx",
    "apps/web/src/app/activity/page.tsx",
    "apps/web/src/app/inbox/page.tsx",
    "apps/web/src/app/profile/page.tsx",
    "apps/web/src/app/admin/page.tsx",
]
for rel in required_routes:
    if not (ROOT / rel).is_file():
        errors.append(f"missing route: {rel}")

migration_files = sorted((ROOT / "supabase/migrations").glob("*.sql"))
expected_prefixes = [f"20260726000{i}_" for i in range(1, 8)]
actual_prefixes = [path.name[:13] for path in migration_files]
for prefix in expected_prefixes:
    if not any(path.name.startswith(prefix) for path in migration_files):
        errors.append(f"missing migration prefix: {prefix}")
if migration_files != sorted(migration_files):
    errors.append("migration files are not lexically ordered")

# JSON syntax and essential package metadata.
for rel in ["package.json", "apps/web/package.json", "packages/contracts/package.json", "schemas/ai-ask-draft.schema.json"]:
    try:
        json.loads((ROOT / rel).read_text())
    except Exception as exc:
        errors.append(f"invalid JSON {rel}: {exc}")

root_package = json.loads((ROOT / "package.json").read_text())
for script in ["dev", "build", "lint", "typecheck", "test", "test:e2e", "verify", "db:reset", "db:test"]:
    if script not in root_package.get("scripts", {}):
        errors.append(f"root package missing script: {script}")

# Every local /assets reference in source must exist in public.
asset_pattern = re.compile(r"[\"'](/assets/[^\"'?]+)")
for source in (ROOT / "apps/web/src").rglob("*"):
    if source.suffix not in {".ts", ".tsx", ".css"}:
        continue
    text = source.read_text(errors="ignore")
    for match in asset_pattern.finditer(text):
        asset = ROOT / "apps/web/public" / match.group(1).lstrip("/")
        if not asset.is_file():
            errors.append(f"missing referenced asset {match.group(1)} from {source.relative_to(ROOT)}")

# Basic local alias import resolution for @/ imports.
import_pattern = re.compile(r"(?:from\s+|import\s*)[\"']@/([^\"']+)[\"']")
for source in (ROOT / "apps/web/src").rglob("*.ts*"):
    text = source.read_text(errors="ignore")
    for module in import_pattern.findall(text):
        base = ROOT / "apps/web/src" / module
        candidates = [base, base.with_suffix(".ts"), base.with_suffix(".tsx"), base / "index.ts", base / "index.tsx"]
        if not any(candidate.is_file() for candidate in candidates):
            errors.append(f"unresolved local import @/{module} in {source.relative_to(ROOT)}")

# Markdown links must resolve when they are local file references.
link_pattern = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
for md in ROOT.rglob("*.md"):
    if is_generated(md):
        continue
    text = md.read_text(errors="ignore")
    for raw in link_pattern.findall(text):
        target = raw.strip().split("#", 1)[0]
        if not target or target.startswith(("http://", "https://", "mailto:", "sandbox:", "/")):
            continue
        target = target.split(" ", 1)[0]
        resolved = (md.parent / target).resolve()
        try:
            resolved.relative_to(ROOT.resolve())
        except ValueError:
            warnings.append(f"link exits bundle: {md.relative_to(ROOT)} -> {raw}")
            continue
        if not resolved.exists():
            errors.append(f"broken local link: {md.relative_to(ROOT)} -> {raw}")

# No actual secrets or local secret files.
for forbidden in [".env", ".env.local", ".env.production", "service-account.json"]:
    if (ROOT / forbidden).exists():
        errors.append(f"forbidden secret-bearing file present: {forbidden}")
secret_patterns = [
    re.compile(r"sk-[A-Za-z0-9_-]{20,}"),
    re.compile(r"sbp_[A-Za-z0-9]{20,}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
]
for path in ROOT.rglob("*"):
    if (
        is_generated(path)
        or not path.is_file()
        or path.suffix.lower()
        not in {".md", ".ts", ".tsx", ".js", ".mjs", ".json", ".sql", ".toml", ".yaml", ".yml", ".example"}
    ):
        continue
    text = path.read_text(errors="ignore")
    for pattern in secret_patterns:
        if pattern.search(text):
            errors.append(f"possible secret in {path.relative_to(ROOT)} ({pattern.pattern})")

# The canonical artifacts and handoff controls must be present.
for rel in [
    "visuals/00_CANONICAL_UI_DIRECTION.png",
    "visuals/canonical-screen-crops-contact-sheet.png",
    "docs/00_EXECUTIVE_DECISIONS.md",
    "docs/22_PRODUCTION_ARCHITECTURE_MAP.md",
    "runbooks/ACCOUNT_SETUP_CHECKLIST.md",
    "AGENTS.md",
    "CODEX_AUTONOMOUS_BUILD_PROMPT.md",
    "BUILD_STATUS.md",
]:
    if not (ROOT / rel).is_file():
        errors.append(f"missing handoff control: {rel}")

if errors:
    print("DELIVERY_INVALID")
    for error in sorted(set(errors)):
        print(f"ERROR {error}")
    for warning in sorted(set(warnings)):
        print(f"WARNING {warning}")
    sys.exit(1)

print("DELIVERY_OK")
print(f"MIGRATIONS {len(migration_files)}")
print(f"ROUTES {len(required_routes)}")
print(f"WARNINGS {len(set(warnings))}")
for warning in sorted(set(warnings)):
    print(f"WARNING {warning}")
