alter table public.pins
  add column if not exists thumbnail_url text,
  add column if not exists author text;
