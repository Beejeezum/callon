begin;

create or replace function private.enqueue_email_job(
  p_circle_id uuid,
  p_profile_id uuid,
  p_template text,
  p_object_id uuid,
  p_href text,
  p_scheduled_for timestamptz,
  p_idempotency_key text
)
returns void
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
begin
  if p_profile_id is null then return; end if;
  if not exists (
    select 1
    from public.notification_preferences n
    where n.profile_id = p_profile_id and n.email_enabled
  ) then
    return;
  end if;

  insert into private.notification_jobs(
    circle_id, profile_id, channel, template_key, payload, scheduled_for
  ) values (
    p_circle_id,
    p_profile_id,
    'email',
    p_template,
    jsonb_build_object(
      'idempotency_key', p_idempotency_key,
      'object_id', p_object_id,
      'href', p_href
    ),
    greatest(p_scheduled_for, timezone('utc', now()))
  )
  on conflict do nothing;
end;
$$;

create or replace function private.expand_outbox_events(p_limit integer default 100)
returns integer
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_event private.outbox_events;
  v_profile_id uuid;
  v_circle_id uuid;
  v_template text;
  v_href text;
  v_loan public.loans;
  v_commitment public.commitments;
  v_count integer := 0;
begin
  for v_event in
    select *
    from private.outbox_events
    where published_at is null and attempts < 8
    order by occurred_at
    for update skip locked
    limit greatest(1, least(p_limit, 250))
  loop
    v_profile_id := null;
    v_circle_id := null;
    v_template := null;
    v_href := '/';

    if v_event.event_type = 'ask.published' then
      select circle_id, created_by
        into v_circle_id, v_profile_id
      from public.asks where id = v_event.aggregate_id;
      v_template := 'ask_published.v1';
      v_href := '/asks/' || v_event.aggregate_id::text;

    elsif v_event.event_type = 'offer.submitted' then
      select circle_id into v_circle_id
      from public.offers where id = v_event.aggregate_id;
      v_profile_id := nullif(v_event.payload->>'requester_profile_id', '')::uuid;
      v_template := 'offer_received.v1';
      v_href := '/asks/' || (v_event.payload->>'ask_id') || '/offers';

    elsif v_event.event_type = 'offer.accepted' then
      select * into v_commitment
      from public.commitments where id = v_event.aggregate_id;
      v_circle_id := v_commitment.circle_id;
      v_profile_id := v_commitment.contributor_profile_id;
      v_template := 'offer_accepted.v1';
      v_href := '/commitments/' || v_commitment.id::text;

      select * into v_loan
      from public.loans where commitment_id = v_commitment.id;
      if found then
        if v_commitment.starts_at is not null then
          perform private.enqueue_email_job(
            v_circle_id,
            v_loan.borrower_profile_id,
            'pickup_reminder.v1',
            v_loan.id,
            '/commitments/' || v_commitment.id::text,
            v_commitment.starts_at - interval '24 hours',
            'pickup-24h:' || v_loan.id::text
          );
        end if;
        if v_loan.due_at is not null then
          perform private.enqueue_email_job(
            v_circle_id,
            v_loan.borrower_profile_id,
            'return_due.v1',
            v_loan.id,
            '/loans/' || v_loan.id::text,
            v_loan.due_at - interval '24 hours',
            'due-24h:' || v_loan.id::text
          );
          perform private.enqueue_email_job(
            v_circle_id,
            v_loan.borrower_profile_id,
            'return_due.v1',
            v_loan.id,
            '/loans/' || v_loan.id::text,
            v_loan.due_at,
            'due-now:' || v_loan.id::text
          );
        end if;
      end if;

    elsif v_event.event_type = 'message.sent' then
      select *
        into v_commitment
      from public.commitments
      where id = nullif(v_event.payload->>'commitment_id', '')::uuid;
      v_circle_id := v_commitment.circle_id;
      v_profile_id := case
        when v_commitment.requester_profile_id =
          nullif(v_event.payload->>'sender_profile_id', '')::uuid
        then v_commitment.contributor_profile_id
        else v_commitment.requester_profile_id
      end;
      v_template := 'commitment_message.v1';
      v_href := '/commitments/' || v_commitment.id::text;

    elsif v_event.event_type like 'loan.%' then
      select * into v_loan
      from public.loans where id = v_event.aggregate_id;
      v_circle_id := v_loan.circle_id;
      v_href := '/loans/' || v_loan.id::text;

      case v_event.event_type
        when 'loan.handoff_confirmed' then
          v_profile_id := v_loan.lender_profile_id;
          v_template := 'loan_checked_out.v1';
        when 'loan.extension_requested' then
          v_profile_id := v_loan.lender_profile_id;
          v_template := 'extension_requested.v1';
        when 'loan.extension_approved' then
          v_profile_id := v_loan.borrower_profile_id;
          v_template := 'extension_resolved.v1';
        when 'loan.extension_declined' then
          v_profile_id := v_loan.borrower_profile_id;
          v_template := 'extension_resolved.v1';
        when 'loan.return_marked' then
          v_profile_id := v_loan.lender_profile_id;
          v_template := 'return_marked.v1';
        when 'loan.return_confirmed' then
          v_profile_id := v_loan.borrower_profile_id;
          v_template := 'return_confirmed.v1';
        when 'loan.issue_reported' then
          v_profile_id := case
            when v_event.payload->>'actor_profile_id' = v_loan.lender_profile_id::text
            then v_loan.borrower_profile_id
            else v_loan.lender_profile_id
          end;
          v_template := 'incident_update.v1';
        else
          v_profile_id := null;
      end case;

    elsif v_event.event_type = 'commitment.fulfilled' then
      select * into v_commitment
      from public.commitments where id = v_event.aggregate_id;
      v_circle_id := v_commitment.circle_id;
      v_profile_id := v_commitment.contributor_profile_id;
      v_template := 'commitment_completed.v1';
      v_href := '/commitments/' || v_commitment.id::text;
    end if;

    if v_template is not null and v_profile_id is not null then
      perform private.enqueue_email_job(
        v_circle_id,
        v_profile_id,
        v_template,
        v_event.aggregate_id,
        v_href,
        timezone('utc', now()),
        v_event.event_type || ':' || v_event.id::text || ':' || v_profile_id::text
      );
    end if;

    update private.outbox_events
       set published_at = timezone('utc', now()),
           attempts = attempts + 1
     where id = v_event.id;
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

