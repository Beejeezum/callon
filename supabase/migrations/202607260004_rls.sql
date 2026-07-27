begin;

-- RLS is enabled before grants are useful. No table is intentionally left open.
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','circles','circle_memberships','circle_invites','categories','asks','ask_needs','resources','resource_hints','resource_components',
    'offers','conversations','commitments','conversation_participants','messages','loans','loan_events','incidents','notification_preferences'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
  end loop;
end $$;

-- Profiles: only people who share an active Circle, plus self.
create policy profiles_select_shared_circle on public.profiles for select to authenticated using (
  id = auth.uid() or exists (
    select 1 from public.circle_memberships me
    join public.circle_memberships them on them.circle_id = me.circle_id
    where me.profile_id = auth.uid() and me.status = 'active'
      and them.profile_id = profiles.id and them.status in ('active','restricted')
  )
);
create policy profiles_update_self on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy circles_select_member on public.circles for select to authenticated using (public.is_active_circle_member(id));
create policy circles_update_admin on public.circles for update to authenticated using (
  exists(select 1 from public.circle_memberships m where m.circle_id = circles.id and m.profile_id = auth.uid() and m.status='active' and m.role='circle_admin')
) with check (
  exists(select 1 from public.circle_memberships m where m.circle_id = circles.id and m.profile_id = auth.uid() and m.status='active' and m.role='circle_admin')
);

create policy memberships_select_same_circle on public.circle_memberships for select to authenticated using (
  profile_id = auth.uid() or public.is_active_circle_member(circle_id)
);
create policy memberships_update_admin on public.circle_memberships for update to authenticated using (public.can_moderate_circle(circle_id)) with check (public.can_moderate_circle(circle_id));

create policy invites_select_admin on public.circle_invites for select to authenticated using (public.can_moderate_circle(circle_id));
create policy invites_write_admin on public.circle_invites for all to authenticated using (public.can_moderate_circle(circle_id)) with check (public.can_moderate_circle(circle_id));

create policy categories_select_authenticated on public.categories for select to authenticated using (is_active = true);

create policy asks_select_member on public.asks for select to authenticated using (created_by = auth.uid() or public.is_active_circle_member(circle_id));
create policy asks_insert_owner on public.asks for insert to authenticated with check (created_by = auth.uid() and public.is_active_circle_member(circle_id));
create policy asks_update_owner on public.asks for update to authenticated using (created_by = auth.uid()) with check (created_by = auth.uid());

create policy needs_select_member on public.ask_needs for select to authenticated using (public.is_active_circle_member(circle_id));
create policy needs_write_ask_owner on public.ask_needs for all to authenticated using (
  exists(select 1 from public.asks a where a.id = ask_needs.ask_id and a.created_by = auth.uid())
) with check (
  exists(select 1 from public.asks a where a.id = ask_needs.ask_id and a.created_by = auth.uid() and a.circle_id = ask_needs.circle_id)
);

create policy offers_select_parties on public.offers for select to authenticated using (
  contributor_profile_id = auth.uid() or exists(select 1 from public.asks a where a.id = offers.ask_id and a.created_by = auth.uid())
);
create policy offers_insert_contributor on public.offers for insert to authenticated with check (
  contributor_profile_id = auth.uid() and public.is_circle_contributor(circle_id)
);
create policy offers_update_contributor_or_owner on public.offers for update to authenticated using (
  contributor_profile_id = auth.uid() or exists(select 1 from public.asks a where a.id = offers.ask_id and a.created_by = auth.uid())
) with check (
  contributor_profile_id = auth.uid() or exists(select 1 from public.asks a where a.id = offers.ask_id and a.created_by = auth.uid())
);

create policy commitments_select_parties on public.commitments for select to authenticated using (requester_profile_id = auth.uid() or contributor_profile_id = auth.uid());
create policy commitments_update_parties on public.commitments for update to authenticated using (requester_profile_id = auth.uid() or contributor_profile_id = auth.uid()) with check (requester_profile_id = auth.uid() or contributor_profile_id = auth.uid());

