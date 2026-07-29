"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CalendarBlank,
  Check,
  ChatCircle,
  Clock,
  Package,
  WarningCircle,
} from "@phosphor-icons/react";
import type { LoanView } from "@/server/transaction-queries";
import {
  formatPaseosDateTime,
  paseosLocalDateTimeToDate,
} from "@/lib/paseos-time";
import {
  declineLoanExtensionAction,
  reportLoanIncidentAction,
  saveResourceFromLoanAction,
  transitionLoanAction,
} from "@/server/transaction-actions";
import { Button, ButtonLink, Card, Chip } from "./ui";

function dateTime(value: string | null) {
  if (!value) return "No date recorded";
  return formatPaseosDateTime(value, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusLabel(status: string) {
  return status
    .split("_")
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}

export function LoanTracker({ loan }: { loan: LoanView }) {
  const router = useRouter();
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const [extensionDate, setExtensionDate] = useState("");
  const [extensionTime, setExtensionTime] = useState("18:00");
  const [showExtension, setShowExtension] = useState(false);
  const [showIssue, setShowIssue] = useState(false);
  const [issueKind, setIssueKind] = useState("damage");
  const [issueSummary, setIssueSummary] = useState("");
  const [saveItem, setSaveItem] = useState(true);
  const [resourceTitle, setResourceTitle] = useState(loan.itemName);
  const [visibility, setVisibility] = useState("match_only");
  const [actionKeys] = useState(() => ({
    returned: crypto.randomUUID(),
    extension: crypto.randomUUID(),
    approve: crypto.randomUUID(),
    decline: crypto.randomUUID(),
    confirm: crypto.randomUUID(),
    issue: crypto.randomUUID(),
    save: crypto.randomUUID(),
  }));
  const [resourceSaved, setResourceSaved] = useState(false);

  async function runLoanAction(
    pendingName: string,
    action:
      | "mark_returned"
      | "request_extension"
      | "approve_extension"
      | "confirm_return",
    idempotencyKey: string,
    proposedDueAt?: string,
  ) {
    setPending(pendingName);
    setError("");
    const result = await transitionLoanAction({
      loanId: loan.id,
      action,
      proposedDueAt,
      idempotencyKey,
    });
    setPending("");
    if (!result.ok) {
      setError(result.error.message);
      return false;
    }
    router.refresh();
    return true;
  }

  async function requestExtension() {
    const proposed = paseosLocalDateTimeToDate(extensionDate, extensionTime);
    if (!proposed || proposed <= new Date()) {
      setError("Choose a future return time.");
      return;
    }
    const ok = await runLoanAction(
      "extension",
      "request_extension",
      actionKeys.extension,
      proposed.toISOString(),
    );
    if (ok) setShowExtension(false);
  }

  async function declineExtension() {
    setPending("decline");
    setError("");
    const result = await declineLoanExtensionAction({
      loanId: loan.id,
      idempotencyKey: actionKeys.decline,
    });
    setPending("");
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    router.refresh();
  }

  async function reportIssue() {
    setPending("issue");
    setError("");
    const incident = await reportLoanIncidentAction({
      circleId: loan.circleId,
      subjectProfileId: loan.counterpartProfileId,
      commitmentId: loan.commitmentId,
      loanId: loan.id,
      kind: issueKind,
      summary: issueSummary,
      idempotencyKey: actionKeys.issue,
    });
    if (!incident.ok) {
      setPending("");
      setError(incident.error.message);
      return;
    }
    setPending("");
    setShowIssue(false);
    router.refresh();
  }

  async function saveResource() {
    if (!saveItem) {
      router.push("/activity");
      return;
    }
    setPending("save");
    setError("");
    const result = await saveResourceFromLoanAction({
      sourceLoanId: loan.id,
      title: resourceTitle,
      description: "Remembered after a completed neighbor share.",
      visibility,
      willingness: "happy_to_be_asked",
      idempotencyKey: actionKeys.save,
    });
    setPending("");
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setResourceSaved(true);
  }

  if (loan.status === "returned") {
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
            The custody record is complete. No public rating or score is
            created.
          </p>
        </div>
        {loan.viewerIsLender && !resourceSaved ? (
          <Card className="pad section">
            <div className="row-between">
              <div>
                <div className="eyebrow">Remember for future matches?</div>
                <h3 style={{ marginTop: 5 }}>{loan.itemName}</h3>
                <p className="muted small" style={{ margin: 0 }}>
                  Optional and private by default.
                </p>
              </div>
              <button
                className="toggle"
                data-on={saveItem}
                onClick={() => setSaveItem((value) => !value)}
                aria-label="Remember item for future matches"
              />
            </div>
            {saveItem ? (
              <div className="form-grid" style={{ marginTop: 16 }}>
                <div className="field">
                  <label htmlFor="resource-title">Item name</label>
                  <input
                    id="resource-title"
                    className="input"
                    value={resourceTitle}
                    onChange={(event) => setResourceTitle(event.target.value)}
                    maxLength={100}
                  />
                </div>
                <div className="field">
                  <label htmlFor="resource-visibility">Visibility</label>
                  <select
                    id="resource-visibility"
                    className="select"
                    value={visibility}
                    onChange={(event) => setVisibility(event.target.value)}
                  >
                    <option value="match_only">Private matching only</option>
                    <option value="private">Private memory</option>
                    <option value="circle">Visible to this Circle</option>
                  </select>
                </div>
              </div>
            ) : null}
            {error ? <div className="notice error">{error}</div> : null}
            <div className="spacer-16" />
            <Button full onClick={saveResource} disabled={pending === "save"}>
              {pending === "save"
                ? "Saving…"
                : saveItem
                  ? "Save preference"
                  : "Skip"}
            </Button>
          </Card>
        ) : resourceSaved ? (
          <div className="notice section">
            <strong>Saved privately.</strong> Future matches still require your
            approval every time.
          </div>
        ) : null}
        <div className="stack-sm section">
          <ButtonLink href="/activity" full>
            View activity
          </ButtonLink>
          <ButtonLink href="/" variant="secondary" full>
            Back home
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="content narrow">
      <div className="row-between">
        <div>
          <div className="eyebrow">
            {loan.viewerIsLender ? "Item you lent" : "Item in your care"}
          </div>
          <h1 style={{ marginTop: 6 }}>{loan.itemName}</h1>
        </div>
        <Chip
          tone={
            loan.status === "overdue" || loan.status === "disputed"
              ? "red"
              : loan.status === "extension_requested"
                ? "amber"
                : "green"
          }
        >
          {statusLabel(loan.status)}
        </Chip>
      </div>

      <Card className="pad section">
        <div className="row-start">
          <span className="choice-icon">
            <Package size={24} weight="duotone" />
          </span>
          <div>
            <div className="eyebrow">
              {loan.viewerIsLender ? "Borrowed by" : "Borrowed from"}
            </div>
            <h3 style={{ marginTop: 5 }}>{loan.counterpartName}</h3>
            <p className="muted tiny" style={{ margin: 0 }}>
              Exact logistics remain private to accepted parties.
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
              <div className="strong small">Handoff</div>
              <div className="muted tiny">
                {loan.checkedOutAt
                  ? dateTime(loan.checkedOutAt)
                  : "Waiting for confirmation"}
              </div>
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
              <div className="strong small">Custody</div>
              <div className="muted tiny">
                Components and condition remain attached to this record.
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
              <div className="muted tiny">{dateTime(loan.dueAt)}</div>
            </div>
          </div>
        </div>
      </section>

      {loan.status === "extension_requested" ? (
        <div className="notice warning">
          <strong>Extension requested.</strong>{" "}
          {loan.viewerIsLender
            ? `The proposed return is ${dateTime(loan.proposedDueAt)}.`
            : "The original due time remains in effect until the lender responds."}
        </div>
      ) : null}
      {loan.status === "overdue" ? (
        <div className="notice error">
          <strong>Return overdue.</strong> Coordinate privately or request a new
          time. This is factual custody status, not a public penalty.
        </div>
      ) : null}
      {loan.status === "return_marked" ? (
        <div className="notice">
          <strong>Return marked.</strong>{" "}
          {loan.viewerIsLender
            ? "Inspect the item and confirm the return or report an issue."
            : "Waiting for the lender to confirm."}
        </div>
      ) : null}
      {loan.status === "disputed" ? (
        <div className="notice error">
          <strong>Private issue open.</strong> The custody record is frozen
          while the parties and a scoped moderator resolve it.
        </div>
      ) : null}

      {showExtension ? (
        <section className="section card pad">
          <h2>Request a new return time</h2>
          <div className="field-grid-2">
            <div className="field">
              <label htmlFor="extension-date">Date</label>
              <input
                id="extension-date"
                className="input"
                type="date"
                value={extensionDate}
                onChange={(event) => setExtensionDate(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="extension-time">Time</label>
              <input
                id="extension-time"
                className="input"
                type="time"
                value={extensionTime}
                onChange={(event) => setExtensionTime(event.target.value)}
              />
            </div>
          </div>
          <div className="spacer-16" />
          <div className="field-grid-2">
            <Button full onClick={requestExtension}>
              Send request
            </Button>
            <Button
              full
              variant="neutral"
              onClick={() => setShowExtension(false)}
            >
              Cancel
            </Button>
          </div>
        </section>
      ) : null}

      {showIssue ? (
        <section className="section card pad">
          <h2>Report an issue privately</h2>
          <p className="muted small">
            Describe facts, not accusations. This is never published to the
            Circle.
          </p>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="issue-kind">Issue type</label>
              <select
                id="issue-kind"
                className="select"
                value={issueKind}
                onChange={(event) => setIssueKind(event.target.value)}
              >
                <option value="late_return">Late return</option>
                <option value="missing_component">Missing component</option>
                <option value="damage">Damage</option>
                <option value="unsafe_item">Unsafe item</option>
                <option value="privacy">Privacy concern</option>
                <option value="harassment">Harassment</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="issue-summary">What happened?</label>
              <textarea
                id="issue-summary"
                className="textarea"
                value={issueSummary}
                onChange={(event) => setIssueSummary(event.target.value)}
                minLength={10}
                maxLength={2000}
              />
            </div>
            <div className="field-grid-2">
              <Button
                full
                variant="danger"
                disabled={
                  pending === "issue" || issueSummary.trim().length < 10
                }
                onClick={reportIssue}
              >
                {pending === "issue" ? "Submitting…" : "Submit privately"}
              </Button>
              <Button
                full
                variant="neutral"
                onClick={() => setShowIssue(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section stack-sm">
        {error ? <div className="notice error">{error}</div> : null}
        {!loan.viewerIsLender &&
        ["checked_out", "overdue"].includes(loan.status) ? (
          <>
            <Button
              full
              onClick={() =>
                runLoanAction("returned", "mark_returned", actionKeys.returned)
              }
              disabled={Boolean(pending)}
            >
              <Check size={18} />{" "}
              {pending === "returned" ? "Marking…" : "Mark as returned"}
            </Button>
            <Button
              variant="secondary"
              full
              onClick={() => setShowExtension(true)}
              disabled={Boolean(pending)}
            >
              <Clock size={18} /> Request an extension
            </Button>
          </>
        ) : null}
        {loan.viewerIsLender && loan.status === "extension_requested" ? (
          <div className="field-grid-2">
            <Button
              full
              onClick={() =>
                runLoanAction(
                  "approve",
                  "approve_extension",
                  actionKeys.approve,
                )
              }
              disabled={Boolean(pending)}
            >
              Approve
            </Button>
            <Button
              full
              variant="neutral"
              onClick={declineExtension}
              disabled={Boolean(pending)}
            >
              Decline
            </Button>
          </div>
        ) : null}
        {loan.viewerIsLender && loan.status === "return_marked" ? (
          <Button
            full
            onClick={() =>
              runLoanAction("confirm", "confirm_return", actionKeys.confirm)
            }
            disabled={Boolean(pending)}
          >
            <Check size={18} />{" "}
            {pending === "confirm" ? "Confirming…" : "Confirm return"}
          </Button>
        ) : null}
        <ButtonLink
          href={`/commitments/${loan.commitmentId}`}
          variant="neutral"
          full
        >
          <ChatCircle size={18} /> Message {loan.counterpartName}
        </ButtonLink>
        {!["returned", "disputed", "cancelled"].includes(loan.status) ? (
          <Button variant="danger" full onClick={() => setShowIssue(true)}>
            <WarningCircle size={18} /> Report an issue privately
          </Button>
        ) : null}
      </section>
    </div>
  );
}
