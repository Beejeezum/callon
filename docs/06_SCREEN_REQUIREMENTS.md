# Screen-by-Screen Requirements

Each screen has a product job, required data, actions, and privacy boundary. Mock data in the scaffold is illustrative; production uses the domain model.

## 1. Home `/`

**Job:** show what needs the member’s attention and one clear way to Ask.

Required:

- Circle switcher/name;
- greeting and notification control;
- chips: All, Needs help, Offering, Events;
- `Your commitments` block when due/overdue;
- one active Ask progress card;
- maximum three relevant nearby Needs;
- optional Offer/event rows;
- bottom navigation.

Avoid: endless scrolling, engagement ranking, crime/politics categories, generic composer.

## 2. Create Ask `/asks/new`

**Job:** publish a useful Ask in under 60 seconds.

States:

1. intent/context/timing;
2. Need line editor;
3. review/privacy;
4. published/share success.

Validation:

- title/description length;
- deadline in future or explicit same-day handling;
- one valid Need;
- prohibited-category check;
- image type/size;
- no exact address in public fields warning/detection.

## 3. Shared Ask `/share/[token]`

**Job:** allow a relevant neighbor to understand and respond immediately.

Public projection only:

- owner display name/first name;
- Circle display name;
- Ask title/context;
- general area;
- date/time;
- Need lines and coverage;
- optional safe image;
- `I can help`;
- privacy/how-it-works disclosure.

Errors: revoked, expired, removed, full/closed, temporarily unavailable.

## 4. Contribution flow

Can be modal/sheet or nested route from shared Ask.

Required steps:

- choose Need;
- choose lend/give/help/advise/recommend/alternative as allowed;
- contribution description and quantity;
- availability and conditions;
- optional image;
- minimal contact;
- verification;
- final review and submit.

Do not force item-saving or Circle browsing.

## 5. Ask detail `/asks/[askId]`

Member view includes Need coverage and public activity. Owner view adds Offer count, edit/share/close controls. It does not expose private Offers to other members.

## 6. Offer inbox `/asks/[askId]/offers`

**Job:** compare responses without turning people into rated vendors.

- grouped by Need;
- newest/relevant sort only;
- contribution, quantity, timing, conditions;
- factual history where authorized;
- accept, private question, decline;
- no public comments or Offer visibility between contributors.

## 7. Offer detail `/offers/[offerId]`

- contributor identity/context;
- exact contribution;
- safe image;
- availability;
- conditions;
- history facts;
- privacy note;
- accept/decline/message/report.

Before acceptance, exact residential address is prohibited.

## 8. Commitment `/commitments/[id]`

- status banner and next action;
- contribution snapshot;
- parties;
- accepted schedule;
- private exact location after a party supplies it;
- message thread;
- modify timing/cancel/report;
- handoff action when applicable.

## 9. Loan `/loans/[id]`

- item and parties;
- current status;
- due date;
- event timeline;
- included components/condition if required;
- message;
- extension;
- mark returned/confirm return/report issue.

Overdue state is firm but non-shaming.

## 10. Completion

- factual success;
- optional thanks;
- private issue/experience question;
- save Resource prompt for lender;
- close and return to activity;
- optional shareable community outcome without private details.

## 11. Activity `/activity`

Tabs:

- My Asks;
- My Offers;
- Loans;
- Saved Items.

Default to active obligations, then completed history. Allow export/delete-account entry from settings, not this screen.

## 12. Inbox `/inbox`

Tabs:

- Messages;
- Notifications.

Each row states object, counterpart, latest safe preview, time, unread state. Do not show exact addresses in notification previews.

## 13. Resource `/resources/[id]`

Owner-only management in P0:

- image/label/category;
- willingness/visibility;
- usual terms;
- optional details;
- last confirmed date;
- pause matching;
- archive.

No booking calendar is required.

## 14. Profile `/profile`

- display name/photo;
- verified contact status, not raw contact to other users;
- Circle memberships;
- factual personal activity;
- notification and matching preferences;
- quiet mode;
- privacy/data controls;
- support/report issue.

## 15. Admin `/admin`

Separate permissioned surface:

- membership queue and status actions;
- prohibited/flagged content;
- incident assignments;
- active/overdue custody summary;
- failed jobs/provider health;
- Circle settings and invitations;
- scoped audit view.

No unrestricted private-message browser.

## 16. Internal design-system route

An authenticated development-only route may render tokens and component states. It must be excluded/protected in production unless intentionally retained.
