"use server";

import {
  createAskSchema,
  submitOfferSchema,
  transitionAskSchema,
} from "@call-on/contracts";
import { revalidatePath } from "next/cache";
import { isSupabaseConfigured, publicEnv } from "@/lib/public-env";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { actionFailure, actionSuccess } from "./action-result";
import { createOpaqueToken, hashOpaqueToken } from "./tokens";

function shareExpiry(neededBy: string) {
  return new Date(
    new Date(neededBy).getTime() + 47 * 60 * 60 * 1000,
  ).toISOString();
}

export async function createAndPublishAskAction(input: unknown) {
  const parsed = createAskSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the Ask details and try again.",
      parsed.error.flatten().fieldErrors,
    );
  }
  if (!isSupabaseConfigured) {
    return actionSuccess({
      askId: "birthday-party",
      shareToken: "oakridge-birthday-demo",
      shareUrl: `${publicEnv.NEXT_PUBLIC_APP_URL}/share/oakridge-birthday-demo`,
    });
  }

  const supabase = await createSupabaseServerClient();
  const { data: askId, error: createError } = await supabase.rpc("create_ask", {
    p_input: parsed.data,
  });
  if (createError || !askId) {
    return actionFailure(
      createError?.code === "42501" ? "MEMBERSHIP_REQUIRED" : "INTERNAL_ERROR",
      createError?.code === "42501"
        ? "An active Circle membership is required to create an Ask."
        : "The Ask could not be saved. Nothing was partially published.",
    );
  }

  const shareToken = createOpaqueToken();
  const { error: publishError } = await supabase.rpc("publish_ask_with_share", {
    p_input: {
      askId,
      tokenHash: hashOpaqueToken(shareToken),
      expiresAt: shareExpiry(parsed.data.neededBy),
      idempotencyKey: `${parsed.data.idempotencyKey}:share`,
    },
  });
  if (publishError) {
    return actionFailure(
      publishError.code === "42501" ? "PROHIBITED_CATEGORY" : "INTERNAL_ERROR",
      publishError.code === "42501"
        ? "One of these needs requires safety review before it can be shared."
        : "The draft was saved, but the sharing link was not created. Open the Ask and try sharing again.",
    );
  }

  revalidatePath("/");
  revalidatePath("/activity");
  return actionSuccess({
    askId,
    shareToken,
    shareUrl: `${publicEnv.NEXT_PUBLIC_APP_URL}/share/${shareToken}`,
  });
}

export async function createShareForExistingAskAction(input: {
  askId: string;
  neededBy: string;
  idempotencyKey: string;
}) {
  if (!isSupabaseConfigured) {
    return actionSuccess({
      shareToken: "oakridge-birthday-demo",
      shareUrl: `${publicEnv.NEXT_PUBLIC_APP_URL}/share/oakridge-birthday-demo`,
    });
  }
  const shareToken = createOpaqueToken();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("publish_ask_with_share", {
    p_input: {
      askId: input.askId,
      tokenHash: hashOpaqueToken(shareToken),
      expiresAt: shareExpiry(input.neededBy),
      idempotencyKey: input.idempotencyKey,
    },
  });
  if (error) {
    return actionFailure(
      error.code === "42501" ? "NOT_AUTHORIZED" : "INVALID_STATE",
      "A new sharing link could not be created for this Ask.",
    );
  }
  return actionSuccess({
    shareToken,
    shareUrl: `${publicEnv.NEXT_PUBLIC_APP_URL}/share/${shareToken}`,
  });
}

export async function submitSharedOfferAction(input: unknown) {
  const value = input as Record<string, unknown>;
  const shareToken =
    typeof value.shareToken === "string" ? value.shareToken : "";
  const parsed = submitOfferSchema.safeParse(value);
  if (!parsed.success || !shareToken) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the Offer details and try again.",
      parsed.success ? undefined : parsed.error.flatten().fieldErrors,
    );
  }
  if (!isSupabaseConfigured) {
    return actionSuccess({ offerId: "mock-offer" });
  }

  const supabase = await createSupabaseServerClient();
  const { error: grantError } = await supabase.rpc("redeem_shared_ask", {
    p_token_hash: hashOpaqueToken(shareToken),
  });
  if (grantError) {
    return actionFailure(
      grantError.code === "28000" ? "VERIFICATION_REQUIRED" : "TOKEN_EXPIRED",
      grantError.code === "28000"
        ? "Verify your phone or email before submitting this Offer."
        : "This shared Ask is no longer available.",
    );
  }
  const { data, error } = await supabase.rpc("submit_offer", {
    p_input: parsed.data,
  });
  if (error || !data) {
    return actionFailure(
      error?.code === "42501"
        ? "NOT_AUTHORIZED"
        : error?.code === "22023"
          ? "INVALID_STATE"
          : "INTERNAL_ERROR",
      error?.code === "22023"
        ? "That need is already covered or cannot accept this Offer."
        : "Your Offer could not be submitted. Try again.",
    );
  }
  revalidatePath(`/asks/${parsed.data.askId}/offers`);
  return actionSuccess({ offerId: data });
}

export async function submitMemberOfferAction(input: unknown) {
  const parsed = submitOfferSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the Offer details and try again.",
      parsed.error.flatten().fieldErrors,
    );
  }
  if (!isSupabaseConfigured) {
    return actionSuccess({ offerId: "mock-member-offer" });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("submit_offer", {
    p_input: parsed.data,
  });
  if (error || !data) {
    return actionFailure(
      error?.code === "42501"
        ? "NOT_AUTHORIZED"
        : error?.code === "22023" || error?.code === "P0002"
          ? "INVALID_STATE"
          : "INTERNAL_ERROR",
      error?.code === "42501"
        ? "Only active Circle members can submit a new Offer."
        : error?.code === "22023"
          ? "You cannot offer on your own Ask."
          : error?.code === "P0002"
            ? "That need is already covered or no longer open."
            : "Your Offer could not be submitted. Try again.",
    );
  }
  revalidatePath(`/asks/${parsed.data.askId}`);
  revalidatePath(`/asks/${parsed.data.askId}/offers`);
  revalidatePath("/activity");
  return actionSuccess({ offerId: data });
}

export async function transitionAskAction(input: unknown) {
  const parsed = transitionAskSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure("VALIDATION_FAILED", "That action is not available.");
  }
  if (!isSupabaseConfigured) {
    return actionSuccess({ askId: parsed.data.askId });
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("transition_ask", {
    p_input: parsed.data,
  });
  if (error || !data) {
    return actionFailure(
      error?.code === "42501" ? "NOT_AUTHORIZED" : "INVALID_STATE",
      "The Ask cannot move to that state yet.",
    );
  }
  revalidatePath("/");
  revalidatePath(`/asks/${parsed.data.askId}`);
  return actionSuccess({ askId: data });
}
