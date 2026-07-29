"use server";

import {
  acceptOfferSchema,
  completeCommitmentSchema,
  decideOfferSchema,
  reportIncidentSchema,
  saveResourceSchema,
  setCommitmentLocationSchema,
  sendMessageSchema,
  updateLoanSchema,
} from "@call-on/contracts";
import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/public-env";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { actionFailure, actionSuccess } from "./action-result";
import { encryptLocation } from "./location-crypto";

function stateError(message: string) {
  return actionFailure("INVALID_STATE", message);
}

export async function acceptOfferAction(input: unknown) {
  const parsed = acceptOfferSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Choose valid handoff and return timing.",
      parsed.error.flatten().fieldErrors,
    );
  }
  if (!isSupabaseConfigured) {
    return actionSuccess({ commitmentId: "birthday-tables" });
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("accept_offer", {
    p_input: {
      offerId: parsed.data.offerId,
      startsAt: parsed.data.startsAt,
      dueAt: parsed.data.dueAt,
      idempotencyKey: parsed.data.idempotencyKey,
    },
  });
  if (error || !data) {
    return actionFailure(
      error?.code === "42501"
        ? "NOT_AUTHORIZED"
        : error?.code === "22023"
          ? "QUANTITY_UNAVAILABLE"
          : "CONFLICT_RETRY",
      error?.code === "22023"
        ? "That need was just covered by another Offer."
        : "This Offer changed while you were reviewing it. Refresh and try again.",
    );
  }
  revalidatePath(`/offers/${parsed.data.offerId}`);
  revalidatePath("/activity");
  return actionSuccess({ commitmentId: data });
}

export async function decideOfferAction(input: unknown) {
  const parsed = decideOfferSchema.safeParse(input);
  if (!parsed.success) return stateError("That Offer action is unavailable.");
  if (!isSupabaseConfigured) {
    return actionSuccess({ offerId: parsed.data.offerId });
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("decide_offer", {
    p_input: parsed.data,
  });
  if (error || !data) return stateError("The Offer is no longer available.");
  revalidatePath(`/offers/${parsed.data.offerId}`);
  return actionSuccess({ offerId: data });
}

export async function sendCommitmentMessageAction(input: unknown) {
  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Write a message before sending.",
      parsed.error.flatten().fieldErrors,
    );
  }
  if (!isSupabaseConfigured) {
    return actionSuccess({ messageId: crypto.randomUUID() });
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("send_commitment_message", {
    p_input: parsed.data,
  });
  if (error || !data) {
    return actionFailure(
      error?.code === "42501" ? "NOT_AUTHORIZED" : "INVALID_STATE",
      "This private conversation is not available.",
    );
  }
  revalidatePath(`/commitments/${parsed.data.commitmentId}`);
  revalidatePath("/inbox");
  return actionSuccess({ messageId: data });
}

export async function setCommitmentLocationAction(input: unknown) {
  const parsed = setCommitmentLocationSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the private pickup details.",
      parsed.error.flatten().fieldErrors,
    );
  }
  if (!isSupabaseConfigured) {
    return actionSuccess({ locationId: "mock-location" });
  }
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const lastVerified = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).getTime()
    : 0;
  if (Date.now() - lastVerified > 12 * 60 * 60 * 1000) {
    return actionFailure(
      "VERIFICATION_REQUIRED",
      "Verify your contact again before adding an exact location.",
    );
  }
  const encrypted = encryptLocation({
    label: parsed.data.label,
    addressLine1: parsed.data.addressLine1,
    addressLine2: parsed.data.addressLine2 || undefined,
    locality: parsed.data.locality,
    region: parsed.data.region,
    postalCode: parsed.data.postalCode,
    pickupNotes: parsed.data.pickupNotes || undefined,
  });
  const { data, error } = await supabase.rpc("set_commitment_location", {
    p_input: {
      commitmentId: parsed.data.commitmentId,
      locationKind: parsed.data.locationKind,
      ...encrypted,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      idempotencyKey: parsed.data.idempotencyKey,
    },
  });
  if (error || !data) {
    return actionFailure(
      error?.code === "42501" ? "NOT_AUTHORIZED" : "INVALID_STATE",
      "These private logistics could not be saved.",
    );
  }
  revalidatePath(`/commitments/${parsed.data.commitmentId}`);
  return actionSuccess({ locationId: data });
}

