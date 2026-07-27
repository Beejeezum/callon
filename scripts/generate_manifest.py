#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GENERATED = {"MANIFEST.md", "MANIFEST.json", "SHA256SUMS.txt"}
IGNORED_PARTS = {
    ".branches",
    ".git",
    ".next",
    ".netlify",
    ".supabase",
    ".temp",
    "__pycache__",
    "coverage",
    "node_modules",
    "playwright-report",
    "test-results",
}


def eligible(path: Path) -> bool:
    if not path.is_file():
        return False
    rel = path.relative_to(ROOT)
    if any(part in IGNORED_PARTS for part in rel.parts):
        return False
    if path.name == ".DS_Store":
        return False
    return True


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def scan(exclude_generated: bool = False) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for path in sorted((p for p in ROOT.rglob("*") if eligible(p)), key=lambda p: p.as_posix()):
        rel = path.relative_to(ROOT).as_posix()
        if exclude_generated and rel in GENERATED:
            continue
        rows.append({"path": rel, "bytes": path.stat().st_size, "sha256": digest(path)})
    return rows


def main() -> None:
    generated_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    rows = scan(exclude_generated=True)
    by_top_level = Counter(row["path"].split("/", 1)[0] for row in rows)
    total_bytes = sum(int(row["bytes"]) for row in rows)

    payload = {
        "product": "Call On",
        "handoff_version": "2.0",
        "generated_at_utc": generated_at,
        "root": ROOT.name,
        "file_count_excluding_generated_manifests": len(rows),
        "total_bytes_excluding_generated_manifests": total_bytes,
        "generated_files_excluded_from_manifest_hash_set": sorted(GENERATED),
        "top_level_counts": dict(sorted(by_top_level.items())),
        "files": rows,
    }
    (ROOT / "MANIFEST.json").write_text(json.dumps(payload, indent=2) + "\n")

    lines = [
        "# Call On Production Kit — Manifest",
        "",
        f"Generated: `{generated_at}`",
        "",
        f"- Handoff version: **2.0**",
        f"- Files represented: **{len(rows)}** (generated manifest/checksum files excluded from their own hash set)",
        f"- Payload size represented: **{total_bytes:,} bytes**",
        "",
        "## Start here",
        "",
        "1. `README_START_HERE.md`",
        "2. `AGENTS.md`",
        "3. `CODEX_START_PROMPT.md` or `CODEX_AUTONOMOUS_BUILD_PROMPT.md`",
        "4. `docs/00_EXECUTIVE_DECISIONS.md`",
        "5. `docs/02_P0_BUILD_CONTRACT.md`",
        "6. `visuals/00_CANONICAL_UI_DIRECTION.png`",
        "",
        "## Top-level inventory",
        "",
        "| Path | Files |",
        "|---|---:|",
    ]
    for key, count in sorted(by_top_level.items()):
        lines.append(f"| `{key}` | {count} |")
    lines += [
        "",
        "## Critical implementation assets",
        "",
        "- `apps/web/` — Next.js App Router mock-mode production scaffold.",
        "- `packages/contracts/` — shared Zod/domain contracts.",
        "- `supabase/migrations/` — ordered PostgreSQL schema, transaction RPCs, RLS, storage, seed, and hardening.",
        "- `supabase/tests/` — hostile tenant/authorization tests to execute and expand.",
        "- `docs/22_PRODUCTION_ARCHITECTURE_MAP.md` — runtime, trust-boundary, environment, and ER diagrams.",
        "- `runbooks/` — account setup, deployment, backup, key rotation, privacy, moderation, and incident response.",
        "- `prototype/interactive/standalone.html` — static behavior reference only; not production code.",
        "",
        "## Verification",
        "",
        "```bash",
        "python3 scripts/check_repo_structure.py",
        "python3 scripts/delivery_audit.py",
        "python3 scripts/verify_bundle.py",
        "python3 scripts/generate_manifest.py",
        "```",
        "",
        "`SHA256SUMS.txt` contains checksums for every delivered file except itself, including these generated manifests.",
        "",
    ]
    (ROOT / "MANIFEST.md").write_text("\n".join(lines))

    checksum_rows = scan(exclude_generated=False)
    checksum_lines = [f"{row['sha256']}  {row['path']}" for row in checksum_rows if row["path"] != "SHA256SUMS.txt"]
    (ROOT / "SHA256SUMS.txt").write_text("\n".join(checksum_lines) + "\n")

    print("MANIFEST_OK")
    print(f"FILES {len(rows)}")
    print(f"BYTES {total_bytes}")


if __name__ == "__main__":
    main()
