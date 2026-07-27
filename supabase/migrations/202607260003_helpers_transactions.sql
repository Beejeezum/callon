begin;

create or replace function public.is_active_circle_member(p_circle_id uuid, p_profile_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.circle_memberships m
    where m.circle_id = p_circle_id
      and m.profile_id = p_profile_id
      and m.status in ('active','restricted')
  );
$$;

create or replace function public.is_circle_contributor(p_circle_id uuid, p_profile_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.circle_memberships m
    where m.circle_id = p_circle_id
      and m.profile_id = p_profile_id
      and m.status in ('active','pending','restricted')
  );
$$;

create or replace function public.can_moderate_circle(p_circle_id uuid, p_profile_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.circle_memberships m
    where m.circle_id = p_circle_id
      and m.profile_id = p_profile_id
      and m.status = 'active'
      and m.role in ('moderator','circle_admin')
  );
$$;

create or replace function private.is_conversation_participant(p_conversation_id uuid, p_profile_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  select exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = p_conversation_id
      and cp.profile_id = p_profile_id
  );
$$;

create or replace function private.record_audit(
  p_circle_id uuid,
  p_actor_profile_id uuid,
  p_action text,
  p_target_type text,
  p_target_id uuid,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language sql
volatile
security definer
set search_path = pg_catalog, private
as $$
  insert into private.audit_events(circle_id, actor_profile_id, action, target_type, target_id, metadata)
  values (p_circle_id, p_actor_profile_id, p_action, p_target_type, p_target_id, coalesce(p_metadata, '{}'::jsonb));
$$;

create or replace function private.record_outbox(
  p_aggregate_type text,
  p_aggregate_id uuid,
  p_event_type text,
  p_payload jsonb
)
returns void
language sql
volatile
security definer
set search_path = pg_catalog, private
as $$
  insert into private.outbox_events(aggregate_type, aggregate_id, event_type, payload)
  values (p_aggregate_type, p_aggregate_id, p_event_type, p_payload);
$$;

create or replace function private.begin_idempotent_operation(
  p_scope text,
  p_key text,
  p_request_hash text
)
returns private.idempotency_records
language plpgsql
volatile
security definer
set search_path = pg_catalog, private
as $$
declare
  v_actor uuid := auth.uid();
  v_record private.idempotency_records;
begin
  if v_actor is null then raise exception 'authentication required' using errcode = '28000'; end if;
  if char_length(p_key) < 16 or char_length(p_key) > 200 then raise exception 'invalid idempotency key' using errcode = '22023'; end if;

  insert into private.idempotency_records(actor_profile_id, scope, idempotency_key, request_hash)
  values (v_actor, p_scope, p_key, p_request_hash)
  on conflict (actor_profile_id, scope, idempotency_key) do nothing;

  select * into v_record
  from private.idempotency_records
  where actor_profile_id = v_actor and scope = p_scope and idempotency_key = p_key
  for update;

  if v_record.request_hash <> p_request_hash then
    raise exception 'idempotency key reused for a different request' using errcode = '22000';
  end if;
  return v_record;
end;
$$;

create or replace function private.complete_idempotent_operation(
  p_scope text,
  p_key text,
  p_status integer,
  p_body jsonb,
  p_resource_id uuid
)
returns void
language sql
volatile
security definer
set search_path = pg_catalog, private
as $$
  update private.idempotency_records
     set response_status = p_status,
         response_body = p_body,
         resource_id = p_resource_id,
         completed_at = timezone('utc', now())
   where actor_profile_id = auth.uid()
     and scope = p_scope
     and idempotency_key = p_key;
$$;

create or replace function public.create_ask(p_input jsonb)
returns uuid
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_actor uuid := auth.uid();
  v_ask_id uuid := gen_random_uuid();
  v_circle_id uuid := (p_input->>'circleId')::uuid;
  v_needed_by timestamptz := (p_input->>'neededBy')::timestamptz;
  v_need jsonb;
  v_sort integer := 0;
  v_key text := p_input->>'idempotencyKey';
  v_existing private.idempotency_records;
begin
  if v_actor is null then raise exception 'authentication required' using errcode = '28000'; end if;
  if not public.is_active_circle_member(v_circle_id, v_actor) then raise exception 'active membership required' using errcode = '42501'; end if;

  v_existing := private.begin_idempotent_operation('create_ask', v_key, encode(extensions.digest(p_input::text, 'sha256'), 'hex'));
  if v_existing.completed_at is not null then return v_existing.resource_id; end if;

  insert into public.asks(id, circle_id, created_by, ask_type, title, description, general_location, starts_at, needed_by, expires_at)
  values (
    v_ask_id, v_circle_id, v_actor, 'quick_need',
    trim(p_input->>'title'), coalesce(trim(p_input->>'description'), ''), trim(p_input->>'generalLocation'),
    nullif(p_input->>'startsAt','')::timestamptz, v_needed_by, v_needed_by + interval '2 days'
  );

  for v_need in select value from jsonb_array_elements(p_input->'needs') loop
    insert into public.ask_needs(
      circle_id, ask_id, kind, title, description, quantity_requested, unit, risk_level, sort_order
    ) values (
      v_circle_id, v_ask_id, (v_need->>'kind')::public.need_kind, trim(v_need->>'title'),
      coalesce(trim(v_need->>'description'), ''), coalesce((v_need->>'quantityRequested')::numeric, 1),
      nullif(trim(v_need->>'unit'), ''), coalesce((v_need->>'riskLevel')::public.risk_level, 'low'), v_sort
    );
    v_sort := v_sort + 1;
  end loop;

  perform private.record_audit(v_circle_id, v_actor, 'ask.created', 'ask', v_ask_id, '{}'::jsonb);
  perform private.complete_idempotent_operation('create_ask', v_key, 201, jsonb_build_object('askId', v_ask_id), v_ask_id);
  return v_ask_id;
end;
$$;

create or replace function public.publish_ask(p_ask_id uuid, p_idempotency_key text)
returns uuid
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_actor uuid := auth.uid();
  v_ask public.asks;
  v_existing private.idempotency_records;
begin
  select * into v_ask from public.asks where id = p_ask_id for update;
  if not found then raise exception 'ask not found' using errcode = 'P0002'; end if;
  if v_ask.created_by <> v_actor then raise exception 'only the owner can publish' using errcode = '42501'; end if;
  if v_ask.status <> 'draft' then return v_ask.id; end if;
  if exists(select 1 from public.ask_needs where ask_id = p_ask_id and risk_level in ('restricted','prohibited')) then
    raise exception 'restricted or prohibited need requires review' using errcode = '42501';
  end if;

  v_existing := private.begin_idempotent_operation('publish_ask', p_idempotency_key, encode(extensions.digest(p_ask_id::text, 'sha256'), 'hex'));
  if v_existing.completed_at is not null then return v_existing.resource_id; end if;

  update public.asks set status = 'open', published_at = timezone('utc', now()) where id = p_ask_id;
  perform private.record_audit(v_ask.circle_id, v_actor, 'ask.published', 'ask', p_ask_id, '{}'::jsonb);
  perform private.record_outbox('ask', p_ask_id, 'ask.published', jsonb_build_object('ask_id', p_ask_id, 'circle_id', v_ask.circle_id));
  perform private.complete_idempotent_operation('publish_ask', p_idempotency_key, 200, jsonb_build_object('askId', p_ask_id), p_ask_id);
  return p_ask_id;
end;
$$;

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
  if not public.is_circle_contributor(v_ask.circle_id, v_actor) then raise exception 'approved membership or scoped guest required' using errcode = '42501'; end if;
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

create or replace function public.accept_offer(p_input jsonb)
returns uuid
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_actor uuid := auth.uid();
  v_offer public.offers;
  v_ask public.asks;
  v_need public.ask_needs;
  v_commitment_id uuid := gen_random_uuid();
  v_conversation_id uuid := gen_random_uuid();
  v_loan_id uuid;
  v_quantity numeric;
  v_key text := p_input->>'idempotencyKey';
  v_existing private.idempotency_records;
begin
  select * into v_offer from public.offers where id = (p_input->>'offerId')::uuid for update;
  if not found then raise exception 'offer not found' using errcode = 'P0002'; end if;
  select * into v_ask from public.asks where id = v_offer.ask_id for update;
  select * into v_need from public.ask_needs where id = v_offer.need_id for update;
  if v_ask.created_by <> v_actor then raise exception 'only requester can accept' using errcode = '42501'; end if;
  if v_offer.status <> 'submitted' then
    select id into v_commitment_id from public.commitments where offer_id = v_offer.id;
    if v_commitment_id is not null then return v_commitment_id; end if;
    raise exception 'offer is not available';
  end if;

  v_existing := private.begin_idempotent_operation('accept_offer', v_key, encode(extensions.digest(p_input::text, 'sha256'), 'hex'));
  if v_existing.completed_at is not null then return v_existing.resource_id; end if;

  v_quantity := least(v_offer.quantity, v_need.quantity_requested - v_need.quantity_committed);
  if v_quantity <= 0 then raise exception 'need already covered' using errcode = '22023'; end if;

  insert into public.conversations(id, circle_id) values (v_conversation_id, v_offer.circle_id);
  insert into public.conversation_participants(conversation_id, profile_id, participant_role)
  values (v_conversation_id, v_actor, 'requester'), (v_conversation_id, v_offer.contributor_profile_id, 'contributor');

  insert into public.commitments(
    id, circle_id, ask_id, need_id, offer_id, resource_id, requester_profile_id, contributor_profile_id,
    contribution_type, quantity, summary_snapshot, terms_version, status, starts_at, due_at, conversation_id, exact_location_id
  ) values (
    v_commitment_id, v_offer.circle_id, v_offer.ask_id, v_offer.need_id, v_offer.id, v_offer.resource_id,
    v_actor, v_offer.contributor_profile_id, v_offer.offer_type, v_quantity,
    jsonb_build_object('item_name', coalesce(v_offer.freeform_item_name, ''), 'description', v_offer.description, 'quantity', v_quantity),
    'pilot-v1', 'accepted', nullif(p_input->>'startsAt','')::timestamptz, nullif(p_input->>'dueAt','')::timestamptz,
    v_conversation_id, nullif(p_input->>'exactLocationId','')::uuid
  );

  update public.offers set status = 'accepted', decided_at = timezone('utc', now()) where id = v_offer.id;
  update public.ask_needs
     set quantity_committed = quantity_committed + v_quantity,
         status = case
           when quantity_committed + v_quantity >= quantity_requested then 'covered'::public.need_status
           else 'partially_covered'::public.need_status
         end
   where id = v_need.id;
  update public.asks
     set status = case
       when not exists(select 1 from public.ask_needs n where n.ask_id = v_ask.id and n.id <> v_need.id and n.status in ('open','partially_covered'))
         and v_need.quantity_committed + v_quantity >= v_need.quantity_requested
       then 'ready'::public.ask_status
       else 'partially_fulfilled'::public.ask_status
     end
   where id = v_ask.id;

  if v_offer.offer_type = 'lend' then
    v_loan_id := gen_random_uuid();
    insert into public.loans(id, circle_id, commitment_id, lender_profile_id, borrower_profile_id, resource_id, due_at)
    values (v_loan_id, v_offer.circle_id, v_commitment_id, v_offer.contributor_profile_id, v_actor, v_offer.resource_id, nullif(p_input->>'dueAt','')::timestamptz);
    insert into public.loan_events(circle_id, loan_id, actor_profile_id, event_type, metadata)
    values (v_offer.circle_id, v_loan_id, v_actor, 'created', jsonb_build_object('commitment_id', v_commitment_id));
  end if;

  perform private.record_audit(v_offer.circle_id, v_actor, 'offer.accepted', 'commitment', v_commitment_id, jsonb_build_object('offer_id', v_offer.id));
  perform private.record_outbox('commitment', v_commitment_id, 'offer.accepted', jsonb_build_object('commitment_id', v_commitment_id, 'contributor_profile_id', v_offer.contributor_profile_id));
  perform private.complete_idempotent_operation('accept_offer', v_key, 201, jsonb_build_object('commitmentId', v_commitment_id, 'loanId', v_loan_id), v_commitment_id);
  return v_commitment_id;
end;
$$;

create or replace function public.transition_loan(p_input jsonb)
returns uuid
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_actor uuid := auth.uid();
  v_loan public.loans;
  v_action text := p_input->>'action';
  v_key text := p_input->>'idempotencyKey';
  v_existing private.idempotency_records;
  v_event text;
begin
  select * into v_loan from public.loans where id = (p_input->>'loanId')::uuid for update;
  if not found then raise exception 'loan not found' using errcode = 'P0002'; end if;
  if v_actor not in (v_loan.lender_profile_id, v_loan.borrower_profile_id) then raise exception 'not a loan party' using errcode = '42501'; end if;

  v_existing := private.begin_idempotent_operation('transition_loan:' || v_action, v_key, encode(extensions.digest(p_input::text, 'sha256'), 'hex'));
  if v_existing.completed_at is not null then return v_existing.resource_id; end if;

  case v_action
    when 'confirm_handoff' then
      if v_actor <> v_loan.borrower_profile_id or v_loan.status <> 'pending_handoff' then raise exception 'invalid handoff transition'; end if;
      update public.loans set status = 'checked_out', checked_out_at = timezone('utc', now()) where id = v_loan.id;
      update public.commitments set status = 'active' where id = v_loan.commitment_id;
      v_event := 'handoff_confirmed';
    when 'request_extension' then
      if v_actor <> v_loan.borrower_profile_id or v_loan.status not in ('checked_out','overdue') then raise exception 'invalid extension request'; end if;
      update public.loans set status = 'extension_requested', extension_requested_at = timezone('utc', now()), proposed_due_at = (p_input->>'proposedDueAt')::timestamptz where id = v_loan.id;
      v_event := 'extension_requested';
    when 'approve_extension' then
      if v_actor <> v_loan.lender_profile_id or v_loan.status <> 'extension_requested' then raise exception 'invalid extension approval'; end if;
      update public.loans set status = 'checked_out', due_at = proposed_due_at, proposed_due_at = null where id = v_loan.id;
      v_event := 'extension_approved';
    when 'mark_returned' then
      if v_actor <> v_loan.borrower_profile_id or v_loan.status not in ('checked_out','extension_requested','overdue') then raise exception 'invalid return mark'; end if;
      update public.loans set status = 'return_marked', return_marked_at = timezone('utc', now()) where id = v_loan.id;
      v_event := 'return_marked';
    when 'confirm_return' then
      if v_actor <> v_loan.lender_profile_id or v_loan.status <> 'return_marked' then raise exception 'invalid return confirmation'; end if;
      update public.loans set status = 'returned', returned_at = timezone('utc', now()) where id = v_loan.id;
      update public.commitments set status = 'fulfilled', fulfilled_at = timezone('utc', now()) where id = v_loan.commitment_id;
      update public.ask_needs n set quantity_completed = least(n.quantity_committed, n.quantity_completed + c.quantity), status = case when least(n.quantity_committed, n.quantity_completed + c.quantity) >= n.quantity_requested then 'completed' else n.status end
        from public.commitments c where c.id = v_loan.commitment_id and n.id = c.need_id;
      v_event := 'return_confirmed';
    when 'report_issue' then
      update public.loans set status = 'disputed' where id = v_loan.id;
      update public.commitments set status = 'disputed' where id = v_loan.commitment_id;
      v_event := 'issue_reported';
    else raise exception 'unsupported loan action' using errcode = '22023';
  end case;

  insert into public.loan_events(circle_id, loan_id, actor_profile_id, event_type, metadata)
  values (v_loan.circle_id, v_loan.id, v_actor, v_event, jsonb_build_object('note', nullif(p_input->>'note',''), 'proposed_due_at', nullif(p_input->>'proposedDueAt','')));
  perform private.record_audit(v_loan.circle_id, v_actor, 'loan.' || v_event, 'loan', v_loan.id, '{}'::jsonb);
  perform private.record_outbox('loan', v_loan.id, 'loan.' || v_event, jsonb_build_object('loan_id', v_loan.id, 'actor_profile_id', v_actor));
  perform private.complete_idempotent_operation('transition_loan:' || v_action, v_key, 200, jsonb_build_object('loanId', v_loan.id, 'statusEvent', v_event), v_loan.id);
  return v_loan.id;
end;
$$;

create or replace function private.claim_notification_jobs(p_worker text, p_limit integer default 50)
returns setof private.notification_jobs
language plpgsql
volatile
security definer
set search_path = pg_catalog, private
as $$
begin
  return query
  with claimed as (
    select id from private.notification_jobs
    where status in ('pending','failed') and scheduled_for <= timezone('utc', now()) and attempts < 8
    order by scheduled_for
    for update skip locked
    limit greatest(1, least(p_limit, 100))
  )
  update private.notification_jobs j
     set status = 'processing', locked_at = timezone('utc', now()), locked_by = p_worker, attempts = attempts + 1
    from claimed c
   where j.id = c.id
  returning j.*;
end;
$$;

revoke all on function private.claim_notification_jobs(text, integer) from public, anon, authenticated;

commit;
