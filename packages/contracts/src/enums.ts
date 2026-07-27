export const circleMembershipStatuses = [
  "invited",
  "pending",
  "active",
  "restricted",
  "suspended",
  "left",
] as const;

export const circleRoles = ["member", "moderator", "circle_admin"] as const;
export const askStatuses = [
  "draft",
  "open",
  "partially_fulfilled",
  "ready",
  "in_progress",
  "completed",
  "cancelled",
  "expired",
  "archived",
] as const;
export const needKinds = [
  "lend",
  "give",
  "help",
  "advice",
  "recommendation",
  "alternative",
] as const;
export const needStatuses = [
  "open",
  "partially_covered",
  "covered",
  "completed",
  "cancelled",
] as const;
export const offerStatuses = [
  "draft",
  "submitted",
  "accepted",
  "declined",
  "withdrawn",
  "expired",
] as const;
export const commitmentStatuses = [
  "accepted",
  "coordinating",
  "ready_for_handoff",
  "active",
  "fulfilled",
  "cancelled",
  "disputed",
] as const;
export const loanStatuses = [
  "pending_handoff",
  "checked_out",
  "extension_requested",
  "return_marked",
  "returned",
  "overdue",
  "disputed",
  "cancelled",
] as const;
export const riskLevels = [
  "low",
  "moderate",
  "restricted",
  "prohibited",
] as const;
export const resourceVisibilities = [
  "private",
  "match_only",
  "circle",
] as const;
export const resourceWillingness = [
  "happy_to_be_asked",
  "community_projects_only",
  "weekends",
  "paused",
] as const;
export const incidentStatuses = [
  "open",
  "awaiting_response",
  "under_review",
  "resolved",
  "closed",
] as const;
