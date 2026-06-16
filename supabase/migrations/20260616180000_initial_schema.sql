-- Baseline schema for pin-note (profiles, notes, pins).
-- If these objects already exist on the linked remote project, mark this migration
-- as applied without re-running DDL:
--   npx supabase migration repair 20260616180000 --status applied

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '',
  content text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists notes_user_id_idx on public.notes (user_id);
create index if not exists notes_updated_at_idx on public.notes (updated_at desc);

create table if not exists public.pins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_type text not null,
  source_url text not null,
  title text not null,
  summary text not null,
  created_at timestamptz not null default now()
);

create index if not exists pins_user_id_idx on public.pins (user_id);
create index if not exists pins_created_at_idx on public.pins (created_at desc);

create or replace function public.set_notes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
  before update on public.notes
  for each row
  execute function public.set_notes_updated_at();
