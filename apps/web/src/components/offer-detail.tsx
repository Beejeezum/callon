"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CalendarBlank,
  ChatCircle,
  Clock,
  HandHeart,
  MapPin,
  Package,
  ShieldCheck,
} from "@phosphor-icons/react";
import type { Offer } from "@/lib/mock-data";
import { useHydrated } from "@/lib/use-hydrated";
import { Avatar, Button, ButtonLink, Card, PrivacyCallout } from "./ui";

export function OfferDetail({ offer }: { offer: Offer }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const [accepting, setAccepting] = useState(false);

  async function accept() {
    setAccepting(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    router.push("/commitments/birthday-tables");
  }

  return (
    <div className="content narrow">
      <div className="row-start">
        <Avatar src={offer.avatar} name={offer.name} size="lg" />
        <div style={{ flex: 1 }}>
          <div className="eyebrow">Private offer</div>
          <h1 style={{ marginTop: 5, marginBottom: 4 }}>
            {offer.name} can help
          </h1>
          <div className="factual-history">
            <HandHeart size={14} weight="duotone" /> {offer.completedShares}{" "}
            completed shares · no unresolved returns
          </div>
        </div>
      </div>

      {offer.itemName ? (
        <Card className="section" style={{ overflow: "hidden" }}>
          <Image
            className="card-media"
            src="/assets/folding-table.jpg"
            alt="Two folding tables"
            width={560}
            height={240}
            priority
          />
          <div
            className="card pad"
            style={{ border: 0, boxShadow: "none", borderRadius: 0 }}
          >
            <div className="eyebrow">{offer.name} is offering</div>
            <h2 style={{ marginTop: 6 }}>{offer.itemName}</h2>
            <p className="muted small">{offer.detail}</p>
          </div>
        </Card>
      ) : (
        <Card className="pad section">
          <h2>{offer.message}</h2>
          <p className="muted">{offer.detail}</p>
        </Card>
      )}

      <section className="section">
        <div className="detail-list">
          <div className="detail-item">
            <Package className="detail-icon" size={21} />
            <div>
              <div className="detail-label">Contribution</div>
              <div className="detail-value">{offer.message}</div>
            </div>
          </div>
          <div className="detail-item">
            <CalendarBlank className="detail-icon" size={21} />
            <div>
              <div className="detail-label">Available</div>
              <div className="detail-value">{offer.availability}</div>
            </div>
          </div>
          <div className="detail-item">
            <MapPin className="detail-icon" size={21} />
            <div>
              <div className="detail-label">General area</div>
              <div className="detail-value">{offer.generalLocation}</div>
            </div>
          </div>
          <div className="detail-item">
            <Clock className="detail-icon" size={21} />
            <div>
              <div className="detail-label">Expected return</div>
              <div className="detail-value">Sunday evening</div>
            </div>
          </div>
        </div>
      </section>

      <div className="spacer-16" />
      <PrivacyCallout>
        Accepting creates a private commitment. Only then can you and{" "}
        {offer.name} exchange exact pickup details.
      </PrivacyCallout>

      <section className="section stack-sm">
        <Button full onClick={accept} disabled={!hydrated || accepting}>
          <ShieldCheck size={19} />{" "}
          {accepting ? "Accepting…" : "Accept this offer"}
        </Button>
        <ButtonLink href="/inbox" variant="secondary" full>
          <ChatCircle size={18} /> Ask a question first
        </ButtonLink>
        <Button variant="neutral" full>
          Decline privately
        </Button>
      </section>
    </div>
  );
}
