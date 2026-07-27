# Call On — P0 UX and Interaction Specification

| Field | Value |
|---|---|
| Status | Prototype implementation specification |
| Product | Call On, working title |
| Scope | Release 0 clickable prototype and Release 1 interaction baseline |
| Primary surface | Mobile web/PWA opened from WhatsApp |
| Secondary surface | Responsive authenticated web application |
| Pilot context | One private HOA/neighborhood Circle |
| Source of truth | `docs/PRD.md` |

---

## 1. Experience thesis

Call On must feel like a lightweight coordination helper, not a social network and not an inventory-management system.

The dominant emotional sequence is:

```text
I have a normal need
→ explaining it is easy
→ asking does not feel embarrassing
→ helping does not feel like a commitment trap
→ logistics become private at the correct moment
→ the item comes back without an awkward chase
→ the community sees a useful, positive result
```

The UX is successful when a person can complete a real act of cooperation without first understanding the product’s underlying data model.

### Non-negotiable interaction rules

1. A first-time contributor sees the actual Ask before any account prompt.
2. Every screen has one dominant decision.
3. “I can help” is more prominent than discussion.
4. An Offer may reference an unlisted item.
5. Exact location and direct contact remain hidden before acceptance.
6. Physical-custody flows use more structure than advice or volunteer help.
7. Safety friction increases with item risk.
8. Declines are private and consequence-free.
9. Persistent inventory is requested only after demonstrated value.
10. The home screen prioritizes obligations, not engagement.
11. Completion produces gratitude and proof of utility, not a generosity leaderboard.
12. WhatsApp is an entry and distribution surface; Call On remains the system of record.

---

## 2. Visual and interaction direction

### 2.1 Intended character

The visual system should feel:

- Neighborly without looking childish.
- Trustworthy without resembling banking or government software.
- Warm without becoming decorative clutter.
- Plain-language and highly legible for occasional, nontechnical users.
- Distinct from Nextdoor’s feed-oriented visual grammar.

### 2.2 Visual tokens used in the prototype

| Token | Purpose |
|---|---|
| Deep forest green | Primary actions, trust, active completion |
| Warm paper background | Domestic, approachable context; reduces “enterprise dashboard” feeling |
| Coral | Creation and celebratory emphasis |
| Soft gold | Open needs and time-sensitive states |
| Soft blue | Advice, information and neutral coordination |
| Rounded cards | Bounded tasks and friendly separation |
| Thin neutral borders | Structure without heavy visual chrome |
| Large system typography | Readability without downloading a font |

Status may never rely on color alone. Every state includes text, an icon, or both.

### 2.3 Motion

Motion is used only to clarify:

- Route changes.
- Progress updates.
- Confirmation and toast states.
- Opening the prototype map.

The experience honors `prefers-reduced-motion`. No infinite animation, gamified confetti shower, or attention-seeking feed behavior is permitted.

### 2.4 Content style

Preferred language:

- Ask
- Need
- I can help
- You’re bringing
- Private plan
- Mark returned
- Ask for more time
- Happy to be asked
- Something went wrong

Avoid member-facing language such as:

- Post
- Lead
- Conversion
- Transaction object
- Trust score
- Inventory score
- Engagement
- Rating
- Dispute ticket

---

## 3. Information architecture

### 3.1 Logged-out/shared-link architecture

```text
Shared Ask
├── Requester and Circle context
├── Time and scope
├── Needs and live coverage
├── I can help
├── Contribution type
├── Offer details
├── Minimal verification
└── Offer sent
```

No unrelated Circle navigation is exposed to a shared-link visitor.

### 3.2 Authenticated navigation

```text
Home
Asks
Share
Mine
Circle
```

- **Home:** obligations, active Asks and relevant opportunities.
- **Asks:** active and recently completed concrete requests.
- **Share:** starts the natural-language composer.
- **Mine:** loans, commitments, saved signals and history.
- **Circle:** membership, rules, privacy and settings.

### 3.3 Admin architecture

```text
Pilot console
├── Overview
├── Membership
├── Reports
├── Invite links
└── Audit log
```

The admin product is visibly separate from the member coordination experience. It never displays routine private messages, exact locations or possession maps.

---

## 4. Core responsive behavior

### Mobile

- Bottom navigation remains reachable with one hand.
- Shared Ask pages use a minimal header and no member navigation.
- Primary actions are at least 44×44 pixels and often full-width.
- High-priority actions may remain sticky above the bottom navigation.
- Multi-column controls collapse into a single decision stack.
- Copy uses short paragraphs with explicit status labels.

