"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  EnvelopeSimple,
  LockKey,
  Phone,
} from "@phosphor-icons/react";
import { Button, PrivacyCallout } from "./ui";
import { requestOtpAction, verifyOtpAction } from "@/server/auth-actions";

export function AuthForm({
  join = false,
  next = "/",
  circleName = "your private Circle",
}: {
  join?: boolean;
  next?: string;
  circleName?: string;
}) {
  const router = useRouter();
  const [channel, setChannel] = useState<"phone" | "email">("phone");
  const [value, setValue] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [token, setToken] = useState("");
  const [sent, setSent] = useState(false);
  const [destinationHint, setDestinationHint] = useState("");
  const [mockMode, setMockMode] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function requestCode() {
    setPending(true);
    setError("");
    const result = await requestOtpAction({
      channel,
      value,
      displayName: join ? displayName : undefined,
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
      displayName: join ? displayName : undefined,
      token: mockMode && token.length < 6 ? "000000" : token,
      next,
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
    <div className="content narrow" style={{ paddingTop: 48 }}>
      <div className="eyebrow">
        {join ? `Invitation to ${circleName}` : "Passwordless access"}
      </div>
      <h1 style={{ marginTop: 8 }}>
        {join ? "Join your private Circle" : "Sign in to Call On"}
      </h1>
      <p className="lede">
        {join
          ? "Verify one contact method. You can contribute to a shared Ask before completing a long profile."
          : "Use a one-time code. No password to remember."}
      </p>
      {!sent ? (
        <div className="form-grid section">
          {join ? (
            <div className="field">
              <label htmlFor="display-name">First name</label>
              <input
                id="display-name"
                className="input"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={80}
                autoComplete="given-name"
                placeholder="How neighbors should know you"
              />
            </div>
          ) : null}
          <div className="chip-row">
            <button
              className="chip"
              data-selected={channel === "phone"}
              onClick={() => setChannel("phone")}
            >
              <Phone size={15} /> Phone
            </button>
            <button
              className="chip"
              data-selected={channel === "email"}
              onClick={() => setChannel("email")}
            >
              <EnvelopeSimple size={15} /> Email
            </button>
          </div>
          <div className="field">
            <label htmlFor="identity">
              {channel === "phone" ? "Mobile number" : "Email address"}
            </label>
            <input
              id="identity"
              className="input"
              type={channel === "phone" ? "tel" : "email"}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={
                channel === "phone" ? "+1 555 555 0123" : "you@example.com"
              }
              autoComplete={channel === "phone" ? "tel" : "email"}
            />
          </div>
          {error ? <div className="notice error">{error}</div> : null}
          <Button
            full
            disabled={
              pending ||
              value.trim().length < 5 ||
              (join && displayName.trim().length < 1)
            }
            onClick={requestCode}
          >
            {pending ? "Sending…" : "Send one-time code"}{" "}
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
            {pending ? "Verifying…" : "Verify and continue"}
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
        <LockKey size={20} /> Contact details remain private and are not shown
        on shared Ask pages.
      </PrivacyCallout>
    </div>
  );
}
