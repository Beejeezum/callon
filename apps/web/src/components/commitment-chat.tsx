"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CalendarBlank,
  Check,
  Clock,
  MapPin,
  ShieldCheck,
} from "@phosphor-icons/react";
import type { CommitmentView } from "@/server/transaction-queries";
import { formatPaseosDateTime } from "@/lib/paseos-time";
import {
  completeCommitmentAction,
  sendCommitmentMessageAction,
  setCommitmentLocationAction,
  transitionLoanAction,
} from "@/server/transaction-actions";
import { Avatar, Button, ButtonLink, Card, PrivacyCallout } from "./ui";

function dateTime(value: string | null) {
  if (!value) return "Coordinate in the private conversation";
  return formatPaseosDateTime(value, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CommitmentChat({ commitment }: { commitment: CommitmentView }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(commitment.messages);
  const [showLocation, setShowLocation] = useState(false);
  const [label, setLabel] = useState("Pickup location");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [locality, setLocality] = useState("");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [pickupNotes, setPickupNotes] = useState("");
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const [messageKey, setMessageKey] = useState(() => crypto.randomUUID());
  const [locationKey] = useState(() => crypto.randomUUID());
  const [handoffKey] = useState(() => crypto.randomUUID());
  const [completeKey] = useState(() => crypto.randomUUID());

  async function sendMessage() {
    const body = message.trim();
    if (!body || pending) return;
    setPending("message");
    setError("");
    const result = await sendCommitmentMessageAction({
      commitmentId: commitment.id,
      body,
      idempotencyKey: messageKey,
    });
    setPending("");
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setMessages((current) => [
      ...current,
      { id: result.data.messageId, mine: true, text: body, time: "Now" },
    ]);
    setMessage("");
    setMessageKey(crypto.randomUUID());
  }

  async function saveLocation() {
    setPending("location");
    setError("");
    const result = await setCommitmentLocationAction({
      commitmentId: commitment.id,
      locationKind: "pickup",
      label,
      addressLine1,
      addressLine2,
      locality,
      region,
      postalCode,
      pickupNotes,
      idempotencyKey: locationKey,
    });
    setPending("");
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setShowLocation(false);
    router.refresh();
  }

  async function confirmHandoff() {
    if (!commitment.loanId) return;
    setPending("handoff");
    setError("");
    const result = await transitionLoanAction({
      loanId: commitment.loanId,
      action: "confirm_handoff",
      idempotencyKey: handoffKey,
    });
    setPending("");
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    router.push(`/loans/${commitment.loanId}`);
    router.refresh();
  }

  async function completeContribution() {
    setPending("complete");
    setError("");
    const result = await completeCommitmentAction({
      commitmentId: commitment.id,
      idempotencyKey: completeKey,
    });
    setPending("");
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    router.refresh();
  }

  const location = commitment.exactLocation;
  const loanCheckedOut = commitment.loanStatus === "checked_out";

  return (
    <div className="content narrow">
      <div className="row-start">
        <Avatar
          src={commitment.counterpartAvatar}
          name={commitment.counterpartName}
          size="lg"
        />
        <div>
          <div className="eyebrow">Accepted contribution</div>
          <h1 style={{ marginTop: 5, marginBottom: 4 }}>
            Coordinate with {commitment.counterpartName}
          </h1>
          <div className="factual-history">
            <Check size={14} weight="bold" /> Offer accepted privately
          </div>
        </div>
      </div>

      <Card className="pad section soft">
        <div className="row-start">
          <span className="choice-icon">
            <ShieldCheck size={22} weight="duotone" />
          </span>
          <div>
            <div className="eyebrow">Contribution</div>
            <h3 style={{ marginTop: 4 }}>
              {commitment.quantity > 1 ? `${commitment.quantity} × ` : ""}
              {commitment.itemName}
            </h3>
            <p className="muted tiny" style={{ margin: 0 }}>
              {commitment.dueAt
                ? `Return by ${dateTime(commitment.dueAt)}`
                : `For ${commitment.askTitle}`}
            </p>
          </div>
        </div>
      </Card>

      <section className="section">
        <div className="chat" aria-live="polite">
          {messages.length ? (
            messages.map((item) => (
              <div
                className={`bubble ${item.mine ? "mine" : ""}`}
                key={item.id}
              >
                {item.text}
                <span className="bubble-time">{item.time}</span>
              </div>
            ))
          ) : (
            <div className="empty-state compact">
              <p className="muted small">
                No messages yet. Agree on timing before sharing exact details.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <Card className="pad">
          <div className="row-between">
            <div>
              <div className="eyebrow">Private logistics</div>
              <h3 style={{ marginTop: 4 }}>
                {location ? location.label : "No exact location saved"}
              </h3>
            </div>
            {!location && !commitment.locationRequiresStepUp ? (
              <Button
                small
                variant="secondary"
                onClick={() => setShowLocation((value) => !value)}
              >
                <MapPin size={16} /> Add
              </Button>
            ) : null}
          </div>
          <div className="detail-list" style={{ marginTop: 14 }}>
            <div className="detail-item">
              <CalendarBlank className="detail-icon" size={20} />
              <div>
                <div className="detail-label">Planned handoff</div>
                <div className="detail-value">
                  {dateTime(commitment.startsAt)}
                </div>
              </div>
            </div>
            {commitment.dueAt ? (
              <div className="detail-item">
                <Clock className="detail-icon" size={20} />
                <div>
                  <div className="detail-label">Return due</div>
                  <div className="detail-value">
                    {dateTime(commitment.dueAt)}
                  </div>
                </div>
              </div>
            ) : null}
            {location ? (
              <div className="detail-item">
                <MapPin className="detail-icon" size={20} />
                <div>
                  <div className="detail-label">Accepted-party only</div>
                  <div className="detail-value">
                    {location.addressLine1}
                    {location.addressLine2 ? `, ${location.addressLine2}` : ""}
                    <br />
                    {location.locality}, {location.region} {location.postalCode}
                    {location.pickupNotes ? (
                      <>
                        <br />
                        <span className="muted">{location.pickupNotes}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          {commitment.locationRequiresStepUp ? (
            <div className="notice warning" style={{ marginTop: 14 }}>
              Verify again to reveal exact logistics.{" "}
              <a
                href={`/login?reauth=1&next=/commitments/${commitment.id}`}
                className="strong"
              >
                Verify now
              </a>
            </div>
          ) : null}
        </Card>
      </section>

      {showLocation ? (
        <section className="section card pad">
          <h2>Exact pickup details</h2>
          <p className="muted small">
            Encrypted before storage and visible only to accepted parties.
          </p>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="location-label">Label</label>
              <input
                id="location-label"
                className="input"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="address-1">Address</label>
              <input
                id="address-1"
                className="input"
                value={addressLine1}
                onChange={(event) => setAddressLine1(event.target.value)}
                autoComplete="address-line1"
              />
            </div>
            <div className="field">
              <label htmlFor="address-2">Unit or detail (optional)</label>
              <input
                id="address-2"
                className="input"
                value={addressLine2}
                onChange={(event) => setAddressLine2(event.target.value)}
                autoComplete="address-line2"
              />
            </div>
            <div className="field-grid-2">
              <div className="field">
                <label htmlFor="locality">City</label>
                <input
                  id="locality"
                  className="input"
                  value={locality}
                  onChange={(event) => setLocality(event.target.value)}
                  autoComplete="address-level2"
                />
              </div>
              <div className="field">
                <label htmlFor="region">State</label>
                <input
                  id="region"
                  className="input"
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                  autoComplete="address-level1"
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="postal-code">Postal code</label>
              <input
                id="postal-code"
                className="input"
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
                autoComplete="postal-code"
              />
            </div>
            <div className="field">
              <label htmlFor="pickup-notes">Pickup notes (optional)</label>
              <textarea
                id="pickup-notes"
                className="textarea"
                value={pickupNotes}
                onChange={(event) => setPickupNotes(event.target.value)}
                maxLength={500}
              />
            </div>
            <div className="field-grid-2">
              <Button
                full
                onClick={saveLocation}
                disabled={
                  pending === "location" ||
                  addressLine1.trim().length < 3 ||
                  locality.trim().length < 2 ||
                  region.trim().length < 2 ||
                  postalCode.trim().length < 3
                }
              >
                {pending === "location" ? "Encrypting…" : "Save privately"}
              </Button>
              <Button
                full
                variant="neutral"
                onClick={() => setShowLocation(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <div className="spacer-16" />
      <PrivacyCallout>
        These logistics are visible only to accepted parties. Circle
        administrators do not automatically receive message or location access.
      </PrivacyCallout>

      <section className="section stack-sm">
        {error ? <div className="notice error">{error}</div> : null}
        {commitment.loanId ? (
          <>
            {commitment.viewerIsRequester &&
            commitment.loanStatus === "pending_handoff" ? (
              <Button full onClick={confirmHandoff} disabled={Boolean(pending)}>
                <ShieldCheck size={19} />{" "}
                {pending === "handoff"
                  ? "Confirming…"
                  : "Confirm item picked up"}
              </Button>
            ) : null}
            {loanCheckedOut ? (
              <ButtonLink href={`/loans/${commitment.loanId}`} full>
                View active Loan
              </ButtonLink>
            ) : null}
            {!commitment.viewerIsRequester &&
            commitment.loanStatus === "pending_handoff" ? (
              <div className="notice">
                Waiting for the borrower to confirm the handoff.
              </div>
            ) : null}
          </>
        ) : commitment.viewerIsRequester &&
          commitment.status !== "fulfilled" ? (
          <Button
            full
            onClick={completeContribution}
            disabled={Boolean(pending)}
          >
            <Check size={18} />{" "}
            {pending === "complete"
              ? "Completing…"
              : "Confirm help was completed"}
          </Button>
        ) : null}
        {commitment.status === "fulfilled" ? (
          <div className="notice">
            <strong>Complete.</strong> This contribution is closed and remains
            in both neighbors’ factual history.
          </div>
        ) : null}
        <ButtonLink href={`/asks/${commitment.askId}`} variant="neutral" full>
          View original Ask
        </ButtonLink>
      </section>

      {commitment.status !== "fulfilled" ? (
        <div className="chat-input">
          <input
            className="input"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder={`Message ${commitment.counterpartName}…`}
            aria-label={`Message ${commitment.counterpartName}`}
            maxLength={4000}
          />
          <Button
            aria-label="Send message"
            onClick={sendMessage}
            disabled={!message.trim() || pending === "message"}
          >
            ↑
          </Button>
        </div>
      ) : null}
    </div>
  );
}