### Desktop

- The top bar contains the primary navigation and creation action.
- Task content and contextual explanation may use two columns.
- The main column owns the workflow; sidebars hold context, privacy explanations and progress.
- Desktop does not introduce additional required steps.

### Accessibility baseline

- Semantic headings and landmarks.
- Keyboard-operable buttons and card links.
- Visible focus on interactive controls.
- Programmatic main-content focus after route changes without a full-page focus outline.
- Explicit field labels and associated errors.
- Live-region toasts for non-blocking confirmation.
- No icon-only meaning without an accessible label.
- Plain-language safety and privacy copy.

---

# 5. Screen specifications

## S01 — Shared Ask landing

**Prototype route:** `#/ask/ladder?visitor=1`

### User job

Understand what a known neighbor needs and decide whether to help without installing software or revealing private information.

### Entry

- WhatsApp link.
- SMS or email link.
- Direct canonical Ask URL.

### Content hierarchy

1. Call On identity and private-sharing context.
2. Requester first name, Circle and approved member context.
3. Open/covered status.
4. Plain-language title.
5. Requester’s own context.
6. Date/time and approximate locality.
7. Needs with quantities and coverage.
8. Dominant **I can help** action.
9. Brief privacy explanation.

### Required interactions

- Tap **I can help** without authentication.
- Read a short “How this works” explanation.
- Refresh to current coverage without exposing other Circle records.

### States

- Open with zero coverage.
- Partially covered.
- Fully covered; permit another kind of help but do not imply an item is still needed.
- Expired.
- Cancelled.
- Restricted or removed.

### Privacy rule

The page may not expose exact address, phone number, private messages, other Asks, private Resource Hints, replacement value or detailed member history.

### Analytics

- `shared_ask_viewed`
- `help_cta_selected`
- `how_it_works_opened`

### PRD mapping

`CIR-003`, `SAFE-006`, `WA-002`, shared-link access policy, Journey B.

---

## S02 — Contribution type chooser

**Prototype route:** `#/contribute/ladder`

### User job

State the kind of contribution without first creating an item listing.

### Choices

1. **I can lend it**
2. **I can give something**
3. **I can help**
4. **I know how**
5. **I have another idea**

### Interaction rules

- One option is selected at a time.
- The primary action remains **Continue**.
- The interface does not ask for identity yet.
- “Lend” is not the only high-status contribution.
- The page says no one will know if the visitor changes their mind before sending.

### States

- Default recommendation based on Need category.
- User-selected alternate contribution.
- Contribution disallowed by deterministic safety policy.

### Analytics

- `contribution_type_selected`
- `contribution_flow_abandoned`

### PRD mapping

Journey B, Ask contribution vocabulary, first-use constraints.

---

## S03 — Offer details

**Prototype route:** `#/offer-details/ladder`

### User job

Provide only the details required for the current Ask.

### Physical-item fields

- Short item description.
- Quantity.
- General condition.
- Availability.
- Optional note.

### Help/advice fields

- Short contribution statement.
- Availability or expected time commitment.
- Optional note.

### Required behavior

- `resource_id` is not required.
- A visitor can type “six-foot fiberglass ladder” without listing it permanently.
- Address is explicitly excluded.
- Risk-relevant follow-ups are conditional.
- The form stays brief when the contribution is advice or time.

### Analytics

- `offer_details_started`
- `offer_details_completed`

### PRD mapping

Offer requirements, progressive inventory, Journey B.

---

## S04 — Minimal identity verification

**Prototype route:** `#/verify/ladder`

### User job

Verify enough identity to create an accountable Offer after already choosing to help.

### Required data

- First name.
- Mobile number or email fallback.
- One-time code.
- Confirmation that the user is at least 18.

### Explicitly absent

- Password.
- Last name.
- Profile photo.
- Biography.
- Exact address.
- Inventory.
- Notification-permission prompt.

### States

- Contact entry.
- Code sent.
- Incorrect/expired code.
- Existing account recognized.
- Verification throttled.
- Account recovery required.

### Analytics

- `identity_prompt_viewed`
- `otp_requested`
- `identity_verified`
- `identity_verification_failed`

### PRD mapping

`ID-001` through `ID-004`, `CIR-004`, first-use constraints.

---

