import { describe, expect, it } from "vitest";
import {
  changeMembershipRoleSchema,
  createResourceSchema,
  submitOfferSchema,
} from "./schemas";

const base = {
  askId: "11111111-1111-4111-8111-111111111111",
  needId: "22222222-2222-4222-8222-222222222222",
  offerType: "lend" as const,
  description: "I can lend one.",
  quantity: 1,
  idempotencyKey: "example-idempotency-key-0001",
};

describe("submitOfferSchema", () => {
  it("allows an unlisted item", () => {
    const result = submitOfferSchema.safeParse({
      ...base,
      freeformItemName: "6-foot ladder",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a lend offer with neither resource nor item description", () => {
    const result = submitOfferSchema.safeParse(base);
    expect(result.success).toBe(false);
  });
});

describe("Paseos pilot command contracts", () => {
  it("defaults a quick-added Resource to private matching", () => {
    const result = createResourceSchema.parse({
      circleId: "11111111-1111-4111-8111-111111111111",
      title: " Folding table ",
      idempotencyKey: "resource-create-key-0001",
    });

    expect(result.title).toBe("Folding table");
    expect(result.visibility).toBe("match_only");
    expect(result.willingness).toBe("happy_to_be_asked");
  });

  it("rejects an invalid role assignment", () => {
    const result = changeMembershipRoleSchema.safeParse({
      membershipId: "22222222-2222-4222-8222-222222222222",
      role: "platform_admin",
      idempotencyKey: "membership-role-key-0001",
    });

    expect(result.success).toBe(false);
  });
});
