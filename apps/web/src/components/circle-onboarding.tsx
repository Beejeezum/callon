"use client";

import { useMemo, useState } from "react";
import { CirclesThreePlus, LockKey } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { createCircleAction } from "@/server/circle-actions";
import { Button, Card, PrivacyCallout } from "./ui";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function CircleOnboarding({ displayName }: { displayName: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [generalArea, setGeneralArea] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const slug = useMemo(() => slugify(name), [name]);

  async function createCircle() {
    setPending(true);
    setError("");
    const result = await createCircleAction({
      name,
      slug,
      description,
      generalArea,
      joinPolicy: "invite_only",
      idempotencyKey,
    });
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
        <h1>Create your first private Circle</h1>
        <p className="lede">
          A Circle is the trusted group that can see local Asks—your HOA,
          building, block, school group, or club.
        </p>
      </div>
      <Card className="pad">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="circle-name">Circle name</label>
            <input
              id="circle-name"
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Oakridge neighbors"
              maxLength={100}
            />
          </div>
          <div className="field">
            <label htmlFor="circle-area">General area</label>
            <input
              id="circle-area"
              className="input"
              value={generalArea}
              onChange={(event) => setGeneralArea(event.target.value)}
              placeholder="Oakridge community"
              maxLength={100}
            />
            <span className="help-text">
              Keep this broad. Do not enter a home address.
            </span>
          </div>
          <div className="field">
            <label htmlFor="circle-description">Short description</label>
            <textarea
              id="circle-description"
              className="textarea"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="A private space for concrete neighbor-to-neighbor help."
              maxLength={1200}
            />
          </div>
          {error ? <div className="notice error">{error}</div> : null}
          <Button
            full
            disabled={
              pending ||
              name.trim().length < 2 ||
              slug.length < 3 ||
              generalArea.trim().length < 2
            }
            onClick={createCircle}
          >
            <CirclesThreePlus size={19} />
            {pending ? "Creating Circle…" : "Create private Circle"}
          </Button>
        </div>
      </Card>
      <div className="spacer-24" />
      <PrivacyCallout>
        <LockKey size={20} /> The Circle starts invitation-only. Creating it
        does not publish your profile, address, or possessions.
      </PrivacyCallout>
    </div>
  );
}
