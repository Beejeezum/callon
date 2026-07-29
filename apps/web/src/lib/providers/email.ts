import "server-only";
import type { EmailProvider, NotificationMessage } from "../provider-contracts";
import { serverEnv } from "../server-env";
import { MockEmailProvider } from "./mock";

const templateCopy: Record<
  string,
  { subject: string; heading: string; body: string }
> = {
  "ask_published.v1": {
    subject: "Your Ask is ready to share",
    heading: "Your Ask is live",
    body: "Share it with your private Circle when you are ready.",
  },
  "offer_received.v1": {
    subject: "A neighbor offered to help",
    heading: "You received a new Offer",
    body: "Review it privately and accept only if the timing and details work.",
  },
  "offer_accepted.v1": {
    subject: "Your Offer was accepted",
    heading: "Your help is confirmed",
    body: "You can now coordinate the handoff privately with the requester.",
  },
  "pickup_reminder.v1": {
    subject: "Handoff reminder",
    heading: "Your handoff is coming up",
    body: "Open Call On to confirm the latest private coordination details.",
  },
  "return_due.v1": {
    subject: "Return reminder",
    heading: "A return is due soon",
    body: "Return the item on time or request a new return time in Call On.",
  },
  "commitment_message.v1": {
    subject: "New private message",
    heading: "You have a new coordination message",
    body: "Open the private Commitment to reply.",
  },
  "loan_checked_out.v1": {
    subject: "Handoff confirmed",
    heading: "The item is now checked out",
    body: "The custody ledger is active until both parties confirm the return.",
  },
  "extension_requested.v1": {
    subject: "Return extension requested",
    heading: "A neighbor requested more time",
    body: "Review the proposed time and approve or decline it privately.",
  },
  "extension_resolved.v1": {
    subject: "Return extension updated",
    heading: "Your extension request was reviewed",
    body: "Open the Loan to see the current due time.",
  },
  "return_marked.v1": {
    subject: "Item marked returned",
    heading: "Please confirm the return",
    body: "Inspect the item, confirm the return, or report an issue privately.",
  },
  "return_confirmed.v1": {
    subject: "Return confirmed",
    heading: "The Loan is complete",
    body: "The custody ledger has been closed.",
  },
  "incident_update.v1": {
    subject: "Private Loan issue update",
    heading: "A private issue was reported",
    body: "The Loan is frozen while the parties and a scoped moderator review it.",
  },
  "commitment_completed.v1": {
    subject: "Contribution completed",
    heading: "Your help is complete",
    body: "Thank you for helping a neighbor get something done.",
  },
};

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}

class ResendEmailProvider implements EmailProvider {
  async send(message: NotificationMessage) {
    if (!serverEnv.RESEND_API_KEY) {
      throw new Error("RESEND_NOT_CONFIGURED");
    }
    const copy = templateCopy[message.template] ?? {
      subject: "Call On update",
      heading: "You have a Call On update",
      body: "Open Call On to review the latest activity.",
    };
    const href =
      typeof message.variables.href === "string" ? message.variables.href : "/";
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serverEnv.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": message.idempotencyKey,
      },
      body: JSON.stringify({
        from: serverEnv.EMAIL_FROM,
        to: [message.toEmail],
        subject: copy.subject,
        html: `<main style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#173b2d">
          <p style="font-weight:700;color:#317a57">Call On</p>
          <h1 style="font-size:26px">${escapeHtml(copy.heading)}</h1>
          <p style="line-height:1.6">${escapeHtml(copy.body)}</p>
          <p><a href="${escapeHtml(href)}" style="display:inline-block;background:#26734d;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none">Open Call On</a></p>
          <p style="font-size:13px;color:#66736c">This is a private coordination update. Contact details and exact locations are never included in notification email.</p>
        </main>`,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };
    if (!response.ok || !payload.id) {
      throw new Error(
        response.status === 429
          ? "RESEND_RATE_LIMITED"
          : `RESEND_${response.status}`,
      );
    }
    return { providerMessageId: payload.id };
  }
}

export function createEmailProvider(): EmailProvider {
  return serverEnv.EMAIL_PROVIDER === "resend"
    ? new ResendEmailProvider()
    : new MockEmailProvider();
}
