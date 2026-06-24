-- 0002_storage.sql
-- Private bucket for lead file uploads. Any MIME type (per product decision), 25 MB cap.
-- Objects are keyed lead-uploads/{leadId}/{filename}. Anon may upload (INSERT) only;
-- no read policy => uploads are not publicly readable. See docs/architecture/README.md §8.2.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lead-uploads', 'lead-uploads', false, 26214400, null)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- RLS on storage.objects: allow anon INSERT into this bucket only.
drop policy if exists "anon can upload lead files" on storage.objects;
create policy "anon can upload lead files"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'lead-uploads');
