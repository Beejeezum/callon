# Authentication, Invitations, and Guest Conversion

## 1. Goals

- First value before heavy onboarding.
- Verified identity before actionable commitment.
- No password burden in P0.
- No account-enumeration leakage.
- Strong tenant/membership checks after authentication.

## 2. Auth methods

Preferred:

1. phone OTP;
2. email OTP or magic link fallback.

Use Supabase Auth with current official SSR/cookie integration. Do not implement homegrown passwords or JWT verification.

## 3. Session handling

- HttpOnly, Secure, SameSite cookies through the supported Supabase SSR pattern.
- Server refresh/verification; never trust client-only session state for authorization.
- Rotate/revoke sessions on account-security changes.
- Do not store auth tokens in localStorage.
- Protect state-changing operations against CSRF according to framework/session semantics.

## 4. Circle invitation

Invitation contains:

- opaque token stored hashed;
- Circle ID;
- invited email/phone hash optional;
- role fixed to member unless created through privileged admin flow;
- expiration;
- max uses, normally one;
- revocation;
- inviter and audit metadata.

Flow:

```text
open invitation
→ see Circle name/rules
→ verify phone/email
→ accept rules and terms
→ membership pending or active per join policy
→ minimal profile name
→ home
```

Do not reveal Circle roster before acceptance.

## 5. Shared Ask guest flow

```text
open scoped Ask
→ choose I can help
→ draft Offer
→ provide name + phone/email
→ Turnstile and rate-limit check
→ OTP/magic-link verification
→ validate the shared token server-side
→ create a short-lived, Ask-scoped guest grant
→ submit Offer or hold for owner/admin approval
```

Store the pre-verification draft in a short-lived, encrypted/signed server session or private draft table. Never put private Offer content in a query string.

After verification, a non-member receives a `private.ask_guest_grants` row tied to exactly one Ask, one profile, one Circle, one expiry, and normally the resolving share link. The grant does not reveal the Circle roster and does not permit creating Asks, browsing Circle content, or offering on another Ask. A `pending` membership is not a substitute for this grant.

## 6. Membership policy options

P0 supports:

- invitation only;
- admin approval;
- valid shared Ask permits verified guest Offer, with owner approval;
- existing-member sponsor later, behind feature flag.

Address verification/property-record integration is explicitly out of scope.

## 7. Auth profile bootstrap

An `auth.users` insert trigger creates the minimum `public.profiles` and `public.notification_preferences` rows. It must never copy role, Circle, trust, or administrative claims from user-editable metadata. Contact verification details remain in `private.profile_contacts`.

## 8. Step-up verification

Require recent verification for:

- changing phone/email;
- revealing or changing exact pickup address;
- exporting/deleting account;
- assigning moderator/admin role;
- viewing incident evidence as an elevated operator;
- rotating production recovery settings.

## 9. Recovery

P0 recovery:

- verify alternate contact already on account, or
- operator-assisted recovery with strict identity checklist and audit.

Do not let support agents casually replace a phone number based on an email request. Document every recovery.

## 10. Abuse controls

- generic auth responses;
- per-IP/contact/device velocity limits;
- geographic restrictions matching pilot;
- Turnstile on public send actions;
- OTP attempt ceilings and cooldown;
- spend alerts;
- deny disposable email domains only if false-positive impact is reviewed;
- block obvious automation, not legitimate shared household networks.

## 11. Profile minimization

Required at first commitment:

- display/first name;
- verified phone or email;
- terms/privacy acceptance;
- Circle/guest relationship.

Optional later:

- avatar;
- short neighbor context;
- secondary contact;
- category willingness;
- notification preferences.

Date of birth, government ID, full household roster, and exact home address are not required for general account creation.
