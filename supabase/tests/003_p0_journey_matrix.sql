begin;

create schema tests;

create function tests.create_supabase_user(p_email text, p_user_id uuid)
returns void
language sql
security definer
set search_path = pg_catalog, auth
as $$
  insert into auth.users (
    id, aud, role, email, email_confirmed_at, raw_app_meta_data,
    raw_user_meta_data, created_at, updated_at
  ) values (
    p_user_id, 'authenticated', 'authenticated', p_email, now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb, now(), now()
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

select plan(40);

select tests.create_supabase_user('requester-journey@example.test', '71111111-1111-4111-8111-111111111111');
select tests.create_supabase_user('lender-journey@example.test', '72222222-2222-4222-8222-222222222222');
select tests.create_supabase_user('outsider-journey@example.test', '73333333-3333-4333-8333-333333333333');
select tests.create_supabase_user('invitee-journey@example.test', '74444444-4444-4444-8444-444444444444');

update public.profiles
set display_name = case id
  when '71111111-1111-4111-8111-111111111111' then 'Requesting Neighbor'
  when '72222222-2222-4222-8222-222222222222' then 'Lending Neighbor'
  when '73333333-3333-4333-8333-333333333333' then 'Unrelated Neighbor'
  else 'Invited Neighbor'
end
where id in (
  '71111111-1111-4111-8111-111111111111',
  '72222222-2222-4222-8222-222222222222',
  '73333333-3333-4333-8333-333333333333',
  '74444444-4444-4444-8444-444444444444'
);

insert into public.circles(id, name, slug, general_area, created_by) values
  ('7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Journey Circle', 'journey-circle', 'General test area', '71111111-1111-4111-8111-111111111111'),
  ('7bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Other Journey Circle', 'other-journey-circle', 'Other area', '73333333-3333-4333-8333-333333333333');

insert into public.circle_memberships(id, circle_id, profile_id, status, role, joined_at) values
  ('70000000-0000-4000-8000-000000000001', '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '71111111-1111-4111-8111-111111111111', 'active', 'circle_admin', now()),
  ('70000000-0000-4000-8000-000000000002', '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '72222222-2222-4222-8222-222222222222', 'active', 'member', now()),
  ('70000000-0000-4000-8000-000000000003', '7bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '73333333-3333-4333-8333-333333333333', 'active', 'circle_admin', now());

insert into public.asks(
  id, circle_id, created_by, title, description, general_location,
  needed_by, expires_at, status, published_at
) values
  ('71000000-0000-4000-8000-000000000001', '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '71111111-1111-4111-8111-111111111111', 'Need a folding table', 'For a small gathering', 'Clubhouse area', now() + interval '2 days', now() + interval '5 days', 'open', now()),
  ('71000000-0000-4000-8000-000000000002', '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '71111111-1111-4111-8111-111111111111', 'Need setup advice', 'A separate unshared Ask', 'General area', now() + interval '3 days', now() + interval '6 days', 'open', now()),
  ('71000000-0000-4000-8000-000000000003', '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '71111111-1111-4111-8111-111111111111', 'Need one helper', 'Non-item help', 'Clubhouse area', now() + interval '2 days', now() + interval '5 days', 'partially_fulfilled', now());

insert into public.ask_needs(
  id, circle_id, ask_id, kind, title, quantity_requested,
  quantity_committed, status, risk_level
) values
  ('72000000-0000-4000-8000-000000000001', '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '71000000-0000-4000-8000-000000000001', 'lend', 'Folding table', 2, 1, 'partially_covered', 'low'),
  ('72000000-0000-4000-8000-000000000002', '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '71000000-0000-4000-8000-000000000002', 'advice', 'Setup advice', 1, 0, 'open', 'low'),
  ('72000000-0000-4000-8000-000000000003', '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '71000000-0000-4000-8000-000000000003', 'help', 'Setup helper', 1, 1, 'covered', 'low');

insert into public.offers(
  id, circle_id, ask_id, need_id, contributor_profile_id, offer_type,
  freeform_item_name, description, quantity, status
) values
  ('73000000-0000-4000-8000-000000000001', '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '71000000-0000-4000-8000-000000000001', '72000000-0000-4000-8000-000000000001', '72222222-2222-4222-8222-222222222222', 'lend', 'Six-foot folding table', 'Clean table ready for pickup', 1, 'accepted'),
  ('73000000-0000-4000-8000-000000000003', '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '71000000-0000-4000-8000-000000000003', '72000000-0000-4000-8000-000000000003', '72222222-2222-4222-8222-222222222222', 'help', null, 'Can help set up', 1, 'accepted');

insert into public.conversations(id, circle_id) values
  ('74000000-0000-4000-8000-000000000001', '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('74000000-0000-4000-8000-000000000003', '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');

insert into public.commitments(
  id, circle_id, ask_id, need_id, offer_id, requester_profile_id,
  contributor_profile_id, contribution_type, quantity, summary_snapshot,
  terms_version, status, starts_at, due_at, conversation_id
) values
  ('75000000-0000-4000-8000-000000000001', '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '71000000-0000-4000-8000-000000000001', '72000000-0000-4000-8000-000000000001', '73000000-0000-4000-8000-000000000001', '71111111-1111-4111-8111-111111111111', '72222222-2222-4222-8222-222222222222', 'lend', 1, '{"itemName":"Six-foot folding table"}', 'pilot-v1', 'active', now(), now() + interval '2 days', '74000000-0000-4000-8000-000000000001'),
  ('75000000-0000-4000-8000-000000000003', '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '71000000-0000-4000-8000-000000000003', '72000000-0000-4000-8000-000000000003', '73000000-0000-4000-8000-000000000003', '71111111-1111-4111-8111-111111111111', '72222222-2222-4222-8222-222222222222', 'help', 1, '{"summary":"Setup help"}', 'pilot-v1', 'active', now(), null, '74000000-0000-4000-8000-000000000003');

insert into public.conversation_participants(conversation_id, profile_id, participant_role) values
  ('74000000-0000-4000-8000-000000000001', '71111111-1111-4111-8111-111111111111', 'requester'),
  ('74000000-0000-4000-8000-000000000001', '72222222-2222-4222-8222-222222222222', 'contributor'),
  ('74000000-0000-4000-8000-000000000003', '71111111-1111-4111-8111-111111111111', 'requester'),
  ('74000000-0000-4000-8000-000000000003', '72222222-2222-4222-8222-222222222222', 'contributor');

insert into public.loans(
  id, circle_id, commitment_id, lender_profile_id, borrower_profile_id,
  status, due_at, checked_out_at
) values (
  '76000000-0000-4000-8000-000000000001',
  '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '75000000-0000-4000-8000-000000000001',
  '72222222-2222-4222-8222-222222222222',
  '71111111-1111-4111-8111-111111111111',
  'checked_out',
  now() + interval '2 days',
  now()
);

insert into private.share_links(
  id, ask_id, circle_id, token_hash, expires_at, revoked_at, created_by
) values
  ('77000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001', '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', repeat('b', 64), now() + interval '2 days', null, '71111111-1111-4111-8111-111111111111'),
  ('77000000-0000-4000-8000-000000000002', '71000000-0000-4000-8000-000000000002', '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', repeat('c', 64), now() - interval '1 hour', null, '71111111-1111-4111-8111-111111111111'),
  ('77000000-0000-4000-8000-000000000003', '71000000-0000-4000-8000-000000000002', '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', repeat('d', 64), now() + interval '2 days', now(), '71111111-1111-4111-8111-111111111111');

set local role authenticated;
select tests.authenticate_as('requester-journey@example.test');

select is(
  public.get_shared_ask(repeat('b', 64))->>'title',
  'Need a folding table',
  'Valid shared Ask returns the safe projection'
);
select isnt(
  public.get_shared_ask(repeat('b', 64)) ? 'exactLocation',
  true,
  'Shared Ask projection never includes exact location'
);
select is(public.get_shared_ask('not-a-valid-hash'), null, 'Malformed share token fails closed');
select is(public.get_shared_ask(repeat('c', 64)), null, 'Expired share token fails closed');
select is(public.get_shared_ask(repeat('d', 64)), null, 'Revoked share token fails closed');

create temporary table test_ids(name text primary key, id uuid not null) on commit drop;
grant select, insert, update, delete on test_ids to authenticated;

select lives_ok(
  $$ insert into test_ids(name, id)
     values (
       'invite',
       public.create_circle_invite(jsonb_build_object(
         'circleId', '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
         'tokenHash', repeat('a', 64),
         'expiresAt', now() + interval '2 days',
         'maxUses', 1,
         'idempotencyKey', 'journey-invite-create'
       ))
     ) $$,
  'Circle administrator can create a bounded invite'
);
select is(
  public.get_circle_invite_preview(repeat('a', 64))->>'circleName',
  'Journey Circle',
  'Invite preview exposes only Circle-level context'
);

select tests.authenticate_as('invitee-journey@example.test');
select lives_ok(
  $$ insert into test_ids(name, id)
     values (
       'membership',
       public.accept_circle_invite(jsonb_build_object(
         'tokenHash', repeat('a', 64),
         'idempotencyKey', 'journey-invite-accept'
       ))
     ) $$,
  'Verified invitee can accept an active invite'
);
select is(
  (select status::text from public.circle_memberships where id = (select id from test_ids where name = 'membership')),
  'active',
  'Invite acceptance creates active membership'
);
select is(
  public.accept_circle_invite(jsonb_build_object(
    'tokenHash', repeat('a', 64),
    'idempotencyKey', 'journey-invite-accept'
  )),
  (select id from test_ids where name = 'membership'),
  'Invite acceptance replay remains idempotent after exhaustion'
);
select is(public.get_circle_invite_preview(repeat('a', 64)), null, 'Exhausted invite no longer previews');

select tests.authenticate_as('outsider-journey@example.test');
select is(
  public.redeem_shared_ask(repeat('b', 64)),
  '71000000-0000-4000-8000-000000000001'::uuid,
  'Verified outsider can redeem only the shared Ask'
);
select ok(
  public.can_submit_offer_on_ask(
    '71000000-0000-4000-8000-000000000001',
    '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  ),
  'Scoped guest can contribute to the redeemed Ask'
);
select isnt(
  public.can_submit_offer_on_ask(
    '71000000-0000-4000-8000-000000000002',
    '7aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  ),
  true,
  'Scoped guest cannot contribute to an unshared Ask'
);
select results_eq(
  $$ select count(*)::bigint from public.offers where ask_id = '71000000-0000-4000-8000-000000000001' $$,
  array[0::bigint],
  'Scoped guest cannot inspect competing Offers'
);
select lives_ok(
  $$ insert into test_ids(name, id)
     values (
       'guest_offer',
       public.submit_offer(jsonb_build_object(
         'askId', '71000000-0000-4000-8000-000000000001',
         'needId', '72000000-0000-4000-8000-000000000001',
         'offerType', 'alternative',
         'description', 'I can offer a smaller side table',
         'quantity', 1,
         'idempotencyKey', 'journey-guest-offer'
       ))
     ) $$,
  'Scoped guest can submit a private Offer without joining the Circle'
);

select tests.authenticate_as('requester-journey@example.test');
select lives_ok(
  $$ insert into test_ids(name, id)
     values (
       'message',
       public.send_commitment_message(jsonb_build_object(
         'commitmentId', '75000000-0000-4000-8000-000000000001',
         'body', 'Pickup by the clubhouse entrance works.',
         'idempotencyKey', 'journey-private-message'
       ))
     ) $$,
  'Accepted party can send a private coordination message'
);

select tests.authenticate_as('lender-journey@example.test');
select results_eq(
  $$ select count(*)::bigint from public.messages where id = (select id from test_ids where name = 'message') $$,
  array[1::bigint],
  'Other accepted party can read the private message'
);

select tests.authenticate_as('outsider-journey@example.test');
select results_eq(
  $$ select count(*)::bigint from public.messages where id = (select id from test_ids where name = 'message') $$,
  array[0::bigint],
  'Unrelated member cannot read private coordination'
);
select throws_ok(
  $$ select public.send_commitment_message(jsonb_build_object(
       'commitmentId', '75000000-0000-4000-8000-000000000001',
       'body', 'I should not be able to send this.',
       'idempotencyKey', 'journey-outsider-message'
     )) $$,
  '42501',
  null,
  'Unrelated member cannot send private coordination'
);

select tests.authenticate_as('lender-journey@example.test');
select lives_ok(
  $$ insert into test_ids(name, id)
     values (
       'location',
       public.set_commitment_location(jsonb_build_object(
         'commitmentId', '75000000-0000-4000-8000-000000000001',
         'locationKind', 'pickup',
         'ciphertext', 'QUJDRA==',
         'nonce', 'MTIzNA==',
         'keyVersion', 1,
         'expiresAt', now() + interval '2 days',
         'idempotencyKey', 'journey-location'
       ))
     ) $$,
  'Accepted lender can attach encrypted pickup details'
);

select tests.authenticate_as('requester-journey@example.test');
select throws_ok(
  $$ select public.transition_loan(jsonb_build_object(
       'loanId', '76000000-0000-4000-8000-000000000001',
       'action', 'request_extension',
       'proposedDueAt', now() - interval '1 hour',
       'idempotencyKey', 'journey-invalid-extension'
     )) $$,
  '23514',
  null,
  'Borrower cannot request an extension into the past'
);
select is(
  public.get_commitment_location('75000000-0000-4000-8000-000000000001')->>'ciphertext',
  'QUJDRA==',
  'Accepted requester can retrieve encrypted pickup details'
);

select tests.authenticate_as('outsider-journey@example.test');
select is(
  public.get_commitment_location('75000000-0000-4000-8000-000000000001'),
  null,
  'Unrelated member cannot retrieve encrypted pickup details'
);

select tests.authenticate_as('requester-journey@example.test');
select is(
  public.transition_loan(jsonb_build_object(
    'loanId', '76000000-0000-4000-8000-000000000001',
    'action', 'request_extension',
    'proposedDueAt', now() + interval '3 days',
    'idempotencyKey', 'journey-extension-request'
  )),
  '76000000-0000-4000-8000-000000000001'::uuid,
  'Borrower can request a later return time'
);
select is(
  (select status::text from public.loans where id = '76000000-0000-4000-8000-000000000001'),
  'extension_requested',
  'Extension request preserves a pending lender decision'
);

select tests.authenticate_as('lender-journey@example.test');
select is(
  public.decline_loan_extension(jsonb_build_object(
    'loanId', '76000000-0000-4000-8000-000000000001',
    'idempotencyKey', 'journey-extension-decline'
  )),
  '76000000-0000-4000-8000-000000000001'::uuid,
  'Lender can privately decline an extension'
);
select is(
  (select status::text from public.loans where id = '76000000-0000-4000-8000-000000000001'),
  'checked_out',
  'Declined extension restores the active custody state'
);

select tests.authenticate_as('outsider-journey@example.test');
select throws_ok(
  $$ select public.report_loan_incident(jsonb_build_object(
       'loanId', '76000000-0000-4000-8000-000000000001',
       'kind', 'damage',
       'summary', 'An unrelated person cannot report this Loan.',
       'idempotencyKey', 'journey-outsider-incident'
     )) $$,
  '42501',
  null,
  'Unrelated member cannot report an issue on the Loan'
);

select tests.authenticate_as('requester-journey@example.test');
select lives_ok(
  $$ insert into test_ids(name, id)
     values (
       'incident',
       public.report_loan_incident(jsonb_build_object(
         'loanId', '76000000-0000-4000-8000-000000000001',
         'kind', 'damage',
         'summary', 'The table leg appears damaged after the handoff.',
         'idempotencyKey', 'journey-loan-incident'
       ))
     ) $$,
  'Loan party can report a private issue atomically'
);
select is(
  (select status::text from public.loans where id = '76000000-0000-4000-8000-000000000001'),
  'disputed',
  'Incident transaction freezes the Loan'
);
select is(
  (select status::text from public.commitments where id = '75000000-0000-4000-8000-000000000001'),
  'disputed',
  'Incident transaction freezes the related Commitment'
);
select is(
  public.report_loan_incident(jsonb_build_object(
    'loanId', '76000000-0000-4000-8000-000000000001',
    'kind', 'damage',
    'summary', 'The table leg appears damaged after the handoff.',
    'idempotencyKey', 'journey-loan-incident'
  )),
  (select id from test_ids where name = 'incident'),
  'Incident replay returns the original private report'
);
select results_eq(
  $$ select count(*)::bigint from public.incidents where loan_id = '76000000-0000-4000-8000-000000000001' $$,
  array[1::bigint],
  'Incident replay does not duplicate reports'
);

select tests.authenticate_as('lender-journey@example.test');
select throws_ok(
  $$ select public.complete_non_loan_commitment(jsonb_build_object(
       'commitmentId', '75000000-0000-4000-8000-000000000003',
       'idempotencyKey', 'journey-help-wrong-party'
     )) $$,
  '42501',
  null,
  'Contributor cannot self-certify non-item completion'
);

select tests.authenticate_as('requester-journey@example.test');
select is(
  public.complete_non_loan_commitment(jsonb_build_object(
    'commitmentId', '75000000-0000-4000-8000-000000000003',
    'idempotencyKey', 'journey-help-complete'
  )),
  '75000000-0000-4000-8000-000000000003'::uuid,
  'Requester can confirm completed non-item help'
);
select is(
  (select status::text from public.ask_needs where id = '72000000-0000-4000-8000-000000000003'),
  'completed',
  'Non-item completion closes the Need'
);
select throws_ok(
  $$ select public.prepare_notification_jobs(100) $$,
  '42501',
  null,
  'Authenticated browser sessions cannot run the notification worker'
);

reset role;
select set_config(
  'request.jwt.claims',
  json_build_object('role', 'service_role')::text,
  true
);
set local role service_role;
select lives_ok(
  $$ select public.prepare_notification_jobs(100) $$,
  'Service role can expand lifecycle events into notification jobs'
);
select ok(
  jsonb_array_length(public.claim_notification_jobs('journey-worker', 50)) > 0,
  'Service worker can claim a bounded notification batch'
);

select * from finish();
rollback;
