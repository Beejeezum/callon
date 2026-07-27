import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/server-env";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!serverEnv.CRON_SECRET || auth !== `Bearer ${serverEnv.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // P0 implementation: call a SECURITY DEFINER claim_notification_jobs() RPC,
  // process a bounded batch, record provider outcome, and retry with backoff.
  return NextResponse.json({ ok: true, claimed: 0, sent: 0, mode: "scaffold" });
}