## S05 — Offer submitted

**Prototype route:** `#/offer-sent/ladder`

### User job

Know that the Offer succeeded and understand exactly what happens next.

### Required content

- Clear success state.
- “Bruce will confirm.”
- Privacy reassurance.
- Three-step timeline: sent, reviewed, coordinate after acceptance.
- Optional invitation to join the Circle after the useful action.

### Anti-pattern avoided

Do not drop the user onto a generic dashboard after submission.

### Analytics

- `offer_submitted`
- `post_offer_circle_join_selected`

---

## S06 — Natural-language Ask composer

**Prototype route:** `#/create`

### User job

Describe a real need in the language already used in a group chat.

### Content hierarchy

1. “What are you trying to do or find?”
2. Large text input.
3. Statement that nothing publishes automatically.
4. Three example prompts.
5. AI scope and confirmation explanation.
6. Dominant **Make a draft** action.
7. Manual fallback.

### Functional behavior

- Any useful sentence is accepted before taxonomy selection.
- AI extracts Ask type, title, timing, Need lines, quantities and candidate risk.
- Failure produces manual fields, not a dead end.
- Input may later come from a private WhatsApp assistant or voice note without changing the domain flow.

### Usability target

A verified member reaches a reviewable draft within 20 seconds for a simple Ask.

### Analytics

- `ask_composer_opened`
- `ask_input_started`
- `ask_draft_requested`
- `manual_draft_selected`

### PRD mapping

`ASK-001` through `ASK-003`, `AI-001` through `AI-005`, Journey A.

---

## S07 — Draft review and edit

**Prototype route:** `#/draft`

### User job

Confirm that the structured interpretation is correct before publication.

### Editable facts

- Ask title.
- Ask type.
- Date and time.
- Context.
- Need names.
- Quantities.
- Need removal/addition.
- Audience.
- Risk explanation.

### Interaction rules

- Inferred content never looks locked.
- Low-confidence or material fields are visually called out in production.
- Audience cannot be silently broadened by AI.
- At least one Need is required.
- Manual edit remains available when AI is wrong.

### States

- One-Need quick Ask.
- Multi-Need event.
- Low-confidence date.
- Prohibited item blocked.
- Elevated-risk Need requiring acknowledgment later.

### Analytics

- `ask_draft_viewed`
- `ask_draft_field_changed`
- `need_added`
- `need_removed`
- `ask_review_confirmed`

---

## S08 — Multi-Need editor

**Prototype location:** embedded in `#/draft`

### User job

Create a live checklist for an event or project without becoming a project-management application.

### Need line anatomy

- Sequence number.
- Plain-language Need name.
- Category.
- Candidate risk class.
- Quantity control.
- Remove control.

### Rules

- Each Need is independently fulfillable.
- Quantity cannot fall below one.
- Removal updates share copy and coverage calculations.
- Advice, time and material Needs use the same visual structure without creating a Loan automatically.

---

## S09 — Publish and share

**Prototype route:** `#/share`

### User job

Move the canonical Ask into an existing WhatsApp group with useful fallback text.

### Required content

- Published confirmation.
- Ask title, timing and Need count.
- **Share in WhatsApp**.
- **Copy link** fallback.
- Realistic WhatsApp-message preview.
- Link to live coverage page.

### Share-message requirements

The text must include:

- Ask title.
- Date/time.
- Outstanding Needs.
- Direct contribution prompt.
- Canonical URL.

The message must remain useful if the Open Graph preview fails.

### Analytics

- `ask_published`
- `share_sheet_opened`
- `whatsapp_share_selected`
- `ask_link_copied`

### PRD mapping

`WA-001` through `WA-004`, Journey A.

---

## S10 — Ask status and coverage

**Prototype route:** `#/status/birthday`

### User job

See what is covered, what remains and who has already formed private Plans.

### Content hierarchy

- Overall state.
- Coverage count and percentage.
- Need-by-Need rows.
- Accepted contributors.
- Share-only-what-remains action.
- Ask controls.

### Rules

- Progress derives from accepted contribution quantities, not comments.
- Contributors’ exact inventories and logistics remain private.
- Updated share copy emphasizes unresolved Needs.
- Fully covered state changes the primary action to completion preparation.

### Analytics

- `ask_status_viewed`
- `outstanding_needs_shared`
- `ask_paused`
- `ask_cancelled`

---

## S11 — Offer inbox

