import { z } from "zod";

export const domainEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ask.published"),
    askId: z.uuid(),
    circleId: z.uuid(),
    occurredAt: z.iso.datetime(),
  }),
  z.object({
    type: z.literal("offer.submitted"),
    offerId: z.uuid(),
    askId: z.uuid(),
    occurredAt: z.iso.datetime(),
  }),
  z.object({
    type: z.literal("offer.accepted"),
    offerId: z.uuid(),
    commitmentId: z.uuid(),
    occurredAt: z.iso.datetime(),
  }),
  z.object({
    type: z.literal("loan.checked_out"),
    loanId: z.uuid(),
    commitmentId: z.uuid(),
    occurredAt: z.iso.datetime(),
  }),
  z.object({
    type: z.literal("loan.return_marked"),
    loanId: z.uuid(),
    occurredAt: z.iso.datetime(),
  }),
  z.object({
    type: z.literal("loan.return_confirmed"),
    loanId: z.uuid(),
    occurredAt: z.iso.datetime(),
  }),
  z.object({
    type: z.literal("incident.reported"),
    incidentId: z.uuid(),
    circleId: z.uuid(),
    occurredAt: z.iso.datetime(),
  }),
]);

export type DomainEvent = z.infer<typeof domainEventSchema>;
