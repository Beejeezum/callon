begin;

-- Keep the test suite self-contained. The original handoff referenced the
-- optional Basejump helper package without installing it, which made a clean
-- `supabase test db` fail before exercising any policy. These small helpers
-- provide only the identity behavior this suite needs.
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
  select id into strict v_user_id
  from auth.users
  where email = p_email;

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

select plan(18);

-- Test identities are intentionally synthetic and are created before switching
-- into authenticated request contexts.
select tests.create_supabase_user('alice@example.test', '11111111-1111-4111-8111-111111111111');
select tests.create_supabase_user('bob@example.test', '22222222-2222-4222-8222-222222222222');
select tests.create_supabase_user('mallory@example.test', '33333333-3333-4333-8333-333333333333');
select tests.create_supabase_user('grace@example.test', '44444444-4444-4444-8444-444444444444');
select tests.create_supabase_user('rita@example.test', '55555555-5555-4555-8555-555555555555');

insert into public.profiles(id, display_name) values
 ('11111111-1111-4111-8111-111111111111','Alice'),
 ('22222222-2222-4222-8222-222222222222','Bob'),
 ('33333333-3333-4333-8333-333333333333','Mallory'),
 ('44444444-4444-4444-8444-444444444444','Grace'),
 ('55555555-5555-4555-8555-555555555555','Rita')
on conflict (id) do update set display_name = excluded.display_name;

insert into public.circles(id,name,slug,general_area,created_by) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Circle A','circle-a','Area A','11111111-1111-4111-8111-111111111111'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Circle B','circle-b','Area B','33333333-3333-4333-8333-333333333333');

insert into public.circle_memberships(circle_id,profile_id,status,role,joined_at) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','active','circle_admin',now()),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','22222222-2222-4222-8222-222222222222','active','member',now()),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','55555555-5555-4555-8555-555555555555','restricted','member',now()),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','33333333-3333-4333-8333-333333333333','active','circle_admin',now()),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','44444444-4444-4444-8444-444444444444','pending','member',null);

insert into public.asks(id,circle_id,created_by,title,general_location,needed_by,expires_at,status) values
 ('a1000000-0000-4000-8000-000000000001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','Need a table','Clubhouse',now()+interval '1 day',now()+interval '3 days','open'),
 ('b1000000-0000-4000-8000-000000000001','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','33333333-3333-4333-8333-333333333333','Need a cooler','North side',now()+interval '1 day',now()+interval '3 days','open');

insert into public.ask_needs(id,circle_id,ask_id,kind,title,quantity_requested,status) values
 ('a2000000-0000-4000-8000-000000000001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','a1000000-0000-4000-8000-000000000001','lend','Folding table',1,'open'),
 ('b2000000-0000-4000-8000-000000000001','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','b1000000-0000-4000-8000-000000000001','lend','Large cooler',1,'open');

insert into private.share_links(id,ask_id,circle_id,token_hash,expires_at,created_by) values
 ('a3000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','test-token-hash-a',now()+interval '1 day','11111111-1111-4111-8111-111111111111');

insert into private.ask_guest_grants(ask_id,circle_id,profile_id,share_link_id,expires_at) values
 ('a1000000-0000-4000-8000-000000000001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','44444444-4444-4444-8444-444444444444','a3000000-0000-4000-8000-000000000001',now()+interval '1 day');

select throws_ok(
  $$ insert into public.ask_needs(circle_id,ask_id,kind,title) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','a1000000-0000-4000-8000-000000000001','lend','Cross tenant row') $$,
  '23503', null, 'Tenant-consistency foreign key rejects a Need with the wrong Circle'
);

set local role authenticated;

select tests.authenticate_as('alice@example.test');
select results_eq('select count(*)::bigint from public.asks', array[1::bigint], 'Alice sees only Circle A asks');
select is((select title from public.asks limit 1), 'Need a table', 'Alice sees her Circle Ask');

select tests.authenticate_as('mallory@example.test');
select results_eq('select count(*)::bigint from public.asks', array[1::bigint], 'Mallory sees only Circle B asks');
select is((select title from public.asks limit 1), 'Need a cooler', 'Mallory cannot see Circle A');

select tests.authenticate_as('bob@example.test');
select ok(public.is_active_circle_member('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'), 'Bob is an active Circle A member');
select isnt(public.is_active_circle_member('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'), true, 'Bob is not an active Circle B member');
select ok(public.can_read_circle('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'), 'Bob can read Circle A');
select throws_ok(
  $$ update public.asks set title='tampered' where id='b1000000-0000-4000-8000-000000000001' $$,
  '42501', null, 'Bob has no direct UPDATE privilege on authoritative Ask rows'
);
select results_eq(
  $$ select count(*)::bigint from public.profiles where id='33333333-3333-4333-8333-333333333333' $$,
  array[0::bigint], 'Bob cannot browse an unrelated Circle profile'
);

select tests.authenticate_as('alice@example.test');
select ok(public.can_moderate_circle('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'), 'Circle admin can moderate own Circle');
select isnt(public.can_moderate_circle('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'), true, 'Circle admin cannot moderate another Circle');

select tests.authenticate_as('rita@example.test');
select ok(public.can_read_circle('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'), 'Restricted member can read existing Circle obligations');
select isnt(public.is_active_circle_member('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'), true, 'Restricted member cannot create new activity');
select isnt(public.is_circle_contributor('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'), true, 'Restricted member cannot make new general offers');

select tests.authenticate_as('grace@example.test');
select ok(public.can_submit_offer_on_ask('a1000000-0000-4000-8000-000000000001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'), 'Scoped guest can offer on the shared Ask');
select isnt(public.can_submit_offer_on_ask('b1000000-0000-4000-8000-000000000001','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'), true, 'Scoped guest cannot offer on another Ask');
select isnt(public.is_circle_contributor('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'), true, 'Pending membership alone does not grant contribution access');

select * from finish();
rollback;
