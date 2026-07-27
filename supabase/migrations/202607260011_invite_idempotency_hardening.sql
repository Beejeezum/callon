begin;

-- A successful invite acceptance can exhaust the invite. Idempotent replay
-- must therefore be resolved before checking current invite availability.
create or replace function public.accept_circle_invite(p_input jsonb)
returns uuid
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_actor uuid := auth.uid();
  v_invite public.circle_invites;
  v_membership_id uuid;
  v_token_hash text := private.require_token_hash(p_input->>'tokenHash');
  v_key text := p_input->>'idempotencyKey';
  v_existing private.idempotency_records;
begin
  if v_actor is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  v_existing := private.begin_idempotent_operation(
    'accept_circle_invite',
    v_key,
    encode(extensions.digest(p_input::text, 'sha256'), 'hex')
  );
  if v_existing.completed_at is not null then
    return v_existing.resource_id;
  end if;

  select i.*
  into v_invite
  from private.invite_secrets s
  join public.circle_invites i on i.id = s.invite_id
  where s.token_hash = v_token_hash
  for update of i;

  if not found
     or v_invite.status <> 'active'
     or v_invite.expires_at <= timezone('utc', now())
     or v_invite.use_count >= v_invite.max_uses then
    raise exception 'invite is invalid or expired' using errcode = 'P0002';
  end if;

  select id into v_membership_id
  from public.circle_memberships
  where circle_id = v_invite.circle_id and profile_id = v_actor
  for update;

  if found then
    if exists (
      select 1 from public.circle_memberships
      where id = v_membership_id and status in ('suspended','restricted')
    ) then
      raise exception 'membership requires administrator review' using errcode = '42501';
    end if;
    update public.circle_memberships
       set status = 'active',
           joined_at = coalesce(joined_at, timezone('utc', now()))
     where id = v_membership_id;
  else
    insert into public.circle_memberships(
      circle_id, profile_id, role, status, joined_at
    ) values (
      v_invite.circle_id, v_actor, 'member', 'active', timezone('utc', now())
    )
    returning id into v_membership_id;

    update public.circle_invites
       set use_count = use_count + 1,
           status = case
             when use_count + 1 >= max_uses then 'exhausted'::public.invite_status
             else status
           end
     where id = v_invite.id;
  end if;

  perform private.record_audit(
    v_invite.circle_id, v_actor, 'membership.joined', 'circle_membership',
    v_membership_id, jsonb_build_object('invite_id', v_invite.id)
  );
  perform private.record_outbox(
    'membership', v_membership_id, 'membership.joined',
    jsonb_build_object(
      'circle_id', v_invite.circle_id,
      'profile_id', v_actor,
      'membership_id', v_membership_id
    )
  );
  perform private.complete_idempotent_operation(
    'accept_circle_invite', v_key, 200,
    jsonb_build_object(
      'membershipId', v_membership_id,
      'circleId', v_invite.circle_id
    ),
    v_membership_id
  );
  return v_membership_id;
end;
$$;

revoke all on function public.accept_circle_invite(jsonb) from public;
grant execute on function public.accept_circle_invite(jsonb) to authenticated;

commit;
