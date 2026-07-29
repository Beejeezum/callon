begin;

create schema tests;

create function tests.create_supabase_user(p_email text, p_user_id uuid)
returns void
language sql
security definer
set search_path = pg_catalog, auth
as $$
  insert into auth.users (
    id,
    aud,
    role,
    email,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  values (
    p_user_id,
    'authenticated',
    'authenticated',
    p_email,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );
$$;

create function tests.authenticate_as(p_email text)
returns void
language plpgsql
security definer
set search_path = pg_catalog, auth
as $$
declare
  v_user_id uuid;
begin
  select id into strict v_user_id from auth.users where email = p_email;
  perform set_config('request.jwt.claim.sub', v_user_id::text, true);
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', v_user_id, 'role', 'authenticated')::text,
    true
  );
end;
$$;

grant usage on schema tests to authenticated;
grant execute on function tests.authenticate_as(text) to authenticated;

select plan(21);

select tests.create_supabase_user(
  'paseos-admin@example.test',
  '81111111-1111-4111-8111-111111111111'
);
select tests.create_supabase_user(
  'paseos-member@example.test',
  '82222222-2222-4222-8222-222222222222'
);
select tests.create_supabase_user(
  'paseos-restricted@example.test',
  '83333333-3333-4333-8333-333333333333'
);
select tests.create_supabase_user(
  'other-admin@example.test',
  '84444444-4444-4444-8444-444444444444'
);

update public.profiles
set display_name = case id
  when '81111111-1111-4111-8111-111111111111' then 'Bruce Admin'
  when '82222222-2222-4222-8222-222222222222' then 'Paseos Member'
  when '83333333-3333-4333-8333-333333333333' then 'Restricted Member'
  else 'Other Admin'
end
where id in (
  '81111111-1111-4111-8111-111111111111',
  '82222222-2222-4222-8222-222222222222',
  '83333333-3333-4333-8333-333333333333',
  '84444444-4444-4444-8444-444444444444'
);

insert into public.circles(id, name, slug, general_area, created_by)
values
  (
    '8aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'Paseos Test',
    'paseos-test',
    'Boca Raton, Florida',
    '81111111-1111-4111-8111-111111111111'
  ),
  (
    '8bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'Other Circle',
    'other-circle-library-test',
    'Elsewhere',
    '84444444-4444-4444-8444-444444444444'
  );

insert into public.circle_memberships(
  id,
  circle_id,
  profile_id,
  status,
  role,
  joined_at
)
values
  (
    '81000000-0000-4000-8000-000000000001',
    '8aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '81111111-1111-4111-8111-111111111111',
    'active',
    'circle_admin',
    now()
  ),
  (
    '81000000-0000-4000-8000-000000000002',
    '8aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '82222222-2222-4222-8222-222222222222',
    'active',
    'member',
    now()
  ),
  (
    '81000000-0000-4000-8000-000000000003',
    '8aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '83333333-3333-4333-8333-333333333333',
    'restricted',
    'member',
    now()
  ),
  (
    '81000000-0000-4000-8000-000000000004',
    '8bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '84444444-4444-4444-8444-444444444444',
    'active',
    'circle_admin',
    now()
  );

create temporary table test_ids(
  name text primary key,
  id uuid not null
) on commit drop;
grant select, insert, update, delete on test_ids to authenticated;

set local role authenticated;
select tests.authenticate_as('paseos-member@example.test');

select lives_ok(
  $$ insert into test_ids(name, id)
     select
       'resource',
       public.create_manual_resource(jsonb_build_object(
         'circleId', '8aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
         'title', 'Six-foot folding table',
         'description', 'Clean and ready for neighborhood parties',
         'categoryId', (
           select id from public.categories where slug = 'tables-chairs'
         ),
         'visibility', 'circle',
         'willingness', 'happy_to_be_asked',
         'usualTerms', 'Please return it folded',
         'idempotencyKey', 'paseos-manual-resource-create'
       )) $$,
  'Active Paseos member can add a manual resource'
);
select is(
  public.create_manual_resource(jsonb_build_object(
    'circleId', '8aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'title', 'Six-foot folding table',
    'description', 'Clean and ready for neighborhood parties',
    'categoryId', (
      select id from public.categories where slug = 'tables-chairs'
    ),
    'visibility', 'circle',
    'willingness', 'happy_to_be_asked',
    'usualTerms', 'Please return it folded',
    'idempotencyKey', 'paseos-manual-resource-create'
  )),
  (select id from test_ids where name = 'resource'),
  'Manual resource creation is idempotent'
);
select throws_ok(
  $$ select public.create_manual_resource(jsonb_build_object(
       'circleId', '8aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       'title', 'Changed table',
       'visibility', 'circle',
       'willingness', 'happy_to_be_asked',
       'idempotencyKey', 'paseos-manual-resource-create'
     )) $$,
  '22000',
  null,
  'Changed payload cannot reuse a resource idempotency key'
);
select throws_ok(
  $$ select public.create_manual_resource(jsonb_build_object(
       'circleId', '8bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
       'title', 'Cross-Circle item',
       'visibility', 'circle',
       'willingness', 'happy_to_be_asked',
       'idempotencyKey', 'paseos-cross-circle-resource'
     )) $$,
  '42501',
  null,
  'Member cannot create a Resource in another Circle'
);

