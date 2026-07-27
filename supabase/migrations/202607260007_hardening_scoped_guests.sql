begin;

-- This migration closes gaps that are easy to miss in a first-pass Supabase schema:
-- scoped guest access, tenant-consistency constraints, safe auth bootstrap, explicit
-- ownership validation, and column-level privileges that force critical writes
-- through the audited transaction RPCs.

create table private.ask_guest_grants (
  id uuid primary key default gen_random_uuid(),
  ask_id uuid not null references public.asks(id) on delete cascade,
  circle_id uuid not null references public.circles(id) on delete restrict,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  share_link_id uuid references private.share_links(id) on delete set null,
  status text not null default 'active' check (status in ('active','revoked','expired')),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (ask_id, profile_id)
);

create index ask_guest_grants_profile_active_idx
  on private.ask_guest_grants(profile_id, ask_id, expires_at)
  where status = 'active' and revoked_at is null;

-- Composite uniqueness gives child rows a database-level tenant boundary. The
-- simple foreign keys in the core migration remain useful for delete behavior.
alter table public.asks add constraint asks_id_circle_key unique (id, circle_id);
alter table public.ask_needs add constraint ask_needs_id_circle_key unique (id, circle_id);
alter table public.resources add constraint resources_id_circle_key unique (id, circle_id);
alter table public.offers add constraint offers_id_circle_key unique (id, circle_id);
alter table public.conversations add constraint conversations_id_circle_key unique (id, circle_id);
alter table public.commitments add constraint commitments_id_circle_key unique (id, circle_id);
alter table public.loans add constraint loans_id_circle_key unique (id, circle_id);
alter table private.exact_locations add constraint exact_locations_id_circle_key unique (id, circle_id);

alter table public.ask_needs
  add constraint ask_needs_ask_circle_fk
  foreign key (ask_id, circle_id) references public.asks(id, circle_id) on delete cascade;

alter table public.offers
  add constraint offers_ask_circle_fk
  foreign key (ask_id, circle_id) references public.asks(id, circle_id) on delete restrict,
  add constraint offers_need_circle_fk
  foreign key (need_id, circle_id) references public.ask_needs(id, circle_id) on delete restrict;

alter table public.resource_components
  add constraint resource_components_resource_circle_fk
  foreign key (resource_id, circle_id) references public.resources(id, circle_id) on delete cascade;

alter table public.commitments
  add constraint commitments_ask_circle_fk
  foreign key (ask_id, circle_id) references public.asks(id, circle_id) on delete restrict,
  add constraint commitments_need_circle_fk
  foreign key (need_id, circle_id) references public.ask_needs(id, circle_id) on delete restrict,
  add constraint commitments_offer_circle_fk
  foreign key (offer_id, circle_id) references public.offers(id, circle_id) on delete restrict,
  add constraint commitments_conversation_circle_fk
  foreign key (conversation_id, circle_id) references public.conversations(id, circle_id) on delete restrict,
  add constraint commitments_exact_location_circle_fk
  foreign key (exact_location_id, circle_id) references private.exact_locations(id, circle_id) on delete restrict;

alter table public.messages
  add constraint messages_conversation_circle_fk
  foreign key (conversation_id, circle_id) references public.conversations(id, circle_id) on delete cascade;

alter table public.loans
  add constraint loans_commitment_circle_fk
  foreign key (commitment_id, circle_id) references public.commitments(id, circle_id) on delete restrict;

alter table public.loan_events
  add constraint loan_events_loan_circle_fk
  foreign key (loan_id, circle_id) references public.loans(id, circle_id) on delete restrict;

alter table private.share_links
  add constraint share_links_ask_circle_fk
  foreign key (ask_id, circle_id) references public.asks(id, circle_id) on delete cascade;

alter table private.ask_guest_grants
  add constraint ask_guest_grants_ask_circle_fk
  foreign key (ask_id, circle_id) references public.asks(id, circle_id) on delete cascade;

alter table public.resources
  add constraint resources_source_offer_fk foreign key (source_offer_id) references public.offers(id) on delete set null,
  add constraint resources_source_loan_fk foreign key (source_loan_id) references public.loans(id) on delete set null;

create or replace function public.is_active_circle_member(p_circle_id uuid, p_profile_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.circle_memberships m
    join public.profiles p on p.id = m.profile_id
    where m.circle_id = p_circle_id
      and m.profile_id = p_profile_id
      and m.status = 'active'
      and p.status = 'active'
  );
$$;

create or replace function public.can_read_circle(p_circle_id uuid, p_profile_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.circle_memberships m
    join public.profiles p on p.id = m.profile_id
    where m.circle_id = p_circle_id
      and m.profile_id = p_profile_id
      and m.status in ('active','restricted')
      and p.status in ('active','restricted')
  );
