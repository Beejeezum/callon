import { z } from "zod";
import {
  circleRoles,
  needKinds,
  offerStatuses,
  resourceVisibilities,
  resourceWillingness,
  riskLevels,
} from "./enums";

const trimmed = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

export const createCircleSchema = z.object({
  name: trimmed(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/),
  description: optionalText(1200),
  generalArea: trimmed(100),
  joinPolicy: z
    .enum(["invite_only", "invite_or_approval", "admin_approval"])
    .default("invite_only"),
  idempotencyKey: z.string().min(16).max(200),
});

export const createCircleInviteSchema = z.object({
  circleId: z.uuid(),
  role: z.enum(circleRoles).default("member"),
  maxUses: z.number().int().min(1).max(250).default(1),
  expiresAt: z.iso.datetime(),
  idempotencyKey: z.string().min(16).max(200),
});

export const acceptCircleInviteSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{24,128}$/),
  idempotencyKey: z.string().min(16).max(200),
});

export const needInputSchema = z.object({
  kind: z.enum(needKinds),
  title: trimmed(100),
  description: optionalText(500),
  quantityRequested: z.number().positive().max(1000).default(1),
  unit: optionalText(30),
  riskLevel: z.enum(riskLevels).default("low"),
});

export const createAskSchema = z.object({
  circleId: z.uuid(),
  title: trimmed(120),
  description: optionalText(1200),
  generalLocation: trimmed(100),
  neededBy: z.iso.datetime(),
  startsAt: z.iso.datetime().optional(),
  needs: z.array(needInputSchema).min(1).max(20),
  idempotencyKey: z.string().min(16).max(200),
});

export const submitOfferSchema = z
  .object({
    askId: z.uuid(),
    needId: z.uuid(),
    resourceId: z.uuid().optional(),
    offerType: z.enum(needKinds),
    freeformItemName: optionalText(100),
    description: trimmed(800),
    quantity: z.number().positive().max(1000).default(1),
    availableFrom: z.iso.datetime().optional(),
    availableUntil: z.iso.datetime().optional(),
    conditions: optionalText(600),
    idempotencyKey: z.string().min(16).max(200),
  })
  .superRefine((value, ctx) => {
    if (
      value.offerType === "lend" &&
      !value.resourceId &&
      !value.freeformItemName
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["freeformItemName"],
        message: "Describe the unlisted item or select a saved resource.",
      });
    }
  });

export const acceptOfferSchema = z.object({
  offerId: z.uuid(),
  startsAt: z.iso.datetime().optional(),
  dueAt: z.iso.datetime().optional(),
  exactLocationPayload: z
    .object({
      label: trimmed(80),
      addressLine1: trimmed(160),
      addressLine2: optionalText(160),
      locality: trimmed(100),
      region: trimmed(100),
      postalCode: trimmed(20),
      pickupNotes: optionalText(500),
    })
    .optional(),
  idempotencyKey: z.string().min(16).max(200),
});

export const updateLoanSchema = z.object({
  loanId: z.uuid(),
  action: z.enum([
    "confirm_handoff",
    "request_extension",
    "approve_extension",
    "mark_returned",
    "confirm_return",
    "report_issue",
  ]),
  proposedDueAt: z.iso.datetime().optional(),
  note: optionalText(800),
  idempotencyKey: z.string().min(16).max(200),
});

export const saveResourceSchema = z.object({
  sourceOfferId: z.uuid().optional(),
  sourceLoanId: z.uuid().optional(),
  title: trimmed(100),
  description: optionalText(800),
  categoryId: z.uuid().optional(),
  visibility: z.enum(resourceVisibilities).default("match_only"),
  willingness: z.enum(resourceWillingness).default("happy_to_be_asked"),
  idempotencyKey: z.string().min(16).max(200),
});

export const sharedAskTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{24,128}$/);
export const offerStatusSchema = z.enum(offerStatuses);

export const sendMessageSchema = z.object({
  commitmentId: z.uuid(),
  body: trimmed(4000),
  idempotencyKey: z.string().min(16).max(200),
});

export const setCommitmentLocationSchema = z.object({
  commitmentId: z.uuid(),
  locationKind: z
    .enum(["pickup", "return", "event", "other"])
    .default("pickup"),
  label: trimmed(80),
  addressLine1: trimmed(160),
  addressLine2: optionalText(160),
  locality: trimmed(100),
  region: trimmed(100),
  postalCode: trimmed(20),
  pickupNotes: optionalText(500),
  idempotencyKey: z.string().min(16).max(200),
});

export const completeCommitmentSchema = z.object({
  commitmentId: z.uuid(),
  idempotencyKey: z.string().min(16).max(200),
});

export const decideOfferSchema = z.object({
  offerId: z.uuid(),
  action: z.enum(["decline", "withdraw"]),
  idempotencyKey: z.string().min(16).max(200),
});

export const transitionAskSchema = z.object({
  askId: z.uuid(),
  action: z.enum(["cancel", "complete", "archive"]),
  idempotencyKey: z.string().min(16).max(200),
});

export const reportIncidentSchema = z.object({
  circleId: z.uuid(),
  subjectProfileId: z.uuid().optional(),
  askId: z.uuid().optional(),
  commitmentId: z.uuid().optional(),
  loanId: z.uuid().optional(),
  kind: z.enum([
    "late_return",
    "missing_component",
    "damage",
    "unsafe_item",
    "harassment",
    "privacy",
    "prohibited_content",
    "other",
  ]),
  summary: z.string().trim().min(10).max(2000),
  idempotencyKey: z.string().min(16).max(200),
});

export const moderateMembershipSchema = z.object({
  membershipId: z.uuid(),
  action: z.enum(["activate", "restrict", "suspend", "restore"]),
  idempotencyKey: z.string().min(16).max(200),
});
