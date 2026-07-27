import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { serverEnv } from "@/lib/server-env";

export function createOpaqueToken() {
  return randomBytes(32).toString("base64url");
}

export function hashOpaqueToken(token: string) {
  const pepper = serverEnv.SHARE_TOKEN_PEPPER;
  if (!pepper) {
    throw new Error("SHARE_TOKEN_PEPPER is required for opaque links.");
  }
  return createHmac("sha256", pepper).update(token).digest("hex");
}