**Prototype route:** `#/owner/offers`

### User job

Choose the best practical Offer without publicly ranking neighbors.

### Offer card content

- Contributor first name and approved context.
- Offered item/help.
- Timing and conditions.
- Factual transaction indicators where allowed.
- Private message.
- Accept, question, or privately decline.

### Rules

- “Best match” is contextual, not a character judgment.
- An accepted quantity updates the Need atomically.
- Unselected contributors receive a gracious neutral response.
- Alternatives and safer suggestions can remain visible even when the literal item is available.

### Analytics

- `offer_inbox_viewed`
- `offer_accepted`
- `offer_question_started`
- `offer_declined_privately`

### PRD mapping

Offer and Commitment requirements, Journey C.

---

## S12 — Commitment/private Plan

**Prototype route:** `#/plan/ladder`

### User job

Turn an accepted Offer into a clear handoff plan visible only to the required participants.

### Required content

- Accepted item/contribution.
- Participants.
- Handoff methods.
- Date and due time.
- Private location disclosure.
- Progress timeline.
- Private thread entry.
- Issue-report entry.

### Handoff methods

- Porch pickup.
- Meet outside.
- Neutral community point.
- Drop-off.
- Coordinate privately.

### Privacy rule

Exact location is shown only after acceptance and only to Plan participants.

### Analytics

- `plan_viewed`
- `handoff_method_selected`
- `private_thread_opened`

---

## S13 — Private coordination thread

**Prototype route:** `#/messages/ladder`

### User job

Resolve small logistical details without exposing addresses or schedules to the group.

### Required content

- Participant identities.
- Plan summary.
- Message thread.
- Input and send action.
- Admin-privacy explanation.

### Rules

- Routine Circle admins cannot browse the thread.
- Incident access is separate, scoped and audited.
- The thread is not a general direct-message product detached from a Plan.

### Analytics

Only metadata such as message-sent events may be captured. Message bodies may not enter product analytics.

---

## S14 — Handoff confirmation

**Prototype route:** `#/handoff/ladder`

### User job

Record custody and material condition facts with friction proportional to item risk.

### Elevated-risk content

- Item identity.
- Condition selection.
- Known-defect disclosure.
- Borrower responsibility acknowledgment.
- Optional condition photo.
- Clear do-not-continue warning.

### Low-risk variant

For tables, coolers and similar items, reduce this to item/components and one-tap handoff confirmation.

### Rules

- Call On never claims to certify safety.
- Prohibited items never reach this screen.
- Terms are summarized in plain language with access to full terms.
- Confirmation creates an immutable Loan event.

### Analytics

- `handoff_started`
- `condition_photo_added`
- `handoff_confirmed`
- `handoff_cancelled_for_safety`

---

## S15 — Active Loan

**Prototype route:** `#/loan/ladder`

### User job

Know what is due, where it goes and what to do next.

### Content hierarchy

1. Current Loan state.
2. Due time.
3. Return method/location.
4. **Mark returned**.
5. **Ask for more time**.
6. Loan-event timeline.
7. Included components.
8. Private issue action.

### States

- Ready for pickup.
- Active/borrowed.
- Extension requested.
- Extension approved or declined.
- Marked returned.
- Awaiting owner confirmation.
- Closed.
- Overdue.
- Incident open.

### Analytics

- `loan_viewed`
- `return_started`
- `extension_started`
- `incident_started`

---

## S16 — Extension request

**Prototype route:** `#/extension/ladder`

### User job

Ask before the due time with a concrete proposed return.

### Required content

- One-hour option.
- Suggested time within the lender’s stated boundary.
- Custom coordination option.
- Optional note.
- One dominant **Ask Janet** action.

### Rules

- Extension does not silently alter the due time.
- Owner approval or counterproposal is explicit.
- The system does not shame the borrower for asking early.
- Overdue escalation uses a different path.

---

## S17 — Return confirmation

**Prototype route:** `#/return/ladder`

### User job

State that the item has been returned and disclose any known problem.

### Choices

- Returned in the same condition.
- Something changed or went wrong.

The second choice routes to a private incident rather than closing the Loan falsely.

### Completion rule

Borrower marking returned is not final closure; the owner confirms return or reports an issue.

---

## S18 — Resource-save prompt

**Prototype route:** `#/save-resource`

### User job

Decide whether a successfully used item should become reusable community memory.

### Choices

