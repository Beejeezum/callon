begin;

-- Paseos pilot additions: safe manual resource creation, revocable community
-- invitations, explicit role changes, and an operator-only first-admin
-- bootstrap. This migration is forward-only; a failed deployment should be
-- corrected with a follow-up migration rather than partially rolled back.

insert into public.categories(slug, label, default_risk_level, sort_order)
values
  ('electronics', 'Electronics', 'low', 65),
  ('cleaning-equipment', 'Cleaning equipment', 'moderate', 75)
on conflict (slug) do update
set label = excluded.label,
    default_risk_level = excluded.default_risk_level,
    sort_order = excluded.sort_order;

create or replace function public.create_manual_resource(p_input jsonb)
returns uuid
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_actor uuid := auth.uid();
  v_circle_id uuid := (p_input->>'circleId')::uuid;
  v_category_id uuid := nullif(p_input->>'categoryId', '')::uuid;
  v_resource_id uuid := gen_random_uuid();
  v_key text := p_input->>'idempotencyKey';
  v_existing private.idempotency_records;
begin
  if v_actor is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if not exists (
    select 1
    from public.circle_memberships m
    where m.circle_id = v_circle_id
      and m.profile_id = v_actor
      and m.status = 'active'
  ) then
    raise exception 'active Circle membership required' using errcode = '42501';
  end if;
  if v_category_id is not null and not exists (
    select 1
    from public.categories c
    where c.id = v_category_id
      and c.is_active
      and c.default_risk_level in ('low', 'moderate')
  ) then
    raise exception 'unsupported resource category' using errcode = '42501';
  end if;

  v_existing := private.begin_idempotent_operation(
    'create_manual_resource',
    v_key,
    encode(extensions.digest(p_input::text, 'sha256'), 'hex')
  );
  if v_existing.completed_at is not null then
    return v_existing.resource_id;
  end if;

  insert into public.resources(
    id,
    circle_id,
    owner_profile_id,
    title,
    description,
    category_id,
    visibility,
    willingness,
    usual_terms,
    last_confirmed_at
  )
  values (
    v_resource_id,
    v_circle_id,
    v_actor,
    left(trim(p_input->>'title'), 100),
    left(coalesce(trim(p_input->>'description'), ''), 800),
    v_category_id,
    coalesce(
      nullif(p_input->>'visibility', '')::public.resource_visibility,
      'match_only'
    ),
    coalesce(
      nullif(p_input->>'willingness', '')::public.resource_willingness,
      'happy_to_be_asked'
    ),
    left(nullif(trim(coalesce(p_input->>'usualTerms', '')), ''), 800),
    timezone('utc', now())
  );

  perform private.record_audit(
    v_circle_id,
    v_actor,
    'resource.created',
    'resource',
    v_resource_id,
    jsonb_build_object('source', 'manual')
  );
  perform private.complete_idempotent_operation(
    'create_manual_resource',
    v_key,
    201,
    jsonb_build_object('resourceId', v_resource_id),
    v_resource_id
  );
  return v_resource_id;
end;
$$;

create or replace function public.update_resource_settings(p_input jsonb)
returns uuid
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_actor uuid := auth.uid();
  v_resource public.resources;
  v_category_id uuid := nullif(p_input->>'categoryId', '')::uuid;
  v_key text := p_input->>'idempotencyKey';
  v_existing private.idempotency_records;
begin
  if v_actor is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select *
  into v_resource
  from public.resources
  where id = (p_input->>'resourceId')::uuid
  for update;

  if not found then
    raise exception 'resource not found' using errcode = 'P0002';
  end if;
  if v_resource.owner_profile_id <> v_actor then
    raise exception 'only the owner may update a resource' using errcode = '42501';
  end if;
  if v_category_id is not null and not exists (
    select 1
    from public.categories c
    where c.id = v_category_id
      and c.is_active
      and c.default_risk_level in ('low', 'moderate')
  ) then
    raise exception 'unsupported resource category' using errcode = '42501';
  end if;

  v_existing := private.begin_idempotent_operation(
    'update_resource_settings',
    v_key,
    encode(extensions.digest(p_input::text, 'sha256'), 'hex')
  );
  if v_existing.completed_at is not null then
    return v_existing.resource_id;
  end if;

  update public.resources
  set title = left(trim(p_input->>'title'), 100),
      description = left(coalesce(trim(p_input->>'description'), ''), 800),
      category_id = coalesce(v_category_id, category_id),
      visibility = (p_input->>'visibility')::public.resource_visibility,
      willingness = (p_input->>'willingness')::public.resource_willingness,
      status = (p_input->>'status')::public.resource_status,
      usual_terms = left(
        nullif(trim(coalesce(p_input->>'usualTerms', '')), ''),
        800
      ),
      last_confirmed_at = timezone('utc', now())
  where id = v_resource.id;

  perform private.record_audit(
    v_resource.circle_id,
    v_actor,
    'resource.updated',
    'resource',
    v_resource.id,
    jsonb_build_object(
      'visibility', p_input->>'visibility',
      'status', p_input->>'status'
    )
  );
  perform private.complete_idempotent_operation(
    'update_resource_settings',
    v_key,
    200,
    jsonb_build_object('resourceId', v_resource.id),
    v_resource.id
  );
  return v_resource.id;
