"use client";

import { useState } from "react";
import {
  Check,
  ChatCircle,
  ShareNetwork,
  UsersThree,
} from "@phosphor-icons/react";
import type { Ask } from "@/lib/mock-data";
import { Badge, Button, ButtonLink, Card, CheckCircle, Progress } from "./ui";
import { createShareForExistingAskAction } from "@/server/ask-actions";
import { MemberOfferForm } from "./member-offer-form";

export function AskDetail({
  ask,
  viewerIsOwner,
  canOffer,
}: {
  ask: Ask;
  viewerIsOwner: boolean;
  canOffer: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState("");
  const [shareKey] = useState(() => crypto.randomUUID());

  async function share() {
    setSharing(true);
    setShareError("");
    let url = shareUrl;
    if (!url) {
      const result = await createShareForExistingAskAction({
        askId: ask.id,
        neededBy:
          ask.neededBy ??
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        idempotencyKey: shareKey,
      });
      if (!result.ok) {
        setShareError(result.error.message);
        setSharing(false);
        return;
      }
      url = result.data.shareUrl;
      setShareUrl(url);
    }
    try {
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
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setShareError("The share menu could not open. Try copying the link.");
      }
    } finally {
      setSharing(false);
    }
  }

  const covered = ask.needs.filter(
    (need) => need.committed >= need.quantity,
  ).length;

  return (
    <div className="content">
      <div className="row-between">
        <Badge tone="need">Open Ask</Badge>
        {viewerIsOwner ? (
          <button
            className="icon-button"
            onClick={share}
            aria-label="Share Ask"
          >
            <ShareNetwork size={19} />
          </button>
        ) : null}
      </div>
      <div className="spacer-16" />
      <h1>{ask.title}</h1>
      <p className="lede">{ask.description}</p>
      <div className="row wrap small muted" style={{ margin: "12px 0 20px" }}>
        <span>{ask.dateLabel}</span>
        <span>·</span>
        <span>{ask.generalLocation}</span>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>What’s needed</h2>
            <p className="muted small" style={{ margin: 0 }}>
              {covered} of {ask.needs.length} needs covered
            </p>
          </div>
          {viewerIsOwner ? (
            <ButtonLink
              href={`/asks/${ask.id}/offers`}
              variant="secondary"
              small
            >
              <UsersThree size={16} /> View offers
            </ButtonLink>
          ) : null}
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
                {done ? (
                  <Check size={18} color="var(--green-600)" weight="bold" />
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {viewerIsOwner ? (
        <>
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
              <p className="small" style={{ margin: 0 }}>
                Open the private Offers list to review who can help, timing, and
                item details. Neighbors never see competing Offers.
              </p>
            </Card>
          </section>

          <section className="section stack-sm">
            {shareError ? (
              <div className="notice error">{shareError}</div>
            ) : null}
            <ButtonLink href={`/asks/${ask.id}/offers`} full>
              <ChatCircle size={18} /> Review private offers
            </ButtonLink>
            <Button full variant="neutral" onClick={share} disabled={sharing}>
              <ShareNetwork size={18} />{" "}
              {sharing
                ? "Preparing link…"
                : copied
                  ? "Link copied"
                  : "Share Ask again"}
            </Button>
          </section>
        </>
      ) : (
        <section className="section">
          {canOffer ? (
            <MemberOfferForm ask={ask} />
          ) : (
            <Card className="pad soft">
              <h2>Viewing only</h2>
              <p className="muted small" style={{ marginBottom: 0 }}>
                Your Circle access currently allows you to finish existing
                commitments, but not create a new Offer.
              </p>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}
