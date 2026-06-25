-- Atomic phone replacement for the directory importer.
--
-- The importer previously deleted a business's phone rows and then bulk-inserted
-- the replacements in two separate statements. If the insert failed (e.g. a
-- duplicate phone violating unique(business_id, phone_number), or a network
-- error), the delete had already committed and the business was left with no
-- phones. A plpgsql function body runs in a single transaction, so wrapping the
-- delete + insert here makes the replacement all-or-nothing.

create or replace function public.directory_replace_phones(
  p_business_ids uuid[],
  p_rows jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Remove existing phones for the affected businesses...
  delete from public.directory_business_phone_numbers
   where business_id = any(p_business_ids);

  -- ...and insert the replacements in the same transaction. If this fails, the
  -- delete above is rolled back and the existing rows are preserved.
  insert into public.directory_business_phone_numbers
    (business_id, phone_number, normalized_phone_number, position)
  select
    (r ->> 'business_id')::uuid,
    r ->> 'phone_number',
    r ->> 'normalized_phone_number',
    coalesce((r ->> 'position')::int, 0)
  from jsonb_array_elements(coalesce(p_rows, '[]'::jsonb)) as r;
end;
$$;

-- Service-role-only: the importer runs with the service key; no client should call this.
revoke all on function public.directory_replace_phones(uuid[], jsonb) from public, anon, authenticated;
grant execute on function public.directory_replace_phones(uuid[], jsonb) to service_role;
