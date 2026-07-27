# WhatsApp Integration Plan

## 1. Product boundary

WhatsApp is an attention and sharing surface. Call On is the source of truth for Needs, Offers, Commitments, custody, privacy, and completion.

P0 requires only:

- excellent link previews;
- `Share to WhatsApp` deep link/native share;
- copy link;
- return to web app for structured actions.

P1 adds a private one-to-one assistant.

## 2. P0 sharing

After publication, generate a share message:

```text
Emily is hosting a birthday party Saturday and still needs:
• 1 pop-up canopy
• help setting up

Can you help? <scoped link>
```

Rules:

- no exact address;
- no phone/email;
- no list of who owns what;
- message reflects current unresolved Needs at generation time;
- OG metadata remains useful if message text is deleted;
- owner explicitly taps Share; never auto-post.

## 3. Link preview

Server-render:

- concise title;
- safe description;
- Circle/general area;
- optional safe Ask image;
- canonical URL with scoped token;
- no personal contact or exact location in metadata/cache.

Share tokens are revocable. Assume link may be forwarded beyond the intended group; the projection remains safe.

## 4. P1 one-to-one assistant

Supported inbound inputs:

- text;
- forwarded text;
- voice note;
- image with caption.

Flow:

```text
user messages assistant
→ webhook verified and deduplicated
→ input normalized and stored with short retention
→ deterministic/AI extraction produces draft
→ assistant shows title, date, Need lines, Circle
→ user confirms or edits
→ web app creates draft/published Ask under verified identity
→ assistant returns share link/message
→ user manually posts it to their group
```

The assistant must not claim to monitor or participate invisibly in an existing consumer group.

## 5. Conversation window/templates

Treat WhatsApp’s customer-service window and template requirements as provider policy, not product logic. Outside the permitted free-form window, send only approved templates with user opt-in and appropriate use case. Email/in-app remains the fallback.

Proposed templates:

- Offer received;
- Offer accepted;
- pickup reminder;
- return due;
- extension response;
- item marked returned;
- urgent incident update.

Do not use WhatsApp for generic engagement reactivation in P1.

## 6. Webhook architecture

```text
Meta webhook
→ signature verification
→ payload size/type validation
→ webhook_receipt dedupe
→ enqueue outbox/inbound work
→ fast 2xx
→ asynchronous processing
→ safe response through provider adapter
```

Store raw provider payload only when operationally necessary, encrypted/restricted, with short retention. Prefer normalized fields. Never log full payload.

## 7. Identity linking

- Normalize phone to E.164.
- Match through keyed hash in private contacts.
- Require explicit linking/verification if ambiguous.
- Do not reveal that another profile owns a number.
- Handle number recycling and contact change.

## 8. Human escalation

Business messaging must provide a clear support route. The assistant says when it cannot resolve a request and offers web/support escalation. It never pretends a human reviewed content when one did not.

## 9. Failure modes

- Provider outage: web and email continue.
- Template rejected: disable that template and use in-app/email.
- Webhook replay: dedupe by provider message/event ID.
- Duplicate extraction: link inbound message to one draft.
- AI uncertainty: ask one targeted clarification or open the web editor.
- Voice/image unsupported: state limitation; do not fabricate content.
- User blocks assistant: suppress channel and retain core account according to policy.

## 10. Metrics

- assistant draft confirmation rate;
- median turns to published Ask;
- extraction correction rate;
- share-link click/Offer conversion;
- template delivery/failure;
- opt-out/block rate;
- percent of core loop completed without assistant dependency.
