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

select plan(30);

select tests.create_supabase_user('requester@example.test', '61111111-1111-4111-8111-111111111111');
select tests.create_supabase_user('lender@example.test', '62222222-2222-4222-8222-222222222222');
select tests.create_supabase_user('other@example.test', '63333333-3333-4333-8333-333333333333');

update public.profiles
set display_name = case id
  when '61111111-1111-4111-8111-111111111111' then 'Requester'
  when '62222222-2222-4222-8222-222222222222' then 'Lender'
  else 'Other'
end
where id in (
  '61111111-1111-4111-8111-111111111111',
  '62222222-2222-4222-8222-222222222222',
  '63333333-3333-4333-8333-333333333333'
);

insert into public.circles(id, name, slug, general_area, created_by)
values (
  '6aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'Command Test Circle',
  'command-test-circle',
  'Test area',
  '61111111-1111-4111-8111-111111111111'
);

insert into public.circle_memberships(circle_id, profile_id, status, role, joined_at)
values
  ('6aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '61111111-1111-4111-8111-111111111111', 'active', 'circle_admin', now()),
  ('6aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '62222222-2222-4222-8222-222222222222', 'active', 'member', now()),
  ('6aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '63333333-3333-4333-8333-333333333333', 'active', 'member', now());

create temporary table test_payloads (
  name text primary key,
  payload jsonb not null
) on commit drop;

create temporary table test_ids (
  name text primary key,
  id uuid not null
) on commit drop;

grant select, insert, update, delete on test_payloads, test_ids to authenticated;

insert into test_payloads(name, payload)
values (
  'create_ask',
  jsonb_build_object(
    'circleId', '6aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'title', 'Need one folding table',
    'description', 'For a neighborhood gathering',
    'generalLocation', 'Clubhouse',
    'neededBy', '2026-08-01T14:00:00Z',
    'startsAt', '2026-08-01T12:00:00Z',
    'idempotencyKey', 'create-command-test',
    'needs', jsonb_build_array(
      jsonb_build_object(
        'kind', 'lend',
        'title', 'Folding table',
        'description', 'Any ordinary folding table',
        'quantityRequested', 1,
        'unit', 'table',
        'riskLevel', 'low'
      )
    )
  )
);

set local role authenticated;
select tests.authenticate_as('requester@example.test');

select lives_ok(
  $$ insert into test_ids(name, id)
     select 'ask', public.create_ask(payload)
     from test_payloads where name = 'create_ask' $$,
  'Requester can create an Ask through the audited command'
);
select is(
  (select status::text from public.asks where id = (select id from test_ids where name = 'ask')),
  'draft',
  'New Ask starts as a draft'
);
select results_eq(
  $$ select count(*)::bigint from public.ask_needs where ask_id = (select id from test_ids where name = 'ask') $$,
  array[1::bigint],
  'Create Ask writes its Need in the same transaction'
);
select is(
  public.create_ask((select payload from test_payloads where name = 'create_ask')),
  (select id from test_ids where name = 'ask'),
  'Replaying Create Ask with the same key returns the original Ask'
);
select throws_ok(
  $$ select public.create_ask(
       (select payload || '{"title":"Changed request"}'::jsonb from test_payloads where name = 'create_ask')
     ) $$,
  '22000',
  null,
  'Reusing an idempotency key for a changed Create Ask is rejected'
);
select is(
  public.publish_ask((select id from test_ids where name = 'ask'), 'publish-command-test'),
  (select id from test_ids where name = 'ask'),
  'Requester can publish the draft Ask'
);
select is(
  (select status::text from public.asks where id = (select id from test_ids where name = 'ask')),
  'open',
  'Publish changes Ask state to open'
);

select tests.authenticate_as('lender@example.test');
insert into test_payloads(name, payload)
select
  'lender_offer',
  jsonb_build_object(
    'askId', a.id,
    'needId', n.id,
    'offerType', 'lend',
    'freeformItemName', 'Six-foot folding table',
    'description', 'Clean and ready for pickup',
    'quantity', 1,
    'conditions', 'Return Sunday',
    'idempotencyKey', 'lender-offer-command-test'
  )
from public.asks a
join public.ask_needs n on n.ask_id = a.id
where a.id = (select id from test_ids where name = 'ask');

select lives_ok(
  $$ insert into test_ids(name, id)
     select 'lender_offer', public.submit_offer(payload)
     from test_payloads where name = 'lender_offer' $$,
  'Active member can submit an unlisted-item Offer'
);
select is(
  public.submit_offer((select payload from test_payloads where name = 'lender_offer')),
  (select id from test_ids where name = 'lender_offer'),
  'Replaying Submit Offer with the same key returns the original Offer'
);
select throws_ok(
  $$ select public.submit_offer(
       (select payload || '{"quantity":2}'::jsonb from test_payloads where name = 'lender_offer')
     ) $$,
  '22000',
  null,
  'Reusing an idempotency key for a changed Offer is rejected'
);

select tests.authenticate_as('other@example.test');
insert into test_payloads(name, payload)
select
  'other_offer',
  jsonb_build_object(
    'askId', a.id,
    'needId', n.id,
    'offerType', 'lend',
    'freeformItemName', 'Backup folding table',
    'description', 'Available if still needed',
    'quantity', 1,
    'idempotencyKey', 'other-offer-command-test'
  )
from public.asks a
join public.ask_needs n on n.ask_id = a.id
where a.id = (select id from test_ids where name = 'ask');

select lives_ok(
  $$ insert into test_ids(name, id)
     select 'other_offer', public.submit_offer(payload)
     from test_payloads where name = 'other_offer' $$,
  'A second member can Offer before the Need is covered'
);

select tests.authenticate_as('requester@example.test');
select throws_ok(
  $$ select public.submit_offer(
       (select payload || '{"idempotencyKey":"owner-self-offer"}'::jsonb from test_payloads where name = 'lender_offer')
     ) $$,
  '22023',
  null,
  'Requester cannot Offer on their own Ask'
);

insert into test_payloads(name, payload)
select
  'accept_lender',
  jsonb_build_object(
    'offerId', id,
    'startsAt', '2026-08-01T12:00:00Z',
    'dueAt', '2026-08-02T18:00:00Z',
    'idempotencyKey', 'accept-lender-command-test'
  )
from test_ids
where name = 'lender_offer';

select lives_ok(
  $$ insert into test_ids(name, id)
     select 'commitment', public.accept_offer(payload)
     from test_payloads where name = 'accept_lender' $$,
  'Requester can accept an available Offer'
);
select is(
  public.accept_offer((select payload from test_payloads where name = 'accept_lender')),
  (select id from test_ids where name = 'commitment'),
  'Replaying Accept Offer returns the original Commitment'
);
select results_eq(
  $$ select count(*)::bigint from public.loans where commitment_id = (select id from test_ids where name = 'commitment') $$,
  array[1::bigint],
  'Accepting a lending Offer creates exactly one Loan'
);
select is(
  (select status::text from public.ask_needs where ask_id = (select id from test_ids where name = 'ask')),
  'covered',
  'Accepted quantity covers the Need'
);
select throws_ok(
  $$ select public.accept_offer(
       jsonb_build_object(
         'offerId', (select id from test_ids where name = 'other_offer'),
         'dueAt', '2026-08-02T18:00:00Z',
         'idempotencyKey', 'accept-over-capacity-command-test'
       )
     ) $$,
  '22023',
  null,
  'A competing Offer cannot over-commit a covered Need'
);

insert into test_ids(name, id)
select 'loan', id
from public.loans
where commitment_id = (select id from test_ids where name = 'commitment');

select results_eq(
  $$ select count(*)::bigint from public.conversations where id = (
       select conversation_id from public.commitments where id = (select id from test_ids where name = 'commitment')
     ) $$,
  array[1::bigint],
  'Requester can read the accepted Offer conversation'
);

select tests.authenticate_as('other@example.test');
select results_eq(
  $$ select count(*)::bigint from public.conversations where id = (
       select conversation_id from public.commitments where id = (select id from test_ids where name = 'commitment')
     ) $$,
  array[0::bigint],
  'Unrelated member cannot read private coordination'
);
select throws_ok(
  $$ select public.transition_loan(
       jsonb_build_object(
         'loanId', (select id from test_ids where name = 'loan'),
         'action', 'confirm_handoff',
         'idempotencyKey', 'other-handoff-command-test'
       )
     ) $$,
  '42501',
  null,
  'Unrelated member cannot transition the Loan'
);

select tests.authenticate_as('requester@example.test');
insert into test_payloads(name, payload)
select
  'confirm_handoff',
  jsonb_build_object(
    'loanId', id,
    'action', 'confirm_handoff',
    'idempotencyKey', 'confirm-handoff-command-test'
  )
from test_ids
where name = 'loan';

select is(
  public.transition_loan((select payload from test_payloads where name = 'confirm_handoff')),
  (select id from test_ids where name = 'loan'),
  'Borrower can confirm handoff'
);
select is(
  public.transition_loan((select payload from test_payloads where name = 'confirm_handoff')),
  (select id from test_ids where name = 'loan'),
  'Replaying a Loan transition with the same key is idempotent'
);
select is(
  (select status::text from public.loans where id = (select id from test_ids where name = 'loan')),
  'checked_out',
  'Handoff moves Loan to checked out'
);
select is(
  public.transition_loan(
    jsonb_build_object(
      'loanId', (select id from test_ids where name = 'loan'),
      'action', 'mark_returned',
      'idempotencyKey', 'mark-returned-command-test'
    )
  ),
  (select id from test_ids where name = 'loan'),
  'Borrower can mark the item returned'
);

select tests.authenticate_as('lender@example.test');
select is(
  public.transition_loan(
    jsonb_build_object(
      'loanId', (select id from test_ids where name = 'loan'),
      'action', 'confirm_return',
      'idempotencyKey', 'confirm-return-command-test'
    )
  ),
  (select id from test_ids where name = 'loan'),
  'Lender can confirm return'
);
select is(
  (select status::text from public.loans where id = (select id from test_ids where name = 'loan')),
  'returned',
  'Confirmed return closes the Loan'
);
select is(
  (select status::text from public.commitments where id = (select id from test_ids where name = 'commitment')),
  'fulfilled',
  'Confirmed return fulfills the Commitment'
);
select is(
  (select status::text from public.ask_needs where ask_id = (select id from test_ids where name = 'ask')),
  'completed',
  'Confirmed return completes the Need'
);
select is(
  (select status::text from public.asks where id = (select id from test_ids where name = 'ask')),
  'completed',
  'Completing the final Need closes the Ask and its share lifecycle'
);
select isnt(
  has_schema_privilege('authenticated', 'private', 'usage'),
  true,
  'Authenticated clients cannot access the private schema'
);

select * from finish();
rollback;
