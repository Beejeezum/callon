#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATIC_ROOT = ROOT / "apps/web/.next/static"
SERVER_ONLY_IDENTIFIERS = {
    "CRON_SECRET",
    "INTERNAL_OPERATOR_SECRET",
    "LOCATION_ENCRYPTION_KEY",
    "OPENAI_API_KEY",
    "POSTHOG_PERSONAL_API_KEY",
    "RESEND_API_KEY",
    "SENTRY_AUTH_TOKEN",
    "SHARE_TOKEN_PEPPER",
    "SUPABASE_JWT_SECRET",
    "SUPABASE_SERVICE_ROLE_KEY",
    "TURNSTILE_SECRET_KEY",
    "TWILIO_AUTH_TOKEN",
    "WHATSAPP_ACCESS_TOKEN",
    "WHATSAPP_APP_SECRET",
    "WHATSAPP_VERIFY_TOKEN",
}

if not STATIC_ROOT.is_dir():
    print("CLIENT_BUNDLE_SCAN_INVALID")
    print("Run the production build before scanning apps/web/.next/static.")
    sys.exit(1)

findings: list[str] = []
for path in STATIC_ROOT.rglob("*"):
    if not path.is_file():
        continue
    text = path.read_text(errors="ignore")
    for identifier in SERVER_ONLY_IDENTIFIERS:
        if identifier in text:
            findings.append(f"{path.relative_to(ROOT)} contains {identifier}")

if findings:
    print("CLIENT_BUNDLE_SCAN_INVALID")
    for finding in findings:
        print(f"ERROR {finding}")
    sys.exit(1)

print("CLIENT_BUNDLE_SCAN_OK")
print(f"FILES {sum(1 for path in STATIC_ROOT.rglob('*') if path.is_file())}")
