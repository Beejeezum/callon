import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/public-env";
import { formatPaseosDateTime } from "@/lib/paseos-time";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function shortDate(value: string | null) {
  if (!value) return "";
  return formatPaseosDateTime(value, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type ActivityData = {
  asks: Array<{
    id: string;
    title: string;
    status: string;
    neededBy: string;
    coveredNeeds: number;
    totalNeeds: number;
    offerCount: number;
  }>;
  offers: Array<{
    id: string;
    askId: string;
    askTitle: string;
    summary: string;
    status: string;
    submittedAt: string;
    commitmentId: string | null;
  }>;
  loans: Array<{
    id: string;
    itemName: string;
    status: string;
    dueAt: string | null;
    direction: "lent" | "borrowed";
    counterpartName: string;
  }>;
  resources: Array<{
    id: string;
    title: string;
    visibility: string;
    willingness: string;
    status: string;
    savedAt: string;
    image?: string;
  }>;
};

const mockActivity: ActivityData = {
  asks: [
    {
      id: "birthday-party",
      title: "Hosting a birthday party 🎉",
      status: "open",
      neededBy: "May 25",
      coveredNeeds: 3,
      totalNeeds: 4,
      offerCount: 4,
    },
  ],
  offers: [
    {
      id: "janet-tables",
      askId: "birthday-party",
      askTitle: "Hosting a birthday party 🎉",
      summary: "2 folding tables",
      status: "accepted",
      submittedAt: "May 24",
      commitmentId: "birthday-tables",
    },
  ],
  loans: [
    {
      id: "birthday-tables",
      itemName: "2 folding tables",
      status: "checked_out",
      dueAt: "2026-08-02T22:00:00Z",
      direction: "borrowed",
      counterpartName: "Janet",
    },
  ],
  resources: [
    {
      id: "tables",
      title: "2 folding tables",
      visibility: "match_only",
      willingness: "happy_to_be_asked",
      status: "active",
      savedAt: "May 10",
      image: "/assets/folding-table.jpg",
    },
  ],
};

export const getMyActivity = cache(
  async (profileId: string | null): Promise<ActivityData> => {
    if (!isSupabaseConfigured || !profileId) return mockActivity;
    const supabase = await createSupabaseServerClient();
    const [
      { data: askRows },
      { data: offerRows },
      { data: loanRows },
      { data: resourceRows },
    ] = await Promise.all([
      supabase
        .from("asks")
        .select("id, title, status, needed_by")
        .eq("created_by", profileId)
        .order("created_at", { ascending: false }),
      supabase
        .from("offers")
        .select(
          "id, ask_id, freeform_item_name, description, status, submitted_at",
        )
        .eq("contributor_profile_id", profileId)
        .order("submitted_at", { ascending: false }),
      supabase
        .from("loans")
        .select(
          "id, commitment_id, lender_profile_id, borrower_profile_id, status, due_at",
        )
        .or(
          `lender_profile_id.eq.${profileId},borrower_profile_id.eq.${profileId}`,
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("resources")
        .select(
          "id, title, visibility, willingness, status, created_at, image_path",
        )
        .eq("owner_profile_id", profileId)
        .order("created_at", { ascending: false }),
    ]);

    const askIds = (askRows ?? []).map((ask) => ask.id);
    const offerAskIds = (offerRows ?? []).map((offer) => offer.ask_id);
    const loanCommitmentIds = (loanRows ?? []).map(
      (loan) => loan.commitment_id,
    );
    const loanCounterpartIds = (loanRows ?? []).map((loan) =>
      loan.lender_profile_id === profileId
        ? loan.borrower_profile_id
        : loan.lender_profile_id,
    );

    const [
      { data: needs },
      { data: offersOnMyAsks },
      { data: offerAsks },
      { data: offerCommitments },
      { data: loanCommitments },
      { data: counterpartProfiles },
    ] = await Promise.all([
      askIds.length
        ? supabase
            .from("ask_needs")
            .select("ask_id, status")
            .in("ask_id", askIds)
        : Promise.resolve({ data: [] }),
      askIds.length
        ? supabase.from("offers").select("ask_id").in("ask_id", askIds)
        : Promise.resolve({ data: [] }),
      offerAskIds.length
        ? supabase.from("asks").select("id, title").in("id", offerAskIds)
        : Promise.resolve({ data: [] }),
      (offerRows ?? []).length
        ? supabase
            .from("commitments")
            .select("id, offer_id")
            .in(
              "offer_id",
              (offerRows ?? []).map((offer) => offer.id),
            )
        : Promise.resolve({ data: [] }),
      loanCommitmentIds.length
        ? supabase
            .from("commitments")
            .select("id, summary_snapshot")
            .in("id", loanCommitmentIds)
        : Promise.resolve({ data: [] }),
      loanCounterpartIds.length
        ? supabase
            .from("profiles")
            .select("id, display_name")
            .in("id", loanCounterpartIds)
        : Promise.resolve({ data: [] }),
    ]);

    return {
      asks: (askRows ?? []).map((ask) => {
        const askNeeds = (needs ?? []).filter((need) => need.ask_id === ask.id);
        return {
          id: ask.id,
          title: ask.title,
          status: ask.status,
          neededBy: shortDate(ask.needed_by),
          coveredNeeds: askNeeds.filter((need) =>
            ["covered", "completed"].includes(need.status),
          ).length,
          totalNeeds: askNeeds.length,
          offerCount: (offersOnMyAsks ?? []).filter(
            (offer) => offer.ask_id === ask.id,
          ).length,
        };
      }),
      offers: (offerRows ?? []).map((offer) => ({
        id: offer.id,
        askId: offer.ask_id,
        askTitle:
          (offerAsks ?? []).find((ask) => ask.id === offer.ask_id)?.title ??
          "Shared Ask",
        summary: offer.freeform_item_name ?? offer.description,
        status: offer.status,
        submittedAt: shortDate(offer.submitted_at),
        commitmentId:
          (offerCommitments ?? []).find(
            (commitment) => commitment.offer_id === offer.id,
          )?.id ?? null,
      })),
      loans: (loanRows ?? []).map((loan) => {
        const commitment = (loanCommitments ?? []).find(
          (candidate) => candidate.id === loan.commitment_id,
        );
        const snapshot =
          commitment?.summary_snapshot &&
          typeof commitment.summary_snapshot === "object" &&
          !Array.isArray(commitment.summary_snapshot)
            ? commitment.summary_snapshot
            : {};
        const counterpartId =
          loan.lender_profile_id === profileId
            ? loan.borrower_profile_id
            : loan.lender_profile_id;
        return {
          id: loan.id,
          itemName:
            typeof snapshot.item_name === "string" && snapshot.item_name
              ? snapshot.item_name
              : "Shared item",
          status: loan.status,
          dueAt: loan.due_at,
          direction:
            loan.lender_profile_id === profileId
              ? ("lent" as const)
              : ("borrowed" as const),
          counterpartName:
            (counterpartProfiles ?? []).find(
              (profile) => profile.id === counterpartId,
            )?.display_name ?? "Verified neighbor",
        };
      }),
      resources: (resourceRows ?? []).map((resource) => ({
        id: resource.id,
        title: resource.title,
        visibility: resource.visibility,
        willingness: resource.willingness,
        status: resource.status,
        savedAt: shortDate(resource.created_at),
        image: resource.image_path ?? undefined,
      })),
    };
  },
);

export type InboxData = {
  messages: Array<{
    id: string;
    commitmentId: string;
    name: string;
    avatar?: string;
    preview: string;
    time: string;
    unread: boolean;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    detail: string;
    href: string;
    tone: "normal" | "warning";
  }>;
};

export const getInbox = cache(
  async (profileId: string | null): Promise<InboxData> => {
    if (!isSupabaseConfigured || !profileId) {
      return {
        messages: [
          {
            id: "m1",
            commitmentId: "birthday-tables",
            name: "Janet",
            avatar: "/assets/avatar-lisa.png",
            preview: "Pickup confirmed for Friday at 7 PM.",
            time: "Just now",
            unread: true,
          },
        ],
        notifications: [],
      };
    }
    const supabase = await createSupabaseServerClient();
    const { data: commitments } = await supabase
      .from("commitments")
      .select(
        "id, conversation_id, requester_profile_id, contributor_profile_id",
      )
      .or(
        `requester_profile_id.eq.${profileId},contributor_profile_id.eq.${profileId}`,
      );
    const conversationIds = (commitments ?? []).map(
      (commitment) => commitment.conversation_id,
    );
    const counterpartIds = (commitments ?? []).map((commitment) =>
      commitment.requester_profile_id === profileId
        ? commitment.contributor_profile_id
        : commitment.requester_profile_id,
    );
    const [{ data: messages }, { data: profiles }, { data: loans }] =
      await Promise.all([
        conversationIds.length
          ? supabase
              .from("messages")
              .select("id, conversation_id, sender_profile_id, body, sent_at")
              .in("conversation_id", conversationIds)
              .is("deleted_at", null)
              .order("sent_at", { ascending: false })
          : Promise.resolve({ data: [] }),
        counterpartIds.length
          ? supabase
              .from("profiles")
              .select("id, display_name, avatar_path")
              .in("id", counterpartIds)
          : Promise.resolve({ data: [] }),
        supabase
          .from("loans")
          .select("id, status, due_at, lender_profile_id, borrower_profile_id")
          .or(
            `lender_profile_id.eq.${profileId},borrower_profile_id.eq.${profileId}`,
          )
          .in("status", [
            "checked_out",
            "extension_requested",
            "return_marked",
            "overdue",
            "disputed",
          ]),
      ]);

    const messageSummaries = (commitments ?? [])
      .map((commitment) => {
        const latest = (messages ?? []).find(
          (message) => message.conversation_id === commitment.conversation_id,
        );
        const counterpartId =
          commitment.requester_profile_id === profileId
            ? commitment.contributor_profile_id
            : commitment.requester_profile_id;
        const profile = (profiles ?? []).find(
          (candidate) => candidate.id === counterpartId,
        );
        return latest
          ? {
              id: latest.id,
              commitmentId: commitment.id,
              name: profile?.display_name ?? "Verified neighbor",
              avatar: profile?.avatar_path ?? undefined,
              preview: latest.body,
              time: shortDate(latest.sent_at),
              unread: latest.sender_profile_id !== profileId,
            }
          : null;
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    return {
      messages: messageSummaries,
      notifications: (loans ?? []).map((loan) => ({
        id: loan.id,
        title:
          loan.status === "overdue"
            ? "Return overdue"
            : loan.status === "return_marked"
              ? "Return needs confirmation"
              : loan.status === "extension_requested"
                ? "Extension needs a response"
                : "Active Loan",
        detail: loan.due_at ? `Due ${shortDate(loan.due_at)}` : "Open custody",
        href: `/loans/${loan.id}`,
        tone:
          loan.status === "overdue" || loan.status === "disputed"
            ? "warning"
            : "normal",
      })),
    };
  },
);

export type ResourceView = {
  id: string;
  title: string;
  description: string;
  visibility: "private" | "match_only" | "circle";
  willingness:
    "happy_to_be_asked" | "community_projects_only" | "weekends" | "paused";
  status: "active" | "paused" | "retired";
  categoryId?: string;
  usualTerms: string;
  ownerName: string;
  isOwner: boolean;
  image?: string;
};

export const getResource = cache(
  async (
    resourceId: string,
    profileId: string | null,
  ): Promise<ResourceView | null> => {
    if (!isSupabaseConfigured || !profileId) {
      return {
        id: resourceId,
        title: "2 folding tables",
        description: "Hard-side item in good condition.",
        visibility: "match_only",
        willingness: "happy_to_be_asked",
        status: "active",
        usualTerms: "Please return it clean and folded.",
        ownerName: "Janet",
        isOwner: resourceId === "tables",
        image: "/assets/folding-table.jpg",
      };
    }
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("resources")
      .select(
        "id, title, description, visibility, willingness, status, image_path, category_id, usual_terms, owner_profile_id",
      )
      .eq("id", resourceId)
      .maybeSingle();
    if (error || !data) return null;
    const { data: owner } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", data.owner_profile_id)
      .maybeSingle();
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      visibility: data.visibility,
      willingness: data.willingness,
      status: data.status,
      categoryId: data.category_id ?? undefined,
      usualTerms: data.usual_terms ?? "",
      ownerName:
        data.owner_profile_id === profileId
          ? "You"
          : (owner?.display_name ?? "A Paseos neighbor"),
      isOwner: data.owner_profile_id === profileId,
      image: data.image_path ?? undefined,
    };
  },
);

export type ProfileView = {
  displayName: string;
  avatar?: string;
  timezone: string;
  emailEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  completedShares: number;
  unresolvedIssues: number;
  memberSince: string;
};

export const getProfileView = cache(
  async (profileId: string | null): Promise<ProfileView> => {
    if (!isSupabaseConfigured || !profileId) {
      return {
        displayName: "Emily",
        avatar: "/assets/avatar-lisa.png",
        timezone: "America/New_York",
        emailEnabled: true,
        quietHoursStart: "",
        quietHoursEnd: "",
        completedShares: 6,
        unresolvedIssues: 0,
        memberSince: "May 2026",
      };
    }
    const supabase = await createSupabaseServerClient();
    const [
      { data: profile },
      { data: preferences },
      { count: completedShares },
      { count: unresolvedIssues },
      { data: membership },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, avatar_path, timezone")
        .eq("id", profileId)
        .single(),
      supabase
        .from("notification_preferences")
        .select("email_enabled, quiet_hours_start, quiet_hours_end, timezone")
        .eq("profile_id", profileId)
        .maybeSingle(),
      supabase
        .from("loans")
        .select("id", { count: "exact", head: true })
        .eq("status", "returned")
        .or(
          `lender_profile_id.eq.${profileId},borrower_profile_id.eq.${profileId}`,
        ),
      supabase
        .from("incidents")
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "awaiting_response", "under_review"])
        .or(`reported_by.eq.${profileId},subject_profile_id.eq.${profileId}`),
      supabase
        .from("circle_memberships")
        .select("joined_at")
        .eq("profile_id", profileId)
        .in("status", ["active", "restricted"])
        .order("joined_at")
        .limit(1)
        .maybeSingle(),
    ]);
    return {
      displayName: profile?.display_name ?? "Neighbor",
      avatar: profile?.avatar_path ?? undefined,
      timezone:
        preferences?.timezone ?? profile?.timezone ?? "America/New_York",
      emailEnabled: preferences?.email_enabled ?? true,
      quietHoursStart: preferences?.quiet_hours_start ?? "",
      quietHoursEnd: preferences?.quiet_hours_end ?? "",
      completedShares: completedShares ?? 0,
      unresolvedIssues: unresolvedIssues ?? 0,
      memberSince: membership?.joined_at
        ? formatPaseosDateTime(membership.joined_at, {
            month: "long",
            year: "numeric",
          })
        : "Recently",
    };
  },
);
