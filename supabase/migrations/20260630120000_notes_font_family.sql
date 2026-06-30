-- Per-note font family preference (document-wide, stored outside HTML content).

alter table public.notes
  add column if not exists font_family text not null default 'newsreader';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'notes_font_family_allowed'
  ) then
    alter table public.notes
      add constraint notes_font_family_allowed
      check (font_family in ('newsreader', 'google-sans-flex'));
  end if;
end $$;

alter table public.note_versions
  add column if not exists font_family text not null default 'newsreader';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'note_versions_font_family_allowed'
  ) then
    alter table public.note_versions
      add constraint note_versions_font_family_allowed
      check (font_family in ('newsreader', 'google-sans-flex'));
  end if;
end $$;

create or replace function public.note_content_hash(
  p_title text,
  p_content text,
  p_font_size_px integer,
  p_font_family text
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
          'font_size_px', p_font_size_px,
          'font_family', p_font_family
        )::text,
        'UTF8'
      ),
      'sha256'
    ),
    'hex'
  );
$$;

create or replace function public.create_note_with_version(
  p_user_id uuid,
  p_title text,
  p_content text,
  p_font_size_px integer,
  p_font_family text default 'newsreader',
  p_source text default 'autosave'
)
returns public.notes
language plpgsql
as $$
declare
  v_note public.notes;
  v_hash text;
begin
  insert into public.notes (user_id, title, content, font_size_px, font_family)
  values (p_user_id, p_title, p_content, p_font_size_px, p_font_family)
  returning * into v_note;

  v_hash := public.note_content_hash(
    v_note.title, v_note.content, v_note.font_size_px, v_note.font_family
  );

  insert into public.note_versions (
    note_id, user_id, title, content, font_size_px, font_family, content_hash, source
  ) values (
    v_note.id,
    v_note.user_id,
    v_note.title,
    v_note.content,
    v_note.font_size_px,
    v_note.font_family,
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
  p_font_family text default 'newsreader',
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
  select id, user_id, title, content, font_size_px, font_family
  into v_current
  from public.notes
  where id = p_note_id and user_id = p_user_id
  for update;

  if not found then
    raise exception 'Note not found' using errcode = 'P0002';
  end if;

  v_new_hash := public.note_content_hash(
    p_title, p_content, p_font_size_px, p_font_family
  );
  v_current_hash := public.note_content_hash(
    v_current.title, v_current.content, v_current.font_size_px, v_current.font_family
  );

  if v_new_hash = v_current_hash then
    return;
  end if;

  insert into public.note_versions (
    note_id, user_id, title, content, font_size_px, font_family, content_hash, source
  ) values (
    v_current.id,
    v_current.user_id,
    v_current.title,
    v_current.content,
    v_current.font_size_px,
    v_current.font_family,
    v_current_hash,
    p_source
  );

  update public.notes
  set
    title = p_title,
    content = p_content,
    font_size_px = p_font_size_px,
    font_family = p_font_family,
    updated_at = now()
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
  select id, user_id, title, content, font_size_px, font_family
  into v_current
  from public.notes
  where id = p_note_id and user_id = p_user_id
  for update;

  if not found then
    raise exception 'Note not found' using errcode = 'P0002';
  end if;

  select id, note_id, user_id, title, content, font_size_px, font_family
  into v_version
  from public.note_versions
  where id = p_version_id
    and note_id = p_note_id
    and user_id = p_user_id;

  if not found then
    raise exception 'Version not found' using errcode = 'P0002';
  end if;

  v_current_hash := public.note_content_hash(
    v_current.title, v_current.content, v_current.font_size_px, v_current.font_family
  );
  v_version_hash := public.note_content_hash(
    v_version.title, v_version.content, v_version.font_size_px, v_version.font_family
  );

  if v_current_hash = v_version_hash then
    select * into v_note from public.notes where id = p_note_id;
    return v_note;
  end if;

  insert into public.note_versions (
    note_id, user_id, title, content, font_size_px, font_family, content_hash, source
  ) values (
    v_current.id,
    v_current.user_id,
    v_current.title,
    v_current.content,
    v_current.font_size_px,
    v_current.font_family,
    v_current_hash,
    'restore'
  );

  update public.notes
  set
    title = v_version.title,
    content = v_version.content,
    font_size_px = v_version.font_size_px,
    font_family = v_version.font_family,
    updated_at = now()
  where id = p_note_id
  returning * into v_note;

  perform public.prune_note_versions(p_note_id);

  return v_note;
end;
$$;
