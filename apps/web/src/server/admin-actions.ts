"use server";

import {
  changeMembershipRoleSchema,
  moderateMembershipSchema,
  revokeCircleInviteSchema,
} from "@call-on/contracts";
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

export async function changeMembershipRoleAction(input: unknown) {
  const parsed = changeMembershipRoleSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "That role change is unavailable.",
    );
  }
  if (!isSupabaseConfigured) {
    return actionSuccess({ membershipId: parsed.data.membershipId });
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("change_membership_role", {
    p_input: parsed.data,
  });
  if (error || !data) {
    return actionFailure(
      error?.code === "42501" ? "NOT_AUTHORIZED" : "INVALID_STATE",
      error?.code === "42501"
        ? "Only a Paseos administrator can assign community roles."
        : "Activate the member before changing their role.",
    );
  }
  revalidatePath("/admin");
  return actionSuccess({ membershipId: data });
}

export async function revokeCircleInviteAction(input: unknown) {
  const parsed = revokeCircleInviteSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure("VALIDATION_FAILED", "That invite is unavailable.");
  }
  if (!isSupabaseConfigured) {
    return actionSuccess({ inviteId: parsed.data.inviteId });
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("revoke_circle_invite", {
    p_input: parsed.data,
  });
  if (error || !data) {
    return actionFailure(
      error?.code === "42501" ? "NOT_AUTHORIZED" : "INVALID_STATE",
      "The invitation could not be revoked.",
    );
  }
  revalidatePath("/admin");
  return actionSuccess({ inviteId: data });
}
