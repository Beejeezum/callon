"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Check,
  ChatCircle,
  PencilSimple,
  ShareNetwork,
  UsersThree,
} from "@phosphor-icons/react";
import type { Ask } from "@/lib/mock-data";
import { Badge, Button, ButtonLink, Card, CheckCircle, Progress } from "./ui";

export function AskDetail({ ask }: { ask: Ask }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/share/oakridge-birthday-demo`;
    if (navigator.share) {
      await navigator.share({
        title: ask.title,
        text: `Can you help with ${ask.title}?`,
        url,
      });
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const covered = ask.needs.filter(
    (need) => need.committed >= need.quantity,
  ).length;

  return (
    <div className="content">
      <div className="row-between">
        <Badge tone="need">Open Ask</Badge>
        <div className="row">
          <button className="icon-button" aria-label="Edit Ask">
            <PencilSimple size={19} />
          </button>
          <button
            className="icon-button"
            onClick={share}
            aria-label="Share Ask"
          >
            <ShareNetwork size={19} />
          </button>
        </div>
      </div>
      <div className="spacer-16" />
      <h1>{ask.title}</h1>
      <p className="lede">{ask.description}</p>
      <div className="row wrap small muted" style={{ margin: "12px 0 20px" }}>
        <span>{ask.dateLabel}</span>
        <span>·</span>
        <span>{ask.generalLocation}</span>
      </div>
      {ask.image ? (
        <Image
          className="card-media"
          style={{ borderRadius: 16, height: 220 }}
          src={ask.image}
          alt="Birthday party setup"
          width={680}
          height={220}
          priority
        />
      ) : null}

      <section className="section">
        <div className="section-heading">
          <div>
            <h2>What’s needed</h2>
            <p className="muted small" style={{ margin: 0 }}>
              {covered} of {ask.needs.length} needs covered
            </p>
          </div>
          <ButtonLink href={`/asks/${ask.id}/offers`} variant="secondary" small>
            <UsersThree size={16} /> View offers
          </ButtonLink>
        </div>
        <Progress value={ask.progress} />
        <div className="card" style={{ marginTop: 14, overflow: "hidden" }}>
          {ask.needs.map((need) => {
            const done = need.committed >= need.quantity;
            return (
              <div className="list-row" key={need.id}>
                <CheckCircle done={done} />
                <div className="list-content">
                  <div className="strong small">{need.title}</div>
                  <div className="tiny muted">
                    {done
                      ? `${need.contributor ?? "A neighbor"} confirmed`
                      : `${need.quantity - need.committed} still needed`}
                  </div>
                </div>
                {!done ? (
                  <Button small variant="secondary">
                    Offer
                  </Button>
                ) : (
                  <Check size={18} color="var(--green-600)" weight="bold" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Activity</h2>
            <p className="muted small" style={{ margin: 0 }}>
              Only you can see private offer details.
            </p>
          </div>
        </div>
        <Card className="pad">
          <div className="stack">
            <div className="row-start">
              <Image
                className="avatar"
                src="/assets/avatar-lisa.png"
                alt=""
                width={34}
                height={34}
              />
              <div>
                <div className="small">
                  <strong>Janet</strong> offered two folding tables
                </div>
                <div className="tiny muted">Just now</div>
              </div>
            </div>
            <div className="row-start">
              <Image
                className="avatar"
                src="/assets/avatar-mike.png"
                alt=""
                width={34}
                height={34}
              />
              <div>
                <div className="small">
                  <strong>Mark</strong> offered a large cooler
                </div>
                <div className="tiny muted">5 minutes ago</div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="section stack-sm">
        <ButtonLink href={`/asks/${ask.id}/offers`} full>
          <ChatCircle size={18} /> Review private offers
        </ButtonLink>
        <Button full variant="neutral" onClick={share}>
          <ShareNetwork size={18} />{" "}
          {copied ? "Link copied" : "Share Ask again"}
        </Button>
      </section>
    </div>
  );
}
