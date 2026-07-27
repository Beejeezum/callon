"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Check,
  Copy,
  HandHeart,
  LinkSimple,
  LockKey,
  Package,
  ShareNetwork,
  UsersThree,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { asks } from "@/lib/mock-data";
import { useHydrated } from "@/lib/use-hydrated";
import { Button, Card, CheckCircle, Progress } from "./ui";

const ask = asks[0];

export function PublicAsk() {
  const hydrated = useHydrated();
  const [showOffer, setShowOffer] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState("canopy");
  const [mode, setMode] = useState("lend");
  const [description, setDescription] = useState(
    "I have a 10×10 pop-up canopy you can borrow.",
  );
  const [contact, setContact] = useState("");
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function shareToWhatsApp() {
    const text = encodeURIComponent(
      `Can you help with “${ask.title}”? ${window.location.href}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  if (submitted) {
    return (
      <div className="content narrow">
        <div className="completion">
          <Image
            className="completion-art"
            src="/assets/confetti.png"
            alt=""
            width={124}
            height={108}
          />
          <h1>Your offer is in</h1>
          <p className="lede">
            Emily can review it privately. You’ll get a secure link if she
            accepts.
          </p>
        </div>
        <Card className="pad section">
          <div className="row-start">
            <HandHeart size={24} color="var(--green-600)" weight="duotone" />
            <div>
              <h3>{description}</h3>
              <p className="muted small" style={{ margin: 0 }}>
                For {ask.title}
              </p>
            </div>
          </div>
        </Card>
        <div className="spacer-24" />
        <div className="privacy-callout">
          <LockKey size={21} />
          <span>
            Your contact information is not published on the Ask. It is used for
            verification and private coordination only.
          </span>
        </div>
        <div className="spacer-24" />
        <Button full onClick={() => setSubmitted(false)} variant="secondary">
          Edit offer
        </Button>
      </div>
    );
  }

  return (
    <div className="content narrow">
      <div className="share-hero">
        <Image
          src="/assets/birthday-party.jpg"
          alt="Backyard birthday party setup"
          width={680}
          height={360}
          priority
        />
      </div>
      <div className="share-overlay">
        <div className="eyebrow">Oakridge HOA · Private Ask</div>
        <h1 style={{ fontSize: 28, marginTop: 7 }}>{ask.title}</h1>
        <p className="muted small">
          {ask.dateLabel} · {ask.generalLocation}
        </p>
        <div className="need-checklist" style={{ marginTop: 16 }}>
          {ask.needs.map((need) => {
            const done = need.committed >= need.quantity;
            return (
              <div className="need-check" key={need.id}>
                <CheckCircle done={done} />
                <span>{need.title}</span>
                <span className="tiny muted">
                  {done
                    ? need.contributor
                    : `${need.quantity - need.committed} needed`}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 16 }}>
          <Progress value={75} label="3 of 4 needs covered" />
        </div>
      </div>

      {!showOffer ? (
        <>
          <section className="section">
            <Card className="pad soft">
              <h2>Neighbors can help</h2>
              <p className="muted small">
                Offer an item, time, know-how, or an alternative. You do not
                need to list anything first.
              </p>
              <Button
                full
                disabled={!hydrated}
                onClick={() => setShowOffer(true)}
              >
                <HandHeart size={19} weight="duotone" /> I can help
              </Button>
            </Card>
          </section>
          <section className="section stack-sm">
            <Button full onClick={shareToWhatsApp}>
              <WhatsappLogo size={20} weight="fill" /> Share to WhatsApp
            </Button>
            <div className="field-grid-2">
              <Button variant="neutral" onClick={copyLink}>
                <Copy size={17} /> {copied ? "Copied" : "Copy link"}
              </Button>
              <Button
                variant="neutral"
                onClick={() =>
                  navigator.share?.({
                    title: ask.title,
                    url: window.location.href,
                  })
                }
              >
                <ShareNetwork size={17} /> Share options
              </Button>
            </div>
          </section>
          <div className="privacy-callout section">
            <LockKey size={21} />
            <span>
              This link reveals only this Ask. It does not show the community
              roster, exact addresses, phone numbers, or private offers.
            </span>
          </div>
        </>
      ) : (
        <section className="section">
          <div className="row-between">
            <div>
              <h2>How can you help?</h2>
              <p className="muted small" style={{ margin: 0 }}>
                Emily sees the offer privately.
              </p>
            </div>
            <button
              className="button neutral small"
              onClick={() => setShowOffer(false)}
            >
              Cancel
            </button>
          </div>
          <div className="form-grid" style={{ marginTop: 18 }}>
            <div className="field">
              <span className="field-label">Which need?</span>
              <div className="choice-list">
                {ask.needs
                  .filter((need) => need.committed < need.quantity)
                  .map((need) => (
                    <button
                      className="choice"
                      data-selected={selectedNeed === need.id}
                      onClick={() => setSelectedNeed(need.id)}
                      key={need.id}
                    >
                      <span className="choice-icon">
                        <Package size={18} />
                      </span>
                      <span style={{ flex: 1 }}>
                        <span className="strong small">{need.title}</span>
                        <span
                          className="help-text"
                          style={{ display: "block" }}
                        >
                          {need.quantity - need.committed} still needed
                        </span>
                      </span>
                      {selectedNeed === need.id ? (
                        <Check
                          size={18}
                          color="var(--green-600)"
                          weight="bold"
                        />
                      ) : null}
                    </button>
                  ))}
              </div>
            </div>
            <div className="field">
              <span className="field-label">What are you offering?</span>
              <div className="chip-row">
                {[
                  { id: "lend", label: "Lend an item", icon: Package },
                  { id: "help", label: "Give time", icon: UsersThree },
                  { id: "alternative", label: "Alternative", icon: LinkSimple },
                ].map((item) => (
                  <button
                    className="chip"
                    data-selected={mode === item.id}
                    onClick={() => setMode(item.id)}
                    key={item.id}
                  >
                    <item.icon size={14} /> {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label htmlFor="offer-description">
                Tell Emily what you can contribute
              </label>
              <textarea
                id="offer-description"
                className="textarea"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="offer-contact">
                Phone or email for verification
              </label>
              <input
                id="offer-contact"
                className="input"
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder="Used privately; never shown on the Ask"
              />
            </div>
            <div className="notice">
              <strong>Mock-mode verification.</strong> Production uses
              passwordless OTP and Turnstile before the offer is submitted.
            </div>
            <Button
              full
              disabled={
                !hydrated ||
                description.trim().length < 10 ||
                contact.trim().length < 5
              }
              onClick={() => setSubmitted(true)}
            >
              <HandHeart size={19} /> Verify and submit privately
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
