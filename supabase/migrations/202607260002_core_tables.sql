begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  display_name text not null check (char_length(display_name) between 1 and 80),
  avatar_path text,
  locale text not null default 'en-US',
  timezone text not null default 'America/New_York',
  status public.profile_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);

create table private.profile_contacts (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  phone_e164_ciphertext bytea,
  phone_hash text unique,
  email_ciphertext bytea,
  email_hash text unique,
  verified_phone_at timestamptz,
  verified_email_at timestamptz,
  key_version integer not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.circles (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  slug citext not null unique,
  description text not null default '',
  join_policy text not null default 'invite_or_approval' check (join_policy in ('invite_only','invite_or_approval','admin_approval')),
  general_area text not null,
  settings jsonb not null default '{}'::jsonb,
  current_terms_version text not null default 'pilot-v1',
  status public.circle_status not null default 'active',
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);

create table public.circle_memberships (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete restrict,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  role public.membership_role not null default 'member',
  status public.membership_status not null default 'pending',
  neighbor_context text,
  joined_at timestamptz,
  restricted_at timestamptz,
  suspended_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1,
  unique(circle_id, profile_id)
);

create table public.circle_invites (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete restrict,
  role public.membership_role not null default 'member',
  status public.invite_status not null default 'active',
  max_uses integer not null default 1 check (max_uses between 1 and 10000),
  use_count integer not null default 0 check (use_count >= 0 and use_count <= max_uses),
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);

create table private.invite_secrets (
  invite_id uuid primary key references public.circle_invites(id) on delete cascade,
  token_hash text not null unique,
  token_version integer not null default 1,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug citext not null unique,
  label text not null,
  default_risk_level public.risk_level not null default 'low',
  is_active boolean not null default true,
  sort_order integer not null default 0
);

create table public.asks (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete restrict,
  ask_type public.ask_type not null default 'quick_need',
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '' check (char_length(description) <= 1200),
  general_location text not null check (char_length(general_location) between 1 and 100),
  starts_at timestamptz,
  needed_by timestamptz not null,
  expires_at timestamptz not null,
  status public.ask_status not null default 'draft',
  cover_image_path text,
  share_version integer not null default 1 check (share_version > 0),
  published_at timestamptz,
  completed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1,
  check (starts_at is null or starts_at <= needed_by),
  check (needed_by < expires_at)
);

create index asks_circle_status_needed_idx on public.asks(circle_id, status, needed_by);
create index asks_created_by_idx on public.asks(created_by, created_at desc);

create table public.ask_needs (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete restrict,
  ask_id uuid not null references public.asks(id) on delete cascade,
  kind public.need_kind not null,
  title text not null check (char_length(title) between 1 and 100),
  description text not null default '' check (char_length(description) <= 500),
  category_id uuid references public.categories(id) on delete set null,
  quantity_requested numeric(10,2) not null default 1 check (quantity_requested > 0),
  quantity_committed numeric(10,2) not null default 0 check (quantity_committed >= 0),
  quantity_completed numeric(10,2) not null default 0 check (quantity_completed >= 0),
  unit text,
  risk_level public.risk_level not null default 'low',
  status public.need_status not null default 'open',
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1,
  check (quantity_completed <= quantity_committed),
  check (quantity_committed <= quantity_requested)
);

create index ask_needs_ask_sort_idx on public.ask_needs(ask_id, sort_order, created_at);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete restrict,
  owner_profile_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) between 1 and 100),
  description text not null default '' check (char_length(description) <= 800),
  category_id uuid references public.categories(id) on delete set null,
  image_path text,
  visibility public.resource_visibility not null default 'match_only',
  willingness public.resource_willingness not null default 'happy_to_be_asked',
  status public.resource_status not null default 'active',
  usual_terms text check (char_length(usual_terms) <= 800),
  last_confirmed_at timestamptz,
  source_offer_id uuid,
  source_loan_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);

create index resources_owner_idx on public.resources(owner_profile_id, status);
create index resources_circle_visible_idx on public.resources(circle_id, visibility, status);

create table public.resource_hints (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete restrict,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  willingness public.resource_willingness not null default 'happy_to_be_asked',
  visibility public.resource_visibility not null default 'match_only',
  source text not null check (source in ('onboarding','successful_offer','manual','import')),
  last_confirmed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1,
  unique(circle_id, profile_id, category_id)
);

