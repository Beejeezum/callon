import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AcceptOfferInput,
  Actor,
  CreateAskInput,
  SubmitOfferInput,
  UpdateLoanInput,
} from "./types";

/**
 * All authoritative state transitions live in database functions. The repository
 * is intentionally thin: validation and actor resolution happen before these calls,
 * while transactions, row locks, outbox events, and audit records happen in Postgres.
 */
export class CallOnRepository {
  constructor(private readonly db: SupabaseClient) {}

  async createAsk(actor: Actor, input: CreateAskInput) {
    void actor;
    return this.db.rpc("create_ask", { p_input: input });
  }

  async publishAsk(actor: Actor, askId: string, idempotencyKey: string) {
    void actor;
    return this.db.rpc("publish_ask", {
      p_ask_id: askId,
      p_idempotency_key: idempotencyKey,
    });
  }

  async submitOffer(actor: Actor, input: SubmitOfferInput) {
    void actor;
    return this.db.rpc("submit_offer", { p_input: input });
  }

  async acceptOffer(actor: Actor, input: AcceptOfferInput) {
    void actor;
    return this.db.rpc("accept_offer", { p_input: input });
  }

  async updateLoan(actor: Actor, input: UpdateLoanInput) {
    void actor;
    return this.db.rpc("transition_loan", { p_input: input });
  }
}
