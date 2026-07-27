"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarBlank, HandHeart, MapPin } from "@phosphor-icons/react";
import type { Ask } from "@/lib/mock-data";
import { Badge, Chip, Progress } from "./ui";

const filters = ["All", "Need help", "Offering", "Event"] as const;

export function HomeFeed({ asks }: { asks: Ask[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const visible = useMemo(
    () => asks.filter((ask) => filter === "All" || ask.label === filter),
    [asks, filter],
  );

  return (
    <>
      <div className="chip-row" aria-label="Filter community activity">
        {filters.map((item) => (
          <button
            className="chip"
            key={item}
            data-selected={filter === item}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="spacer-16" />
      <div aria-live="polite">
        {visible.map((ask) => (
          <Link
            href={`/asks/${ask.id}`}
            className="card ask-card interactive"
            key={ask.id}
            style={{ display: "block" }}
          >
            <div className={ask.image ? "ask-card-media-layout" : undefined}>
              <div>
                <Badge
                  tone={
                    ask.label === "Need help"
                      ? "need"
                      : ask.label === "Offering"
                        ? "offer"
                        : "event"
                  }
                >
                  {ask.label}
                </Badge>
                <div className="spacer-8" />
                <h3>{ask.title}</h3>
                <p className="muted small" style={{ marginBottom: 12 }}>
                  {ask.description}
                </p>
                <div className="stack-sm tiny muted">
                  <span className="row">
                    <CalendarBlank size={15} /> {ask.dateLabel}
                  </span>
                  <span className="row">
                    <MapPin size={15} /> {ask.generalLocation}
                  </span>
                </div>
              </div>
              {ask.image ? (
                <Image
                  className="ask-thumb"
                  src={ask.image}
                  alt=""
                  width={112}
                  height={108}
                />
              ) : null}
            </div>
            {ask.label === "Need help" ? (
              <div style={{ marginTop: 14 }}>
                <Progress
                  value={ask.progress}
                  tone="violet"
                  label={`${ask.needs.filter((need) => need.committed >= need.quantity).length} of ${ask.needs.length} needs filled`}
                />
                <div className="row-between" style={{ marginTop: 12 }}>
                  <Chip tone="violet">
                    <HandHeart size={14} />{" "}
                    {
                      ask.needs.filter((need) => need.committed < need.quantity)
                        .length
                    }{" "}
                    open{" "}
                    {ask.needs.filter((need) => need.committed < need.quantity)
                      .length === 1
                      ? "need"
                      : "needs"}
                  </Chip>
                </div>
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </>
  );
}
