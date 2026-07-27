"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, HandHeart, Package, Plus } from "@phosphor-icons/react";
import { savedResources } from "@/lib/mock-data";
import { Badge, ButtonLink, Chip } from "./ui";

const tabs = ["My Asks", "My Offers", "Loans", "Saved items"] as const;

export function ActivityView() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("My Asks");

  return (
    <div className="content">
      <div className="row-between">
        <div>
          <h1>My activity</h1>
          <p className="lede">
            Everything you have asked, offered, borrowed, or chosen to remember.
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
        <div className="stack-sm">
          <Link href="/asks/birthday-party" className="card pad interactive">
            <div className="row-between">
              <Badge tone="need">Open</Badge>
              <Chip tone="green">3 of 4 covered</Chip>
            </div>
            <h3 style={{ marginTop: 12 }}>Hosting a birthday party 🎉</h3>
            <p className="muted small">Sat, May 25 · 4 private offers</p>
          </Link>
          <div className="card pad">
            <div className="row-between">
              <Badge tone="event">Complete</Badge>
              <span className="tiny muted">May 10</span>
            </div>
            <h3 style={{ marginTop: 12 }}>Neighborhood movie night</h3>
            <p className="muted small" style={{ margin: 0 }}>
              Projector, screen, two tables, and setup help were covered.
            </p>
          </div>
        </div>
      ) : null}

      {tab === "My Offers" ? (
        <div className="list">
          <div className="list-row">
            <span className="choice-icon">
              <HandHeart size={20} />
            </span>
            <div className="list-content">
              <div className="strong small">Helped with a garage cleanout</div>
              <div className="tiny muted">Completed May 18 · 45 minutes</div>
            </div>
            <ArrowRight size={17} />
          </div>
          <div className="list-row">
            <span className="choice-icon">
              <Package size={20} />
            </span>
            <div className="list-content">
              <div className="strong small">Lent a large cooler</div>
              <div className="tiny muted">Returned May 10</div>
            </div>
            <ArrowRight size={17} />
          </div>
        </div>
      ) : null}

      {tab === "Loans" ? (
        <div className="stack-sm">
          <Link href="/loans/birthday-tables" className="card pad interactive">
            <div className="row-between">
              <Chip tone="green">Active</Chip>
              <span className="tiny muted">Due in 2 days</span>
            </div>
            <div className="row-start" style={{ marginTop: 12 }}>
              <Image
                src="/assets/folding-table.jpg"
                alt=""
                width={82}
                height={58}
                style={{
                  width: 82,
                  height: 58,
                  objectFit: "cover",
                  borderRadius: 9,
                }}
              />
              <div>
                <h3>2 folding tables</h3>
                <p className="muted tiny" style={{ margin: 0 }}>
                  From Janet · return Sunday by 6 PM
                </p>
              </div>
            </div>
          </Link>
          <div className="card pad">
            <div className="row-between">
              <Chip>Returned</Chip>
              <span className="tiny muted">May 10</span>
            </div>
            <h3 style={{ marginTop: 12 }}>Large cooler</h3>
            <p className="muted tiny" style={{ margin: 0 }}>
              Return confirmed by Mark
            </p>
          </div>
        </div>
      ) : null}

      {tab === "Saved items" ? (
        <div className="stack-sm">
          {savedResources.map((resource) => (
            <Link
              href={`/resources/${resource.id}`}
              className="card pad interactive"
              key={resource.id}
            >
              <div className="row-start">
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
                <div className="list-content">
                  <h3>{resource.title}</h3>
                  <p className="muted tiny" style={{ margin: 0 }}>
                    {resource.category} · {resource.saved}
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
      ) : null}
    </div>
  );
}
