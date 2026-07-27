"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Gift,
  HandHeart,
  Lightbulb,
  LinkSimple,
  LockKey,
  Package,
  ShareNetwork,
  UsersThree,
  WhatsappLogo,
} from "@phosphor-icons/react";
import type { SharedAskProjection } from "@/server/ask-queries";
import { requestOtpAction, verifyOtpAction } from "@/server/auth-actions";
import { submitSharedOfferAction } from "@/server/ask-actions";
import { useHydrated } from "@/lib/use-hydrated";
import { Button, Card, CheckCircle, Progress } from "./ui";

const offerModes = [
  { id: "lend", label: "Lend an item", icon: Package },
  { id: "give", label: "Give something", icon: Gift },
  { id: "help", label: "Give time", icon: UsersThree },
  { id: "advice", label: "Share know-how", icon: Lightbulb },
  { id: "recommendation", label: "Recommend", icon: HandHeart },
  { id: "alternative", label: "Alternative", icon: LinkSimple },
] as const;

type OfferMode = (typeof offerModes)[number]["id"];

export function PublicAsk({
  ask,
  shareToken,
  authenticated,
}: {
  ask: SharedAskProjection;
  shareToken: string;
  authenticated: boolean;
}) {
  const hydrated = useHydrated();
  const openNeeds = useMemo(
    () => ask.needs.filter((need) => need.committed < need.quantity),
    [ask.needs],
  );
  const [showOffer, setShowOffer] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState(openNeeds[0]?.id ?? "");
  const [mode, setMode] = useState<OfferMode>(
    openNeeds[0]?.kind ?? "alternative",
  );
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<"phone" | "email">("phone");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [destinationHint, setDestinationHint] = useState("");
  const [verified, setVerified] = useState(authenticated);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const selected = openNeeds.find((need) => need.id === selectedNeed);
  const maxQuantity = Math.max(
    1,
    (selected?.quantity ?? 1) - (selected?.committed ?? 0),
  );

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function shareToWhatsApp() {
    const text = encodeURIComponent(
      `Can you help with “${ask.title}”? ${window.location.href}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  async function requestCode() {
    setPending(true);
    setError("");
    const result = await requestOtpAction({
      channel,
      value: contact,
      displayName: name,
      next: `/share/${shareToken}`,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setDestinationHint(result.data.destinationHint);
    setVerificationSent(true);
  }

  async function submitOffer() {
    if (!selectedNeed) return;
    setPending(true);
    setError("");

    if (!verified) {
      const verification = await verifyOtpAction({
        channel,
        value: contact,
        displayName: name,
        token: otp,
        next: `/share/${shareToken}`,
      });
      if (!verification.ok) {
        setPending(false);
        setError(verification.error.message);
        return;
      }
      setVerified(true);
    }

    const result = await submitSharedOfferAction({
      shareToken,
      askId: ask.id,
      needId: selectedNeed,
      offerType: mode,
      freeformItemName: mode === "lend" ? itemName : "",
      description,
      quantity: Math.min(quantity, maxQuantity),
      conditions: "",
      idempotencyKey,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setSubmitted(true);
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
            The requester can review it privately. You’ll see private
            coordination only if the Offer is accepted.
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
      </div>
    );
  }

  return (
    <div className="content narrow">
      {ask.image ? (
        <div className="share-hero">
          <Image src={ask.image} alt="" width={680} height={360} priority />
        </div>
      ) : null}
      <div className={ask.image ? "share-overlay" : "card pad"}>
        <div className="eyebrow">{ask.circleName} · Private Ask</div>
        <h1 style={{ fontSize: 28, marginTop: 7 }}>{ask.title}</h1>
        <p className="muted small">
          {ask.dateLabel} · {ask.generalLocation}
        </p>
        {ask.description ? (
          <p className="small" style={{ marginTop: 12 }}>
            {ask.description}
          </p>
        ) : null}
        <div className="need-checklist" style={{ marginTop: 16 }}>
          {ask.needs.map((need) => {
            const done = need.committed >= need.quantity;
            return (
              <div className="need-check" key={need.id}>
                <CheckCircle done={done} />
                <span>{need.title}</span>
                <span className="tiny muted">
                  {done
                    ? "Covered"
                    : `${need.quantity - need.committed} needed`}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 16 }}>
          <Progress
            value={ask.progress}
            label={`${ask.needs.length - openNeeds.length} of ${ask.needs.length} needs covered`}
          />
        </div>
      </div>

      {!showOffer ? (
        <>
          <section className="section">
            <Card className="pad soft">
              <h2>
                {openNeeds.length
                  ? "Neighbors can help"
                  : "This Ask is covered"}
              </h2>
              <p className="muted small">
                {openNeeds.length
                  ? "Offer an item, time, know-how, recommendation, or an alternative. You do not need to list anything first."
                  : "You can still share the completion or check back if the requester reopens a need."}
              </p>
              {openNeeds.length ? (
                <Button
                  full
                  disabled={!hydrated}
                  onClick={() => setShowOffer(true)}
                >
                  <HandHeart size={19} weight="duotone" /> I can help
                </Button>
              ) : null}
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
              This link reveals only this Ask. It does not show the Circle
              roster, exact addresses, contact details, or private Offers.
            </span>
          </div>
        </>
      ) : (
        <section className="section">
          <div className="row-between">
            <div>
              <h2>How can you help?</h2>
              <p className="muted small" style={{ margin: 0 }}>
                Only the requester sees the Offer.
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
                {openNeeds.map((need) => (
                  <button
                    type="button"
                    className="choice"
                    data-selected={selectedNeed === need.id}
                    onClick={() => {
                      setSelectedNeed(need.id);
                      setMode(need.kind);
                      setQuantity(1);
                    }}
                    key={need.id}
                  >
                    <span className="choice-icon">
                      <Package size={18} />
                    </span>
                    <span style={{ flex: 1 }}>
                      <span className="strong small">{need.title}</span>
                      <span className="help-text" style={{ display: "block" }}>
                        {need.quantity - need.committed} still needed
                      </span>
                    </span>
                    {selectedNeed === need.id ? (
                      <Check size={18} color="var(--green-600)" weight="bold" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span className="field-label">What are you offering?</span>
              <div className="chip-row">
                {offerModes.map((item) => (
                  <button
                    type="button"
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
            {mode === "lend" ? (
              <div className="field">
                <label htmlFor="offer-item-name">What item is it?</label>
                <input
                  id="offer-item-name"
                  className="input"
                  value={itemName}
                  onChange={(event) => setItemName(event.target.value)}
                  placeholder="e.g. 6-foot folding table"
                  maxLength={100}
                />
              </div>
            ) : null}
            {maxQuantity > 1 ? (
              <div className="field">
                <label htmlFor="offer-quantity">How many?</label>
                <input
                  id="offer-quantity"
                  className="input"
                  type="number"
                  min={1}
                  max={maxQuantity}
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      Math.max(
                        1,
                        Math.min(maxQuantity, Number(event.target.value) || 1),
                      ),
                    )
                  }
                />
              </div>
            ) : null}
            <div className="field">
              <label htmlFor="offer-description">
                Tell the requester what you can contribute
              </label>
              <textarea
                id="offer-description"
                className="textarea"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Include useful timing, size, or condition details."
                maxLength={800}
              />
            </div>
            {!verified ? (
              <>
                <div className="field">
                  <label htmlFor="offer-name">First name</label>
                  <input
                    id="offer-name"
                    className="input"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="How the requester should know you"
                    maxLength={80}
                  />
                </div>
                <div className="field">
                  <span className="field-label">Verify privately</span>
                  <div className="chip-row" style={{ marginBottom: 8 }}>
                    <button
                      type="button"
                      className="chip"
                      data-selected={channel === "phone"}
                      onClick={() => setChannel("phone")}
                    >
                      Phone
                    </button>
                    <button
                      type="button"
                      className="chip"
                      data-selected={channel === "email"}
                      onClick={() => setChannel("email")}
                    >
                      Email
                    </button>
                  </div>
                  <input
                    id="offer-contact"
                    className="input"
                    type={channel === "phone" ? "tel" : "email"}
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    placeholder="Never shown on the Ask"
                    autoComplete={channel === "phone" ? "tel" : "email"}
                  />
                </div>
                {verificationSent ? (
                  <div className="field">
                    <label htmlFor="offer-otp">
                      Code sent to {destinationHint}
                    </label>
                    <input
                      id="offer-otp"
                      className="input"
                      value={otp}
                      onChange={(event) =>
                        setOtp(
                          event.target.value.replace(/\D/g, "").slice(0, 8),
                        )
                      }
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Six-digit code"
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <div className="notice">
                <strong>Identity verified.</strong> Your contact details remain
                private.
              </div>
            )}
            {error ? <div className="notice error">{error}</div> : null}
            {!verified && !verificationSent ? (
              <Button
                full
                disabled={
                  pending ||
                  name.trim().length < 1 ||
                  contact.trim().length < 5 ||
                  description.trim().length < 10 ||
                  (mode === "lend" && itemName.trim().length < 1)
                }
                onClick={requestCode}
              >
                {pending ? "Sending code…" : "Send verification code"}
              </Button>
            ) : (
              <Button
                full
                disabled={
                  pending ||
                  description.trim().length < 10 ||
                  (mode === "lend" && itemName.trim().length < 1) ||
                  (!verified && otp.length < 6)
                }
                onClick={submitOffer}
              >
                <HandHeart size={19} />{" "}
                {pending ? "Submitting…" : "Submit privately"}
              </Button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
