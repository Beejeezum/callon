#!/usr/bin/env python3
from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
required_dirs = ["apps/web/src/app", "apps/web/src/components", "packages/contracts/src", "supabase/migrations", "supabase/tests", "docs", "tasks", "runbooks", "visuals"]
missing = [d for d in required_dirs if not (root / d).is_dir()]
if missing:
    print("Missing directories:", *missing, sep="\n- ")
    sys.exit(1)
print("Repository structure OK")
