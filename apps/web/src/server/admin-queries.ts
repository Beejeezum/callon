import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/public-env";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export type AdminOverview = {
  circleId: string;
  circleName: string;
  activeMembers: number;
  completedSharers: number;
  memberships: Array<{
    id: string;
    profileId: string;
    displayName: string;
    role: string;
    status: string;
    joinedAt: string | null;
  }>;
  incidents: Array<{
    id: string;
    kind: string;
    summary: string;
    status: string;
    createdAt: string;
  }>;
};

export const getAdminOverview = cache(
  async (
    circleId: string,
    profileId: string | null,
  ): Promise<AdminOverview | null> => {
    if (!isSupabaseConfigured || !profileId) {
      return {
        circleId: "b0b08438-1234-4a2d-9ea2-2a88f3f47001",
        circleName: "Oakridge HOA",
        activeMembers: 42,
        completedSharers: 8,
        memberships: [
          {
            id: "mock-member",
            profileId: "mock-profile",
            displayName: "Jordan M.",
            role: "member",
            status: "pending",
            joinedAt: null,
          },
        ],
        incidents: [],
      };
    }
    const supabase = await createSupabaseServerClient();
    const { data: ownMembership } = await supabase
      .from("circle_memberships")
      .select("role, status")
      .eq("circle_id", circleId)
      .eq("profile_id", profileId)
      .maybeSingle();
    if (
      ownMembership?.status !== "active" ||
      !["moderator", "circle_admin"].includes(ownMembership.role)
    ) {
      return null;
    }
    const [
      { data: circle },
      { data: memberships },
      { data: incidents },
      { data: completedLoans },
    ] = await Promise.all([
      supabase.from("circles").select("name").eq("id", circleId).single(),
      supabase
        .from("circle_memberships")
        .select("id, profile_id, role, status, joined_at")
        .eq("circle_id", circleId)
        .order("created_at"),
      supabase
        .from("incidents")
        .select("id, kind, summary, status, created_at")
        .eq("circle_id", circleId)
        .in("status", ["open", "awaiting_response", "under_review"])
        .order("created_at", { ascending: false }),
      supabase
        .from("loans")
        .select("lender_profile_id, borrower_profile_id")
        .eq("circle_id", circleId)
        .eq("status", "returned"),
    ]);
    const profileIds = (memberships ?? []).map(
      (membership) => membership.profile_id,
    );
    const { data: profiles } = profileIds.length
      ? await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", profileIds)
      : { data: [] };
    const completedSharers = new Set(
      (completedLoans ?? []).flatMap((loan) => [
        loan.lender_profile_id,
        loan.borrower_profile_id,
      ]),
    ).size;
    return {
      circleId,
      circleName: circle?.name ?? "Private Circle",
      activeMembers: (memberships ?? []).filter(
        (membership) => membership.status === "active",
      ).length,
      completedSharers,
      memberships: (memberships ?? []).map((membership) => ({
        id: membership.id,
        profileId: membership.profile_id,
        displayName:
          (profiles ?? []).find(
            (profile) => profile.id === membership.profile_id,
          )?.display_name ?? "Verified neighbor",
        role: membership.role,
        status: membership.status,
        joinedAt: membership.joined_at,
      })),
      incidents: (incidents ?? []).map((incident) => ({
        id: incident.id,
        kind: incident.kind,
        summary: incident.summary,
        status: incident.status,
        createdAt: incident.created_at,
      })),
    };
  },
);
