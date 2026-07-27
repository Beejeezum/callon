begin;

alter table public.loans
  add constraint loans_extension_window_valid check (
    proposed_due_at is null
    or (
      extension_requested_at is not null
      and proposed_due_at > extension_requested_at
      and proposed_due_at <= extension_requested_at + interval '30 days'
    )
  );

create or replace function private.sync_completed_ask_from_need()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_ask public.asks;
begin
  select * into v_ask
  from public.asks
  where id = new.ask_id
  for update;

  if v_ask.status not in ('completed','cancelled','expired','archived')
     and not exists (
       select 1
       from public.ask_needs n
       where n.ask_id = new.ask_id
         and n.status not in ('completed','cancelled')
     ) then
    update public.asks
       set status = 'completed',
           completed_at = coalesce(completed_at, timezone('utc', now()))
     where id = new.ask_id;
    update private.share_links
       set revoked_at = coalesce(revoked_at, timezone('utc', now()))
     where ask_id = new.ask_id;
    perform private.record_audit(
      v_ask.circle_id,
      auth.uid(),
      'ask.completed',
      'ask',
      v_ask.id,
      jsonb_build_object('source', 'need_completion')
    );
    perform private.record_outbox(
      'ask',
      v_ask.id,
      'ask.completed',
      jsonb_build_object('ask_id', v_ask.id, 'circle_id', v_ask.circle_id)
    );
  end if;
  return new;
end;
$$;

create trigger ask_needs_sync_completed_ask
after update of status, quantity_completed on public.ask_needs
for each row
when (new.status = 'completed')
execute function private.sync_completed_ask_from_need();

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
declare
  v_preferences public.notification_preferences;
  v_scheduled_for timestamptz :=
    greatest(p_scheduled_for, timezone('utc', now()));
  v_local timestamp;
  v_local_time time;
begin
  if p_profile_id is null then return; end if;

  select * into v_preferences
  from public.notification_preferences
  where profile_id = p_profile_id;
  if not found or not v_preferences.email_enabled then return; end if;

  if v_preferences.quiet_hours_start is not null
     and v_preferences.quiet_hours_end is not null
     and v_preferences.quiet_hours_start <> v_preferences.quiet_hours_end then
    begin
      v_local := v_scheduled_for at time zone v_preferences.timezone;
    exception
      when invalid_parameter_value then
        v_local := v_scheduled_for at time zone 'UTC';
    end;
    v_local_time := v_local::time;

    if v_preferences.quiet_hours_start < v_preferences.quiet_hours_end
       and v_local_time >= v_preferences.quiet_hours_start
       and v_local_time < v_preferences.quiet_hours_end then
      v_scheduled_for := (
        (v_local::date + v_preferences.quiet_hours_end)
        at time zone v_preferences.timezone
      );
    elsif v_preferences.quiet_hours_start > v_preferences.quiet_hours_end
       and v_local_time >= v_preferences.quiet_hours_start then
      v_scheduled_for := (
        (v_local::date + 1 + v_preferences.quiet_hours_end)
        at time zone v_preferences.timezone
      );
    elsif v_preferences.quiet_hours_start > v_preferences.quiet_hours_end
       and v_local_time < v_preferences.quiet_hours_end then
      v_scheduled_for := (
        (v_local::date + v_preferences.quiet_hours_end)
        at time zone v_preferences.timezone
      );
    end if;
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
    v_scheduled_for
  )
  on conflict do nothing;
end;
$$;

revoke all on function private.sync_completed_ask_from_need() from public;
revoke all on function private.enqueue_email_job(uuid, uuid, text, uuid, text, timestamptz, text) from public;

commit;
