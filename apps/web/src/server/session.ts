import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isSupabaseConfigured } from "@/lib/public-env";

export type CircleMembershipSummary = {
  membershipId: string;
  circleId: string;
  circleName: string;
  generalArea: string;
  role: "member" | "moderator" | "circle_admin";
  status:
    "invited" | "pending" | "active" | "restricted" | "suspended" | "left";
};

export type SessionContext = {
  configured: boolean;
  profileId: string | null;
  displayName: string;
  avatarPath: string | null;
  memberships: CircleMembershipSummary[];
  activeMembership: CircleMembershipSummary | null;
};

export const getSessionContext = cache(async (): Promise<SessionContext> => {
  if (!isSupabaseConfigured) {
    return {
      configured: false,
      profileId: null,
      displayName: "Emily",
      avatarPath: "/assets/avatar-lisa.png",
      memberships: [],
      activeMembership: null,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      configured: true,
      profileId: null,
      displayName: "Neighbor",
      avatarPath: null,
      memberships: [],
      activeMembership: null,
    };
  }

  const [{ data: profile }, { data: membershipRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, avatar_path")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("circle_memberships")
      .select("id, circle_id, role, status")
      .eq("profile_id", user.id)
      .in("status", ["active", "restricted", "suspended"]),
  ]);

  const circleIds = (membershipRows ?? []).map((row) => row.circle_id);
  const { data: circleRows } = circleIds.length
    ? await supabase
        .from("circles")
        .select("id, name, general_area")
        .in("id", circleIds)
    : { data: [] };
  const circleById = new Map(
    (circleRows ?? []).map((circle) => [circle.id, circle]),
  );

  const memberships = (membershipRows ?? []).map((row) => {
    const circle = circleById.get(row.circle_id);
    return {
      membershipId: row.id,
      circleId: row.circle_id,
      circleName: circle?.name ?? "Private Circle",
      generalArea: circle?.general_area ?? "",
      role: row.role,
      status: row.status,
    } satisfies CircleMembershipSummary;
  });

  return {
    configured: true,
    profileId: user.id,
    displayName: profile?.display_name ?? "Neighbor",
    avatarPath: profile?.avatar_path ?? null,
    memberships,
    activeMembership:
      memberships.find((membership) => membership.status === "active") ??
      memberships.find((membership) => membership.status === "restricted") ??
      memberships[0] ??
      null,
  };
});
