"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { serverEnv } from "@/lib/server-env";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { actionFailure, actionSuccess } from "./action-result";

function emailHash(email: string) {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export async function getPilotBootstrapEligibility() {
  if (!serverEnv.PILOT_ADMIN_EMAIL_SHA256) return false;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return Boolean(
    user?.email &&
    user.email_confirmed_at &&
    emailHash(user.email) === serverEnv.PILOT_ADMIN_EMAIL_SHA256,
  );
}

export async function bootstrapPaseosPilotAction() {
  if (!serverEnv.PILOT_ADMIN_EMAIL_SHA256) {
    return actionFailure(
      "PROVIDER_UNAVAILABLE",
      "The first Paseos administrator has not been configured yet.",
    );
  }
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (
    !user?.email ||
    !user.email_confirmed_at ||
    emailHash(user.email) !== serverEnv.PILOT_ADMIN_EMAIL_SHA256
  ) {
    return actionFailure(
      "NOT_AUTHORIZED",
      "This setup is reserved for the configured first Paseos administrator.",
    );
  }

  const service = createSupabaseServiceClient();
  const { data, error } = await service.rpc("bootstrap_paseos_pilot", {
    p_profile_id: user.id,
  });
  if (error || !data) {
    return actionFailure(
      "INTERNAL_ERROR",
      "Paseos could not be initialized. No partial membership was created.",
      { database: [error?.message ?? "No Circle ID returned"] },
    );
  }
  revalidatePath("/");
  revalidatePath("/admin");
  return actionSuccess({ circleId: data });
}
