"use client";

import Image from "next/image";
import { useState } from "react";
import { EyeSlash, HandHeart, Pause, ShieldCheck } from "@phosphor-icons/react";
import { savedResources } from "@/lib/mock-data";
import { Button, Card, Chip, PrivacyCallout } from "./ui";

export function ResourceDetail({ id }: { id: string }) {
  const resource =
    savedResources.find((item) => item.id === id) ?? savedResources[0];
  const [paused, setPaused] = useState(false);
  const [visibility, setVisibility] = useState("Match only");

  return (
    <div className="content narrow">
      <div className="share-hero">
        <Image
          src={resource.image}
          alt={resource.title}
          width={620}
          height={340}
          priority
        />
      </div>
      <section className="section">
        <div className="row-between">
          <div>
            <div className="eyebrow">Saved after a successful share</div>
            <h1 style={{ marginTop: 6 }}>{resource.title}</h1>
          </div>
          <Chip tone={paused ? "amber" : "green"}>
            {paused ? "Paused" : "Available to ask"}
          </Chip>
        </div>
        <p className="lede">
          Hard-side item in good condition. Usually available on weekends.
        </p>
      </section>
      <Card className="pad section">
        <div className="detail-list">
          <div className="detail-item">
            <HandHeart className="detail-icon" size={21} />
            <div>
              <div className="detail-label">Willingness</div>
              <div className="detail-value">
                Happy to be asked; every request still needs your approval.
              </div>
            </div>
          </div>
          <div className="detail-item">
            <EyeSlash className="detail-icon" size={21} />
            <div>
              <div className="detail-label">Visibility</div>
              <div className="detail-value">{visibility}</div>
            </div>
          </div>
          <div className="detail-item">
            <ShieldCheck className="detail-icon" size={21} />
            <div>
              <div className="detail-label">Privacy</div>
              <div className="detail-value">
                No exact storage location or replacement value is shown to
                neighbors.
              </div>
            </div>
          </div>
        </div>
      </Card>
      <section className="section">
        <div className="field">
          <label htmlFor="visibility">Who can discover it?</label>
          <select
            id="visibility"
            className="select"
            value={visibility}
            onChange={(event) => setVisibility(event.target.value)}
          >
            <option>Match only</option>
            <option>Circle members</option>
            <option>Private</option>
          </select>
        </div>
      </section>
      <div className="spacer-16" />
      <PrivacyCallout>
        “Match only” means the system may privately prompt you when a relevant
        Ask appears. It does not publish a map of what you own.
      </PrivacyCallout>
      <section className="section stack-sm">
        <Button
          full
          variant={paused ? "primary" : "secondary"}
          onClick={() => setPaused((value) => !value)}
        >
          <Pause size={18} /> {paused ? "Resume matching" : "Pause matching"}
        </Button>
        <Button full variant="danger">
          Remove saved item
        </Button>
      </section>
    </div>
  );
}