create policy conversations_select_participants on public.conversations for select to authenticated using (private.is_conversation_participant(id));
create policy participants_select_self_conversation on public.conversation_participants for select to authenticated using (private.is_conversation_participant(conversation_id));
create policy messages_select_participants on public.messages for select to authenticated using (private.is_conversation_participant(conversation_id));
create policy messages_insert_participants on public.messages for insert to authenticated with check (sender_profile_id = auth.uid() and private.is_conversation_participant(conversation_id));
create policy messages_update_sender on public.messages for update to authenticated using (sender_profile_id = auth.uid()) with check (sender_profile_id = auth.uid());

create policy loans_select_parties on public.loans for select to authenticated using (lender_profile_id = auth.uid() or borrower_profile_id = auth.uid());
create policy loans_update_parties on public.loans for update to authenticated using (lender_profile_id = auth.uid() or borrower_profile_id = auth.uid()) with check (lender_profile_id = auth.uid() or borrower_profile_id = auth.uid());
create policy loan_events_select_parties on public.loan_events for select to authenticated using (
  exists(select 1 from public.loans l where l.id = loan_events.loan_id and auth.uid() in (l.lender_profile_id,l.borrower_profile_id))
);

create policy resources_select_owner_or_circle on public.resources for select to authenticated using (
  owner_profile_id = auth.uid() or (visibility = 'circle' and status = 'active' and public.is_active_circle_member(circle_id))
);
create policy resources_write_owner on public.resources for all to authenticated using (owner_profile_id = auth.uid()) with check (owner_profile_id = auth.uid() and public.is_active_circle_member(circle_id));
create policy resource_hints_owner_only on public.resource_hints for all to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid() and public.is_active_circle_member(circle_id));
create policy resource_components_owner_or_visible on public.resource_components for select to authenticated using (
  exists(select 1 from public.resources r where r.id = resource_components.resource_id and (r.owner_profile_id = auth.uid() or (r.visibility='circle' and public.is_active_circle_member(r.circle_id))))
);
create policy resource_components_owner_write on public.resource_components for all to authenticated using (
  exists(select 1 from public.resources r where r.id = resource_components.resource_id and r.owner_profile_id = auth.uid())
) with check (
  exists(select 1 from public.resources r where r.id = resource_components.resource_id and r.owner_profile_id = auth.uid())
);

create policy incidents_select_scoped on public.incidents for select to authenticated using (
  reported_by = auth.uid() or subject_profile_id = auth.uid() or public.can_moderate_circle(circle_id)
);
create policy incidents_insert_reporter on public.incidents for insert to authenticated with check (reported_by = auth.uid() and public.is_active_circle_member(circle_id));
create policy incidents_update_scoped on public.incidents for update to authenticated using (reported_by = auth.uid() or subject_profile_id = auth.uid() or public.can_moderate_circle(circle_id));

create policy notification_preferences_self on public.notification_preferences for all to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- Normal API clients get table access only where a policy grants rows.
grant select, insert, update on public.profiles to authenticated;
grant select on public.circles, public.categories to authenticated;
grant select, insert, update on public.circle_memberships, public.circle_invites to authenticated;
grant select, insert, update on public.asks, public.ask_needs, public.offers, public.commitments, public.conversations, public.conversation_participants, public.messages, public.loans, public.incidents, public.notification_preferences to authenticated;
grant select on public.loan_events to authenticated;
grant select, insert, update, delete on public.resources, public.resource_hints, public.resource_components to authenticated;

-- Mutations should use audited RPCs. Direct grants are intentionally narrower than service capabilities.
grant execute on function public.create_ask(jsonb) to authenticated;
grant execute on function public.publish_ask(uuid, text) to authenticated;
grant execute on function public.submit_offer(jsonb) to authenticated;
grant execute on function public.accept_offer(jsonb) to authenticated;
grant execute on function public.transition_loan(jsonb) to authenticated;

revoke all on all tables in schema private from anon, authenticated;
revoke all on all functions in schema private from anon, authenticated;

commit;
