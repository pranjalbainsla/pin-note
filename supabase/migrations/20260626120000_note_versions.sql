-- Note versioning: append-only snapshots with atomic create/update/restore RPCs.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.note_versions (
  id            uuid primary key default gen_random_uuid(),
  note_id       uuid not null references public.notes (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  title         text not null,
  content       text not null,
  font_size_px  integer not null,
  content_hash  text not null,
  source        text not null check (source in ('autosave', 'restore', 'backfill')),
  created_at    timestamptz not null default now(),
  constraint note_versions_font_size_px_range check (font_size_px between 14 and 28)
);

create index if not exists note_versions_note_id_created_at_idx
  on public.note_versions (note_id, created_at desc);

create or replace function public.note_content_hash(
  p_title text,
  p_content text,
  p_font_size_px integer
)
returns text
language sql
immutable
as $$
  select encode(
    extensions.digest(
      convert_to(
        json_build_object(
          'title', p_title,
          'content', p_content,
          'font_size_px', p_font_size_px
        )::text,
        'UTF8'
      ),
      'sha256'
    ),
    'hex'
  );
$$;

create or replace function public.prune_note_versions(p_note_id uuid)
returns void
language plpgsql
as $$
begin
  delete from public.note_versions nv
  where nv.note_id = p_note_id
    and (
      nv.created_at < now() - interval '30 days'
      or nv.id not in (
        select id
        from public.note_versions
        where note_id = p_note_id
        order by created_at desc
        limit 50
      )
    );
end;
$$;

create or replace function public.create_note_with_version(
  p_user_id uuid,
  p_title text,
  p_content text,
  p_font_size_px integer,
  p_source text default 'autosave'
)
returns public.notes
language plpgsql
as $$
declare
  v_note public.notes;
  v_hash text;
begin
  insert into public.notes (user_id, title, content, font_size_px)
  values (p_user_id, p_title, p_content, p_font_size_px)
  returning * into v_note;

  v_hash := public.note_content_hash(v_note.title, v_note.content, v_note.font_size_px);

  insert into public.note_versions (
    note_id, user_id, title, content, font_size_px, content_hash, source
  ) values (
    v_note.id,
    v_note.user_id,
    v_note.title,
    v_note.content,
    v_note.font_size_px,
    v_hash,
    p_source
  );

  return v_note;
end;
$$;

create or replace function public.update_note_with_version(
  p_note_id uuid,
  p_user_id uuid,
  p_title text,
  p_content text,
  p_font_size_px integer,
  p_source text default 'autosave'
)
returns void
language plpgsql
as $$
declare
  v_current record;
  v_new_hash text;
  v_current_hash text;
begin
  select id, user_id, title, content, font_size_px
  into v_current
  from public.notes
  where id = p_note_id and user_id = p_user_id
  for update;

  if not found then
    raise exception 'Note not found' using errcode = 'P0002';
  end if;

  v_new_hash := public.note_content_hash(p_title, p_content, p_font_size_px);
  v_current_hash := public.note_content_hash(
    v_current.title, v_current.content, v_current.font_size_px
  );

  if v_new_hash = v_current_hash then
    return;
  end if;

  insert into public.note_versions (
    note_id, user_id, title, content, font_size_px, content_hash, source
  ) values (
    v_current.id,
    v_current.user_id,
    v_current.title,
    v_current.content,
    v_current.font_size_px,
    v_current_hash,
    p_source
  );

  update public.notes
  set
    title = p_title,
    content = p_content,
    font_size_px = p_font_size_px
  where id = p_note_id;

  perform public.prune_note_versions(p_note_id);
end;
$$;

create or replace function public.restore_note_version(
  p_note_id uuid,
  p_version_id uuid,
  p_user_id uuid
)
returns public.notes
language plpgsql
as $$
declare
  v_note public.notes;
  v_current record;
  v_version record;
  v_current_hash text;
  v_version_hash text;
begin
  select id, user_id, title, content, font_size_px
  into v_current
  from public.notes
  where id = p_note_id and user_id = p_user_id
  for update;

  if not found then
    raise exception 'Note not found' using errcode = 'P0002';
  end if;

  select id, note_id, user_id, title, content, font_size_px
  into v_version
  from public.note_versions
  where id = p_version_id
    and note_id = p_note_id
    and user_id = p_user_id;

  if not found then
    raise exception 'Version not found' using errcode = 'P0002';
  end if;

  v_current_hash := public.note_content_hash(
    v_current.title, v_current.content, v_current.font_size_px
  );
  v_version_hash := public.note_content_hash(
    v_version.title, v_version.content, v_version.font_size_px
  );

  if v_current_hash = v_version_hash then
    select * into v_note from public.notes where id = p_note_id;
    return v_note;
  end if;

  insert into public.note_versions (
    note_id, user_id, title, content, font_size_px, content_hash, source
  ) values (
    v_current.id,
    v_current.user_id,
    v_current.title,
    v_current.content,
    v_current.font_size_px,
    v_current_hash,
    'restore'
  );

  update public.notes
  set
    title = v_version.title,
    content = v_version.content,
    font_size_px = v_version.font_size_px
  where id = p_note_id
  returning * into v_note;

  perform public.prune_note_versions(p_note_id);

  return v_note;
end;
$$;

insert into public.note_versions (
  note_id, user_id, title, content, font_size_px, content_hash, source, created_at
)
select
  n.id,
  n.user_id,
  n.title,
  n.content,
  n.font_size_px,
  public.note_content_hash(n.title, n.content, n.font_size_px),
  'backfill',
  n.updated_at
from public.notes n
where not exists (
  select 1
  from public.note_versions v
  where v.note_id = n.id
    and v.source = 'backfill'
);
