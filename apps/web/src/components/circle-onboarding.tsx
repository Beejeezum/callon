"use client";

import { useState } from "react";
import { ArrowRight, CirclesThreePlus, LockKey } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { bootstrapPaseosPilotAction } from "@/server/pilot-actions";
import { Button, ButtonLink, Card } from "./ui";

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
        <h1>Your account is ready</h1>
        <p className="lede">
          Open the private Paseos invitation from WhatsApp to finish joining.
        </p>
      </div>
      <Card className="pad">
        <div className="stack">
          <div className="row-start">
            <span className="choice-icon">
              <LockKey size={20} />
            </span>
            <div>
              <h2>Looking for your community?</h2>
              <p className="muted small" style={{ marginBottom: 0 }}>
                Reopen the Paseos invitation link. Membership is immediate when
                your email is verified.
              </p>
            </div>
          </div>
          <ButtonLink href="/guide" full variant="secondary">
            See the 60-second guide <ArrowRight size={18} />
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
      <p className="auth-footnote">
        <LockKey size={16} /> New community creation is limited during the
        Paseos pilot.
      </p>
    </div>
  );
}
