"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, HandHeart, Package, Plus } from "@phosphor-icons/react";
import { formatPaseosDateTime } from "@/lib/paseos-time";
import type { ActivityData } from "@/server/user-queries";
import { Badge, ButtonLink, Chip } from "./ui";

const tabs = ["My Asks", "My Offers", "Loans", "Saved items"] as const;

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export function ActivityView({ data }: { data: ActivityData }) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("My Asks");

  return (
    <div className="content">
      <div className="row-between">
        <div>
          <h1>My activity</h1>
          <p className="lede">
            Everything you have asked, offered, borrowed, lent, or chosen to
            remember.
          </p>
        </div>
        <ButtonLink href="/asks/new" small>
          <Plus size={16} /> New Ask
        </ButtonLink>
      </div>
      <div className="tabs" style={{ marginTop: 18, overflowX: "auto" }}>
        {tabs.map((item) => (
          <button
            className="tab"
            data-active={tab === item}
            key={item}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="spacer-16" />

      {tab === "My Asks" ? (
        data.asks.length ? (
          <div className="stack-sm">
            {data.asks.map((ask) => (
              <Link
                href={`/asks/${ask.id}`}
                className="card pad interactive"
                key={ask.id}
              >
                <div className="row-between">
                  <Badge
                    tone={
                      ask.status === "completed" || ask.status === "archived"
                        ? "event"
                        : "need"
                    }
                  >
                    {statusLabel(ask.status)}
                  </Badge>
                  <Chip tone="green">
                    {ask.coveredNeeds} of {ask.totalNeeds} covered
                  </Chip>
                </div>
                <h3 style={{ marginTop: 12 }}>{ask.title}</h3>
                <p className="muted small" style={{ margin: 0 }}>
                  {ask.neededBy} · {ask.offerCount} private{" "}
                  {ask.offerCount === 1 ? "Offer" : "Offers"}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No Asks yet</h2>
            <p className="muted">Start with one concrete thing you need.</p>
            <ButtonLink href="/asks/new">Create an Ask</ButtonLink>
          </div>
        )
      ) : null}

      {tab === "My Offers" ? (
        data.offers.length ? (
          <div className="list">
            {data.offers.map((offer) => (
              <Link
                href={
                  offer.commitmentId
                    ? `/commitments/${offer.commitmentId}`
                    : `/asks/${offer.askId}`
                }
                className="list-row"
                key={offer.id}
              >
                <span className="choice-icon">
                  <HandHeart size={20} />
                </span>
                <div className="list-content">
                  <div className="strong small">{offer.summary}</div>
                  <div className="tiny muted">
                    {offer.askTitle} · {statusLabel(offer.status)} ·{" "}
                    {offer.submittedAt}
                  </div>
                </div>
                <ArrowRight size={17} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No Offers yet</h2>
            <p className="muted">
              When you help through a shared Ask, it appears here.
            </p>
          </div>
        )
      ) : null}

      {tab === "Loans" ? (
        data.loans.length ? (
          <div className="stack-sm">
            {data.loans.map((loan) => (
              <Link
                href={`/loans/${loan.id}`}
                className="card pad interactive"
                key={loan.id}
              >
                <div className="row-between">
                  <Chip
                    tone={
                      loan.status === "overdue" || loan.status === "disputed"
                        ? "red"
                        : loan.status === "returned"
                          ? undefined
                          : "green"
                    }
                  >
                    {statusLabel(loan.status)}
                  </Chip>
                  <span className="tiny muted">
                    {loan.direction === "borrowed" ? "Borrowed" : "Lent"}
                  </span>
                </div>
                <div className="row-start" style={{ marginTop: 12 }}>
                  <span className="choice-icon">
                    <Package size={21} />
                  </span>
                  <div>
                    <h3>{loan.itemName}</h3>
                    <p className="muted tiny" style={{ margin: 0 }}>
                      {loan.direction === "borrowed" ? "From" : "To"}{" "}
                      {loan.counterpartName}
                      {loan.dueAt
                        ? ` · due ${formatPaseosDateTime(loan.dueAt, {
                            month: "short",
                            day: "numeric",
                          })}`
                        : ""}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No Loan records</h2>
            <p className="muted">
              Physical lending custody appears here after an Offer is accepted.
            </p>
          </div>
        )
      ) : null}

      {tab === "Saved items" ? (
        data.resources.length ? (
          <div className="stack-sm">
            {data.resources.map((resource) => (
              <Link
                href={`/resources/${resource.id}`}
                className="card pad interactive"
                key={resource.id}
              >
                <div className="row-start">
                  {resource.image ? (
                    <Image
                      src={resource.image}
                      alt=""
                      width={76}
                      height={62}
                      style={{
                        width: 76,
                        height: 62,
                        objectFit: "cover",
                        borderRadius: 9,
                      }}
                    />
                  ) : (
                    <span className="choice-icon">
                      <Package size={22} />
                    </span>
                  )}
                  <div className="list-content">
                    <h3>{resource.title}</h3>
                    <p className="muted tiny" style={{ margin: 0 }}>
                      {statusLabel(resource.visibility)} · saved{" "}
                      {resource.savedAt}
                    </p>
                  </div>
                  <ArrowRight size={17} />
                </div>
              </Link>
            ))}
            <div className="notice">
              <strong>Private by default.</strong> Saved items are used for
              private matching unless you explicitly make one visible to the
              Circle.
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <h2>No saved items</h2>
            <p className="muted">
              After a successful Loan, the lender can remember the item with one
              choice.
            </p>
          </div>
        )
      ) : null}
    </div>
  );
}
