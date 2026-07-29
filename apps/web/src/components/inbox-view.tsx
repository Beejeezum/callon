"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  ChatCircle,
  MagnifyingGlass,
  WarningCircle,
} from "@phosphor-icons/react";
import type { InboxData } from "@/server/user-queries";
import { Avatar } from "./ui";

export function InboxView({ data }: { data: InboxData }) {
  const [tab, setTab] = useState<"Messages" | "Notifications">("Messages");
  const [query, setQuery] = useState("");
  const visibleMessages = useMemo(
    () =>
      data.messages.filter(
        (message) =>
          message.name.toLowerCase().includes(query.toLowerCase()) ||
          message.preview.toLowerCase().includes(query.toLowerCase()),
      ),
    [data.messages, query],
  );

  return (
    <div className="content">
      <h1>Inbox</h1>
      <p className="lede">
        Private coordination, custody reminders, and account notices.
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
      {tab === "Messages" ? (
        <>
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
                placeholder="Search private conversations"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
          <div className="list" style={{ marginTop: 14 }}>
            {visibleMessages.map((message) => (
              <Link
                href={`/commitments/${message.commitmentId}`}
                className="list-row"
                key={message.id}
              >
                <Avatar src={message.avatar} name={message.name} />
                <div className="list-content">
                  <div className="row-between">
                    <span className="strong small truncate">
                      {message.name}
                    </span>
                    <span className="tiny muted">{message.time}</span>
                  </div>
                  <div
                    className="small muted truncate"
                    style={{ marginTop: 3 }}
                  >
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
          {!visibleMessages.length ? (
            <div className="empty-state">
              <ChatCircle size={30} />
              <h2>No matching conversations</h2>
              <p className="muted">
                Private coordination begins after an Offer is accepted.
              </p>
            </div>
          ) : null}
        </>
      ) : (
        <div className="list" style={{ marginTop: 16 }}>
          {data.notifications.map((notice) => (
            <Link className="list-row" href={notice.href} key={notice.id}>
              {notice.tone === "warning" ? (
                <WarningCircle size={22} color="var(--red-600)" />
              ) : (
                <Bell size={22} color="var(--green-700)" />
              )}
              <div className="list-content">
                <div className="strong small">{notice.title}</div>
                <div className="tiny muted">{notice.detail}</div>
              </div>
              <span>›</span>
            </Link>
          ))}
          {!data.notifications.length ? (
            <div className="empty-state">
              <Bell size={30} />
              <h2>You’re all caught up</h2>
              <p className="muted">
                Call On only notifies you about real commitments and account
                safety—not engagement bait.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
