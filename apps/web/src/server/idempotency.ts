export function requireIdempotencyKey(value: string | null) {
  if (!value || value.length < 16 || value.length > 200) {
    throw new Error(
      "A valid Idempotency-Key header is required for this state-changing operation.",
    );
  }
  return value;
}
