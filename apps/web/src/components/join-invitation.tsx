"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, LockKey } from "@phosphor-icons/react";
import { acceptCircleInviteAction } from "@/server/circle-actions";
import { Button, Card, PrivacyCallout } from "./ui";

export function JoinInvitation({
  token,
  circleName,
  generalArea,
  description,
}: {
  token: string;
  circleName: string;
  generalArea: string;
  description: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  async function accept() {
    setPending(true);
    setError("");
    const result = await acceptCircleInviteAction({
      token,
      idempotencyKey,
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
    <div className="content narrow" style={{ paddingTop: 40 }}>
      <div className="eyebrow">Verified invitation</div>
      <h1 style={{ marginTop: 8 }}>Join {circleName}</h1>
      <p className="lede">
        {description || `A private neighbor Circle in ${generalArea}.`}
      </p>
      <Card className="pad section">
        <div className="stack">
          <div className="row-start">
            <CheckCircle size={22} color="var(--green-600)" weight="fill" />
            <div>
              <div className="strong small">Invitation-only membership</div>
              <div className="tiny muted">{generalArea}</div>
            </div>
          </div>
          <div className="row-start">
            <LockKey size={22} color="var(--green-600)" weight="duotone" />
            <div>
              <div className="strong small">Private by default</div>
              <div className="tiny muted">
                Contact details and exact locations stay outside Circle pages.
              </div>
            </div>
          </div>
        </div>
      </Card>
      {error ? <div className="notice error section">{error}</div> : null}
      <Button full disabled={pending} onClick={accept}>
        {pending ? "Joining…" : `Join ${circleName}`}
      </Button>
      <div className="spacer-24" />
      <PrivacyCallout>
        Joining does not make an inventory, announce your possessions, or commit
        you to lending anything.
      </PrivacyCallout>
    </div>
  );
}
