"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CalendarBlank,
  Clock,
  HandHeart,
  MapPin,
  Package,
  ShieldCheck,
} from "@phosphor-icons/react";
import type { Offer } from "@/lib/mock-data";
import { useHydrated } from "@/lib/use-hydrated";
import {
  paseosDateTimeParts,
  paseosLocalDateTimeToDate,
} from "@/lib/paseos-time";
import {
  acceptOfferAction,
  decideOfferAction,
} from "@/server/transaction-actions";
import { Avatar, Button, ButtonLink, Card, PrivacyCallout } from "./ui";

export function OfferDetail({ offer }: { offer: Offer }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const initialStart = useMemo(
    () =>
      new Date(
        offer.neededBy ?? offer.submittedAt ?? "2027-01-01T12:00:00.000Z",
      ).toISOString(),
    [offer.neededBy, offer.submittedAt],
  );
  const initialDue = useMemo(
    () =>
      new Date(
        new Date(initialStart).getTime() + 24 * 60 * 60 * 1000,
      ).toISOString(),
    [initialStart],
  );
  const startParts = useMemo(
    () => paseosDateTimeParts(initialStart),
    [initialStart],
  );
  const dueParts = useMemo(() => paseosDateTimeParts(initialDue), [initialDue]);
  const [startDate, setStartDate] = useState(startParts.date);
  const [startTime, setStartTime] = useState(startParts.time);
  const [dueDate, setDueDate] = useState(dueParts.date);
  const [dueTime, setDueTime] = useState(dueParts.time);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [error, setError] = useState("");
  const [acceptKey] = useState(() => crypto.randomUUID());
  const [declineKey] = useState(() => crypto.randomUUID());

  async function accept() {
    setAccepting(true);
    setError("");
    const startsAt = paseosLocalDateTimeToDate(startDate, startTime);
    const dueAt = paseosLocalDateTimeToDate(dueDate, dueTime);
    if (!startsAt || !dueAt || startsAt >= dueAt) {
      setError("Return time must be after the planned handoff.");
      setAccepting(false);
      return;
    }
    const result = await acceptOfferAction({
      offerId: offer.id,
      startsAt: startsAt.toISOString(),
      dueAt: dueAt.toISOString(),
      idempotencyKey: acceptKey,
    });
    setAccepting(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    router.push(`/commitments/${result.data.commitmentId}`);
    router.refresh();
  }

  async function decline() {
    setDeclining(true);
    setError("");
    const result = await decideOfferAction({
      offerId: offer.id,
      action: "decline",
      idempotencyKey: declineKey,
    });
    setDeclining(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    router.push(`/asks/${offer.askId}/offers`);
    router.refresh();
  }

  return (
    <div className="content narrow">
      <div className="row-start">
        <Avatar src={offer.avatar} name={offer.name} size="lg" />
        <div style={{ flex: 1 }}>
          <div className="eyebrow">Private Offer</div>
          <h1 style={{ marginTop: 5, marginBottom: 4 }}>
            {offer.name} can help
          </h1>
          <div className="factual-history">
            <HandHeart size={14} weight="duotone" />{" "}
            {offer.completedShares
              ? `${offer.completedShares} completed shares`
              : "Verified identity · new to Call On"}
          </div>
        </div>
      </div>

      <Card className="pad section soft">
        <div className="row-start">
          <span className="choice-icon">
            <Package size={22} weight="duotone" />
          </span>
          <div>
            <div className="eyebrow">{offer.name} is offering</div>
            <h2 style={{ marginTop: 6 }}>{offer.itemName ?? offer.message}</h2>
            <p className="muted small" style={{ margin: 0 }}>
              {offer.detail}
            </p>
          </div>
        </div>
      </Card>

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
              <div className="detail-label">Contributor’s availability</div>
              <div className="detail-value">{offer.availability}</div>
            </div>
          </div>
          <div className="detail-item">
            <MapPin className="detail-icon" size={21} />
            <div>
              <div className="detail-label">General Circle area</div>
              <div className="detail-value">{offer.generalLocation}</div>
            </div>
          </div>
        </div>
      </section>

      {offer.itemName ? (
        <section className="section">
          <h2>Set the commitment window</h2>
          <p className="muted small">
            These dates become the custody record. Exact pickup details are
            exchanged privately after acceptance.
          </p>
          <div className="field-grid-2">
            <div className="field">
              <label htmlFor="handoff-date">Handoff date</label>
              <input
                id="handoff-date"
                className="input"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="handoff-time">Handoff time</label>
              <input
                id="handoff-time"
                className="input"
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="return-date">Return date</label>
              <input
                id="return-date"
                className="input"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="return-time">Return time</label>
              <input
                id="return-time"
                className="input"
                type="time"
                value={dueTime}
                onChange={(event) => setDueTime(event.target.value)}
              />
            </div>
          </div>
        </section>
      ) : null}

      <div className="spacer-16" />
      <PrivacyCallout>
        Accepting creates a private commitment. Only then can you and{" "}
        {offer.name} exchange exact pickup details.
      </PrivacyCallout>

      <section className="section stack-sm">
        {error ? <div className="notice error">{error}</div> : null}
        {offer.status === "accepted" ? (
          <div className="notice">
            <strong>Already accepted.</strong> Open My Activity to continue
            coordination.
          </div>
        ) : (
          <>
            <Button
              full
              onClick={accept}
              disabled={!hydrated || accepting || declining}
            >
              <ShieldCheck size={19} />{" "}
              {accepting ? "Accepting…" : "Accept this Offer"}
            </Button>
            <Button
              variant="neutral"
              full
              onClick={decline}
              disabled={accepting || declining}
            >
              {declining ? "Declining…" : "Decline privately"}
            </Button>
          </>
        )}
        <ButtonLink
          href={`/asks/${offer.askId}/offers`}
          variant="secondary"
          full
        >
          <Clock size={18} /> Keep reviewing
        </ButtonLink>
      </section>
    </div>
  );
}