end;
$$;

create or replace function public.revoke_circle_invite(p_input jsonb)
returns uuid
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_actor uuid := auth.uid();
  v_invite public.circle_invites;
  v_key text := p_input->>'idempotencyKey';
  v_existing private.idempotency_records;
begin
  select *
  into v_invite
  from public.circle_invites
  where id = (p_input->>'inviteId')::uuid
  for update;

  if not found then
    raise exception 'invite not found' using errcode = 'P0002';
  end if;
  if not public.can_moderate_circle(v_invite.circle_id, v_actor) then
    raise exception 'moderator access required' using errcode = '42501';
  end if;

  v_existing := private.begin_idempotent_operation(
    'revoke_circle_invite',
    v_key,
    encode(extensions.digest(p_input::text, 'sha256'), 'hex')
  );
  if v_existing.completed_at is not null then
    return v_existing.resource_id;
  end if;

  update public.circle_invites
  set status = 'revoked'
  where id = v_invite.id
    and status = 'active';

  perform private.record_audit(
    v_invite.circle_id,
    v_actor,
    'invite.revoked',
    'circle_invite',
    v_invite.id,
    '{}'::jsonb
  );
  perform private.complete_idempotent_operation(
    'revoke_circle_invite',
    v_key,
    200,
    jsonb_build_object('inviteId', v_invite.id),
    v_invite.id
  );
  return v_invite.id;
end;
$$;

create or replace function public.change_membership_role(p_input jsonb)
returns uuid
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_actor uuid := auth.uid();
  v_membership public.circle_memberships;
  v_role public.membership_role :=
    (p_input->>'role')::public.membership_role;
  v_key text := p_input->>'idempotencyKey';
  v_existing private.idempotency_records;
begin
  select *
  into v_membership
  from public.circle_memberships
  where id = (p_input->>'membershipId')::uuid
  for update;

  if not found then
    raise exception 'membership not found' using errcode = 'P0002';
  end if;
  if v_membership.profile_id = v_actor then
    raise exception 'administrators cannot change their own role' using errcode = '42501';
  end if;
  if not exists (
    select 1
    from public.circle_memberships m
    where m.circle_id = v_membership.circle_id
      and m.profile_id = v_actor
      and m.status = 'active'
      and m.role = 'circle_admin'
  ) then
    raise exception 'Circle administrator access required' using errcode = '42501';
  end if;
  if v_membership.status <> 'active' then
    raise exception 'activate the member before changing their role' using errcode = '22023';
  end if;

  v_existing := private.begin_idempotent_operation(
    'change_membership_role',
    v_key,
    encode(extensions.digest(p_input::text, 'sha256'), 'hex')
  );
  if v_existing.completed_at is not null then
    return v_existing.resource_id;
  end if;

  update public.circle_memberships
  set role = v_role
  where id = v_membership.id;

  perform private.record_audit(
    v_membership.circle_id,
    v_actor,
    'membership.role_changed',
    'circle_membership',
    v_membership.id,
    jsonb_build_object(
      'target_profile_id', v_membership.profile_id,
      'from_role', v_membership.role,
      'to_role', v_role
    )
  );
  perform private.record_outbox(
    'membership',
    v_membership.id,
    'membership.role_changed',
    jsonb_build_object(
      'membership_id', v_membership.id,
      'profile_id', v_membership.profile_id,
      'circle_id', v_membership.circle_id,
      'role', v_role
    )
  );
  perform private.complete_idempotent_operation(
    'change_membership_role',
    v_key,
    200,
    jsonb_build_object('membershipId', v_membership.id),
    v_membership.id
  );
  return v_membership.id;
end;
$$;

