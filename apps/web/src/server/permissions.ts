import type { Actor } from "./types";

export class AuthorizationError extends Error {
  readonly code = "FORBIDDEN";
}

export function requireAuthenticated(
  actor: Actor | null,
): asserts actor is Actor {
  if (!actor || actor.source === "system")
    throw new AuthorizationError("Authentication is required.");
}

export function requireCircle(actor: Actor, circleId: string) {
  if (actor.circleId !== circleId && actor.role !== "operator") {
    throw new AuthorizationError(
      "The actor is not authorized for this Circle.",
    );
  }
}
