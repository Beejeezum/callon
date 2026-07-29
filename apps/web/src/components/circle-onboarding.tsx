"use client";

import { useState } from "react";
import { ArrowRight, CirclesThreePlus, LockKey } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { bootstrapPaseosPilotAction } from "@/server/pilot-actions";
import { Button, ButtonLink, Card, PrivacyCallout } from "./ui";

export function CircleOnboarding({
  displayName,
  canBootstrapPaseos,
}: {
  displayName: string;
  canBootstrapPaseos: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function bootstrapPaseos() {
    setPending(true);
    setError("");
    const result = await bootstrapPaseosPilotAction();
    setPending(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="content narrow">
      <div className="completion" style={{ paddingBottom: 16 }}>
        <span className="empty-icon">
          <CirclesThreePlus size={34} weight="duotone" />
        </span>
        <div className="eyebrow">Welcome, {displayName}</div>
        <h1>You’re verified—now join your neighbors</h1>
        <p className="lede">
          Your account is ready, but it is not attached to a private community
          yet.
        </p>
      </div>
      <Card className="pad">
        <div className="stack">
          <div className="row-start">
            <span className="choice-icon">
              <LockKey size={20} />
            </span>
            <div>
              <h2>Have the Paseos WhatsApp invitation?</h2>
              <p className="muted small" style={{ marginBottom: 0 }}>
                Reopen that private link. After email verification, membership
                is immediate—there is no approval queue.
              </p>
            </div>
          </div>
          <ButtonLink href="/" full variant="secondary">
            Return to the Paseos welcome page <ArrowRight size={18} />
          </ButtonLink>
          {canBootstrapPaseos ? (
            <>
              <div className="notice">
                <strong>First-admin setup recognized.</strong> This verified
                email may initialize Paseos and become its first administrator.
              </div>
              <Button full onClick={bootstrapPaseos} disabled={pending}>
                <CirclesThreePlus size={19} />
                {pending ? "Setting up Paseos…" : "Set up Paseos as admin"}
              </Button>
            </>
          ) : null}
          {error ? <div className="notice error">{error}</div> : null}
        </div>
      </Card>
      <div className="spacer-24" />
      <PrivacyCallout>
        <LockKey size={20} /> New communities are reviewed during the Paseos
        pilot instead of being created automatically. That keeps spam and
        accidental public communities out of the product.
      </PrivacyCallout>
    </div>
  );
}
