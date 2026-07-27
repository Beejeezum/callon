begin;

create extension if not exists pgcrypto;
create extension if not exists citext;
create extension if not exists btree_gist;
create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema public to anon, authenticated;

create type public.profile_status as enum ('active', 'restricted', 'suspended', 'deleted');
create type public.circle_status as enum ('draft', 'active', 'paused', 'archived');
create type public.membership_role as enum ('member', 'moderator', 'circle_admin');
create type public.membership_status as enum ('invited', 'pending', 'active', 'restricted', 'suspended', 'left');
create type public.invite_status as enum ('active', 'revoked', 'expired', 'exhausted');
create type public.ask_status as enum ('draft', 'open', 'partially_fulfilled', 'ready', 'in_progress', 'completed', 'cancelled', 'expired', 'archived');
create type public.ask_type as enum ('quick_need', 'project', 'event', 'offer');
create type public.need_kind as enum ('lend', 'give', 'help', 'advice', 'recommendation', 'alternative');
create type public.need_status as enum ('open', 'partially_covered', 'covered', 'completed', 'cancelled');
create type public.risk_level as enum ('low', 'moderate', 'restricted', 'prohibited');
create type public.offer_status as enum ('draft', 'submitted', 'accepted', 'declined', 'withdrawn', 'expired');
create type public.commitment_status as enum ('accepted', 'coordinating', 'ready_for_handoff', 'active', 'fulfilled', 'cancelled', 'disputed');
create type public.resource_visibility as enum ('private', 'match_only', 'circle');
create type public.resource_willingness as enum ('happy_to_be_asked', 'community_projects_only', 'weekends', 'paused');
create type public.resource_status as enum ('active', 'paused', 'retired');
create type public.loan_status as enum ('pending_handoff', 'checked_out', 'extension_requested', 'return_marked', 'returned', 'overdue', 'disputed', 'cancelled');
create type public.incident_status as enum ('open', 'awaiting_response', 'under_review', 'resolved', 'closed');
create type public.incident_kind as enum ('late_return', 'missing_component', 'damage', 'unsafe_item', 'harassment', 'privacy', 'prohibited_content', 'other');
create type private.job_status as enum ('pending', 'processing', 'sent', 'failed', 'dead_letter');
create type private.access_grant_scope as enum ('messages', 'location', 'evidence');

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public, private
as $$
begin
  new.updated_at = timezone('utc', now());
  new.version = old.version + 1;
  return new;
end;
$$;

create or replace function private.prevent_update_delete()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  raise exception 'append-only table: %', tg_table_name using errcode = '55000';
end;
$$;

commit;
