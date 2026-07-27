"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarBlank,
  Camera,
  Check,
  Clock,
  HandHeart,
  Lightbulb,
  MapPin,
  Minus,
  Package,
  Plus,
  Sparkle,
  UsersThree,
} from "@phosphor-icons/react";
import { useHydrated } from "@/lib/use-hydrated";
import { Button } from "./ui";

const kindOptions = [
  {
    id: "lend",
    label: "Borrow an item",
    detail: "Tools, equipment, tables, gear",
    icon: Package,
  },
  {
    id: "help",
    label: "Get help or time",
    detail: "Setup, lifting, moving, a second pair of hands",
    icon: UsersThree,
  },
  {
    id: "advice",
    label: "Ask for know-how",
    detail: "Guidance from someone who has done it",
    icon: Lightbulb,
  },
  {
    id: "alternative",
    label: "Find another way",
    detail: "A substitute, workaround, or suggestion",
    icon: Sparkle,
  },
] as const;

type NeedDraft = {
  id: string;
  title: string;
  quantity: number;
  kind: (typeof kindOptions)[number]["id"];
};

const initialNeeds: NeedDraft[] = [
  { id: "need-1", title: "2 folding tables", quantity: 2, kind: "lend" },
  { id: "need-2", title: "1 large cooler", quantity: 1, kind: "lend" },
  { id: "need-3", title: "Pop-up canopy", quantity: 1, kind: "lend" },
  { id: "need-4", title: "Help setting up", quantity: 1, kind: "help" },
];

