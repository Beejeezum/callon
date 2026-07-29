export type NotificationMessage = {
  toEmail: string;
  template: string;
  variables: Record<string, string | number | boolean | null>;
  idempotencyKey: string;
};

export interface EmailProvider {
  send(message: NotificationMessage): Promise<{ providerMessageId: string }>;
}

export interface AnalyticsProvider {
  capture(event: string, properties: Record<string, unknown>): Promise<void>;
}

export interface ErrorReporter {
  capture(error: unknown, context?: Record<string, unknown>): void;
}

export interface AskDraftProvider {
  draft(input: { text: string; locale: string }): Promise<{
    title: string;
    description?: string;
    needs: Array<{ kind: string; title: string; quantity: number }>;
    warnings: string[];
  }>;
}
