"use client";

import { useState } from "react";
import {
  ArrowRight,
  EnvelopeSimple,
  LockKey,
  Phone,
} from "@phosphor-icons/react";
import { Button, PrivacyCallout } from "./ui";

export function AuthForm({ join = false }: { join?: boolean }) {
  const [channel, setChannel] = useState<"phone" | "email">("phone");
  const [value, setValue] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="content narrow" style={{ paddingTop: 48 }}>
      <div className="eyebrow">
        {join ? "Invitation to Oakridge HOA" : "Passwordless access"}
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
          <div className="notice">
            <strong>Mock mode:</strong> production connects this form to
            Supabase OTP, an approved SMS/email provider, Turnstile, and
            server-side rate limits.
          </div>
          <Button
            full
            disabled={value.trim().length < 5}
            onClick={() => setSent(true)}
          >
            Send one-time code <ArrowRight size={18} />
          </Button>
        </div>
      ) : (
        <div className="form-grid section">
          <div className="field">
            <label htmlFor="otp">Six-digit code</label>
            <input
              id="otp"
              className="input"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
            />
          </div>
          <Button full onClick={() => window.location.assign(join ? "/" : "/")}>
            Verify and continue
          </Button>
          <Button variant="neutral" full onClick={() => setSent(false)}>
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