1. Save for private matching.
2. Show to the Circle.
3. Keep transaction history only.
4. Do not save.

### Rules

- This prompt appears after return confirmation.
- It explains that being asked is not guaranteed availability.
- Match-only is the recommended privacy-preserving default.
- No detailed listing form appears at this moment.
- Additional details are requested later only when useful.

### Analytics

- `resource_save_prompt_viewed`
- `resource_memory_choice_selected`
- `resource_saved_match_only`
- `resource_not_saved`

### PRD mapping

Progressive inventory, Journey G.

---

## S19 — Completion and thank-you

**Prototype route:** `#/complete`

### User job

Close the social loop and show the original group that the Ask produced a useful result.

### Required content

- Outcome statement.
- Aggregate things shared and neighbors involved.
- Consent-aware names.
- “Nothing else needed” implication.
- WhatsApp share action.
- One optional qualitative learning question.

### Rules

- No ranked “top helper.”
- No financial claim presented as precise fact.
- Named recognition requires consent.
- The completion card should recruit future behavior by demonstrating utility.

### Analytics

- `ask_completed`
- `completion_card_shared`
- `new_neighbor_connection_reported`

---

## S20 — Home dashboard

**Prototype route:** `#/home`

### User job

See only what requires attention and what may be relevant now.

### Hierarchy

1. Requires your action.
2. Due and active commitments.
3. Your active Ask.
4. Needs you may be able to help with.
5. Recently completed community projects.
6. Product-principle explanation for early pilot users.

### Rules

- No infinite feed.
- No ranking by comments or outrage.
- No profile-completion meter.
- Matching explains why an Ask appears.
- Empty state points to a real Ask or intentional idleness.

### Analytics

- `home_viewed`
- `attention_item_opened`
- `matched_ask_opened`

---

## S21 — Asks index

**Prototype route:** `#/asks`

### User job

Browse active, completed or owned concrete Asks without entering a general discussion feed.

### Filters

- Active.
- Completed.
- Yours.

### Card content

- Ask type.
- Deadline.
- Requester.
- Fulfillment state.
- Open Need summary.

No reactions, trending labels or public controversy signals are present.

---

## S22 — Mine

**Prototype route:** `#/mine`

### User job

Review personal custody, commitments, history and saved signals.

### Sections

- Borrowed now.
- Your upcoming commitments.
- Recent completed history.
- Private Resource Hints.
- Saved items.

### Privacy rule

This surface is personal. Circle members cannot browse another person’s equivalent view.

---

## S23 — Resource Hints and quiet mode

**Prototype route:** `#/hints`

### User job

Express broad willingness without publishing an inventory or creating social pressure.

### Categories

- Basic tools.
- Ladders.
- Yard equipment.
- Party gear.
- Camping gear.
- DIY guidance.

### Quiet mode

- Pauses proactive matching.
- Does not announce absence.
- Does not stop essential active-transaction notices.
- May later support an optional end date.

### Rules

- The selected category means “comfortable being asked,” not “owns this” or “available.”
- Private declines are never shown.
- Frequency caps and matching rotation are explained.

### Analytics

- `resource_hint_changed`
- `quiet_mode_enabled`
- `quiet_mode_disabled`

---

## S24 — Saved item detail/edit

**Prototype representation:** summarized within `#/mine`; production screen required.

### Required controls

- Display name.
- Match-only/Circle-visible/private state.
- “Happy to be asked” status.
- Optional item details collected progressively.
- Temporary unavailable state without vacation disclosure.
- Remove from matching.
- Archive/delete where retention allows.

### Rule

There is no calendar implying guaranteed personal-item availability.

---

## S25 — Circle join/request

**Prototype representation:** post-offer invitation and admin membership queue.

### User job

Request access after value is clear or through an explicit invitation.

### Minimum fields

- Verified first name/contact.
- Connection to Circle.
- Inviter or invite token.
- Adult confirmation.

### States

- Invited.
- Pending.
- Approved.
- Rejected with private reason.
- Suspended.

The join flow does not require listing an item.

---

## S26 — Profile and notification preferences

**Prototype route:** `#/settings`

### Required controls

- First name.
- Optional approximate neighbor context.
- Verified contact recovery.
- Essential transaction notices.
- Proactive matching notices.
- Optional digest.
- Blocked members.
- Data export.
- Leave Circle.

Exact address is never a profile field.

---

## S27 — Circle rules and privacy explanation

**Prototype route:** `#/circle/rules`

