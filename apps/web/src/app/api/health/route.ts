import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "call-on-web",
      environment: process.env.CONTEXT ?? process.env.NODE_ENV ?? "unknown",
      revision: process.env.COMMIT_REF?.slice(0, 12) ?? "local",
      timestamp: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
