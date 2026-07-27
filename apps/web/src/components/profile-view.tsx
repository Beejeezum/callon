"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Gear,
  HandHeart,
  LockKey,
  ShieldCheck,
  SignOut,
  UsersThree,
} from "@phosphor-icons/react";
import type { ProfileView as ProfileData } from "@/server/user-queries";
import { updateProfileAction } from "@/server/user-actions";
import { signOutAction } from "@/server/auth-actions";
import { Avatar, Button, Card, Chip } from "./ui";

export function ProfileView({
  profile,
  circleName,
  canAdmin,
}: {
  profile: ProfileData;
  circleName: string;
  canAdmin: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [timezone, setTimezone] = useState(profile.timezone);
  const [emailEnabled, setEmailEnabled] = useState(profile.emailEnabled);
  const [quietHoursStart, setQuietHoursStart] = useState(
    profile.quietHoursStart,
  );
  const [quietHoursEnd, setQuietHoursEnd] = useState(profile.quietHoursEnd);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function save() {
    setPending(true);
    setError("");
    setSaved(false);
    const result = await updateProfileAction({
      displayName,
      timezone,
      emailEnabled,
      quietHoursStart,
      quietHoursEnd,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setSaved(true);
    setEditing(false);
    router.refresh();
  }

  async function signOut() {
    setPending(true);
    const result = await signOutAction();
    setPending(false);
    if (result.ok) {
      router.push(result.data.next);
      router.refresh();
    }
  }

  return (
    <div className="content narrow">
      <div style={{ textAlign: "center" }}>
        <span style={{ display: "inline-flex" }}>
          <Avatar src={profile.avatar} name={profile.displayName} size="lg" />
        </span>
        <h1 style={{ marginTop: 14, marginBottom: 4 }}>
          {profile.displayName}
        </h1>
        <p className="muted small">
          {circleName} member since {profile.memberSince}
        </p>
      </div>
      <div className="field-grid-2 section">
        <Card className="pad" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {profile.completedShares}
          </div>
          <div className="tiny muted">Completed shares</div>
        </Card>
        <Card className="pad" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {profile.unresolvedIssues}
          </div>
          <div className="tiny muted">Unresolved issues</div>
        </Card>
      </div>
      <div
        className="row wrap"
        style={{ justifyContent: "center", marginTop: 12 }}
      >
        <Chip tone="green">
          <ShieldCheck size={14} /> Verified member
        </Chip>
        <Chip>
          <HandHeart size={14} /> Factual history only
        </Chip>
      </div>

      {editing ? (
        <section className="section card pad">
          <h2>Profile and reminders</h2>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="profile-name">Display name</label>
              <input
                id="profile-name"
                className="input"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={80}
              />
            </div>
            <div className="field">
              <label htmlFor="profile-timezone">Timezone</label>
              <select
                id="profile-timezone"
                className="select"
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
              >
                <option value="America/New_York">Eastern</option>
                <option value="America/Chicago">Central</option>
                <option value="America/Denver">Mountain</option>
                <option value="America/Los_Angeles">Pacific</option>
                <option value="America/Phoenix">Arizona</option>
                <option value="Pacific/Honolulu">Hawaii</option>
              </select>
            </div>
            <label className="choice">
              <Bell size={19} />
              <span style={{ flex: 1 }}>
                <span className="strong small">Transactional email</span>
                <span className="help-text" style={{ display: "block" }}>
                  Offers, handoffs, due dates, returns, and incidents only.
                </span>
              </span>
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={(event) => setEmailEnabled(event.target.checked)}
              />
            </label>
            <div className="field-grid-2">
              <div className="field">
                <label htmlFor="quiet-start">Quiet hours start</label>
                <input
                  id="quiet-start"
                  className="input"
                  type="time"
                  value={quietHoursStart}
                  onChange={(event) => setQuietHoursStart(event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="quiet-end">Quiet hours end</label>
                <input
                  id="quiet-end"
                  className="input"
                  type="time"
                  value={quietHoursEnd}
                  onChange={(event) => setQuietHoursEnd(event.target.value)}
                />
              </div>
            </div>
            {error ? <div className="notice error">{error}</div> : null}
            <div className="field-grid-2">
              <Button
                full
                onClick={save}
                disabled={pending || displayName.trim().length < 1}
              >
                {pending ? "Saving…" : "Save settings"}
              </Button>
              <Button full variant="neutral" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <section className="section">
          <div className="list">
            <Link href="/activity" className="list-row">
              <UsersThree size={20} color="var(--green-700)" />
              <div className="list-content">
                <div className="strong small">My activity</div>
                <div className="tiny muted">
                  Asks, Offers, Loans, and saved items
                </div>
              </div>
              <span>›</span>
            </Link>
            <button
              className="list-row"
              style={{ width: "100%", textAlign: "left" }}
              onClick={() => setEditing(true)}
            >
              <Bell size={20} color="var(--green-700)" />
              <div className="list-content">
                <div className="strong small">Profile and notifications</div>
                <div className="tiny muted">
                  Name, timezone, reminders, and quiet hours
                </div>
              </div>
              <span>›</span>
            </button>
            <div className="list-row">
              <LockKey size={20} color="var(--green-700)" />
              <div className="list-content">
                <div className="strong small">Privacy and data</div>
                <div className="tiny muted">
                  Contact details and exact locations are private.
                </div>
              </div>
            </div>
            {canAdmin ? (
              <Link href="/admin" className="list-row">
                <Gear size={20} color="var(--green-700)" />
                <div className="list-content">
                  <div className="strong small">Circle administration</div>
                  <div className="tiny muted">
                    Membership, invites, safety, and incident queue
                  </div>
                </div>
                <span>›</span>
              </Link>
            ) : null}
          </div>
        </section>
      )}

      {saved ? (
        <div className="notice">
          <strong>Saved.</strong> Your profile and notification preferences are
          current.
        </div>
      ) : null}
      <section className="section">
        <div className="notice">
          <strong>No public reputation score.</strong> Call On uses factual
          completion and unresolved-issue status only where it helps people
          safely coordinate.
        </div>
      </section>
      <section className="section">
        <Button variant="neutral" full onClick={signOut} disabled={pending}>
          <SignOut size={18} /> Sign out
        </Button>
      </section>
    </div>
  );
}
