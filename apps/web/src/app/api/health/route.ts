import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/public-env";
import { serverEnv } from "@/lib/server-env";

export const dynamic = "force-dynamic";

export function GET() {
  const checks = {
    supabase: isSupabaseConfigured,
    serviceRole: Boolean(serverEnv.SUPABASE_SERVICE_ROLE_KEY),
    shareTokenProtection: Boolean(serverEnv.SHARE_TOKEN_PEPPER),
    locationEncryption: Boolean(serverEnv.LOCATION_ENCRYPTION_KEY_V1),
    cronAuthentication: Boolean(serverEnv.CRON_SECRET),
    email:
      serverEnv.EMAIL_PROVIDER === "mock"
        ? true
        : Boolean(serverEnv.RESEND_API_KEY),
    p1Disabled:
      serverEnv.AI_DRAFTS_ENABLED === "false" &&
      serverEnv.WHATSAPP_ENABLED === "false",
  };
  const ready = Object.values(checks).every(Boolean);
  return NextResponse.json(
    {
      ok: true,
      ready,
      checks,
      service: "call-on-web",
      environment: process.env.CONTEXT ?? process.env.NODE_ENV ?? "unknown",
      revision: process.env.COMMIT_REF?.slice(0, 12) ?? "local",
      timestamp: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
