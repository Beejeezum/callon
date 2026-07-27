import { randomUUID, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { publicEnv } from "@/lib/public-env";
import { createEmailProvider } from "@/lib/providers/email";
import { serverEnv } from "@/lib/server-env";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type NotificationJob = {
  id: string;
  profileId: string;
  channel: string;
  templateKey: string;
  payload: {
    idempotency_key?: string;
    href?: string;
    object_id?: string;
  };
  attempts: number;
};

function isAuthorized(request: NextRequest) {
  const received = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  const expected = serverEnv.CRON_SECRET;
  if (!received || !expected) return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

function errorCode(error: unknown) {
  if (!(error instanceof Error)) return "UNKNOWN_PROVIDER_ERROR";
  return error.message.replace(/[^A-Z0-9_-]/gi, "_").slice(0, 120);
}

async function run(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createSupabaseServiceClient();
    const email = createEmailProvider();
    const worker = `web-${process.env.COMMIT_REF?.slice(0, 12) ?? "local"}-${randomUUID().slice(0, 8)}`;
    const { data: prepared, error: prepareError } = await supabase.rpc(
      "prepare_notification_jobs",
      { p_limit: 100 },
    );
    if (prepareError) throw prepareError;

    const { data, error: claimError } = await supabase.rpc(
      "claim_notification_jobs",
      { p_worker: worker, p_limit: 50 },
    );
    if (claimError) throw claimError;
    const jobs = Array.isArray(data) ? (data as NotificationJob[]) : [];
    let sent = 0;
    let failed = 0;

    for (const job of jobs) {
      let success = false;
      let providerMessageId = "";
      let failureCode = "";
      try {
        if (job.channel !== "email") {
          throw new Error("UNSUPPORTED_CHANNEL");
        }
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.admin.getUserById(job.profileId);
        if (userError || !user?.email) throw new Error("MISSING_DESTINATION");
        const result = await email.send({
          toEmail: user.email,
          template: job.templateKey,
          variables: {
            href: new URL(
              job.payload.href ?? "/",
              publicEnv.NEXT_PUBLIC_APP_URL,
            ).toString(),
            objectId: job.payload.object_id ?? null,
          },
          idempotencyKey:
            job.payload.idempotency_key ?? `notification-job:${job.id}`,
        });
        success = true;
        providerMessageId = result.providerMessageId;
        sent += 1;
      } catch (providerError) {
        failureCode = errorCode(providerError);
        failed += 1;
      }

      const { error: settleError } = await supabase.rpc(
        "settle_notification_job",
        {
          p_input: {
            jobId: job.id,
            success,
            providerMessageId,
            errorCode: failureCode,
          },
        },
      );
      if (settleError) throw settleError;
    }

    return NextResponse.json({
      ok: true,
      prepared,
      claimed: jobs.length,
      sent,
      failed,
      provider: serverEnv.EMAIL_PROVIDER,
    });
  } catch (error) {
    console.error("notification.worker.failed", {
      code: errorCode(error),
    });
    return NextResponse.json(
      { ok: false, error: "worker_failed" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return run(request);
}

export async function POST(request: NextRequest) {
  return run(request);
}
