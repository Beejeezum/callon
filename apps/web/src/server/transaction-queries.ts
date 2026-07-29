import "server-only";
import { cache } from "react";
import type { Offer } from "@/lib/mock-data";
import {
  getOffer as getMockOffer,
  offers as mockOffers,
} from "@/lib/mock-data";
import { isSupabaseConfigured } from "@/lib/public-env";
import { formatPaseosDateTime } from "@/lib/paseos-time";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { decryptLocation, type ExactLocationPayload } from "./location-crypto";

function dateTime(value: string | null) {
  if (!value) return "Coordinate privately";
  return formatPaseosDateTime(value, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const getOffersForAsk = cache(
  async (askId: string): Promise<Offer[]> => {
    if (!isSupabaseConfigured) {
      return mockOffers.filter((offer) => offer.askId === askId);
    }
    const supabase = await createSupabaseServerClient();
    const { data: rows, error } = await supabase
      .from("offers")
      .select(
        "id, ask_id, need_id, contributor_profile_id, offer_type, freeform_item_name, description, quantity, available_from, available_until, conditions, status, submitted_at",
      )
      .eq("ask_id", askId)
      .in("status", ["submitted", "accepted"])
      .order("submitted_at", { ascending: false });
    if (error) return [];
    const profileIds = [
      ...new Set((rows ?? []).map((row) => row.contributor_profile_id)),
    ];
    const { data: profiles } = profileIds.length
      ? await supabase
          .from("profiles")
          .select("id, display_name, avatar_path")
          .in("id", profileIds)
      : { data: [] };
    const { data: ask } = await supabase
      .from("asks")
      .select("general_location, needed_by")
      .eq("id", askId)
      .maybeSingle();

    return (rows ?? []).map((row) => {
      const profile = (profiles ?? []).find(
        (candidate) => candidate.id === row.contributor_profile_id,
      );
      return {
        id: row.id,
        askId: row.ask_id,
        needId: row.need_id,
        name: profile?.display_name ?? "Verified neighbor",
        avatar: profile?.avatar_path ?? undefined,
        message:
          row.offer_type === "lend"
            ? `Can lend ${row.freeform_item_name ?? "an item"}.`
            : row.description,
        detail: row.description,
        itemName: row.freeform_item_name ?? undefined,
        quantity: Number(row.quantity),
        availability:
          row.available_from || row.available_until
            ? `${dateTime(row.available_from)} – ${dateTime(row.available_until)}`
            : row.conditions || "Coordinate timing privately",
        generalLocation: ask?.general_location ?? "General Circle area",
        completedShares: 0,
        receivedLabel: dateTime(row.submitted_at),
        status: row.status,
        neededBy: ask?.needed_by ?? undefined,
        submittedAt: row.submitted_at,
      };
    });
  },
);

export const getOfferDetail = cache(
  async (offerId: string): Promise<Offer | null> => {
    if (!isSupabaseConfigured) return getMockOffer(offerId);
    const supabase = await createSupabaseServerClient();
    const { data: row, error } = await supabase
      .from("offers")
      .select(
        "id, ask_id, need_id, contributor_profile_id, offer_type, freeform_item_name, description, quantity, available_from, available_until, conditions, status, submitted_at",
      )
      .eq("id", offerId)
      .maybeSingle();
    if (error || !row) return null;
    const [{ data: profile }, { data: ask }] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, avatar_path")
        .eq("id", row.contributor_profile_id)
        .maybeSingle(),
      supabase
        .from("asks")
        .select("general_location, needed_by")
        .eq("id", row.ask_id)
        .maybeSingle(),
    ]);
    return {
      id: row.id,
      askId: row.ask_id,
      needId: row.need_id,
      name: profile?.display_name ?? "Verified neighbor",
      avatar: profile?.avatar_path ?? undefined,
      message:
        row.offer_type === "lend"
          ? `Can lend ${row.freeform_item_name ?? "an item"}.`
          : row.description,
      detail: row.description,
      itemName: row.freeform_item_name ?? undefined,
      quantity: Number(row.quantity),
      availability:
        row.available_from || row.available_until
          ? `${dateTime(row.available_from)} – ${dateTime(row.available_until)}`
          : row.conditions || "Coordinate timing privately",
      generalLocation: ask?.general_location ?? "General Circle area",
      completedShares: 0,
      receivedLabel: dateTime(row.submitted_at),
      status: row.status,
      neededBy: ask?.needed_by ?? undefined,
      submittedAt: row.submitted_at,
    };
  },
);

