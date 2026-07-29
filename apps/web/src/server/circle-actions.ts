"use server";

import {
  acceptCircleInviteSchema,
  createCircleInviteSchema,
  createCircleSchema,
} from "@call-on/contracts";
import { revalidatePath } from "next/cache";
import { isSupabaseConfigured, publicEnv } from "@/lib/public-env";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { actionFailure, actionSuccess } from "./action-result";
import { createOpaqueToken, hashOpaqueToken } from "./tokens";

function databaseFailure(message: string) {
  return actionFailure(
    "INTERNAL_ERROR",
    "Call On could not save that change. Nothing was partially applied. Try again.",
    { database: [message] },
  );
}

export async function createCircleAction(input: unknown) {
  const parsed = createCircleSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the Circle details and try again.",
      parsed.error.flatten().fieldErrors,
    );
  }
  if (!isSupabaseConfigured) {
    return actionSuccess({ circleId: "mock-circle" });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("create_circle", {
    p_input: parsed.data,
  });
  if (error || !data) return databaseFailure(error?.message ?? "No Circle ID");
  revalidatePath("/");
  return actionSuccess({ circleId: data });
}

export async function createCircleInviteAction(input: unknown) {
  const parsed = createCircleInviteSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the invitation settings and try again.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const token = createOpaqueToken();
  if (!isSupabaseConfigured) {
    return actionSuccess({
      inviteId: "mock-invite",
      inviteUrl: `${publicEnv.NEXT_PUBLIC_APP_URL}/join/${token}`,
    });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("create_circle_invite", {
    p_input: {
      ...parsed.data,
      tokenHash: hashOpaqueToken(token),
    },
  });
  if (error || !data) return databaseFailure(error?.message ?? "No invite ID");
  revalidatePath("/admin");
  return actionSuccess({
    inviteId: data,
    inviteUrl: `${publicEnv.NEXT_PUBLIC_APP_URL}/join/${token}`,
  });
}

export async function acceptCircleInviteAction(input: unknown) {
  const parsed = acceptCircleInviteSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "This invitation link is invalid.",
      parsed.error.flatten().fieldErrors,
    );
  }
  if (!isSupabaseConfigured) {
    return actionSuccess({ membershipId: "mock-membership", next: "/" });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("accept_circle_invite", {
    p_input: {
      tokenHash: hashOpaqueToken(parsed.data.token),
      idempotencyKey: parsed.data.idempotencyKey,
    },
  });
  if (error || !data) {
    return actionFailure(
      error?.code === "P0002" ? "TOKEN_EXPIRED" : "NOT_AUTHORIZED",
      error?.code === "P0002"
        ? "This invitation has expired or is no longer available."
        : "This invitation needs an administrator’s attention.",
    );
  }
  revalidatePath("/");
  return actionSuccess({ membershipId: data, next: "/" });
}

export async function getCircleInvitePreview(token: string) {
  if (!isSupabaseConfigured) {
    return {
      circleName: "Paseos Community Sharing",
      generalArea: "Paseos · Boca Raton, Florida",
      description:
        "A private, neighbor-built place for Paseos residents to ask, share, and keep handoffs easy.",
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    };
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.rpc("get_circle_invite_preview", {
      p_token_hash: hashOpaqueToken(token),
    });
    return data as {
      circleName: string;
      generalArea: string;
      description: string;
      expiresAt: string;
    } | null;
  } catch {
    return null;
  }
}