select tests.authenticate_as('paseos-restricted@example.test');
select throws_ok(
  $$ select public.create_manual_resource(jsonb_build_object(
       'circleId', '8aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       'title', 'Restricted item',
       'visibility', 'circle',
       'willingness', 'happy_to_be_asked',
       'idempotencyKey', 'paseos-restricted-resource'
     )) $$,
  '42501',
  null,
  'Restricted member cannot add new inventory'
);

select tests.authenticate_as('paseos-admin@example.test');
select results_eq(
  $$ select count(*)::bigint from public.resources
     where id = (select id from test_ids where name = 'resource') $$,
  array[1::bigint],
  'Paseos member can browse a Circle-visible Resource'
);

select tests.authenticate_as('other-admin@example.test');
select results_eq(
  $$ select count(*)::bigint from public.resources
     where id = (select id from test_ids where name = 'resource') $$,
  array[0::bigint],
  'Other Circle cannot browse Paseos inventory'
);
select throws_ok(
  $$ select public.update_resource_settings(jsonb_build_object(
       'resourceId', (select id from test_ids where name = 'resource'),
       'title', 'Tampered table',
       'description', '',
       'visibility', 'circle',
       'willingness', 'happy_to_be_asked',
       'status', 'active',
       'idempotencyKey', 'paseos-nonowner-resource-update'
     )) $$,
  '42501',
  null,
  'Non-owner cannot update a Paseos Resource'
);

select tests.authenticate_as('paseos-member@example.test');
select is(
  public.update_resource_settings(jsonb_build_object(
    'resourceId', (select id from test_ids where name = 'resource'),
    'title', 'Two folding tables',
    'description', 'Now two tables',
    'visibility', 'match_only',
    'willingness', 'weekends',
    'usualTerms', 'Please return both folded',
    'status', 'active',
    'idempotencyKey', 'paseos-owner-resource-update'
  )),
  (select id from test_ids where name = 'resource'),
  'Owner can change their own sharing preference'
);
select is(
  (
    select visibility::text
    from public.resources
    where id = (select id from test_ids where name = 'resource')
  ),
  'match_only',
  'Resource visibility update is persisted'
);

select tests.authenticate_as('paseos-admin@example.test');
select is(
  public.change_membership_role(jsonb_build_object(
    'membershipId', '81000000-0000-4000-8000-000000000002',
    'role', 'moderator',
    'idempotencyKey', 'paseos-member-role-change'
  )),
  '81000000-0000-4000-8000-000000000002'::uuid,
  'Paseos admin can appoint a moderator'
);
select is(
  (
    select role::text
    from public.circle_memberships
    where id = '81000000-0000-4000-8000-000000000002'
  ),
  'moderator',
  'Role change is persisted'
);
select throws_ok(
  $$ select public.change_membership_role(jsonb_build_object(
       'membershipId', '81000000-0000-4000-8000-000000000001',
       'role', 'member',
       'idempotencyKey', 'paseos-admin-self-demotion'
     )) $$,
  '42501',
  null,
  'Administrator cannot change their own role'
);

select tests.authenticate_as('paseos-member@example.test');
select throws_ok(
  $$ select public.change_membership_role(jsonb_build_object(
       'membershipId', '81000000-0000-4000-8000-000000000003',
       'role', 'circle_admin',
       'idempotencyKey', 'paseos-moderator-escalation'
     )) $$,
  '42501',
  null,
  'Moderator cannot grant administrator access'
);

select tests.authenticate_as('paseos-admin@example.test');
insert into test_ids(name, id)
values (
  'launch_invite',
  public.create_circle_invite(jsonb_build_object(
    'circleId', '8aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'tokenHash', repeat('e', 64),
    'maxUses', 250,
    'expiresAt', now() + interval '30 days',
    'idempotencyKey', 'paseos-launch-invite-create'
  ))
);
select is(
  public.get_circle_invite_preview(repeat('e', 64))->>'circleName',
  'Paseos Test',
  'Active Paseos launch link exposes a safe preview'
);
select is(
  public.revoke_circle_invite(jsonb_build_object(
    'inviteId', (select id from test_ids where name = 'launch_invite'),
    'idempotencyKey', 'paseos-launch-invite-revoke'
  )),
  (select id from test_ids where name = 'launch_invite'),
  'Paseos administrator can revoke a launch link'
);
select is(
  public.get_circle_invite_preview(repeat('e', 64)),
  null,
  'Revoked Paseos link fails closed'
);

select tests.authenticate_as('paseos-member@example.test');
select throws_ok(
  $$ select public.bootstrap_paseos_pilot(
       '82222222-2222-4222-8222-222222222222'
     ) $$,
  '42501',
  null,
  'Authenticated browser role cannot call operator-only pilot bootstrap'
);

reset role;
select ok(
  not has_function_privilege(
    'authenticated',
    'public.create_circle(jsonb)',
    'execute'
  ),
  'Ordinary authenticated users cannot self-provision a new Circle'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.provision_circle(jsonb)',
    'execute'
  ),
  'Operator service role can provision an approved Circle'
);
select results_eq(
  $$ select count(*)::bigint
     from private.audit_events
     where action in (
       'resource.created',
       'resource.updated',
       'membership.role_changed',
       'invite.revoked'
     ) $$,
  array[4::bigint],
  'New sensitive pilot actions leave audit records'
);

select * from finish();
rollback;
