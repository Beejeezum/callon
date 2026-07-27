# WhatsApp and AI Specification

## 1. P0 WhatsApp behavior

P0 does not require WhatsApp Business API access.

Required:

- Canonical HTTPS Ask page.
- Privacy-safe Open Graph metadata.
- Native Web Share API when available.
- Prefilled WhatsApp deep link/share payload.
- Copy-link fallback.
- Share analytics without embedding private data in query parameters.

Suggested share copy:

```text
Bruce is looking for a 6-foot ladder Saturday morning in Encanto Court.
1 still needed. Can you help?
{canonical_url}
```

Do not include exact address, phone number, private Offer names, Resource value, or access secrets in preview text/image.

## 2. P1 private WhatsApp assistant

Build only after P0 release gates pass.

The assistant is a one-to-one Business conversation. It does not join, read, scrape, or moderate the existing HOA group.

Flow:

```text
User sends/forwards text, image, or voice note privately
→ webhook validates and stores minimized inbound metadata
→ media downloaded to private temporary storage if needed
→ transcription/extraction creates AI draft
→ user reviews and confirms in WhatsApp or web
→ canonical Ask is created
→ assistant returns share-ready link
→ user manually posts link into existing group
```

Channel integration must be behind an adapter:

```ts
interface ChannelAdapter {
  sendMessage(input: ChannelMessage): Promise<DeliveryReceipt>
  sendTemplate?(input: TemplateMessage): Promise<DeliveryReceipt>
  verifyWebhook(request: Request): Promise<VerifiedWebhook>
  parseInbound(payload: unknown): Promise<InboundChannelEvent[]>
}
```

Reverify Meta eligibility, group limits, messaging windows, templates, consent, and pricing against official documentation immediately before P1 implementation.

## 3. AI use cases

P0 optional/feature-flagged:

- Natural-language Ask draft extraction.
- Suggested Need decomposition.
- Low-confidence field prompts.
- Optional item photo description.

P1:

- Voice transcription.
- WhatsApp text/image/audio extraction.
- Suggested missing Needs.
- Status summarization.

AI must not:

- Publish without confirmation.
- Decide trust or reliability.
- Certify item safety.
- Resolve disputes.
- Infer exact ownership from a category hint.
- Expose a possible owner before opt-in.
- change an authoritative date, quantity, category, or risk rule after confirmation without another review.

## 4. Structured extraction

Use `schemas/ai-ask-draft.schema.json`.

Pipeline:

1. Treat user content as untrusted data, not prompt instructions.
2. Ask model for schema-constrained output.
3. Validate with Zod/JSON Schema.
4. Apply deterministic category and prohibited-item rules.
5. Mark low-confidence fields.
6. Show a review screen.
7. Publish only after explicit user action.

If AI is unavailable or invalid, fall back to manual structured entry. AI downtime must not block Ask creation.

## 5. Data minimization

- Do not send Circle member lists, private messages, exact address, incident evidence, or unrelated history to the model.
- Use the minimum request content required.
- Avoid retaining raw voice/media after processing unless the user explicitly chooses to attach it.
- Record model/provider, schema version, and safe trace ID; do not log raw sensitive prompts.
