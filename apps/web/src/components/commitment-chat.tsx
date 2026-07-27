"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CalendarBlank,
  Camera,
  Check,
  Clock,
  MapPin,
  Paperclip,
  ShieldCheck,
} from "@phosphor-icons/react";
import { Avatar, Button, ButtonLink, Card, PrivacyCallout } from "./ui";

export function CommitmentChat() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      mine: true,
      text: "Thanks Janet! We can pick up Friday evening around 7 PM. Does that work?",
      time: "9:41 AM",
    },
    {
      id: "2",
      mine: false,
      text: "Perfect! I’ll set them out on the side of the garage.",
      time: "9:43 AM",
    },
  ]);
  const [confirming, setConfirming] = useState(false);

  function sendMessage() {
    if (!message.trim()) return;
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        mine: true,
        text: message.trim(),
        time: "Now",
      },
    ]);
    setMessage("");
  }

  async function confirmHandoff() {
    setConfirming(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    router.push("/loans/birthday-tables");
  }

  return (
    <div className="content narrow">
      <div className="row-start">
        <Avatar src="/assets/avatar-lisa.png" name="Janet" size="lg" />
        <div>
          <div className="eyebrow">Accepted contribution</div>
          <h1 style={{ marginTop: 5, marginBottom: 4 }}>
            Coordinate with Janet
          </h1>
          <div className="factual-history">
            <Check size={14} weight="bold" /> Offer accepted privately
          </div>
        </div>
      </div>

      <Card className="pad section soft">
        <div className="row-start">
          <Image
            src="/assets/folding-table.jpg"
            alt="Two folding tables"
            width={92}
            height={70}
            style={{
              width: 92,
              height: 70,
              borderRadius: 10,
              objectFit: "cover",
            }}
          />
          <div>
            <div className="eyebrow">Contribution</div>
            <h3 style={{ marginTop: 4 }}>2 folding tables</h3>
            <p className="muted tiny" style={{ margin: 0 }}>
              Return by Sunday, May 26 · 6 PM
            </p>
          </div>
        </div>
      </Card>

      <section className="section">
        <div className="chat" aria-live="polite">
          {messages.map((item) => (
            <div className={`bubble ${item.mine ? "mine" : ""}`} key={item.id}>
              {item.text}
              <span className="bubble-time">{item.time}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <Card className="pad">
          <div className="eyebrow">Pickup details</div>
          <div className="detail-list" style={{ marginTop: 14 }}>
            <div className="detail-item">
              <CalendarBlank className="detail-icon" size={20} />
              <div>
                <div className="detail-label">Date</div>
                <div className="detail-value">Friday, May 24</div>
              </div>
            </div>
            <div className="detail-item">
              <Clock className="detail-icon" size={20} />
              <div>
                <div className="detail-label">Time</div>
                <div className="detail-value">7:00 PM</div>
              </div>
            </div>
            <div className="detail-item">
              <MapPin className="detail-icon" size={20} />
              <div>
                <div className="detail-label">Accepted-party only</div>
                <div className="detail-value">
                  123 Maple Dr · Side of garage
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <div className="spacer-16" />
      <PrivacyCallout>
        These logistics are visible only to you and Janet. Circle administrators
        do not automatically receive message access.
      </PrivacyCallout>

      <section className="section stack-sm">
        <Button full onClick={confirmHandoff} disabled={confirming}>
          <ShieldCheck size={19} />{" "}
          {confirming ? "Confirming…" : "Confirm item picked up"}
        </Button>
        <ButtonLink href="/asks/birthday-party" variant="neutral" full>
          View original Ask
        </ButtonLink>
      </section>

      <div className="chat-input">
        <div style={{ position: "relative" }}>
          <input
            className="input"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") sendMessage();
            }}
            placeholder="Message Janet…"
            aria-label="Message Janet"
          />
          <div
            className="row"
            style={{ position: "absolute", right: 9, top: 10 }}
          >
            <Paperclip size={18} color="var(--muted)" />
            <Camera size={18} color="var(--muted)" />
          </div>
        </div>
        <Button aria-label="Send message" onClick={sendMessage}>
          ↑
        </Button>
      </div>
    </div>
  );
}
