"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Gift,
  HandHeart,
  Lightbulb,
  LinkSimple,
  Package,
  UsersThree,
} from "@phosphor-icons/react";
import type { Ask } from "@/lib/mock-data";
import { submitMemberOfferAction } from "@/server/ask-actions";
import { Button, Card } from "./ui";

const offerModes = [
  { id: "lend", label: "Lend an item", icon: Package },
  { id: "give", label: "Give something", icon: Gift },
  { id: "help", label: "Give time", icon: UsersThree },
  { id: "advice", label: "Share know-how", icon: Lightbulb },
  { id: "recommendation", label: "Recommend", icon: HandHeart },
  { id: "alternative", label: "Alternative", icon: LinkSimple },
] as const;

type OfferMode = (typeof offerModes)[number]["id"];

export function MemberOfferForm({ ask }: { ask: Ask }) {
  const openNeeds = useMemo(
    () => ask.needs.filter((need) => need.committed < need.quantity),
    [ask.needs],
  );
  const [expanded, setExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState(openNeeds[0]?.id ?? "");
  const [mode, setMode] = useState<OfferMode>(
    openNeeds[0]?.kind ?? "alternative",
  );
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const selected = openNeeds.find((need) => need.id === selectedNeed);
  const maxQuantity = Math.max(
    1,
    (selected?.quantity ?? 1) - (selected?.committed ?? 0),
  );

  async function submit() {
    if (!selectedNeed) return;
    setPending(true);
    setError("");
    const result = await submitMemberOfferAction({
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

  if (!openNeeds.length) {
    return (
      <Card className="pad soft">
        <h2>This Ask is covered</h2>
        <p className="muted small" style={{ marginBottom: 0 }}>
          Every listed need already has enough confirmed help.
        </p>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card className="pad soft" role="status">
        <div className="row-start">
          <span className="choice-icon">
            <Check size={20} weight="bold" />
          </span>
          <div>
            <h2>Your Offer is in</h2>
            <p className="muted small" style={{ marginBottom: 0 }}>
              Only the requester can review it. Private coordination begins if
              they accept.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!expanded) {
    return (
      <Card className="pad soft">
        <h2>Can you help?</h2>
        <p className="muted small">
          Offer an unlisted item, time, know-how, recommendation, or an
          alternative. Your Offer stays private.
        </p>
        <Button full onClick={() => setExpanded(true)}>
          <HandHeart size={19} weight="duotone" /> I can help
        </Button>
      </Card>
    );
  }

  return (
    <Card className="pad">
      <div className="row-between">
        <div>
          <h2>Make a private Offer</h2>
          <p className="muted small" style={{ margin: 0 }}>
            Only the requester sees the details.
          </p>
        </div>
        <button
          type="button"
          className="button neutral small"
          onClick={() => setExpanded(false)}
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
            <label htmlFor="member-offer-item">What item is it?</label>
            <input
              id="member-offer-item"
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
            <label htmlFor="member-offer-quantity">How many?</label>
            <input
              id="member-offer-quantity"
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
          <label htmlFor="member-offer-description">
            Tell the requester what you can contribute
          </label>
          <textarea
            id="member-offer-description"
            className="textarea"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Include useful timing, size, or condition details."
            maxLength={800}
          />
        </div>
        {error ? <div className="notice error">{error}</div> : null}
        <Button
          full
          disabled={
            pending ||
            description.trim().length < 10 ||
            (mode === "lend" && itemName.trim().length < 1)
          }
          onClick={submit}
        >
          <HandHeart size={19} /> {pending ? "Submitting…" : "Submit privately"}
        </Button>
      </div>
    </Card>
  );
}
