import { randomUUID } from "node:crypto";

export type ActionErrorCode =
  | "AUTH_REQUIRED"
  | "VERIFICATION_REQUIRED"
  | "MEMBERSHIP_REQUIRED"
  | "MEMBERSHIP_RESTRICTED"
  | "NOT_AUTHORIZED"
  | "NOT_FOUND"
  | "INVALID_STATE"
  | "VALIDATION_FAILED"
  | "PROHIBITED_CATEGORY"
  | "QUANTITY_UNAVAILABLE"
  | "CONFLICT_RETRY"
  | "TOKEN_EXPIRED"
  | "TOKEN_REVOKED"
  | "RATE_LIMITED"
  | "PROVIDER_UNAVAILABLE"
  | "INTERNAL_ERROR";

export type ActionResult<T> =
  | { ok: true; data: T; requestId: string }
  | {
      ok: false;
      error: {
        code: ActionErrorCode;
        message: string;
        fieldErrors?: Record<string, string[]>;
      };
      requestId: string;
    };

export function actionSuccess<T>(data: T): ActionResult<T> {
  return { ok: true, data, requestId: randomUUID() };
}

export function actionFailure(
  code: ActionErrorCode,
  message: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<never> {
  return {
    ok: false,
    error: { code, message, fieldErrors },
    requestId: randomUUID(),
  };
}
