"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, EnvelopeSimple, LockKey } from "@phosphor-icons/react";
import { Button, PrivacyCallout } from "./ui";
import { requestOtpAction, verifyOtpAction } from "@/server/auth-actions";

export function AuthForm({
  join = false,
  next = "/",
  circleName = "your private Circle",
  circleArea,
  inviteToken,
}: {
  join?: boolean;
  next?: string;
  circleName?: string;
  circleArea?: string;
  inviteToken?: string;
}) {
  const router = useRouter();
  const channel = "email" as const;
  const [value, setValue] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [token, setToken] = useState("");
  const [sent, setSent] = useState(false);
  const [destinationHint, setDestinationHint] = useState("");
  const [mockMode, setMockMode] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [joinKey] = useState(() => crypto.randomUUID());

  async function requestCode() {
    setPending(true);
    setError("");
    const result = await requestOtpAction({
      channel,
      value,
      firstName: join ? firstName : undefined,
      lastName: join ? lastName : undefined,
      next,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setDestinationHint(result.data.destinationHint);
    setMockMode(result.data.mockMode);
    setSent(true);
  }

  async function verifyCode() {
    setPending(true);
    setError("");
    const result = await verifyOtpAction({
      channel,
      value,
      firstName: join ? firstName : undefined,
      lastName: join ? lastName : undefined,
      token: mockMode && token.length < 6 ? "000000" : token,
      next,
      inviteToken,
      idempotencyKey: inviteToken ? joinKey : undefined,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    router.push(result.data.next);
    router.refresh();
  }

  return (
    <div className="content narrow auth-panel">
      <div className="eyebrow">
        {join
          ? `Private invitation · ${circleArea ?? "Paseos"}`
          : "Paseos member access"}
      </div>
      <h1 style={{ marginTop: 8 }}>
        {join ? `Join ${circleName}` : "Welcome back, neighbor"}
      </h1>
      <p className="lede">
        {join
          ? "Tell neighbors who you are, then verify your email. This private invitation grants membership immediately."
          : "We’ll email you a one-time code. No password to remember."}
      </p>
      {!sent ? (
        <div className="form-grid section">
          {join ? (
            <div className="field-grid-2">
              <div className="field">
                <label htmlFor="first-name">First name</label>
                <input
                  id="first-name"
                  className="input"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  maxLength={50}
                  autoComplete="given-name"
                  placeholder="Bruce"
                />
              </div>
              <div className="field">
                <label htmlFor="last-name">Last name</label>
                <input
                  id="last-name"
                  className="input"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  maxLength={80}
                  autoComplete="family-name"
                  placeholder="Pinchbeck"
                />
              </div>
            </div>
          ) : null}
          <div className="field">
            <label htmlFor="identity">Email address</label>
            <input
              id="identity"
              className="input"
              type="email"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <span className="help-text">
              Used for verification and important loan reminders only. Never
              shown on Paseos pages.
            </span>
          </div>
          {error ? <div className="notice error">{error}</div> : null}
          <Button
            full
            disabled={
              pending ||
              value.trim().length < 5 ||
              (join &&
                (firstName.trim().length < 1 || lastName.trim().length < 1))
            }
            onClick={requestCode}
          >
            <EnvelopeSimple size={18} />
            {pending ? "Sending…" : "Email my one-time code"}{" "}
            <ArrowRight size={18} />
          </Button>
        </div>
      ) : (
        <div className="form-grid section">
          <div className="notice">
            Code sent to <strong>{destinationHint}</strong>.
            {mockMode ? " Use 000000 in this unconfigured preview." : ""}
          </div>
          <div className="field">
            <label htmlFor="otp">Six-digit code</label>
            <input
              id="otp"
              className="input"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              value={token}
              onChange={(event) =>
                setToken(event.target.value.replace(/\D/g, "").slice(0, 8))
              }
            />
          </div>
          {error ? <div className="notice error">{error}</div> : null}
          <Button
            full
            disabled={pending || (!mockMode && token.length < 6)}
            onClick={verifyCode}
          >
            {pending
              ? "Verifying…"
              : join
                ? `Verify and join ${circleName}`
                : "Verify and continue"}
          </Button>
          <Button
            variant="neutral"
            full
            disabled={pending}
            onClick={() => {
              setSent(false);
              setToken("");
              setError("");
            }}
          >
            Use a different contact
          </Button>
        </div>
      )}
      <div className="spacer-24" />
      <PrivacyCallout>
        <LockKey size={20} /> We do not ask for your street address here. Pickup
        details are shared privately only after a specific Offer is accepted.
      </PrivacyCallout>
    </div>
  );
}