create or replace function public.prepare_notification_jobs(p_limit integer default 100)
returns jsonb
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_expired integer;
  v_overdue integer;
  v_expanded integer;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  v_expired := private.expire_due_asks(p_limit);
  v_overdue := private.mark_overdue_loans(p_limit);
  v_expanded := private.expand_outbox_events(p_limit);
  return jsonb_build_object(
    'expiredAsks', v_expired,
    'overdueLoans', v_overdue,
    'expandedEvents', v_expanded
  );
end;
$$;

create or replace function public.claim_notification_jobs(
  p_worker text,
  p_limit integer default 50
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_jobs jsonb;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', j.id,
    'profileId', j.profile_id,
    'channel', j.channel,
    'templateKey', j.template_key,
    'payload', j.payload,
    'attempts', j.attempts
  )), '[]'::jsonb)
  into v_jobs
  from private.claim_notification_jobs(p_worker, p_limit) j;
  return v_jobs;
end;
$$;

create or replace function public.settle_notification_job(p_input jsonb)
returns uuid
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_job private.notification_jobs;
  v_success boolean := coalesce((p_input->>'success')::boolean, false);
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  select * into v_job
  from private.notification_jobs
  where id = (p_input->>'jobId')::uuid
  for update;
  if not found then
    raise exception 'job not found' using errcode = 'P0002';
  end if;
  if v_job.status = 'sent' then return v_job.id; end if;

  update private.notification_jobs
     set status = case
           when v_success then 'sent'::private.job_status
           when attempts >= 8 then 'dead_letter'::private.job_status
           else 'failed'::private.job_status
         end,
         provider_message_id = case
           when v_success then nullif(p_input->>'providerMessageId', '')
           else provider_message_id
         end,
         last_error_code = case
           when v_success then null
           else left(coalesce(p_input->>'errorCode', 'provider_error'), 120)
         end,
         sent_at = case
           when v_success then timezone('utc', now())
           else sent_at
         end,
         scheduled_for = case
           when v_success or attempts >= 8 then scheduled_for
           else timezone('utc', now()) + make_interval(mins => least(240, (2 ^ least(attempts, 7))::integer))
         end,
         locked_at = null,
         locked_by = null
   where id = v_job.id;
  return v_job.id;
