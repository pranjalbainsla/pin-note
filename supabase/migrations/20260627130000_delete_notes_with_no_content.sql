-- Remove notes accidentally created during the new-note autosave bug:
-- partial titles were saved to the server while the editor body stayed empty.
delete from public.notes
where trim(regexp_replace(coalesce(content, ''), '<[^>]*>', '', 'g')) = '';
