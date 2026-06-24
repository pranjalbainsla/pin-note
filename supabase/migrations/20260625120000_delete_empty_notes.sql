delete from public.notes
where trim(title) = ''
  and trim(regexp_replace(content, '<[^>]*>', '', 'g')) = '';
