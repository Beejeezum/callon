"use client";

import Image from "next/image";
import { useState } from "react";
import {
  CalendarBlank,
  Check,
  ChatCircle,
  Clock,
  HandHeart,
  Package,
  WarningCircle,
} from "@phosphor-icons/react";
import { Button, ButtonLink, Card, Chip } from "./ui";

export function LoanTracker() {
  const [state, setState] = useState<
    "active" | "extension" | "returned" | "complete"
  >("active");
  const [saveItem, setSaveItem] = useState(true);
  const [experience, setExperience] = useState("Great");

  if (state === "complete") {
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
          <h1>Loan closed</h1>
          <p className="lede">
            The tables are back with Janet. The custody record is complete.
          </p>
        </div>
        <Card className="pad section">
          <div className="row-between">
            <div>
              <div className="eyebrow">Save for future matches?</div>
              <h3 style={{ marginTop: 5 }}>2 folding tables</h3>
              <p className="muted small" style={{ margin: 0 }}>
                This stays match-only unless Janet chooses wider visibility.
              </p>
            </div>
            <button
              className="toggle"
              data-on={saveItem}
              onClick={() => setSaveItem((value) => !value)}
              aria-label="Save item for future matches"
            />
          </div>
        </Card>
        <div className="spacer-24" />
        <ButtonLink href="/activity" full>
          View activity
        </ButtonLink>
        <div className="spacer-8" />
        <ButtonLink href="/" variant="secondary" full>
          Back home
        </ButtonLink>
      </div>
    );
  }

  if (state === "returned") {
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
          <h1>You returned the tables</h1>
          <p className="lede">
            Janet has been asked to confirm. Thanks for closing the loop.
          </p>
        </div>
        <section className="section">
          <h2>How was everything?</h2>
          <div className="chip-row">
            {["Great", "Good", "Okay", "There was an issue"].map((item) => (
              <button
                key={item}
                className="chip"
                data-selected={experience === item}
                onClick={() => setExperience(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>
        <section className="section stack-sm">
          <Button full onClick={() => setState("complete")}>
            <Check size={18} /> Simulate Janet’s confirmation
          </Button>
          <Button variant="secondary" full>
            <HandHeart size={18} /> Send a thank-you
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="content narrow">
      <div className="row-between">
        <div>
          <div className="eyebrow">Active loan</div>
          <h1 style={{ marginTop: 6 }}>2 folding tables</h1>
        </div>
        <Chip tone={state === "extension" ? "amber" : "green"}>
          {state === "extension" ? "Extension requested" : "Checked out"}
        </Chip>
      </div>
      <Card className="pad section">
        <div className="row-start">
          <Image
            src="/assets/folding-table.jpg"
            alt="Two folding tables"
            width={118}
            height={82}
            style={{
              width: 118,
              height: 82,
              borderRadius: 12,
              objectFit: "cover",
            }}
          />
          <div>
            <div className="eyebrow">Borrowed from</div>
            <h3 style={{ marginTop: 5 }}>Janet</h3>
            <p className="muted tiny" style={{ margin: 0 }}>
              Oakridge HOA · exact logistics private
            </p>
          </div>
        </div>
      </Card>

      <section className="section">
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-marker">
              <span className="timeline-dot done">
                <Check size={12} weight="bold" />
              </span>
              <span className="timeline-line" />
            </div>
            <div className="timeline-copy">
              <div className="strong small">Pickup confirmed</div>
              <div className="muted tiny">Friday, May 24 · 7:05 PM</div>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-marker">
              <span className="timeline-dot done">
                <Package size={12} weight="fill" />
              </span>
              <span className="timeline-line" />
            </div>
            <div className="timeline-copy">
              <div className="strong small">In your care</div>
              <div className="muted tiny">
                Use it safely and keep all components together.
              </div>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-marker">
              <span className="timeline-dot">
                <CalendarBlank size={12} />
              </span>
            </div>
            <div className="timeline-copy">
              <div className="strong small">Return due</div>
              <div className="muted tiny">Sunday, May 26 · 6:00 PM</div>
            </div>
          </div>
        </div>
      </section>

      {state === "extension" ? (
        <div className="notice warning">
          <strong>Request sent.</strong> Janet can approve or suggest another
          return time. The original due time remains in effect until accepted.
        </div>
      ) : null}

      <section className="section stack-sm">
        <Button full onClick={() => setState("returned")}>
          <Check size={18} /> Mark as returned
        </Button>
        <Button variant="secondary" full onClick={() => setState("extension")}>
          <Clock size={18} /> Request an extension
        </Button>
        <ButtonLink href="/commitments/birthday-tables" variant="neutral" full>
          <ChatCircle size={18} /> Message Janet
        </ButtonLink>
        <Button variant="danger" full>
          <WarningCircle size={18} /> Report an issue privately
        </Button>
      </section>
    </div>
  );
}
