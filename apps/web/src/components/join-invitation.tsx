"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "@phosphor-icons/react";
import { acceptCircleInviteAction } from "@/server/circle-actions";
import { Button, Card } from "./ui";

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
      <div className="eyebrow">One last step</div>
      <h1 style={{ marginTop: 8 }}>Your invitation is verified</h1>
      <p className="lede">
        Join {circleName} to start asking, lending, and helping your neighbors.
      </p>
      <Card className="pad section compact-confirmation-card">
        <div className="row-start">
          <CheckCircle size={22} color="var(--green-600)" weight="fill" />
          <div>
            <div className="strong small">{circleName}</div>
            <div className="tiny muted">
              {description || `Private community sharing in ${generalArea}.`}
            </div>
          </div>
        </div>
      </Card>
      {error ? <div className="notice error section">{error}</div> : null}
      <Button full disabled={pending} onClick={accept}>
        {pending ? "Joining…" : `Join ${circleName}`}
      </Button>
      <p className="auth-footnote">
        You decide what to share. Joining never commits you to lending anything.
      </p>
    </div>
  );
}