export function AskWizard() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [step, setStep] = useState(1);
  const [context, setContext] = useState(
    "I’m hosting a birthday party Saturday and need some equipment.",
  );
  const [title, setTitle] = useState("Hosting a birthday party 🎉");
  const [needs, setNeeds] = useState<NeedDraft[]>(initialNeeds);
  const [generalLocation, setGeneralLocation] = useState(
    "Oakridge clubhouse area",
  );
  const [date, setDate] = useState("2026-08-01");
  const [time, setTime] = useState("14:00");
  const [notes, setNotes] = useState(
    "Backyard party for about 20 people. Exact pickup details will be shared privately after an offer is accepted.",
  );
  const [publishing, setPublishing] = useState(false);

  const canContinue = useMemo(
    () =>
      context.trim().length >= 10 && needs.some((need) => need.title.trim()),
    [context, needs],
  );

  function updateNeed(id: string, patch: Partial<NeedDraft>) {
    setNeeds((current) =>
      current.map((need) => (need.id === id ? { ...need, ...patch } : need)),
    );
  }

  function removeNeed(id: string) {
    setNeeds((current) => current.filter((need) => need.id !== id));
  }

  function addNeed() {
    setNeeds((current) => [
      ...current,
      {
        id: `need-${crypto.randomUUID()}`,
        title: "",
        quantity: 1,
        kind: "lend",
      },
    ]);
  }

  async function publish() {
    setPublishing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/share/oakridge-birthday-demo");
  }

  return (
    <div className="content narrow">
      <div className="row-between" style={{ marginBottom: 10 }}>
        <button
          className="icon-button plain"
          onClick={() =>
            step === 1 ? router.back() : setStep((value) => value - 1)
          }
          aria-label="Go back"
        >
          <ArrowLeft size={21} />
        </button>
        <span className="strong small">Create an Ask</span>
        <span className="small muted">{step} of 3</span>
      </div>
      <div className="stepper" aria-label={`Step ${step} of 3`}>
        {[1, 2, 3].map((item, index) => (
          <span key={item} style={{ display: "contents" }}>
            <span className={`step-dot ${item <= step ? "active" : ""}`} />
            {index < 2 ? <span className="step-line" /> : null}
          </span>
        ))}
      </div>

      {step === 1 ? (
        <section>
          <div className="eyebrow">Start with the real situation</div>
          <h1 style={{ marginTop: 7 }}>What do you need help with?</h1>
          <p className="lede">
            Say it naturally. The app turns it into clear things neighbors can
            offer.
          </p>
          <div className="form-grid" style={{ marginTop: 22 }}>
            <div className="field">
              <label htmlFor="ask-context">Describe what you’re doing</label>
              <textarea
                id="ask-context"
                className="textarea"
                value={context}
                onChange={(event) => setContext(event.target.value)}
                maxLength={500}
              />
              <div className="row-between help-text">
                <span>Specific and informal works best.</span>
                <span>{context.length}/500</span>
              </div>
            </div>
            <div className="field">
              <label htmlFor="ask-title">Ask title</label>
              <input
                id="ask-title"
                className="input"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
              />
            </div>
            <div className="field">
              <span className="field-label">What would help?</span>
              <span className="help-text">
                Each line can be filled by a different person.
              </span>
              <div className="need-editor">
                {needs.map((need) => {
                  const kind =
                    kindOptions.find((option) => option.id === need.kind) ??
                    kindOptions[0];
                  const Icon = kind.icon;
                  return (
                    <div className="need-row" key={need.id}>
                      <span className="need-icon">
                        <Icon size={17} weight="duotone" />
                      </span>
                      <div className="stack-sm">
                        <input
                          className="input"
                          style={{ minHeight: 38, padding: "8px 10px" }}
                          aria-label="Need description"
                          value={need.title}
                          onChange={(event) =>
                            updateNeed(need.id, { title: event.target.value })
                          }
                          placeholder="e.g. folding table"
                        />
                        <select
                          className="select tiny"
                          style={{ minHeight: 34, padding: "6px 8px" }}
                          aria-label="Contribution type"
                          value={need.kind}
                          onChange={(event) =>
                            updateNeed(need.id, {
                              kind: event.target.value as NeedDraft["kind"],
                            })
                          }
                        >
                          {kindOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="stack-sm" style={{ justifyItems: "end" }}>
                        <div className="quantity-stepper" aria-label="Quantity">
                          <button
                            type="button"
                            onClick={() =>
                              updateNeed(need.id, {
                                quantity: Math.max(1, need.quantity - 1),
                              })
                            }
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span>{need.quantity}</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateNeed(need.id, {
                                quantity: Math.min(99, need.quantity + 1),
                              })
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        {needs.length > 1 ? (
                          <button
                            type="button"
                            className="tiny"
                            style={{
                              border: 0,
                              background: "none",
                              color: "var(--red-600)",
                              cursor: "pointer",
                            }}
                            onClick={() => removeNeed(need.id)}
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button type="button" variant="secondary" full onClick={addNeed}>
                <Plus size={17} /> Add another need
              </Button>
            </div>
          </div>
          <div className="spacer-24" />
          <Button
            full
            disabled={!hydrated || !canContinue}
            onClick={() => setStep(2)}
          >
            Continue
          </Button>
        </section>
      ) : null}

      {step === 2 ? (
        <section>
          <div className="eyebrow">Make it easy to respond</div>
          <h1 style={{ marginTop: 7 }}>When and roughly where?</h1>
          <p className="lede">
            Neighbors see only the general area. Exact pickup details stay
            private until you accept an offer.
          </p>
          <div className="form-grid" style={{ marginTop: 22 }}>
            <div className="field-grid-2">
              <div className="field">
                <label htmlFor="need-date" className="row">
                  <CalendarBlank size={17} /> Date
                </label>
                <input
                  id="need-date"
                  className="input"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="need-time" className="row">
                  <Clock size={17} /> Time
                </label>
                <input
                  id="need-time"
                  className="input"
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="general-location" className="row">
                <MapPin size={17} /> General area
              </label>
              <input
                id="general-location"
                className="input"
                value={generalLocation}
                onChange={(event) => setGeneralLocation(event.target.value)}
              />
              <span className="help-text">
                Use “north side,” “clubhouse,” or another non-exact location.
              </span>
            </div>
            <div className="field">
              <label htmlFor="ask-notes">Anything neighbors should know?</label>
              <textarea
                id="ask-notes"
                className="textarea"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
            <div className="choice">
              <span className="choice-icon">
                <Camera size={19} weight="duotone" />
              </span>
              <div style={{ flex: 1 }}>
                <div className="strong small">Add a photo</div>
                <div className="help-text">
                  Optional. Do not upload anything that reveals a private
                  address.
                </div>
              </div>
              <span className="chip">Later</span>
            </div>
          </div>
          <div className="spacer-24" />
          <Button full onClick={() => setStep(3)}>
            Review Ask
          </Button>
        </section>
      ) : null}

      {step === 3 ? (
        <section>
          <div className="eyebrow">One final check</div>
          <h1 style={{ marginTop: 7 }}>Ready to ask your neighbors?</h1>
          <p className="lede">
            You can edit the Ask after publishing. Private offer details are
            visible only to you.
          </p>
          <div className="card pad" style={{ marginTop: 20 }}>
            <h2>{title}</h2>
            <p className="muted small">{context}</p>
            <div className="detail-list" style={{ margin: "18px 0" }}>
              <div className="detail-item">
                <CalendarBlank className="detail-icon" size={20} />
                <div>
                  <div className="detail-label">Needed</div>
                  <div className="detail-value">
                    {date} at {time}
                  </div>
                </div>
              </div>
              <div className="detail-item">
                <MapPin className="detail-icon" size={20} />
                <div>
                  <div className="detail-label">General area</div>
                  <div className="detail-value">{generalLocation}</div>
                </div>
              </div>
            </div>
            <div className="need-checklist">
              {needs
                .filter((need) => need.title.trim())
                .map((need) => (
                  <div className="need-check" key={need.id}>
                    <span className="check-circle">
                      <Check size={12} />
                    </span>
                    <span>{need.title}</span>
                    <span className="chip">{need.quantity}</span>
                  </div>
                ))}
            </div>
          </div>
          <div className="privacy-callout" style={{ marginTop: 14 }}>
            <HandHeart size={22} weight="duotone" />
            <span>
              Publishing creates one scoped share page. It does not expose the
              community roster, your address, or competing offers.
            </span>
          </div>
          <div className="spacer-24" />
          <Button full onClick={publish} disabled={publishing}>
            {publishing ? "Publishing…" : "Publish and share"}
          </Button>
        </section>
      ) : null}
    </div>
  );
}