### Required topics

- Concrete, completable Asks.
- Private declines and disputes.
- Prohibited item/work categories.
- Admin privacy boundary.
- Emergency-services boundary.
- Commercial-solicitation prohibition.

The first layer is plain language. Full terms remain separately accessible.

---

## S28 — Circle overview

**Prototype route:** `#/circle`

### User job

Understand who the private network is for, its basic health and how it differs from a public social network.

### Content

- Circle name and verified-member count.
- Aggregate completed assists.
- Approved member context.
- Rules/privacy link.
- Invite control for authorized users.
- Personal membership/settings.

No detailed member possession map is shown.

---

# 6. Admin screen specifications

## A01 — Admin overview

**Prototype route:** `#/admin`, Overview tab

Shows aggregate:

- Completed assists.
- Percentage of Asks receiving an Offer.
- Median time to first response.
- Serious unresolved incidents.
- On-time return rate.
- Second-Ask rate.

Excludes message content, exact locations, private declines and possession details.

## A02 — Pending memberships

**Prototype route:** `#/admin`, Membership tab

Shows only:

- Submitted first name.
- Verification status.
- Stated Circle connection.
- Inviter/invite link.

Approval, rejection, suspension and restoration create audit events.

## A03 — Member detail

Production requirement. Show scoped administrative fields, membership status and relevant restrictions. Do not show routine private transactions or match-only Resources.

## A04 — Invite links

**Prototype route:** `#/admin`, Invite links tab

Each link has:

- Label.
- Creation date.
- Usage count/limit.
- Expiry.
- Revocation state.

## A05 — Reported content queue

Production requirement. Separate prohibited public content reports from private transaction incidents.

## A06 — Incident list

**Prototype route:** `#/admin`, Reports tab

Shows category, severity, status and assignment. Evidence remains inaccessible until assignment or documented break-glass access.

## A07 — Incident review

Production requirement. Must include:

- Scope statement.
- Assigned moderator.
- Audited evidence access.
- Participant response.
- Temporary contact restrictions.
- Resolution and appeal path.

## A08 — Circle settings and prohibited categories

Production requirement. Configure membership mode, permitted contribution categories, risk ceiling, Circle rules and notification defaults.

## A09 — Audit log summary

**Prototype route:** `#/admin`, Audit log tab

Shows sensitive state changes such as membership decisions, incident access and content restrictions. It is not a stream of every ordinary member action.

## A10 — Aggregate pilot health

Included in Overview. Definitions must match the PRD metric dictionary and include denominators where relevant.

---

# 7. System-state requirements

## 7.1 Ask states

```text
draft
→ open
→ partially_fulfilled
→ fulfilled
→ in_progress
→ completed
```

Alternate exits:

```text
cancelled
expired
restricted
```

The UI derives plain-language state from deterministic data. It does not ask the user to understand state-machine terminology.

## 7.2 Offer states

```text
draft
→ submitted
→ accepted
→ completed
```

Alternate exits:

```text
declined
withdrawn
expired
```

## 7.3 Loan states

```text
planned
→ ready_for_handoff
→ active
→ return_marked
→ closed
```

Branches:

```text
extension_requested
extension_approved
extension_declined
overdue
incident_open
cancelled
```

Every material transition creates an append-only event in production.

---

# 8. Error and empty states

## AI unavailable

> “We couldn’t organize that automatically. Your words are safe—add the timing and Need manually.”

Primary action: **Continue manually**.

## WhatsApp share unavailable

Primary action: **Copy message and link**.

## No Offer yet

Do not suggest adding inventory. Suggest:

- Share the Ask into the existing group.
- Clarify timing.
- Broaden acceptable alternatives.

## Offer no longer available

Explain that the contributor withdrew or timing changed. Return the Need to open without exposing private reasoning.

## Item looks unsafe at handoff

Primary action: **Do not borrow this item**. Preserve a private report path.

## Return overdue

Use bounded reminders. Then offer a private contact/resolution path rather than repeated public or automated pressure.

## Empty home

> “Nothing needs you right now.”

Actions:

- Stay idle.
- Make a real Ask.
- Optionally review current Circle Needs.

## Empty Circle

> “Start with the first real thing someone needs.”

Do not use a profile or inventory checklist.

---

# 9. Notification UX

### Essential

- New Offer.
- Offer accepted.
- Change request.
- Upcoming handoff.
- Due reminder.
- Extension decision.
- Return marked.
- Issue reported.
- Membership decision.

