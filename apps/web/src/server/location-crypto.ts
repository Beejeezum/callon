import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { serverEnv } from "@/lib/server-env";

export type ExactLocationPayload = {
  label: string;
  addressLine1: string;
  addressLine2?: string;
  locality: string;
  region: string;
  postalCode: string;
  pickupNotes?: string;
};

function locationKey() {
  const source = serverEnv.LOCATION_ENCRYPTION_KEY_V1;
  if (!source) {
    throw new Error("Exact-location encryption is not configured.");
  }
  return createHash("sha256").update(source).digest();
}

export function encryptLocation(payload: ExactLocationPayload) {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", locationKey(), nonce);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const encrypted = Buffer.concat([
    cipher.update(plaintext),
    cipher.final(),
    cipher.getAuthTag(),
  ]);
  return {
    ciphertext: encrypted.toString("base64"),
    nonce: nonce.toString("base64"),
    keyVersion: 1,
  };
}

export function decryptLocation(input: {
  ciphertext: string;
  nonce: string;
  keyVersion: number;
}) {
  if (input.keyVersion !== 1) {
    throw new Error("Unsupported exact-location key version.");
  }
  const encrypted = Buffer.from(input.ciphertext, "base64");
  if (encrypted.length <= 16) {
    throw new Error("Invalid encrypted exact-location payload.");
  }
  const body = encrypted.subarray(0, -16);
  const tag = encrypted.subarray(-16);
  const decipher = createDecipheriv(
    "aes-256-gcm",
    locationKey(),
    Buffer.from(input.nonce, "base64"),
  );
  decipher.setAuthTag(tag);
  return JSON.parse(
    Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8"),
  ) as ExactLocationPayload;
}
