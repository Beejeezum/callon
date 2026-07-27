import type {
  AnalyticsProvider,
  AskDraftProvider,
  EmailProvider,
  ErrorReporter,
  NotificationMessage,
} from "../provider-contracts";

export class MockEmailProvider implements EmailProvider {
  async send(message: NotificationMessage) {
    console.info("mock.email", {
      template: message.template,
      idempotencyKey: message.idempotencyKey,
    });
    return { providerMessageId: `mock-${message.idempotencyKey}` };
  }
}

export class MockAnalyticsProvider implements AnalyticsProvider {
  async capture(event: string, properties: Record<string, unknown>) {
    console.info("mock.analytics", {
      event,
      propertyNames: Object.keys(properties).sort(),
    });
  }
}

export class ConsoleErrorReporter implements ErrorReporter {
  capture(error: unknown, context?: Record<string, unknown>) {
    console.error("reported.error", {
      errorName: error instanceof Error ? error.name : "UnknownError",
      contextKeys: context ? Object.keys(context).sort() : [],
    });
  }
}

export class DeterministicAskDraftProvider implements AskDraftProvider {
  async draft(input: { text: string; locale: string }) {
    return {
      title: input.text.slice(0, 80),
      description: input.text,
      needs: [
        {
          kind: "help",
          title: "Clarify the specific help needed",
          quantity: 1,
        },
      ],
      warnings: [
        "AI drafting is disabled; this deterministic fallback never publishes automatically.",
      ],
    };
  }
}