export type CommitmentMessage = {
  id: string;
  mine: boolean;
  text: string;
  time: string;
};

export type CommitmentView = {
  id: string;
  askId: string;
  askTitle: string;
  status: string;
  contributionType: string;
  itemName: string;
  quantity: number;
  counterpartName: string;
  counterpartAvatar?: string;
  startsAt: string | null;
  dueAt: string | null;
  loanId: string | null;
  loanStatus: string | null;
  viewerIsRequester: boolean;
  exactLocation: ExactLocationPayload | null;
  locationRequiresStepUp: boolean;
  messages: CommitmentMessage[];
};

export const getCommitmentDetail = cache(
  async (
    commitmentId: string,
    viewerProfileId: string | null,
  ): Promise<CommitmentView | null> => {
    if (!isSupabaseConfigured) {
      return {
        id: "birthday-tables",
        askId: "birthday-party",
        askTitle: "Hosting a birthday party 🎉",
        status: "accepted",
        contributionType: "lend",
        itemName: "2 folding tables",
        quantity: 2,
        counterpartName: "Janet",
        counterpartAvatar: "/assets/avatar-lisa.png",
        startsAt: "2026-08-01T19:00:00Z",
        dueAt: "2026-08-02T22:00:00Z",
        loanId: "birthday-tables",
        loanStatus: "pending_handoff",
        viewerIsRequester: true,
        exactLocation: null,
        locationRequiresStepUp: false,
        messages: [],
      };
    }
    const supabase = await createSupabaseServerClient();
    const { data: row, error } = await supabase
      .from("commitments")
      .select(
        "id, ask_id, requester_profile_id, contributor_profile_id, contribution_type, quantity, summary_snapshot, status, starts_at, due_at, conversation_id, exact_location_id",
      )
      .eq("id", commitmentId)
      .maybeSingle();
    if (error || !row || !viewerProfileId) return null;
    const counterpartId =
      row.requester_profile_id === viewerProfileId
        ? row.contributor_profile_id
        : row.requester_profile_id;
    const [
      { data: profile },
      { data: ask },
      { data: loan },
      { data: messages },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, avatar_path")
        .eq("id", counterpartId)
        .maybeSingle(),
      supabase.from("asks").select("title").eq("id", row.ask_id).maybeSingle(),
      supabase
        .from("loans")
        .select("id, status")
        .eq("commitment_id", row.id)
        .maybeSingle(),
      supabase
        .from("messages")
        .select("id, sender_profile_id, body, sent_at")
        .eq("conversation_id", row.conversation_id)
        .is("deleted_at", null)
        .order("sent_at"),
    ]);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const lastVerified = user?.last_sign_in_at
      ? new Date(user.last_sign_in_at).getTime()
      : 0;
    const recentVerification = Date.now() - lastVerified <= 12 * 60 * 60 * 1000;
    let exactLocation: ExactLocationPayload | null = null;
    if (row.exact_location_id && recentVerification) {
      const { data: encrypted } = await supabase.rpc(
        "get_commitment_location",
        { p_commitment_id: row.id },
      );
      if (
        encrypted &&
        typeof encrypted === "object" &&
        !Array.isArray(encrypted)
      ) {
        try {
          exactLocation = decryptLocation(
            encrypted as {
              ciphertext: string;
              nonce: string;
              keyVersion: number;
            },
          );
        } catch {
          exactLocation = null;
        }
      }
    }
    const snapshot =
      row.summary_snapshot &&
      typeof row.summary_snapshot === "object" &&
      !Array.isArray(row.summary_snapshot)
        ? row.summary_snapshot
        : {};
    return {
      id: row.id,
      askId: row.ask_id,
      askTitle: ask?.title ?? "Original Ask",
      status: row.status,
      contributionType: row.contribution_type,
      itemName:
        typeof snapshot.item_name === "string" && snapshot.item_name
          ? snapshot.item_name
          : typeof snapshot.description === "string"
            ? snapshot.description
            : "Neighbor contribution",
      quantity: Number(row.quantity),
      counterpartName: profile?.display_name ?? "Verified neighbor",
      counterpartAvatar: profile?.avatar_path ?? undefined,
      startsAt: row.starts_at,
      dueAt: row.due_at,
      loanId: loan?.id ?? null,
      loanStatus: loan?.status ?? null,
      viewerIsRequester: row.requester_profile_id === viewerProfileId,
      exactLocation,
      locationRequiresStepUp:
        Boolean(row.exact_location_id) && !recentVerification,
      messages: (messages ?? []).map((message) => ({
        id: message.id,
        mine: message.sender_profile_id === viewerProfileId,
        text: message.body,
        time: dateTime(message.sent_at),
      })),
    };
  },
);

