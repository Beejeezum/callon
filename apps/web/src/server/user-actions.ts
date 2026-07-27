"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/public-env";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { actionFailure, actionSuccess } from "./action-result";

const resourceUpdateSchema = z.object({
  resourceId: z.uuid(),
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(800),
  visibility: z.enum(["private", "match_only", "circle"]),
  willingness: z.enum([
    "happy_to_be_asked",
    "community_projects_only",
    "weekends",
    "paused",
  ]),
  status: z.enum(["active", "paused", "retired"]),
});

const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  timezone: z.string().trim().min(1).max(100),
  emailEnabled: z.boolean(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
});

export async function updateResourceAction(input: unknown) {
  const parsed = resourceUpdateSchema.safeParse(input);
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
  const { data, error } = await supabase
    .from("resources")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      visibility: parsed.data.visibility,
      willingness: parsed.data.willingness,
      status: parsed.data.status,
    })
    .eq("id", parsed.data.resourceId)
    .select("id")
    .single();
  if (error || !data) {
    return actionFailure(
      "NOT_AUTHORIZED",
      "Only the item owner can change these settings.",
    );
  }
  revalidatePath(`/resources/${parsed.data.resourceId}`);
  revalidatePath("/activity");
  return actionSuccess({ resourceId: data.id });
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
