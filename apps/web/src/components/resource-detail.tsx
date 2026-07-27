"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  EyeSlash,
  HandHeart,
  Package,
  Pause,
  ShieldCheck,
} from "@phosphor-icons/react";
import type { ResourceView } from "@/server/user-queries";
import { updateResourceAction } from "@/server/user-actions";
import { Button, Card, Chip, PrivacyCallout } from "./ui";

const visibilityLabels = {
  private: "Private memory",
  match_only: "Private matching only",
  circle: "Visible to Circle members",
};

export function ResourceDetail({ resource }: { resource: ResourceView }) {
  const router = useRouter();
  const [title, setTitle] = useState(resource.title);
  const [description, setDescription] = useState(resource.description);
  const [status, setStatus] = useState(resource.status);
  const [visibility, setVisibility] = useState(resource.visibility);
  const [willingness, setWillingness] = useState(resource.willingness);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save(nextStatus = status) {
    setPending(true);
    setSaved(false);
    setError("");
    const result = await updateResourceAction({
      resourceId: resource.id,
      title,
      description,
      visibility,
      willingness,
      status: nextStatus,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setStatus(nextStatus);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="content narrow">
      {resource.image ? (
        <div className="share-hero">
          <Image
            src={resource.image}
            alt=""
            width={620}
            height={340}
            priority
          />
        </div>
      ) : (
        <div className="empty-icon" style={{ margin: "18px auto" }}>
          <Package size={34} weight="duotone" />
        </div>
      )}
      <section className="section">
        <div className="row-between">
          <div>
            <div className="eyebrow">Optional resource memory</div>
            <h1 style={{ marginTop: 6 }}>{resource.title}</h1>
          </div>
          <Chip
            tone={
              status === "paused"
                ? "amber"
                : status === "retired"
                  ? "red"
                  : "green"
            }
          >
            {status === "active"
              ? "Available to ask"
              : status === "paused"
                ? "Paused"
                : "Retired"}
          </Chip>
        </div>
        <p className="lede">
          Remembered for easier future sharing. Every request still requires
          your approval.
        </p>
      </section>
      <Card className="pad section">
        <div className="detail-list">
          <div className="detail-item">
            <HandHeart className="detail-icon" size={21} />
            <div>
              <div className="detail-label">Willingness</div>
              <div className="detail-value">
                {willingness.replaceAll("_", " ")}
              </div>
            </div>
          </div>
          <div className="detail-item">
            <EyeSlash className="detail-icon" size={21} />
            <div>
              <div className="detail-label">Visibility</div>
              <div className="detail-value">{visibilityLabels[visibility]}</div>
            </div>
          </div>
          <div className="detail-item">
            <ShieldCheck className="detail-icon" size={21} />
            <div>
              <div className="detail-label">Privacy</div>
              <div className="detail-value">
                No storage location or replacement value is shown.
              </div>
            </div>
          </div>
        </div>
      </Card>
      <section className="section">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="resource-title">Item name</label>
            <input
              id="resource-title"
              className="input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
            />
          </div>
          <div className="field">
            <label htmlFor="resource-description">Helpful description</label>
            <textarea
              id="resource-description"
              className="textarea"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={800}
            />
          </div>
          <div className="field">
            <label htmlFor="visibility">Who can discover it?</label>
            <select
              id="visibility"
              className="select"
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as ResourceView["visibility"])
              }
            >
              <option value="match_only">Private matching only</option>
              <option value="circle">Circle members</option>
              <option value="private">Private memory</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="willingness">When can people ask?</label>
            <select
              id="willingness"
              className="select"
              value={willingness}
              onChange={(event) =>
                setWillingness(
                  event.target.value as ResourceView["willingness"],
                )
              }
            >
              <option value="happy_to_be_asked">Happy to be asked</option>
              <option value="community_projects_only">
                Community projects only
              </option>
              <option value="weekends">Usually weekends</option>
              <option value="paused">Do not match right now</option>
            </select>
          </div>
        </div>
      </section>
      <div className="spacer-16" />
      <PrivacyCallout>
        Private matching means the system may prompt you about a relevant Ask.
        It never promises availability or publishes a possession map.
      </PrivacyCallout>
      <section className="section stack-sm">
        {error ? <div className="notice error">{error}</div> : null}
        {saved ? (
          <div className="notice">
            <strong>Saved.</strong> Your sharing preference is updated.
          </div>
        ) : null}
        <Button
          full
          onClick={() => save()}
          disabled={pending || title.trim().length < 1}
        >
          {pending ? "Saving…" : "Save settings"}
        </Button>
        {status !== "retired" ? (
          <Button
            full
            variant={status === "paused" ? "primary" : "secondary"}
            onClick={() => save(status === "paused" ? "active" : "paused")}
            disabled={pending}
          >
            <Pause size={18} />{" "}
            {status === "paused" ? "Resume matching" : "Pause matching"}
          </Button>
        ) : null}
        <Button
          full
          variant="danger"
          onClick={() => save("retired")}
          disabled={pending || status === "retired"}
        >
          Remove from future sharing
        </Button>
      </section>
    </div>
  );
}
