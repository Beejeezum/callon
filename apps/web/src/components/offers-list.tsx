"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FunnelSimple, HandHeart } from "@phosphor-icons/react";
import { offers } from "@/lib/mock-data";
import { Avatar, ButtonLink, Chip } from "./ui";

export function OffersList({ askId }: { askId: string }) {
  const [filter, setFilter] = useState("All");
  const visible = useMemo(
    () =>
      offers.filter(
        (offer) =>
          offer.askId === askId &&
          (filter === "All" || offer.needId === filter),
      ),
    [askId, filter],
  );

  return (
    <div className="content narrow">
      <div className="row-between">
        <div>
          <h1>Offers</h1>
          <p className="lede">
            Neighbors respond privately. They cannot see competing offers.
          </p>
        </div>
        <button className="icon-button" aria-label="Filter offers">
          <FunnelSimple size={19} />
        </button>
      </div>
      <div className="chip-row" style={{ marginTop: 16 }}>
        {[
          { id: "All", label: "All" },
          { id: "tables", label: "Tables" },
          { id: "cooler", label: "Cooler" },
          { id: "setup", label: "Setup" },
          { id: "canopy", label: "Canopy" },
        ].map((item) => (
          <button
            className="chip"
            data-selected={filter === item.id}
            key={item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="spacer-16" />
      <div className="card pad">
        {visible.map((offer) => (
          <Link
            href={`/offers/${offer.id}`}
            className="offer-row"
            key={offer.id}
          >
            <Avatar src={offer.avatar} name={offer.name} />
            <div>
              <div className="offer-name">{offer.name}</div>
              <div className="offer-message">{offer.message}</div>
              <div className="factual-history">
                <HandHeart size={13} /> {offer.completedShares} completed shares
              </div>
            </div>
            <span className="offer-time">{offer.receivedLabel}</span>
          </Link>
        ))}
      </div>
      {visible.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <HandHeart size={32} />
          </div>
          <h2>No offers in this category yet</h2>
          <p className="muted">
            Share the Ask again or keep the category open.
          </p>
        </div>
      ) : null}
      <div className="spacer-24" />
      <ButtonLink href="/share/oakridge-birthday-demo" variant="secondary" full>
        Still need help? Share Ask again
      </ButtonLink>
      <div style={{ marginTop: 10 }}>
        <Chip tone="green">4 private offers</Chip>
      </div>
    </div>
  );
}