export type LoanView = {
  id: string;
  circleId: string;
  commitmentId: string;
  status: string;
  itemName: string;
  counterpartName: string;
  counterpartProfileId: string;
  viewerIsLender: boolean;
  checkedOutAt: string | null;
  dueAt: string | null;
  proposedDueAt: string | null;
  events: Array<{ id: string; type: string; createdAt: string }>;
};

export const getLoanDetail = cache(
  async (
    loanId: string,
    viewerProfileId: string | null,
  ): Promise<LoanView | null> => {
    if (!isSupabaseConfigured) {
      return {
        id: "birthday-tables",
        circleId: "b0b08438-1234-4a2d-9ea2-2a88f3f47001",
        commitmentId: "birthday-tables",
        status: "checked_out",
        itemName: "2 folding tables",
        counterpartName: "Janet",
        counterpartProfileId: "mock-janet",
        viewerIsLender: false,
        checkedOutAt: "2026-08-01T19:05:00Z",
        dueAt: "2026-08-02T22:00:00Z",
        proposedDueAt: null,
        events: [],
      };
    }
    const supabase = await createSupabaseServerClient();
    const { data: loan, error } = await supabase
      .from("loans")
      .select(
        "id, circle_id, commitment_id, lender_profile_id, borrower_profile_id, status, due_at, checked_out_at, proposed_due_at",
      )
      .eq("id", loanId)
      .maybeSingle();
    if (error || !loan || !viewerProfileId) return null;
    const viewerIsLender = loan.lender_profile_id === viewerProfileId;
    const counterpartId = viewerIsLender
      ? loan.borrower_profile_id
      : loan.lender_profile_id;
    const [{ data: profile }, { data: commitment }, { data: events }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("display_name")
          .eq("id", counterpartId)
          .maybeSingle(),
        supabase
          .from("commitments")
          .select("summary_snapshot")
          .eq("id", loan.commitment_id)
          .maybeSingle(),
        supabase
          .from("loan_events")
          .select("id, event_type, created_at")
          .eq("loan_id", loan.id)
          .order("created_at"),
      ]);
    const snapshot =
      commitment?.summary_snapshot &&
      typeof commitment.summary_snapshot === "object" &&
      !Array.isArray(commitment.summary_snapshot)
        ? commitment.summary_snapshot
        : {};
    return {
      id: loan.id,
      circleId: loan.circle_id,
      commitmentId: loan.commitment_id,
      status: loan.status,
      itemName:
        typeof snapshot.item_name === "string" && snapshot.item_name
          ? snapshot.item_name
          : "Borrowed item",
      counterpartName: profile?.display_name ?? "Verified neighbor",
      counterpartProfileId: counterpartId,
      viewerIsLender,
      checkedOutAt: loan.checked_out_at,
      dueAt: loan.due_at,
      proposedDueAt: loan.proposed_due_at,
      events: (events ?? []).map((event) => ({
        id: event.id,
        type: event.event_type,
        createdAt: event.created_at,
      })),
    };
  },
);
