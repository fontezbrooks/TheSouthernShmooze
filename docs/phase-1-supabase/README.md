# Phase 1 — Supabase Backend Setup

> Implements Phase 1 of [`../implementation-workflow/README.md`](../implementation-workflow/README.md).
> Code is in `supabase/migrations/` and `src/lib/`. The steps below require **your**
> Supabase account and are the manual part (project creation + credentials) that can't be
> automated here.

## What's already built
- `supabase/migrations/0001_leads.sql` — `leads` table, check constraints, indexes, **insert-only RLS** (anon can INSERT with `status='new'`; no SELECT/UPDATE/DELETE).
- `supabase/migrations/0002_storage.sql` — private `lead-uploads` bucket (25 MB cap, any MIME), anon **INSERT-only** storage policy (no public read).
- `src/lib/supabase.ts` — lazy anon client singleton (no session persistence), validates env at first use.
- `src/lib/database.ts` — typed `leads` schema (`LeadRow` / `LeadInsert` / `BudgetValue`).

## Setup steps

1. **Create the project** at https://supabase.com → new project. Note the **Project URL** and **anon public** key (Settings → API).

2. **Configure env** — copy and fill (Expo `EXPO_PUBLIC_*` convention):
   ```bash
   cp .env.example .env
   # edit .env:
   # EXPO_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   # EXPO_PUBLIC_SUPABASE_KEY=<anon-public-key>
   ```
   These are read by `app.config.ts` into `expo.extra` and consumed by `src/lib/supabase.ts`.
   (Legacy `SUPABASE_URL` / `SUPABASE_ANON_KEY` names are also accepted as a fallback.)

3. **Run the migrations** — either option:
   - **SQL Editor (simplest):** paste `0001_leads.sql` then `0002_storage.sql`, run in order.
   - **Supabase CLI:**
     ```bash
     supabase link --project-ref <ref>
     supabase db push     # applies supabase/migrations/*
     ```

## Checkpoint C1 — verification

Run in the SQL editor (or psql) to confirm the security model:

```sql
-- As anon, INSERT should succeed:
set role anon;
insert into public.leads (first_name,last_name,email,phone,address,project_details)
values ('Test','User','t@example.com','5551234567','123 Peachtree St','Need a plumber');

-- As anon, SELECT should return 0 rows / be denied (no select policy):
select count(*) from public.leads;   -- expect permission denied or 0
reset role;

-- As the table owner, the row is visible:
select id, status, created_at from public.leads order by created_at desc limit 1;
```

Storage check: with the anon key, uploading to `lead-uploads/<uuid>/test.txt` should
succeed; listing/downloading it should fail.

**Security gate (must hold):**
- App bundle contains only the **anon** key — never the service-role key.
- Anon: INSERT ✓, SELECT ✗ on `leads`; INSERT ✓, READ ✗ on `lead-uploads`.

## Notes
- `status` is forced to `'new'` on anon insert by the RLS `WITH CHECK`.
- `budget` accepts only `lt_1000` / `1000_5000` / `gt_5000` (DB constraint mirrors the form enum).
- Owners read leads via the Supabase dashboard or a service-role backend (out of MVP scope).
