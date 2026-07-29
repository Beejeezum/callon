"use server";

import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/public-env";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "./action-result";
import { hashOpaqueToken } from "./tokens";

const requestOtpSchema = z.object({
  channel: z.enum(["phone", "email"]),
  value: z.string().trim().min(5).max(320),
  displayName: z.string().trim().min(1).max(80).optional(),
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  next: z.string().startsWith("/").max(500).default("/"),
});

const verifyOtpSchema = requestOtpSchema.extend({
  token: z
    .string()
    .trim()
    .regex(/^\d{6,8}$/),
  inviteToken: z
    .string()
    .regex(/^[A-Za-z0-9_-]{24,128}$/)
    .optional(),
  idempotencyKey: z.string().min(16).max(200).optional(),
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

function requestedDisplayName(input: z.infer<typeof requestOtpSchema>) {
  if (input.firstName && input.lastName) {
    return `${input.firstName} ${input.lastName}`.trim().slice(0, 80);
  }
  return input.displayName?.trim().slice(0, 80);
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
  const displayName = requestedDisplayName(parsed.data);
  const commonOptions = {
    shouldCreateUser: true,
    data: displayName ? { display_name: displayName } : undefined,
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
): Promise<
  ActionResult<{ next: string; mockMode: boolean; joinedCircle: boolean }>
> {
  const parsed = verifyOtpSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Enter the complete one-time code.",
      parsed.error.flatten().fieldErrors,
    );
  }

  if (!isSupabaseConfigured) {
    return actionSuccess({
      next: parsed.data.next,
      mockMode: true,
      joinedCircle: Boolean(parsed.data.inviteToken),
    });
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

  const displayName = requestedDisplayName(parsed.data);
  if (displayName) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return actionFailure(
        "VERIFICATION_REQUIRED",
        "Your code worked, but the session did not finish. Try signing in again.",
      );
    }
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", user.id);
    if (profileError) {
      return actionFailure(
        "INTERNAL_ERROR",
        "Your email was verified, but your neighbor profile could not be completed.",
      );
    }
  }

  if (parsed.data.inviteToken) {
    if (!parsed.data.idempotencyKey) {
      return actionFailure(
        "VALIDATION_FAILED",
        "The invitation could not be completed safely. Refresh the page and try again.",
      );
    }
    const { error: inviteError } = await supabase.rpc("accept_circle_invite", {
      p_input: {
        tokenHash: hashOpaqueToken(parsed.data.inviteToken),
        idempotencyKey: parsed.data.idempotencyKey,
      },
    });
    if (inviteError) {
      return actionFailure(
        inviteError.code === "P0002" ? "TOKEN_EXPIRED" : "NOT_AUTHORIZED",
        inviteError.code === "P0002"
          ? "This invitation has expired or reached its join limit. Ask Bruce for a fresh Paseos link."
          : "Your email is verified, but this Paseos invitation needs an administrator’s attention.",
      );
    }
  }

  return actionSuccess({
    next: parsed.data.next,
    mockMode: false,
    joinedCircle: Boolean(parsed.data.inviteToken),
  });
}

export async function signOutAction(): Promise<ActionResult<{ next: string }>> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  return actionSuccess({ next: "/login" });
}
