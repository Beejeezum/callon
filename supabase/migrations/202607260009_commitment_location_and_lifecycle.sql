begin;

-- A pickup/return location can belong to either accepted party. The original
-- hardening trigger was too narrow for the common "pick up at the lender"
-- journey.
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
      and l.owner_profile_id in (
        new.requester_profile_id,
        new.contributor_profile_id
      )
      and l.deleted_at is null
      and (l.expires_at is null or l.expires_at > timezone('utc', now()))
  ) then
    raise exception 'exact location must belong to an accepted party in the same Circle' using errcode = '23514';
  end if;

  return new;
end;
$$;

create or replace function public.set_commitment_location(p_input jsonb)
returns uuid
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_actor uuid := auth.uid();
  v_commitment public.commitments;
  v_location_id uuid := gen_random_uuid();
  v_key text := p_input->>'idempotencyKey';
  v_existing private.idempotency_records;
begin
  select * into v_commitment
  from public.commitments
  where id = (p_input->>'commitmentId')::uuid
  for update;
  if not found then
    raise exception 'Commitment not found' using errcode = 'P0002';
  end if;
  if v_actor not in (
    v_commitment.requester_profile_id,
    v_commitment.contributor_profile_id
  ) then
    raise exception 'not a Commitment participant' using errcode = '42501';
  end if;
  if v_commitment.status in ('cancelled','fulfilled') then
    raise exception 'Commitment is closed' using errcode = '22023';
  end if;
  if coalesce(p_input->>'ciphertext', '') !~ '^[A-Za-z0-9+/=]+$'
     or coalesce(p_input->>'nonce', '') !~ '^[A-Za-z0-9+/=]+$' then
    raise exception 'invalid encrypted location payload' using errcode = '22023';
  end if;

  v_existing := private.begin_idempotent_operation(
    'set_commitment_location',
    v_key,
    encode(extensions.digest(p_input::text, 'sha256'), 'hex')
  );
  if v_existing.completed_at is not null then
    return v_existing.resource_id;
  end if;

  insert into private.exact_locations(
    id, circle_id, owner_profile_id, ciphertext, nonce, key_version,
    location_kind, expires_at
  ) values (
    v_location_id,
    v_commitment.circle_id,
    v_actor,
    decode(p_input->>'ciphertext', 'base64'),
    decode(p_input->>'nonce', 'base64'),
    coalesce((p_input->>'keyVersion')::integer, 1),
    coalesce(nullif(p_input->>'locationKind', ''), 'pickup'),
    coalesce(
      nullif(p_input->>'expiresAt', '')::timestamptz,
      timezone('utc', now()) + interval '30 days'
    )
  );

  update public.commitments
     set exact_location_id = v_location_id,
         status = case
           when status = 'accepted' then 'coordinating'::public.commitment_status
           else status
         end
   where id = v_commitment.id;

  perform private.record_audit(
    v_commitment.circle_id, v_actor, 'commitment.location_set',
    'commitment', v_commitment.id,
    jsonb_build_object('location_id', v_location_id)
  );
  perform private.complete_idempotent_operation(
    'set_commitment_location', v_key, 201,
    jsonb_build_object('locationId', v_location_id), v_location_id
  );
  return v_location_id;
end;
$$;

