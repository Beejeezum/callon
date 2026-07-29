"use server";

import { createResourceSchema, updateResourceSchema } from "@call-on/contracts";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/public-env";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { actionFailure, actionSuccess } from "./action-result";

const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  timezone: z.string().trim().min(1).max(100),
  emailEnabled: z.boolean(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
});

export async function updateResourceAction(input: unknown) {
  const parsed = updateResourceSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the saved item settings.",
      parsed.error.flatten().fieldErrors,
    );
  }
  if (!isSupabaseConfigured)
    return actionSuccess({ resourceId: parsed.data.resourceId });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("update_resource_settings", {
    p_input: parsed.data,
  });
  if (error || !data) {
    return actionFailure(
      "NOT_AUTHORIZED",
      "Only the item owner can change these settings.",
    );
  }
  revalidatePath(`/resources/${parsed.data.resourceId}`);
  revalidatePath("/activity");
  return actionSuccess({ resourceId: data });
}

export async function createResourceAction(input: unknown) {
  const parsed = createResourceSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the item details and sharing preference.",
      parsed.error.flatten().fieldErrors,
    );
  }
  if (!isSupabaseConfigured) {
    return actionSuccess({ resourceId: "preview-resource" });
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("create_manual_resource", {
    p_input: parsed.data,
  });
  if (error || !data) {
    return actionFailure(
      error?.code === "42501" ? "NOT_AUTHORIZED" : "INTERNAL_ERROR",
      error?.code === "42501"
        ? "Only active Paseos members can add items."
        : "The item could not be saved. Nothing was partially added.",
    );
  }
  revalidatePath("/library");
  revalidatePath("/activity");
  return actionSuccess({ resourceId: data });
}

export async function updateProfileAction(input: unknown) {
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the profile settings.",
      parsed.error.flatten().fieldErrors,
    );
  }
  if (!isSupabaseConfigured) return actionSuccess({ updated: true });
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionFailure("AUTH_REQUIRED", "Sign in again.");
  const [profileResult, preferencesResult] = await Promise.all([
    supabase
      .from("profiles")
      .update({
        display_name: parsed.data.displayName,
        timezone: parsed.data.timezone,
      })
      .eq("id", user.id),
    supabase
      .from("notification_preferences")
      .update({
        email_enabled: parsed.data.emailEnabled,
        quiet_hours_start: parsed.data.quietHoursStart || null,
        quiet_hours_end: parsed.data.quietHoursEnd || null,
        timezone: parsed.data.timezone,
      })
      .eq("profile_id", user.id),
  ]);
  if (profileResult.error || preferencesResult.error) {
    return actionFailure(
      "INTERNAL_ERROR",
      "Profile settings could not be saved.",
    );
  }
  revalidatePath("/profile");
  return actionSuccess({ updated: true });
}
