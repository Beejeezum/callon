"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Copy,
  LinkSimple,
  ShieldStar,
  ShieldCheck,
  UserCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import { formatPaseosDateTime } from "@/lib/paseos-time";
import type { AdminOverview } from "@/server/admin-queries";
import { createCircleInviteAction } from "@/server/circle-actions";
import {
  changeMembershipRoleAction,
  moderateMembershipAction,
  revokeCircleInviteAction,
} from "@/server/admin-actions";
import { Badge, Button, Card, Chip } from "./ui";

function statusLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function AdminView({
  data,
  currentProfileId,
}: {
  data: AdminOverview;
  currentProfileId: string;
}) {
  const router = useRouter();
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteUses, setInviteUses] = useState(250);
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [inviteKey, setInviteKey] = useState(() => crypto.randomUUID());

  async function createInvite() {
    setPending("invite");
    setError("");
    const result = await createCircleInviteAction({
      circleId: data.circleId,
      role: "member",
      maxUses: inviteUses,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      idempotencyKey: inviteKey,
    });
    setPending("");
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setInviteUrl(result.data.inviteUrl);
    setInviteKey(crypto.randomUUID());
  }

  async function copyInvite() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function copyWhatsAppNote() {
    const note = `Hey neighbors 👋

Remember my virtual neighborhood library idea from a while back? I’ve kept noodling on it and built a first Paseos version.

The idea grew into something simpler: when you need a ladder, party table, advice, or an extra pair of hands, create one Ask and share it here.

Neighbors can privately offer what they can, and Call On keeps track of who is helping with what, pickup details, and when borrowed things should come back.

Joining takes about a minute:

${inviteUrl}

Made with neighborly love by Bruce 💚`;
    await navigator.clipboard.writeText(note);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function moderate(
    membershipId: string,
    action: "activate" | "restrict" | "suspend" | "restore",
  ) {
    setPending(membershipId);
    setError("");
    const result = await moderateMembershipAction({
      membershipId,
      action,
      idempotencyKey: crypto.randomUUID(),
    });
    setPending("");
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    router.refresh();
  }

  async function changeRole(
    membershipId: string,
    role: "member" | "moderator" | "circle_admin",
  ) {
    setPending(membershipId);
    setError("");
    const result = await changeMembershipRoleAction({
      membershipId,
      role,
      idempotencyKey: crypto.randomUUID(),
    });
    setPending("");
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    router.refresh();
  }

  async function revokeInvite(inviteId: string) {
    setPending(inviteId);
    setError("");
    const result = await revokeCircleInviteAction({
      inviteId,
      idempotencyKey: crypto.randomUUID(),
    });
    setPending("");
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="content">
      <div className="row-between">
        <div>
          <h1>{data.circleName}</h1>
          <p className="lede">
            Membership, safety, and pilot health—not surveillance.
          </p>
        </div>
        <Chip tone="green">Private pilot</Chip>
      </div>

      <div className="field-grid-2 section">
        <Card className="pad">
          <div className="eyebrow">Active members</div>
          <div style={{ fontSize: 34, fontWeight: 850, marginTop: 6 }}>
            {data.activeMembers}
          </div>
          <div className="tiny muted">
            {data.completedSharers} have completed a share
          </div>
        </Card>
        <Card className="pad">
          <div className="eyebrow">Open incidents</div>
          <div style={{ fontSize: 34, fontWeight: 850, marginTop: 6 }}>
            {data.incidents.length}
          </div>
          <div className="tiny muted">
            Evidence remains private without a scoped grant
          </div>
        </Card>
      </div>

      <section className="section card pad">
        <div className="row-start">
          <LinkSimple size={22} color="var(--green-700)" />
          <div>
            <h2>Invite neighbors</h2>
            <p className="muted small" style={{ margin: 0 }}>
              Create one WhatsApp launch link. It grants immediate membership
              after email verification and can be revoked at any time.
            </p>
          </div>
        </div>
        <div className="form-grid" style={{ marginTop: 16 }}>
          <div className="field">
            <label htmlFor="invite-uses">Maximum verified joins</label>
            <input
              id="invite-uses"
              className="input"
              type="number"
              min={1}
              max={250}
              value={inviteUses}
              onChange={(event) =>
                setInviteUses(
                  Math.max(1, Math.min(250, Number(event.target.value) || 1)),
                )
              }
            />
          </div>
          <Button full onClick={createInvite} disabled={pending === "invite"}>
            {pending === "invite" ? "Creating…" : "Create 30-day Paseos invite"}
          </Button>
          {inviteUrl ? (
            <>
              <div className="field">
                <label htmlFor="invite-url">Invitation link</label>
                <div className="row">
                  <input
                    id="invite-url"
                    className="input"
                    readOnly
                    value={inviteUrl}
                  />
                  <Button variant="secondary" onClick={copyInvite}>
                    <Copy size={17} /> {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
              <Button full variant="violet" onClick={copyWhatsAppNote}>
                <Copy size={17} />{" "}
                {copied ? "Copied note" : "Copy WhatsApp launch note"}
              </Button>
            </>
          ) : null}
        </div>
      </section>

      <section className="section">
        <h2>Recent invitation links</h2>
        {data.invites.length ? (
          <div className="list">
            {data.invites.map((invite) => (
              <div className="list-row" key={invite.id}>
                <LinkSimple size={21} color="var(--green-700)" />
                <div className="list-content">
                  <div className="strong small">
                    {invite.useCount} of {invite.maxUses} joins used
                  </div>
                  <div className="tiny muted">
                    {statusLabel(invite.status)} · expires{" "}
                    {formatPaseosDateTime(invite.expiresAt, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
                {invite.status === "active" ? (
                  <Button
                    small
                    variant="danger"
                    disabled={pending === invite.id}
                    onClick={() => revokeInvite(invite.id)}
                  >
                    Revoke
                  </Button>
                ) : (
                  <Badge tone="event">{statusLabel(invite.status)}</Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="notice">
            No links yet. Create one above when you are ready to invite Paseos.
          </div>
        )}
      </section>

      <section className="section">
        <h2>Membership</h2>
        <div className="list">
          {data.memberships.map((membership) => {
            const own = membership.profileId === currentProfileId;
            return (
              <div className="list-row" key={membership.id}>
                <UserCircle size={22} color="var(--green-700)" />
                <div className="list-content">
                  <div className="strong small">
                    {membership.displayName} {own ? "(you)" : ""}
                  </div>
                  <div className="tiny muted">
                    {statusLabel(membership.role)} ·{" "}
                    {statusLabel(membership.status)}
                  </div>
                </div>
                <div
                  className="row wrap"
                  style={{ justifyContent: "flex-end" }}
                >
                  <Badge
                    tone={membership.status === "active" ? "active" : "event"}
                  >
                    {statusLabel(membership.status)}
                  </Badge>
                  {!own && membership.status === "pending" ? (
                    <Button
                      small
                      onClick={() => moderate(membership.id, "activate")}
                      disabled={pending === membership.id}
                    >
                      Approve
                    </Button>
                  ) : null}
                  {!own && membership.status === "active" ? (
                    <>
                      {membership.role !== "moderator" ? (
                        <Button
                          small
                          variant="neutral"
                          onClick={() => changeRole(membership.id, "moderator")}
                          disabled={pending === membership.id}
                        >
                          Moderator
                        </Button>
                      ) : null}
                      {membership.role !== "circle_admin" ? (
                        <Button
                          small
                          variant="neutral"
                          onClick={() =>
                            changeRole(membership.id, "circle_admin")
                          }
                          disabled={pending === membership.id}
                        >
                          <ShieldStar size={16} /> Admin
                        </Button>
                      ) : null}
                      {membership.role !== "member" ? (
                        <Button
                          small
                          variant="neutral"
                          onClick={() => changeRole(membership.id, "member")}
                          disabled={pending === membership.id}
                        >
                          Member
                        </Button>
                      ) : null}
                      <Button
                        small
                        variant="secondary"
                        onClick={() => moderate(membership.id, "restrict")}
                        disabled={pending === membership.id}
                      >
                        Restrict
                      </Button>
                      <Button
                        small
                        variant="danger"
                        onClick={() => moderate(membership.id, "suspend")}
                        disabled={pending === membership.id}
                      >
                        Suspend
                      </Button>
                    </>
                  ) : null}
                  {!own &&
                  ["restricted", "suspended"].includes(membership.status) ? (
                    <Button
                      small
                      onClick={() => moderate(membership.id, "restore")}
                      disabled={pending === membership.id}
                    >
                      Restore
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <h2>Incident queue</h2>
        {data.incidents.length ? (
          <div className="list">
            {data.incidents.map((incident) => (
              <div className="list-row" key={incident.id}>
                <WarningCircle size={22} color="var(--red-600)" />
                <div className="list-content">
                  <div className="strong small">
                    {statusLabel(incident.kind)}
                  </div>
                  <div className="tiny muted">{incident.summary}</div>
                </div>
                <Chip tone="amber">{statusLabel(incident.status)}</Chip>
              </div>
            ))}
          </div>
        ) : (
          <div className="notice">
            No unresolved incidents. Private evidence is not exposed here.
          </div>
        )}
      </section>

      {error ? <div className="notice error section">{error}</div> : null}
      <section className="section">
        <h2>Moderation boundary</h2>
        <div className="privacy-callout">
          <ShieldCheck size={23} />
          <span>
            Circle administrators can review membership and incident summaries.
            They cannot browse private messages, exact pickup locations, or
            evidence without a scoped, audited incident grant.
          </span>
        </div>
      </section>
    </div>
  );
}
