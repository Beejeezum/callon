"use server";

import { moderateMembershipSchema } from "@call-on/contracts";
import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/public-env";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { actionFailure, actionSuccess } from "./action-result";

export async function moderateMembershipAction(input: unknown) {
  const parsed = moderateMembershipSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "That membership action is unavailable.",
    );
  }
  if (!isSupabaseConfigured) {
    return actionSuccess({ membershipId: parsed.data.membershipId });
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("moderate_membership", {
    p_input: parsed.data,
  });
  if (error || !data) {
    return actionFailure(
      error?.code === "42501" ? "NOT_AUTHORIZED" : "INVALID_STATE",
      "You cannot change that membership.",
    );
  }
  revalidatePath("/admin");
  return actionSuccess({ membershipId: data });
}