create or replace function public.bootstrap_paseos_pilot(p_profile_id uuid)
returns uuid
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_circle_id uuid;
begin
  if coalesce(auth.role(), '') <> 'service_role'
     and current_user <> 'postgres' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles p where p.id = p_profile_id) then
    raise exception 'profile not found' using errcode = 'P0002';
  end if;

  select id
  into v_circle_id
  from public.circles
  where slug = 'paseos-boca-raton'
  for update;

  if v_circle_id is null then
    insert into public.circles(
      name,
      slug,
      description,
      join_policy,
      general_area,
      settings,
      created_by
    )
    values (
      'Paseos Community Sharing',
      'paseos-boca-raton',
      'A private, neighbor-built place for Paseos residents to ask, share, and keep handoffs easy.',
      'invite_only',
      'Paseos · Boca Raton, Florida',
      jsonb_build_object(
        'pilot', true,
        'official_hoa_service', false,
        'attribution', 'Made with neighborly love by Bruce'
      ),
      p_profile_id
    )
    returning id into v_circle_id;
  end if;

  insert into public.circle_memberships(
    circle_id,
    profile_id,
    role,
    status,
    joined_at
  )
  values (
    v_circle_id,
    p_profile_id,
    'circle_admin',
    'active',
    timezone('utc', now())
  )
  on conflict (circle_id, profile_id) do update
  set role = 'circle_admin',
      status = 'active',
      joined_at = coalesce(
        public.circle_memberships.joined_at,
        timezone('utc', now())
      ),
      restricted_at = null,
      suspended_at = null;

  perform private.record_audit(
    v_circle_id,
    p_profile_id,
    'pilot.admin_bootstrapped',
    'circle',
    v_circle_id,
    jsonb_build_object('pilot_slug', 'paseos-boca-raton')
  );
  return v_circle_id;
end;
$$;

create or replace function public.provision_circle(p_input jsonb)
returns uuid
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_admin_profile_id uuid := (p_input->>'adminProfileId')::uuid;
  v_circle_id uuid := gen_random_uuid();
  v_slug text := lower(trim(p_input->>'slug'));
begin
  if coalesce(auth.role(), '') <> 'service_role'
     and current_user <> 'postgres' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if not exists (
    select 1
    from public.profiles p
    where p.id = v_admin_profile_id
      and p.status = 'active'
  ) then
    raise exception 'active administrator profile required' using errcode = 'P0002';
  end if;
  if v_slug !~ '^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$' then
    raise exception 'invalid Circle slug' using errcode = '22023';
  end if;

  insert into public.circles(
    id,
    name,
    slug,
    description,
    join_policy,
    general_area,
    settings,
    created_by
  )
  values (
    v_circle_id,
    left(trim(p_input->>'name'), 100),
    v_slug,
    left(coalesce(trim(p_input->>'description'), ''), 1200),
    coalesce(nullif(p_input->>'joinPolicy', ''), 'invite_only'),
    left(trim(p_input->>'generalArea'), 100),
    coalesce(p_input->'settings', '{}'::jsonb),
    v_admin_profile_id
  );

  insert into public.circle_memberships(
    circle_id,
    profile_id,
    role,
    status,
    joined_at
  )
  values (
    v_circle_id,
    v_admin_profile_id,
    'circle_admin',
    'active',
    timezone('utc', now())
  );

  perform private.record_audit(
    v_circle_id,
    v_admin_profile_id,
    'circle.provisioned',
    'circle',
    v_circle_id,
    jsonb_build_object('source', 'operator_approval')
  );
  perform private.record_outbox(
    'circle',
    v_circle_id,
    'circle.provisioned',
    jsonb_build_object(
      'circle_id', v_circle_id,
      'administrator_profile_id', v_admin_profile_id
    )
  );
  return v_circle_id;
end;
$$;

revoke all on function public.create_manual_resource(jsonb) from public;
revoke all on function public.update_resource_settings(jsonb) from public;
revoke all on function public.revoke_circle_invite(jsonb) from public;
revoke all on function public.change_membership_role(jsonb) from public;
revoke all on function public.bootstrap_paseos_pilot(uuid) from public;
revoke all on function public.provision_circle(jsonb) from public;
revoke execute on function public.create_circle(jsonb) from authenticated;

grant execute on function public.create_manual_resource(jsonb) to authenticated;
grant execute on function public.update_resource_settings(jsonb) to authenticated;
grant execute on function public.revoke_circle_invite(jsonb) to authenticated;
grant execute on function public.change_membership_role(jsonb) to authenticated;
grant execute on function public.bootstrap_paseos_pilot(uuid) to service_role;
grant execute on function public.provision_circle(jsonb) to service_role;

commit;
