alter table public.notes
  add column if not exists font_size_px integer not null default 18;

alter table public.notes
  drop constraint if exists notes_font_size_px_range;

alter table public.notes
  add constraint notes_font_size_px_range
  check (font_size_px between 14 and 28);
