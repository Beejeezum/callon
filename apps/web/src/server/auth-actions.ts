"use server";

import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/public-env";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "./action-result";

const requestOtpSchema = z.object({
  channel: z.enum(["phone", "email"]),
  value: z.string().trim().min(5).max(320),
  displayName: z.string().trim().min(1).max(80).optional(),
  next: z.string().startsWith("/").max(500).default("/"),
});

const verifyOtpSchema = requestOtpSchema.extend({
  token: z
    .string()
    .trim()
    .regex(/^\d{6,8}$/),
});

type OtpRequestResult = {
  channel: "phone" | "email";
  destinationHint: string;
  mockMode: boolean;
};

function destinationHint(channel: "phone" | "email", value: string) {
  if (channel === "email") {
    const [local, domain = ""] = value.split("@");
    return `${local.slice(0, 2)}•••@${domain}`;
  }
  const digits = value.replace(/\D/g, "");
  return `••• ••• ${digits.slice(-4)}`;
}

export async function requestOtpAction(
  input: unknown,
): Promise<ActionResult<OtpRequestResult>> {
  const parsed = requestOtpSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the contact information and try again.",
      parsed.error.flatten().fieldErrors,
    );
  }

  if (!isSupabaseConfigured) {
    return actionSuccess({
      channel: parsed.data.channel,
      destinationHint: destinationHint(parsed.data.channel, parsed.data.value),
      mockMode: true,
    });
  }

  const supabase = await createSupabaseServerClient();
  const commonOptions = {
    shouldCreateUser: true,
    data: parsed.data.displayName
      ? { display_name: parsed.data.displayName }
      : undefined,
  };
  const { error } =
    parsed.data.channel === "phone"
      ? await supabase.auth.signInWithOtp({
          phone: parsed.data.value,
          options: commonOptions,
        })
      : await supabase.auth.signInWithOtp({
          email: parsed.data.value,
          options: commonOptions,
        });

  if (error) {
    return actionFailure(
      error.status === 429 ? "RATE_LIMITED" : "PROVIDER_UNAVAILABLE",
      error.status === 429
        ? "Too many code requests. Wait a moment and try again."
        : "We could not send a code right now. Try again shortly.",
    );
  }

  return actionSuccess({
    channel: parsed.data.channel,
    destinationHint: destinationHint(parsed.data.channel, parsed.data.value),
    mockMode: false,
  });
}

export async function verifyOtpAction(
  input: unknown,
): Promise<ActionResult<{ next: string; mockMode: boolean }>> {
  const parsed = verifyOtpSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Enter the complete one-time code.",
      parsed.error.flatten().fieldErrors,
    );
  }

  if (!isSupabaseConfigured) {
    return actionSuccess({ next: parsed.data.next, mockMode: true });
  }

  const supabase = await createSupabaseServerClient();
  const { error } =
    parsed.data.channel === "phone"
      ? await supabase.auth.verifyOtp({
          phone: parsed.data.value,
          token: parsed.data.token,
          type: "sms",
        })
      : await supabase.auth.verifyOtp({
          email: parsed.data.value,
          token: parsed.data.token,
          type: "email",
        });

  if (error) {
    return actionFailure(
      error.status === 429 ? "RATE_LIMITED" : "VERIFICATION_REQUIRED",
      error.status === 429
        ? "Too many attempts. Wait a moment before trying again."
        : "That code is invalid or expired. Request a new one.",
    );
  }

  return actionSuccess({ next: parsed.data.next, mockMode: false });
}

export async function signOutAction(): Promise<ActionResult<{ next: string }>> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  return actionSuccess({ next: "/login" });
}
