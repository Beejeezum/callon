# Paseos Pilot: Membership, Administration, and Launch

## Pilot decision

Paseos Community Sharing is a private, neighbor-built pilot for Paseos in Boca
Raton, Florida. It is not an official HOA service. The member-facing product
uses the warm Call On visual system and the attribution:

> Made with neighborly love by Bruce

The public welcome page may explain the idea, but Circle activity, inventory,
member records, private Offers, messages, and pickup details require scoped
access.

## Access model

There are three deliberately different entry paths.

### 1. Paseos launch invitation

Bruce creates a revocable, time-limited Circle invitation from the admin
screen. A neighbor opens the link and provides:

- first name;
- last name; and
- email address.

Supabase Auth sends a one-time code. Verifying the code and accepting the
invitation are one atomic experience. Successful verification grants immediate
active Paseos membership; there is no separate approval queue for this launch
link.

The launch link defaults to a 30-day expiration and may be used by up to 250
people. Bruce can revoke it at any time. The application stores only the hashed
invite secret.

### 2. Shared Ask guest

A nonmember may open one shared Ask and offer an unlisted item, time, advice, or
an alternative after verified email and name capture. That verification grants
access only to the specific Ask. It does not make the person a Paseos member,
expose the library, or reveal other community activity.

If the Offer is accepted, only the requester and contributor may see the
transaction conversation and exact pickup details.

### 3. General public visitor

A visitor without an invite may view the Paseos welcome page and a safe demo.
They cannot browse Circle data, create an Ask, add inventory, or self-provision
a Circle.

## Address collection

Street address is not part of signup. The application asks for exact pickup or
handoff location only after an Offer is accepted and only when the transaction
needs it. Exact location is encrypted and projected only to the parties.

## Member capabilities

An active member may:

- create and share concrete Asks;
- respond to Circle Asks;
- browse Circle-visible items;
- add a saved item with the quick-add wizard;
- keep an item private or available only for private matching;
- coordinate and close their own commitments and loans; and
- see their own activity and messages.

Adding inventory is always optional. An Offer may reference an unlisted item,
and a successful share may be remembered afterward.

## Resource visibility

- `private`: only the owner can see the saved record.
- `match_only`: the item is not browsable; it may be used for future private
  matching.
- `circle`: active Circle members may browse the item and its owner name, but
  every loan still requires a separate Offer and acceptance.

No view exposes replacement value, exact storage location, or a public map of
possessions.

## Administrative roles

Bruce is the initial `circle_admin`. A Circle administrator may:

- create and revoke invitations;
- restrict, suspend, restore, or remove a membership;
- appoint or remove moderators;
- view aggregate moderation and incident status; and
- manage Circle settings allowed by the pilot.

A moderator may handle scoped moderation but cannot promote anyone to
administrator. No administrator may change their own role. Ordinary Circle
administration does not grant access to private messages, exact locations, or
incident evidence without a separate, audited access grant.

## Membership states

- `active`: normal Circle access and new activity.
- `restricted`: may view allowed Circle information and finish existing
  obligations, but cannot create new Asks, Offers, or Resources.
- `suspended`: cannot view Circle activity or create new activity; existing
  private records remain protected.
- `removed` or `left`: no Circle access.

The UI and database both enforce these states. Hiding a button is never the
security boundary.

## New community creation

The Paseos pilot does not offer instant self-service Circle creation.
Authenticated users cannot call the Circle creation RPC.

A future “Start a community” form should create an application containing:

- proposed community name and general area;
- applicant identity and verified contact;
- applicant relationship to the community;
- approximate size and intended use;
- acknowledgment of safety, privacy, and moderation responsibilities; and
- requested administrator.

An operator reviews the application outside the member data plane. Approval
calls the service-role-only `provision_circle` transaction, which creates the
Circle, appoints its initial administrator, and records audit/outbox events.
Rejection creates no Circle.

## Initial admin bootstrap

The first Paseos administrator is guarded by
`PILOT_ADMIN_EMAIL_SHA256`. The raw email is not stored in application
configuration. After the matching verified user signs in, the server may call
the service-role-only `bootstrap_paseos_pilot` transaction. The transaction is
idempotent and creates or restores the single Paseos admin membership.

After bootstrap succeeds, retain the environment variable only until a backup
administrator has been appointed and the recovery procedure has been tested.

## Production account topology

- GitHub: `Beejeezum/callon`
- Netlify team/project: DreamCraftLabs / `callonapp`
- Supabase: hosted project connected to `Beejeezum/callon`, working directory
  `.`, production branch `main`

Do not use Letterhead or the previous `callon-neighbors` Netlify project.
Preview builds must not have production data or unrestricted provider
destinations.

## Netlify environment checklist

Required for real persistence:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SHARE_TOKEN_PEPPER`
- `LOCATION_ENCRYPTION_KEY_V1`
- `CRON_SECRET`
- `PILOT_ADMIN_EMAIL_SHA256`

Keep `EMAIL_PROVIDER=mock`, `AI_DRAFTS_ENABLED=false`, and
`WHATSAPP_ENABLED=false` until each external provider and abuse control has
been reviewed. Configure the deployed origin in Supabase Auth Site URL and
Redirect URL allowlists. Configure custom SMTP before inviting real neighbors.

## Launch sequence

1. Disconnect every wrong Netlify project from the GitHub repository.
2. Deploy the reviewed branch to DreamCraftLabs `callonapp`.
3. Apply migrations to a nonproduction Supabase branch and run all database and
   browser journey tests.
4. Configure production Netlify variables and Supabase Auth URLs.
5. Sign in as Bruce and perform the one-time Paseos admin bootstrap.
6. Create a short-lived test invitation and complete a second-device join.
7. Test one Ask, guest Offer, accepted handoff, and return without real private
   data.
8. Revoke the test invite, create the launch invite, and copy the WhatsApp
   launch note from the admin screen.
9. Invite a small first cohort before posting to the full Paseos chat.
10. Monitor auth delivery, failed joins, incidents, and user confusion during
    the first week.

## Launch message

The admin screen provides a ready-to-copy note in this voice:

> Hey neighbors — remember my virtual tool-library idea from a while back? I’ve
> been noodling on it off and on and built a little Paseos experiment called
> Call On. It gives us a simple place to ask before buying, offer an item or a
> hand, and keep pickup/return details from becoming a group-chat scavenger
> hunt. You do not need to inventory your garage—join with your name and email,
> then add something only if and when it feels useful. If this helps a few
> strangers become neighbors, that’s the whole point. Made with neighborly love
> by Bruce.

Append the active invitation URL immediately below the note.