### Optional

- Proactive private match.
- Circle digest.
- Completion update.

### Copy principles

- Lead with the required action.
- Name the person and item only when permitted.
- Never reveal exact location in lock-screen copy.
- Provide one direct link to the relevant state.
- Stop overdue nudges after the configured bounded cadence.

Example:

> Janet’s ladder is due back tomorrow. Need more time? Ask for an extension.

---

# 10. Analytics and privacy

Member-facing design may be measured, but analytics must exclude:

- Message bodies.
- Exact address.
- Phone number.
- Raw Ask text where it contains PII.
- Private decline behavior visible at individual level.
- Incident evidence.
- Detailed possession lists.

Core funnels:

### Requester

```text
composer opened
→ draft generated
→ review confirmed
→ published
→ shared
→ first Offer
→ accepted Offer
→ completed Ask
```

### Contributor

```text
shared Ask viewed
→ I can help
→ contribution selected
→ details completed
→ identity verified
→ Offer submitted
→ Offer accepted
→ contribution completed
```

### Circle

```text
first Ask
→ first Offer
→ first completed assist
→ five completed assists
→ repeat requester
→ repeat contributor
```

North-star metric: **completed neighbor assists per active Circle**.

---

# 11. Prototype evaluation script

A moderator should run five sessions with people who are not part of the product team.

## Task 1 — First-time contributor

Prompt:

> “This link appeared in your HOA WhatsApp group. You have the ladder Bruce needs. Offer it.”

Observe:

- Whether the person understands the Ask without explanation.
- Whether **I can help** is obvious.
- Whether identity timing feels reasonable.
- Whether they notice that their address is still private.

Success target: contribution begins in under 30 seconds and completes without inventory creation.

## Task 2 — Requester

Prompt:

> “You are hosting a birthday and need two tables, a cooler and shade. Create and share the Ask.”

Observe:

- Whether the natural-language composer feels easier than a form.
- Whether the draft is trusted but still reviewed.
- Whether quantities and audience are noticed.
- Whether the WhatsApp share output is understandable.

Success target: publish/share in under 60 seconds with no facilitator correction.

## Task 3 — Offer selection

Prompt:

> “Three neighbors offered different ways to handle the ladder problem. Choose what you would actually do.”

Observe:

- Whether safer alternatives receive attention.
- Whether factual reliability indicators feel useful or creepy.
- Whether declining feels socially safe.

## Task 4 — Handoff and return

Prompt:

> “You picked up Janet’s ladder. Complete the handoff, ask for more time, then return it.”

Observe:

- Whether risk friction feels proportional.
- Whether extension is easier than ignoring the deadline.
- Whether owner confirmation is understood.

## Task 5 — Progressive memory

Prompt:

> “The loan went well. Decide whether Janet’s ladder should be remembered.”

Observe:

- Whether match-only visibility is understandable.
- Whether any option feels coercive.
- Whether the user understands that saved does not mean automatically bookable.

---

# 12. Prototype decision log

1. The shared Ask route has no bottom navigation or prototype control because conversion clarity is more important than demo navigation.
2. Authentication appears only after a concrete Offer is composed.
3. The prototype uses “Plan” sparingly and explains it in user language; production naming should be tested against “arrangement” and “handoff.”
4. A small prototype map exists only on authenticated screens and is not a production feature.
5. Persistent item saving appears after return confirmation.
6. The admin prototype emphasizes aggregate health and scoped access rather than operational density.
7. The static implementation deliberately simulates instant OTP and lender approval; production must not preserve those shortcuts.

---

# 13. Definition of UX readiness for the private pilot

The interaction design is ready to move from P0 to production implementation when:

- At least 80% of test participants complete the first-time contribution flow without facilitator help.
- Median time to a submitted simple Offer is under 45 seconds, excluding OTP delivery delay.
- Median time from composer open to share-ready Ask is under 60 seconds for a simple request.
- Participants can explain the difference between a private Resource Hint and a public listing.
- Participants understand that address disclosure happens after acceptance.
- No participant believes the HOA can casually browse private messages or possession data.
- Users recognize the extension path before choosing to ignore a deadline.
- Safety acknowledgments are understood without creating the false impression of platform certification.
- The completion card feels appreciative rather than gamified.
- WCAG 2.2 AA review identifies no critical blocker in the core mobile flows.