end;
$$;

create or replace function public.report_loan_incident(p_input jsonb)
returns uuid
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_actor uuid := auth.uid();
  v_loan public.loans;
  v_incident_id uuid := gen_random_uuid();
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
  if v_actor not in (v_loan.lender_profile_id, v_loan.borrower_profile_id) then
    raise exception 'not a Loan party' using errcode = '42501';
  end if;
  if v_loan.status in ('returned','cancelled') then
    raise exception 'closed Loan cannot be disputed' using errcode = '22023';
  end if;

  v_existing := private.begin_idempotent_operation(
    'report_loan_incident',
    v_key,
    encode(extensions.digest(p_input::text, 'sha256'), 'hex')
  );
  if v_existing.completed_at is not null then
    return v_existing.resource_id;
  end if;

  insert into public.incidents(
    id, circle_id, reported_by, subject_profile_id, commitment_id, loan_id,
    kind, summary
  ) values (
    v_incident_id,
    v_loan.circle_id,
    v_actor,
    case
      when v_actor = v_loan.lender_profile_id then v_loan.borrower_profile_id
      else v_loan.lender_profile_id
    end,
    v_loan.commitment_id,
    v_loan.id,
    (p_input->>'kind')::public.incident_kind,
    left(trim(p_input->>'summary'), 2000)
  );
  update public.loans set status = 'disputed' where id = v_loan.id;
  update public.commitments set status = 'disputed' where id = v_loan.commitment_id;
  insert into public.loan_events(
    circle_id, loan_id, actor_profile_id, event_type, metadata
  ) values (
    v_loan.circle_id, v_loan.id, v_actor, 'issue_reported',
    jsonb_build_object('incident_id', v_incident_id)
  );
  perform private.record_audit(
    v_loan.circle_id, v_actor, 'incident.reported',
    'incident', v_incident_id,
    jsonb_build_object('loan_id', v_loan.id, 'kind', p_input->>'kind')
  );
  perform private.record_outbox(
    'loan', v_loan.id, 'loan.issue_reported',
    jsonb_build_object(
      'loan_id', v_loan.id,
      'incident_id', v_incident_id,
      'actor_profile_id', v_actor
    )
  );
  perform private.complete_idempotent_operation(
    'report_loan_incident', v_key, 201,
    jsonb_build_object('incidentId', v_incident_id), v_incident_id
  );
  return v_incident_id;
end;
$$;

revoke all on function private.enqueue_email_job(uuid, uuid, text, uuid, text, timestamptz, text) from public;
revoke all on function private.expand_outbox_events(integer) from public;
revoke all on function public.prepare_notification_jobs(integer) from public;
revoke all on function public.claim_notification_jobs(text, integer) from public;
revoke all on function public.settle_notification_job(jsonb) from public;
revoke all on function public.report_loan_incident(jsonb) from public;

grant execute on function public.prepare_notification_jobs(integer) to service_role;
grant execute on function public.claim_notification_jobs(text, integer) to service_role;
grant execute on function public.settle_notification_job(jsonb) to service_role;
grant execute on function public.report_loan_incident(jsonb) to authenticated;

commit;