create or replace function public.get_commitment_location(p_commitment_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  select jsonb_build_object(
    'ciphertext', encode(l.ciphertext, 'base64'),
    'nonce', encode(l.nonce, 'base64'),
    'keyVersion', l.key_version,
    'locationKind', l.location_kind
  )
  from public.commitments c
  join private.exact_locations l on l.id = c.exact_location_id
  where c.id = p_commitment_id
    and auth.uid() in (c.requester_profile_id, c.contributor_profile_id)
    and l.deleted_at is null
    and (l.expires_at is null or l.expires_at > timezone('utc', now()));
$$;

create or replace function public.complete_non_loan_commitment(p_input jsonb)
returns uuid
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_actor uuid := auth.uid();
  v_commitment public.commitments;
  v_key text := p_input->>'idempotencyKey';
  v_existing private.idempotency_records;
begin
  select * into v_commitment
  from public.commitments
  where id = (p_input->>'commitmentId')::uuid
  for update;
  if not found then
    raise exception 'Commitment not found' using errcode = 'P0002';
  end if;
  if v_commitment.requester_profile_id <> v_actor then
    raise exception 'only the requester can confirm completion' using errcode = '42501';
  end if;
  if exists (
    select 1 from public.loans where commitment_id = v_commitment.id
  ) then
    raise exception 'physical lending must use the Loan return flow' using errcode = '22023';
  end if;
  if v_commitment.status = 'fulfilled' then
    return v_commitment.id;
  end if;
  if v_commitment.status in ('cancelled','disputed') then
    raise exception 'Commitment cannot be completed in its current state' using errcode = '22023';
  end if;

  v_existing := private.begin_idempotent_operation(
    'complete_non_loan_commitment',
    v_key,
    encode(extensions.digest(p_input::text, 'sha256'), 'hex')
  );
  if v_existing.completed_at is not null then
    return v_existing.resource_id;
  end if;

  update public.commitments
     set status = 'fulfilled',
         fulfilled_at = timezone('utc', now())
   where id = v_commitment.id;
  update public.ask_needs
     set quantity_completed = least(
           quantity_committed,
           quantity_completed + v_commitment.quantity
         ),
         status = case
           when least(
             quantity_committed,
             quantity_completed + v_commitment.quantity
           ) >= quantity_requested
           then 'completed'::public.need_status
           else status
         end
   where id = v_commitment.need_id;

  if not exists (
    select 1 from public.ask_needs
    where ask_id = v_commitment.ask_id
      and status not in ('completed','cancelled')
  ) then
    update public.asks
       set status = 'completed',
           completed_at = timezone('utc', now())
     where id = v_commitment.ask_id;
    update private.share_links
       set revoked_at = coalesce(revoked_at, timezone('utc', now()))
     where ask_id = v_commitment.ask_id;
  end if;

  perform private.record_audit(
    v_commitment.circle_id, v_actor, 'commitment.fulfilled',
    'commitment', v_commitment.id, '{}'::jsonb
  );
  perform private.record_outbox(
    'commitment', v_commitment.id, 'commitment.fulfilled',
    jsonb_build_object(
      'commitment_id', v_commitment.id,
      'contributor_profile_id', v_commitment.contributor_profile_id
    )
  );
  perform private.complete_idempotent_operation(
    'complete_non_loan_commitment', v_key, 200,
    jsonb_build_object('commitmentId', v_commitment.id), v_commitment.id
  );
  return v_commitment.id;
end;
$$;

create or replace function public.decline_loan_extension(p_input jsonb)
returns uuid
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_actor uuid := auth.uid();
  v_loan public.loans;
  v_key text := p_input->>'idempotencyKey';
  v_existing private.idempotency_records;
begin
  select * into v_loan
  from public.loans
  where id = (p_input->>'loanId')::uuid
  for update;
  if not found then
    raise exception 'Loan not found' using errcode = 'P0002';
  end if;
  if v_actor <> v_loan.lender_profile_id
     or v_loan.status <> 'extension_requested' then
    raise exception 'invalid extension decline' using errcode = '42501';
  end if;

  v_existing := private.begin_idempotent_operation(
    'decline_loan_extension',
    v_key,
    encode(extensions.digest(p_input::text, 'sha256'), 'hex')
  );
  if v_existing.completed_at is not null then
    return v_existing.resource_id;
  end if;

  update public.loans
     set status = case
           when due_at < timezone('utc', now()) then 'overdue'::public.loan_status
           else 'checked_out'::public.loan_status
         end,
         proposed_due_at = null
   where id = v_loan.id;
  insert into public.loan_events(
    circle_id, loan_id, actor_profile_id, event_type, metadata
  ) values (
    v_loan.circle_id, v_loan.id, v_actor, 'extension_declined',
    jsonb_build_object('note', nullif(p_input->>'note', ''))
  );
  perform private.record_audit(
    v_loan.circle_id, v_actor, 'loan.extension_declined',
    'loan', v_loan.id, '{}'::jsonb
  );
  perform private.record_outbox(
    'loan', v_loan.id, 'loan.extension_declined',
    jsonb_build_object('loan_id', v_loan.id)
  );
  perform private.complete_idempotent_operation(
    'decline_loan_extension', v_key, 200,
    jsonb_build_object('loanId', v_loan.id), v_loan.id
  );
  return v_loan.id;
end;
$$;

create or replace function private.expire_due_asks(p_limit integer default 250)
returns integer
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_count integer;
begin
  with due as (
    select id
    from public.asks
    where expires_at <= timezone('utc', now())
      and status in ('draft','open','partially_fulfilled','ready','in_progress')
    order by expires_at
    for update skip locked
    limit greatest(1, least(p_limit, 1000))
  ),
  changed as (
    update public.asks a
       set status = 'expired'
      from due
     where a.id = due.id
     returning a.id
  )
  select count(*) into v_count from changed;

  update private.share_links l
     set revoked_at = coalesce(revoked_at, timezone('utc', now()))
   where exists (
     select 1 from public.asks a
     where a.id = l.ask_id and a.status = 'expired'
   );
  return v_count;
end;
$$;

create or replace function private.mark_overdue_loans(p_limit integer default 250)
returns integer
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_count integer;
begin
  with due as (
    select id, circle_id
    from public.loans
    where due_at < timezone('utc', now())
      and status = 'checked_out'
    order by due_at
    for update skip locked
    limit greatest(1, least(p_limit, 1000))
  ),
  changed as (
    update public.loans l
       set status = 'overdue'
      from due
     where l.id = due.id
     returning l.id, l.circle_id
  ),
  events as (
    insert into public.loan_events(
      circle_id, loan_id, actor_profile_id, event_type, metadata
    )
    select circle_id, id, null, 'overdue', '{}'::jsonb
    from changed
    returning loan_id
  )
  select count(*) into v_count from events;
  return v_count;
end;
$$;

revoke all on function public.set_commitment_location(jsonb) from public;
revoke all on function public.get_commitment_location(uuid) from public;
revoke all on function public.complete_non_loan_commitment(jsonb) from public;
revoke all on function public.decline_loan_extension(jsonb) from public;
revoke all on function private.expire_due_asks(integer) from public;
revoke all on function private.mark_overdue_loans(integer) from public;

grant execute on function public.set_commitment_location(jsonb) to authenticated;
grant execute on function public.get_commitment_location(uuid) to authenticated;
grant execute on function public.complete_non_loan_commitment(jsonb) to authenticated;
grant execute on function public.decline_loan_extension(jsonb) to authenticated;

commit;
