import type { z } from "zod";
import type {
  acceptOfferSchema,
  createAskSchema,
  submitOfferSchema,
  updateLoanSchema,
} from "@call-on/contracts";

export type Actor = {
  profileId: string;
  circleId?: string;
  role?: "member" | "moderator" | "circle_admin" | "operator";
  source: "session" | "share_guest" | "system";
};

export type CreateAskInput = z.infer<typeof createAskSchema>;
export type SubmitOfferInput = z.infer<typeof submitOfferSchema>;
export type AcceptOfferInput = z.infer<typeof acceptOfferSchema>;
export type UpdateLoanInput = z.infer<typeof updateLoanSchema>;

export type ServiceResult<T> =
  { ok: true; value: T } | { ok: false; code: string; message: string };