$$;

create or replace function public.is_circle_contributor(p_circle_id uuid, p_profile_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select public.is_active_circle_member(p_circle_id, p_profile_id);
$$;

create or replace function private.can_submit_offer(
  p_ask_id uuid,
  p_circle_id uuid,
  p_profile_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  select public.is_active_circle_member(p_circle_id, p_profile_id)
    or exists (
      select 1
      from private.ask_guest_grants g
      where g.ask_id = p_ask_id
        and g.circle_id = p_circle_id
        and g.profile_id = p_profile_id
        and g.status = 'active'
        and g.revoked_at is null
        and g.expires_at > timezone('utc', now())
    );
$$;

create or replace function public.can_submit_offer_on_ask(
  p_ask_id uuid,
  p_circle_id uuid,
  p_profile_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  select private.can_submit_offer(p_ask_id, p_circle_id, p_profile_id);
$$;

create or replace function public.is_conversation_participant(
  p_conversation_id uuid,
  p_profile_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = p_conversation_id
      and cp.profile_id = p_profile_id
  );
$$;

create or replace function public.can_view_profile(
  p_target_profile_id uuid,
  p_viewer_profile_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select p_target_profile_id = p_viewer_profile_id
    or exists (
      select 1
      from public.circle_memberships me
      join public.circle_memberships them on them.circle_id = me.circle_id
      where me.profile_id = p_viewer_profile_id
        and me.status in ('active','restricted')
        and them.profile_id = p_target_profile_id
        and them.status in ('active','restricted')
    )
    or exists (
      select 1
      from public.offers o
      join public.asks a on a.id = o.ask_id
      where (a.created_by = p_viewer_profile_id and o.contributor_profile_id = p_target_profile_id)
         or (o.contributor_profile_id = p_viewer_profile_id and a.created_by = p_target_profile_id)
    )
    or exists (
      select 1
      from public.commitments c
      where (c.requester_profile_id = p_viewer_profile_id and c.contributor_profile_id = p_target_profile_id)
         or (c.contributor_profile_id = p_viewer_profile_id and c.requester_profile_id = p_target_profile_id)
    );
$$;

create or replace function private.bootstrap_auth_profile()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_display_name text;
begin
  v_display_name := nullif(trim(coalesce(new.raw_user_meta_data->>'display_name', '')), '');
  if v_display_name is null then
    v_display_name := 'Neighbor';
  end if;

  insert into public.profiles(id, display_name)
  values (new.id, left(v_display_name, 80))
  on conflict (id) do nothing;

  insert into public.notification_preferences(profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_call_on on auth.users;
create trigger on_auth_user_created_call_on
after insert on auth.users
for each row execute function private.bootstrap_auth_profile();

create or replace function private.validate_offer_resource()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.resource_id is not null and not exists (
    select 1 from public.resources r
    where r.id = new.resource_id
      and r.circle_id = new.circle_id
      and r.owner_profile_id = new.contributor_profile_id
      and r.status = 'active'
  ) then
    raise exception 'offered resource must be active, in the same Circle, and owned by the contributor' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger offers_validate_resource
before insert or update of resource_id, circle_id, contributor_profile_id
on public.offers
for each row execute function private.validate_offer_resource();

create or replace function private.validate_commitment_private_links()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
begin
  if new.resource_id is not null and not exists (
    select 1 from public.resources r
    where r.id = new.resource_id
      and r.circle_id = new.circle_id
      and r.owner_profile_id = new.contributor_profile_id
  ) then
    raise exception 'commitment resource is outside the Circle or contributor ownership' using errcode = '23514';
  end if;

  if new.exact_location_id is not null and not exists (
    select 1 from private.exact_locations l
    where l.id = new.exact_location_id
      and l.circle_id = new.circle_id
      and l.owner_profile_id = new.requester_profile_id
      and l.deleted_at is null
      and (l.expires_at is null or l.expires_at > timezone('utc', now()))
  ) then
    raise exception 'exact location must be an active requester-owned location in the same Circle' using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger commitments_validate_private_links
before insert or update of resource_id, exact_location_id, circle_id, requester_profile_id, contributor_profile_id
on public.commitments
for each row execute function private.validate_commitment_private_links();

create or replace function private.validate_resource_lineage()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.source_offer_id is not null and not exists (
    select 1 from public.offers o
    where o.id = new.source_offer_id
      and o.circle_id = new.circle_id
      and o.contributor_profile_id = new.owner_profile_id
  ) then
    raise exception 'resource source offer must belong to the same owner and Circle' using errcode = '23514';
  end if;

  if new.source_loan_id is not null and not exists (
    select 1 from public.loans l
    where l.id = new.source_loan_id
      and l.circle_id = new.circle_id
      and l.lender_profile_id = new.owner_profile_id
  ) then
    raise exception 'resource source loan must belong to the same lender and Circle' using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger resources_validate_lineage
before insert or update of source_offer_id, source_loan_id, circle_id, owner_profile_id
on public.resources
for each row execute function private.validate_resource_lineage();

-- Replace the offer RPC so verified guests are scoped to the specific shared Ask,
-- rather than being treated as general pending Circle members.
create or replace function public.submit_offer(p_input jsonb)
returns uuid
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_actor uuid := auth.uid();
  v_ask public.asks;
  v_need public.ask_needs;
  v_offer_id uuid := gen_random_uuid();
  v_key text := p_input->>'idempotencyKey';
  v_existing private.idempotency_records;
begin
  if v_actor is null then raise exception 'verification required' using errcode = '28000'; end if;
  select * into v_ask from public.asks where id = (p_input->>'askId')::uuid and status in ('open','partially_fulfilled') for share;
  if not found then raise exception 'ask is not open' using errcode = 'P0002'; end if;
  if not private.can_submit_offer(v_ask.id, v_ask.circle_id, v_actor) then
    raise exception 'active Circle membership or scoped Ask access required' using errcode = '42501';
  end if;
  if v_ask.created_by = v_actor then raise exception 'ask owner cannot offer to own ask' using errcode = '22023'; end if;
  select * into v_need from public.ask_needs where id = (p_input->>'needId')::uuid and ask_id = v_ask.id and status in ('open','partially_covered') for share;
  if not found then raise exception 'need is not open' using errcode = 'P0002'; end if;
  if v_need.risk_level in ('restricted','prohibited') then raise exception 'need cannot accept direct offers' using errcode = '42501'; end if;

  v_existing := private.begin_idempotent_operation('submit_offer', v_key, encode(extensions.digest(p_input::text, 'sha256'), 'hex'));
  if v_existing.completed_at is not null then return v_existing.resource_id; end if;

  insert into public.offers(
    id, circle_id, ask_id, need_id, contributor_profile_id, resource_id, offer_type,
    freeform_item_name, description, quantity, available_from, available_until, conditions
  ) values (
    v_offer_id, v_ask.circle_id, v_ask.id, v_need.id, v_actor, nullif(p_input->>'resourceId','')::uuid,
    (p_input->>'offerType')::public.need_kind, nullif(trim(p_input->>'freeformItemName'), ''),
    trim(p_input->>'description'), coalesce((p_input->>'quantity')::numeric, 1),
    nullif(p_input->>'availableFrom','')::timestamptz, nullif(p_input->>'availableUntil','')::timestamptz,
    nullif(trim(p_input->>'conditions'), '')
  );

  perform private.record_audit(v_ask.circle_id, v_actor, 'offer.submitted', 'offer', v_offer_id, jsonb_build_object('ask_id', v_ask.id));
  perform private.record_outbox('offer', v_offer_id, 'offer.submitted', jsonb_build_object('offer_id', v_offer_id, 'ask_id', v_ask.id, 'requester_profile_id', v_ask.created_by));
  perform private.complete_idempotent_operation('submit_offer', v_key, 201, jsonb_build_object('offerId', v_offer_id), v_offer_id);
  return v_offer_id;
end;
$$;

-- Read access includes restricted members so they can finish existing obligations;
-- all new creation/offer paths require an active membership or a scoped Ask grant.
drop policy if exists circles_select_member on public.circles;
create policy circles_select_member on public.circles for select to authenticated using (public.can_read_circle(id));

drop policy if exists memberships_select_same_circle on public.circle_memberships;
create policy memberships_select_same_circle on public.circle_memberships for select to authenticated using (
  profile_id = auth.uid() or public.can_read_circle(circle_id)
);

drop policy if exists asks_select_member on public.asks;
create policy asks_select_member on public.asks for select to authenticated using (
  created_by = auth.uid() or public.can_read_circle(circle_id)
);

drop policy if exists needs_select_member on public.ask_needs;
create policy needs_select_member on public.ask_needs for select to authenticated using (public.can_read_circle(circle_id));

drop policy if exists resources_select_owner_or_circle on public.resources;
create policy resources_select_owner_or_circle on public.resources for select to authenticated using (
  owner_profile_id = auth.uid() or (visibility = 'circle' and status = 'active' and public.can_read_circle(circle_id))
);

drop policy if exists resource_components_owner_or_visible on public.resource_components;
create policy resource_components_owner_or_visible on public.resource_components for select to authenticated using (
  exists(
    select 1 from public.resources r
    where r.id = resource_components.resource_id
      and r.circle_id = resource_components.circle_id
      and (r.owner_profile_id = auth.uid() or (r.visibility = 'circle' and public.can_read_circle(r.circle_id)))
  )
);

drop policy if exists profiles_select_shared_circle on public.profiles;
create policy profiles_select_shared_circle on public.profiles for select to authenticated using (
  public.can_view_profile(id)
);

drop policy if exists conversations_select_participants on public.conversations;
create policy conversations_select_participants on public.conversations for select to authenticated using (
  public.is_conversation_participant(id)
);

drop policy if exists participants_select_self_conversation on public.conversation_participants;
create policy participants_select_self_conversation on public.conversation_participants for select to authenticated using (
  public.is_conversation_participant(conversation_id)
);

drop policy if exists messages_select_participants on public.messages;
create policy messages_select_participants on public.messages for select to authenticated using (
  public.is_conversation_participant(conversation_id)
);

drop policy if exists messages_insert_participants on public.messages;
create policy messages_insert_participants on public.messages for insert to authenticated with check (
  sender_profile_id = auth.uid()
  and public.is_conversation_participant(conversation_id)
  and exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and c.circle_id = messages.circle_id
      and c.status = 'active'
  )
);

drop policy if exists offers_insert_contributor on public.offers;
create policy offers_insert_contributor on public.offers for insert to authenticated with check (
  contributor_profile_id = auth.uid()
  and public.can_submit_offer_on_ask(ask_id, circle_id, auth.uid())
);

-- Revoke broad table mutation rights. Critical state changes are available only
-- through explicit RPCs; low-risk self-managed data uses column-level grants.
revoke all privileges on all tables in schema public from authenticated;

grant select on public.profiles, public.circles, public.circle_memberships, public.circle_invites,
  public.categories, public.asks, public.ask_needs, public.resources, public.resource_hints,
  public.resource_components, public.offers, public.conversations, public.commitments,
  public.conversation_participants, public.messages, public.loans, public.loan_events,
  public.incidents, public.notification_preferences to authenticated;

grant update (display_name, avatar_path, locale, timezone) on public.profiles to authenticated;

grant insert (circle_id, conversation_id, sender_profile_id, body, attachment_path) on public.messages to authenticated;
grant update (body, edited_at, deleted_at) on public.messages to authenticated;

grant insert, update, delete on public.resources, public.resource_hints, public.resource_components to authenticated;

grant insert (circle_id, reported_by, subject_profile_id, ask_id, commitment_id, loan_id, kind, summary)
  on public.incidents to authenticated;

grant insert (profile_id, email_enabled, sms_enabled, push_enabled, quiet_hours_start, quiet_hours_end, timezone),
  update (email_enabled, sms_enabled, push_enabled, quiet_hours_start, quiet_hours_end, timezone)
  on public.notification_preferences to authenticated;

-- Remove default PUBLIC execution and grant only the intended authenticated RPCs/helpers.
revoke all on function public.is_active_circle_member(uuid, uuid) from public;
revoke all on function public.can_read_circle(uuid, uuid) from public;
revoke all on function public.is_circle_contributor(uuid, uuid) from public;
revoke all on function public.can_submit_offer_on_ask(uuid, uuid, uuid) from public;
revoke all on function public.is_conversation_participant(uuid, uuid) from public;
revoke all on function public.can_view_profile(uuid, uuid) from public;
revoke all on function public.can_moderate_circle(uuid, uuid) from public;
revoke all on function public.create_ask(jsonb) from public;
revoke all on function public.publish_ask(uuid, text) from public;
revoke all on function public.submit_offer(jsonb) from public;
revoke all on function public.accept_offer(jsonb) from public;
revoke all on function public.transition_loan(jsonb) from public;

grant execute on function public.is_active_circle_member(uuid, uuid) to authenticated;
grant execute on function public.can_read_circle(uuid, uuid) to authenticated;
grant execute on function public.is_circle_contributor(uuid, uuid) to authenticated;
grant execute on function public.can_submit_offer_on_ask(uuid, uuid, uuid) to authenticated;
grant execute on function public.is_conversation_participant(uuid, uuid) to authenticated;
grant execute on function public.can_view_profile(uuid, uuid) to authenticated;
grant execute on function public.can_moderate_circle(uuid, uuid) to authenticated;
grant execute on function public.create_ask(jsonb) to authenticated;
grant execute on function public.publish_ask(uuid, text) to authenticated;
grant execute on function public.submit_offer(jsonb) to authenticated;
grant execute on function public.accept_offer(jsonb) to authenticated;
grant execute on function public.transition_loan(jsonb) to authenticated;

revoke all on all tables in schema private from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
revoke all on schema private from public, anon, authenticated;

commit;