create table public.resource_components (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete restrict,
  resource_id uuid not null references public.resources(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  quantity numeric(10,2) not null default 1 check (quantity > 0),
  required_for_return boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete restrict,
  ask_id uuid not null references public.asks(id) on delete restrict,
  need_id uuid not null references public.ask_needs(id) on delete restrict,
  contributor_profile_id uuid not null references public.profiles(id) on delete restrict,
  resource_id uuid references public.resources(id) on delete set null,
  offer_type public.need_kind not null,
  freeform_item_name text check (char_length(freeform_item_name) <= 100),
  description text not null check (char_length(description) between 1 and 800),
  quantity numeric(10,2) not null default 1 check (quantity > 0),
  available_from timestamptz,
  available_until timestamptz,
  conditions text check (char_length(conditions) <= 600),
  image_path text,
  status public.offer_status not null default 'submitted',
  submitted_at timestamptz not null default timezone('utc', now()),
  withdrawn_at timestamptz,
  decided_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1,
  check (available_from is null or available_until is null or available_from < available_until),
  check (offer_type <> 'lend' or resource_id is not null or nullif(trim(freeform_item_name), '') is not null)
);

create index offers_ask_status_idx on public.offers(ask_id, status, submitted_at desc);
create index offers_contributor_idx on public.offers(contributor_profile_id, status, submitted_at desc);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete restrict,
  status text not null default 'active' check (status in ('active','closed','frozen')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);

create table public.commitments (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete restrict,
  ask_id uuid not null references public.asks(id) on delete restrict,
  need_id uuid not null references public.ask_needs(id) on delete restrict,
  offer_id uuid not null unique references public.offers(id) on delete restrict,
  resource_id uuid references public.resources(id) on delete set null,
  requester_profile_id uuid not null references public.profiles(id) on delete restrict,
  contributor_profile_id uuid not null references public.profiles(id) on delete restrict,
  contribution_type public.need_kind not null,
  quantity numeric(10,2) not null check (quantity > 0),
  summary_snapshot jsonb not null,
  terms_version text not null,
  status public.commitment_status not null default 'accepted',
  starts_at timestamptz,
  due_at timestamptz,
  conversation_id uuid not null unique references public.conversations(id) on delete restrict,
  exact_location_id uuid,
  accepted_at timestamptz not null default timezone('utc', now()),
  fulfilled_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1,
  check (starts_at is null or due_at is null or starts_at < due_at),
  check (requester_profile_id <> contributor_profile_id)
);

alter table public.commitments add constraint commitments_resource_time_no_overlap
exclude using gist (
  resource_id with =,
  tstzrange(starts_at, coalesce(due_at, 'infinity'::timestamptz), '[)') with &&
) where (resource_id is not null and status in ('accepted','coordinating','ready_for_handoff','active'));

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  participant_role text not null check (participant_role in ('requester','contributor','scoped_moderator')),
  created_at timestamptz not null default timezone('utc', now()),
  primary key(conversation_id, profile_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete restrict,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_profile_id uuid not null references public.profiles(id) on delete restrict,
  body text not null check (char_length(body) between 1 and 4000),
  attachment_path text,
  sent_at timestamptz not null default timezone('utc', now()),
  edited_at timestamptz,
  deleted_at timestamptz
);

create index messages_conversation_sent_idx on public.messages(conversation_id, sent_at);

create table private.exact_locations (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete restrict,
  owner_profile_id uuid not null references public.profiles(id) on delete restrict,
  ciphertext bytea not null,
  nonce bytea not null,
  key_version integer not null,
  location_kind text not null check (location_kind in ('pickup','return','event','other')),
  created_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz,
  deleted_at timestamptz
);

create table public.loans (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete restrict,
  commitment_id uuid not null unique references public.commitments(id) on delete restrict,
  lender_profile_id uuid not null references public.profiles(id) on delete restrict,
  borrower_profile_id uuid not null references public.profiles(id) on delete restrict,
  resource_id uuid references public.resources(id) on delete set null,
  status public.loan_status not null default 'pending_handoff',
  due_at timestamptz,
  checked_out_at timestamptz,
  return_marked_at timestamptz,
  returned_at timestamptz,
  extension_requested_at timestamptz,
  proposed_due_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1,
  check (lender_profile_id <> borrower_profile_id)
);

create table public.loan_events (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete restrict,
  loan_id uuid not null references public.loans(id) on delete restrict,
  actor_profile_id uuid references public.profiles(id) on delete restrict,
  event_type text not null check (event_type in ('created','handoff_confirmed','extension_requested','extension_approved','extension_declined','return_marked','return_confirmed','issue_reported','overdue','cancelled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index loan_events_loan_created_idx on public.loan_events(loan_id, created_at);

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete restrict,
  reported_by uuid not null references public.profiles(id) on delete restrict,
  subject_profile_id uuid references public.profiles(id) on delete restrict,
  ask_id uuid references public.asks(id) on delete restrict,
  commitment_id uuid references public.commitments(id) on delete restrict,
  loan_id uuid references public.loans(id) on delete restrict,
  kind public.incident_kind not null,
  summary text not null check (char_length(summary) between 10 and 2000),
  status public.incident_status not null default 'open',
  resolved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);

create table private.incident_evidence (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  storage_path text not null,
  content_type text not null,
  sha256 text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table private.moderator_access_grants (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  moderator_profile_id uuid not null references public.profiles(id) on delete restrict,
  granted_by uuid not null references public.profiles(id) on delete restrict,
  scope private.access_grant_scope not null,
  reason text not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.notification_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  email_enabled boolean not null default true,
  sms_enabled boolean not null default false,
  push_enabled boolean not null default false,
  quiet_hours_start time,
  quiet_hours_end time,
  timezone text not null default 'America/New_York',
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);

create table private.share_links (
  id uuid primary key default gen_random_uuid(),
  ask_id uuid not null references public.asks(id) on delete cascade,
  circle_id uuid not null references public.circles(id) on delete restrict,
  token_hash text not null unique,
  token_version integer not null default 1,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  last_accessed_at timestamptz,
  access_count bigint not null default 0,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

create table private.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid references public.circles(id) on delete restrict,
  profile_id uuid references public.profiles(id) on delete restrict,
  channel text not null check (channel in ('email','sms','whatsapp','push')),
  template_key text not null,
  payload jsonb not null,
  scheduled_for timestamptz not null,
  status private.job_status not null default 'pending',
  attempts integer not null default 0,
  locked_at timestamptz,
  locked_by text,
  provider_message_id text,
  last_error_code text,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index notification_jobs_idempotency_idx
  on private.notification_jobs(channel, template_key, (payload->>'idempotency_key'));

create index notification_jobs_due_idx on private.notification_jobs(status, scheduled_for) where status in ('pending','failed');

create table private.outbox_events (
  id uuid primary key default gen_random_uuid(),
  aggregate_type text not null,
  aggregate_id uuid not null,
  event_type text not null,
  payload jsonb not null,
  occurred_at timestamptz not null default timezone('utc', now()),
  published_at timestamptz,
  attempts integer not null default 0,
  last_error_code text
);

create table private.audit_events (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid,
  actor_profile_id uuid,
  action text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  request_id text,
  created_at timestamptz not null default timezone('utc', now())
);

create table private.idempotency_records (
  actor_profile_id uuid not null,
  scope text not null,
  idempotency_key text not null,
  request_hash text not null,
  response_status integer,
  response_body jsonb,
  resource_id uuid,
  locked_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  expires_at timestamptz not null default timezone('utc', now()) + interval '24 hours',
  primary key(actor_profile_id, scope, idempotency_key)
);

create table private.inbound_channel_messages (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  provider_message_id text not null,
  profile_id uuid references public.profiles(id) on delete restrict,
  payload_redacted jsonb not null,
  payload_ciphertext bytea,
  received_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz,
  unique(channel, provider_message_id)
);

create table private.ai_drafts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete restrict,
  circle_id uuid references public.circles(id) on delete restrict,
  source_kind text not null,
  input_ciphertext bytea,
  output jsonb not null,
  model text not null,
  prompt_version text not null,
  status text not null check (status in ('draft','accepted','edited','discarded')),
  created_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null
);

create table private.webhook_receipts (
  provider text not null,
  event_id text not null,
  body_sha256 text not null,
  received_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz,
  status text not null default 'received',
  primary key(provider, event_id)
);

-- Preserve key state transitions and audit history.
create trigger loan_events_append_only before update or delete on public.loan_events for each row execute function private.prevent_update_delete();
create trigger audit_events_append_only before update or delete on private.audit_events for each row execute function private.prevent_update_delete();
create trigger outbox_events_no_delete before delete on private.outbox_events for each row execute function private.prevent_update_delete();

-- Optimistic concurrency for mutable rows.
do $$
declare t text;
begin
  foreach t in array array['profiles','circles','circle_memberships','circle_invites','asks','ask_needs','resources','resource_hints','offers','conversations','commitments','loans','incidents','notification_preferences'] loop
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function private.set_updated_at()', t, t);
  end loop;
end $$;

commit;