export async function completeCommitmentAction(input: unknown) {
  const parsed = completeCommitmentSchema.safeParse(input);
  if (!parsed.success) return stateError("That completion is unavailable.");
  if (!isSupabaseConfigured) {
    return actionSuccess({ commitmentId: parsed.data.commitmentId });
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("complete_non_loan_commitment", {
    p_input: parsed.data,
  });
  if (error || !data) {
    return actionFailure(
      error?.code === "42501" ? "NOT_AUTHORIZED" : "INVALID_STATE",
      "This contribution cannot be completed from its current state.",
    );
  }
  revalidatePath(`/commitments/${parsed.data.commitmentId}`);
  revalidatePath("/activity");
  return actionSuccess({ commitmentId: data });
}

export async function declineLoanExtensionAction(input: unknown) {
  const parsed = updateLoanSchema.safeParse({
    ...(input as Record<string, unknown>),
    action: "approve_extension",
  });
  if (!parsed.success) return stateError("That extension response is invalid.");
  if (!isSupabaseConfigured) {
    return actionSuccess({ loanId: parsed.data.loanId });
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("decline_loan_extension", {
    p_input: {
      loanId: parsed.data.loanId,
      note: parsed.data.note,
      idempotencyKey: parsed.data.idempotencyKey,
    },
  });
  if (error || !data) {
    return actionFailure(
      error?.code === "42501" ? "NOT_AUTHORIZED" : "INVALID_STATE",
      "This extension request is no longer pending.",
    );
  }
  revalidatePath(`/loans/${parsed.data.loanId}`);
  return actionSuccess({ loanId: data });
}

export async function transitionLoanAction(input: unknown) {
  const parsed = updateLoanSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the requested Loan update.",
      parsed.error.flatten().fieldErrors,
    );
  }
  if (!isSupabaseConfigured) {
    return actionSuccess({ loanId: parsed.data.loanId });
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("transition_loan", {
    p_input: parsed.data,
  });
  if (error || !data) {
    return actionFailure(
      error?.code === "42501" ? "NOT_AUTHORIZED" : "INVALID_STATE",
      "That custody update is not valid for the current Loan state.",
    );
  }
  revalidatePath(`/loans/${parsed.data.loanId}`);
  revalidatePath("/activity");
  return actionSuccess({ loanId: data });
}

export async function saveResourceFromLoanAction(input: unknown) {
  const parsed = saveResourceSchema.safeParse(input);
  if (!parsed.success || !parsed.data.sourceLoanId) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the item details before remembering it.",
      parsed.success ? undefined : parsed.error.flatten().fieldErrors,
    );
  }
  if (!isSupabaseConfigured) {
    return actionSuccess({ resourceId: "mock-resource" });
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("save_resource_from_loan", {
    p_input: parsed.data,
  });
  if (error || !data) {
    return actionFailure(
      error?.code === "42501" ? "NOT_AUTHORIZED" : "INVALID_STATE",
      "Only the lender can remember an item after the return is confirmed.",
    );
  }
  revalidatePath("/activity");
  return actionSuccess({ resourceId: data });
}

export async function reportIncidentAction(input: unknown) {
  const parsed = reportIncidentSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Add a brief factual description of the issue.",
      parsed.error.flatten().fieldErrors,
    );
  }
  if (!isSupabaseConfigured) {
    return actionSuccess({ incidentId: "mock-incident" });
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("report_incident", {
    p_input: parsed.data,
  });
  if (error || !data) {
    return actionFailure(
      error?.code === "42501" ? "NOT_AUTHORIZED" : "INTERNAL_ERROR",
      "The private report could not be submitted.",
    );
  }
  revalidatePath("/admin");
  return actionSuccess({ incidentId: data });
}

export async function reportLoanIncidentAction(input: unknown) {
  const parsed = reportIncidentSchema.safeParse(input);
  if (!parsed.success || !parsed.data.loanId) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Add a brief factual description of the Loan issue.",
      parsed.success ? undefined : parsed.error.flatten().fieldErrors,
    );
  }
  if (!isSupabaseConfigured) {
    return actionSuccess({ incidentId: "mock-loan-incident" });
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("report_loan_incident", {
    p_input: {
      loanId: parsed.data.loanId,
      kind: parsed.data.kind,
      summary: parsed.data.summary,
      idempotencyKey: parsed.data.idempotencyKey,
    },
  });
  if (error || !data) {
    return actionFailure(
      error?.code === "42501" ? "NOT_AUTHORIZED" : "INVALID_STATE",
      "This Loan can no longer be reported from its current state.",
    );
  }
  revalidatePath(`/loans/${parsed.data.loanId}`);
  revalidatePath("/activity");
  revalidatePath("/admin");
  return actionSuccess({ incidentId: data });
}
