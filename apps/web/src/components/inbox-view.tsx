"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, ChatCircle, MagnifyingGlass } from "@phosphor-icons/react";
import { messages } from "@/lib/mock-data";
import { Avatar } from "./ui";

export function InboxView() {
  const [tab, setTab] = useState<"Messages" | "Notifications">("Messages");
  const [query, setQuery] = useState("");
  const visible = messages.filter(
    (message) =>
      message.name.toLowerCase().includes(query.toLowerCase()) ||
      message.preview.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="content">
      <h1>Inbox</h1>
      <p className="lede">
        Private coordination, reminders, and account notices.
      </p>
      <div className="tabs" style={{ marginTop: 18 }}>
        <button
          className="tab"
          data-active={tab === "Messages"}
          onClick={() => setTab("Messages")}
        >
          <ChatCircle size={16} /> Messages
        </button>
        <button
          className="tab"
          data-active={tab === "Notifications"}
          onClick={() => setTab("Notifications")}
        >
          <Bell size={16} /> Notifications
        </button>
      </div>
      <div className="field" style={{ marginTop: 16 }}>
        <div style={{ position: "relative" }}>
          <MagnifyingGlass
            size={18}
            style={{
              position: "absolute",
              left: 13,
              top: 14,
              color: "var(--muted)",
            }}
          />
          <input
            className="input"
            style={{ paddingLeft: 40 }}
            placeholder="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>
      <div className="list" style={{ marginTop: 14 }}>
        {visible.map((message) => (
          <Link
            href={
              message.name === "Janet"
                ? "/commitments/birthday-tables"
                : "/activity"
            }
            className="list-row"
            key={message.id}
          >
            <Avatar src={message.avatar} name={message.name} />
            <div className="list-content">
              <div className="row-between">
                <span className="strong small truncate">{message.name}</span>
                <span className="tiny muted">{message.time}</span>
              </div>
              <div className="small muted truncate" style={{ marginTop: 3 }}>
                {message.preview}
              </div>
            </div>
            {message.unread ? (
              <span
                style={{
                  width: 8,
                  height: 8,
                  background: "var(--green-600)",
                  borderRadius: 99,
                }}
                aria-label="Unread"
              />
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
