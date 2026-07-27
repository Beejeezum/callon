# UX and Information Architecture

## 1. UX objective

Make neighbor-to-neighbor help feel easier and less socially risky than an unstructured group-chat request. The product must minimize work for both the requester and the contributor while creating enough structure to avoid duplicate offers, unclear commitments, missing items, and awkward returns.

## 2. Navigation model

Authenticated mobile navigation:

```text
Home | Asks | Create (+) | Inbox | Me
```

- **Home:** obligations, active Ask, and a small set of relevant nearby needs.
- **Asks:** finite list of active Needs/Offers/Events; not an infinite engagement feed.
- **Create:** Ask wizard.
- **Inbox:** private conversations and notifications.
- **Me:** activity, saved items, memberships, preferences.

Desktop adds a compact left/top navigation but preserves the same hierarchy. Admin routes are not part of normal member navigation.

## 3. The home-screen hierarchy

Order content by consequence, not engagement:

1. overdue or due-soon commitments;
2. active Ask progress;
3. accepted pickup/return actions;
4. relevant Needs the user may be able to help with;
5. recently completed community outcomes;
6. optional available Offer/resource callout.

Do not place an open composer or generic discussion prompt at the top.

## 4. Ask creation

### Step 1 — intent and timing

- What do you need help with?
- Optional context: why/project/event.
- When is it needed?
- General location or Circle.

The initial description should accept one sentence. Deterministic parsing may suggest a title but does not publish.

### Step 2 — Need lines

For each Need:

- kind;
- item/help label;
- quantity;
- optional notes;
- optional image;
- risk/category validation.

Use simple rows and an `Add another need` action. Default quantity to one. Do not require brand, model, replacement value, or full item specifications.

### Step 3 — review and share

- preview exactly what shared visitors see;
- show the privacy statement;
- publish;
- primary CTA `Share to WhatsApp`;
- secondary actions: copy link, native share;
- display coverage after publication.

## 5. Shared visitor path

The shared Ask page is a focused landing page, not a marketing site.

```text
Ask owner + Circle context
Ask title, date, general area
Need coverage list
privacy note
[I can help]
small “How it works” disclosure
```

After `I can help`:

1. choose Need and contribution type;
2. describe contribution and availability;
3. provide minimal identity/contact;
4. complete OTP/magic-link verification;
5. review and submit;
6. show pending/received status.

Do not require navigation into the rest of the Circle.

## 6. Offer-owner path

The Ask owner sees one private row per Offer:

- contributor identity and Circle/guest context;
- contribution summary;
- quantity;
- availability;
- conditions;
- timestamp;
- status.

Actions:

- view;
- ask privately;
- accept;
- decline silently;
- report.

Never show public stars. Factual history may include `3 completed shares` or `no unresolved returns` only when it is accurate and allowed by policy.

## 7. Accepted coordination

After acceptance, the Commitment page becomes the shared workspace:

- accepted contribution summary;
- pickup/return schedule;
- exact location shared by the appropriate party;
- private messages;
- logistics changes;
- cancel/report controls;
- handoff action.

A status banner explains what is expected next. Avoid burying the action inside chat.

## 8. Loan lifecycle UX

### Pending handoff

- item and parties;
- schedule;
- included components/condition only when risk requires it;
- `Confirm handoff`.

### Checked out

- due date prominent;
- message party;
- request extension;
- mark returned;
- report issue.

### Return marked

- borrower sees waiting state;
- lender sees `Confirm return` or `Report issue`.

### Returned

- factual completion;
- private quality prompt for operational learning, not public review;
- optional thanks;
- optional save for future matching.

## 9. Progressive inventory

The inventory model has four levels:

1. **category hint:** privately comfortable being asked about Tools, Party Gear, etc.;
2. **unlisted Offer:** enough detail for one exchange;
3. **saved Resource:** item remembered after successful exchange;
4. **Circle-visible Resource:** explicitly opted-in browsing, still request-to-confirm.

No “complete your inventory” onboarding. The system asks one relevant question at the moment it becomes useful.

## 10. Empty states

Every empty state must explain the next useful action:

- no active Ask: `Create an Ask` and optional category browse;
- no Offers: `Share your Ask` and copy/WhatsApp actions;
- no messages: explain that private coordination appears after acceptance;
- no saved items: explain that items can be remembered after helping;
- no relevant needs: `Nothing needs your attention right now` rather than manufacturing content.

## 11. Copy principles

- Use direct verbs: Ask, Offer, Accept, Pick up, Return, Close.
- Avoid marketplace language: listing, renter, seller, transaction value.
- Avoid obligation: `You may be able to help`, not `You should contribute`.
- Make declining safe: `Not this time` and no explanation required.
- Explain privacy at the decision point.
- Use human names and concrete dates.
- Avoid “trust score,” “top neighbor,” “super lender,” or scarcity pressure.

## 12. Responsive behavior

### Mobile

- single working column;
- sticky bottom navigation only on authenticated member routes;
- sticky primary action when it does not obscure content;
- progressive steps for forms;
- full-width sheets/dialogs where appropriate.

### Tablet/desktop

- maximum working width around 1120 px;
- optional two-column detail + actions;
- no stretched mobile cards across the full screen;
- preserve finite lists and clear obligations;
- public/shared Ask remains centered and focused.

## 13. First-run and installation

Do not ask for PWA installation on first visit. Prompt only after repeated value, such as a completed exchange or third authenticated session. The website remains fully functional without installation or push permission.
