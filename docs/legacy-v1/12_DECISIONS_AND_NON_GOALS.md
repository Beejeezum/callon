# Decisions, Defaults, and Non-Goals

## Locked product decisions

1. The primary object is an Ask, not an item listing.
2. Project and Event are Ask types, not separate social systems.
3. WhatsApp is a sharing/assistant channel, not the system of record.
4. P0 uses share integration only; private assistant is P1.
5. Inventory is optional and emerges from actual contributions.
6. An Offer may reference freeform item text without a Resource.
7. Personal Resources are not directly bookable.
8. Declining is private and consequence-free.
9. No public ratings, scores, leaderboards, or popularity ranking.
10. No general social feed.
11. No payments or commercial marketplace in the pilot.
12. AI drafts; humans confirm.
13. Circle admins do not automatically see private logistics or incident evidence.
14. Exact address is revealed only to accepted parties.
15. P0 is a responsive web app/PWA, not native mobile.

## Recommended implementation defaults

- One Circle per user in P0 UI, while schema does not preclude future multiple Memberships.
- Verified guest may Offer on a scoped Ask but cannot browse the Circle.
- Contributor names remain private to the Ask owner and accepted parties unless explicit consent is given for completion sharing.
- Saved Resources default to `match_only`.
- Ask owner approves every contribution in P0.
- No exact home address at signup.
- Advice remains attached to the Ask; no knowledge base in P0.
- Giveaways are allowed as a contribution type but do not dominate home navigation.
- Bounded Ask discussion plus private Plan messages; no comments feed.

## Non-goals

- Replace WhatsApp conversation.
- Maximize daily active usage.
- Build a public community network.
- Create an economic marketplace.
- Score people’s generosity or trust.
- Certify tool safety or user competence.
- Let HOA boards surveil resident behavior.
- Support minors as independent accounts.
- Support firearms, medication, hazardous chemicals, high-risk machinery, licensed professional work, or child-safety-critical equipment in the pilot.

## Implementation decisions log

Agents must append dated entries here when they choose among equivalent implementation approaches.

Template:

```text
### YYYY-MM-DD — Decision title

- Context:
- Decision:
- Alternatives considered:
- Consequences:
- Documents/tests updated:
```
