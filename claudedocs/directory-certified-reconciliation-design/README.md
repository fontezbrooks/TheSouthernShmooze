# Design: Certified rename · Certified-first ordering · Content-hash reconciliation

**Date:** 2026-06-27
**Source:** `/sc:design` — turns `claudedocs/directory-certified-reconciliation-requirements/` into a buildable spec.
**Status:** Design only (no implementation). Next: `/sc:implement` per migration.
**Scope:** DB + shared transform + edge functions + app data layer. No UI work (Figma round owns badge rendering).

---

## 0. Touchpoint map (what exists today)

| Concern | Object | File |
|---|---|---|
| Column | `has_google_marker boolean` ← `xgm` | `0003`; transform `directory-transform.ts:186` |
| Index | `directory_businesses_has_google_marker_idx` | `0004:19` |
| App view | `directory_businesses_app_view` (projects `has_google_marker`) | `0004:34` |
| Detail view | `directory_business_detail_view` (projects `has_google_marker`) | `0010:75` |
| Search RPC | `directory_search` (returns `has_google_marker`; `order by rank, recommended_score, name`) | `0010:118` |
| Sync RPC | `directory_sync_apply` (insert/conflict on `has_google_marker`) | `0009:17` |
| Due picker | `directory_profiles_due` (missing/stale/errored backoff) | `0012:39` |
| Failure stub | `directory_record_profile_failure` | `0012:19` |
| TS row type | `DirectoryBusinessRow.has_google_marker` | `src/lib/database.ts:60` |
| VM | `hasGoogleMarker` + `toBusiness` | `providerTypes.ts:19,43` |
| List order | `.order("recommended_score").order("name")` | `providerRepository.ts:60` |

**Two facts that shape the design:**
1. Views project the column under a fixed alias → a base-column rename does **not** rename the view's output. So renamed views must be **dropped and recreated** (`create or replace view` cannot rename an existing output column). Same for `directory_search` (changing a RETURNS-TABLE column name requires `drop function` + recreate).
2. Function bodies are string-literal (`as $$ … $$`), so they are **not** dependency-tracked — dropping a view a function references won't error, but the function will break at call time, so we recreate every dependent in the same migration.

---

## 1. Migration plan (two migrations, isolated by concern)

### `0013_directory_rename_certified.sql` — Epic A (rename) + Epic B (ordering)
Mechanical, reviewable, revertible on its own.

```
1. alter table directory_businesses rename column has_google_marker to is_certified;
2. alter index  directory_businesses_has_google_marker_idx rename to directory_businesses_is_certified_idx;
3. drop view directory_businesses_app_view;   recreate w/ b.is_certified  (security_invoker=true)
4. drop view directory_business_detail_view;  recreate w/ b.is_certified  (+ re-grant select to anon,authenticated)
5. drop function directory_search(text,integer);
   recreate: RETURNS … is_certified boolean … ;
   ORDER BY  v.is_certified desc, rank desc, b.recommended_score desc nulls last, b.name   ← Epic B (hard certified-first)
   re-grant execute to anon, authenticated
6. create or replace function directory_sync_apply(...)   -- body now references is_certified (see §2 for the full Epic-C rewrite)
```
> Recreate order matters only for grants, not deps. Recreate views before the function that joins them for clarity.

### `0014_directory_content_hash_reconcile.sql` — Epic C (reconciliation)
```
1. alter table directory_businesses
     add column if not exists source_content_hash   text,
     add column if not exists needs_profile_refetch boolean not null default false;
2. alter table directory_sync_runs add column if not exists unchanged integer;   -- FR-C6 telemetry
3. create or replace function clear_profile_refetch_flag() ... (trigger fn, see §3)
   create trigger directory_profiles_clear_refetch
     after insert or update on directory_business_profiles
     for each row execute function clear_profile_refetch_flag();
4. create or replace function directory_profiles_due(...)   -- add `or b.needs_profile_refetch` clause
5. create or replace function directory_sync_apply(...)     -- final version: hash-diff change detection + flagging (§2)
```
> `directory_sync_apply` is recreated in both 0013 and 0014; only 0014's body is final. (Or: do the column rename refs + Epic-C logic together once in 0014 and keep 0013's recreate minimal. Implementer's call — net effect identical.)

---

## 2. `directory_sync_apply` rewrite (Epic A + C)

Change detection rides on a **conditional `DO UPDATE … WHERE`**: unchanged rows match the conflict but fail the WHERE, so they are **not** rewritten (no `updated_at` churn, not returned). The `RETURNING` set therefore *is* the changed set.

```sql
declare
  v_touched text[];
  ...
begin
  ... -- guards unchanged (zero-valid + anomalous-drop)

  with up as (
    insert into public.directory_businesses (
      source_uid, name, description, logo_url, longitude, latitude,
      recommended_score, has_coupon, is_certified, source_content_hash,
      needs_profile_refetch, raw_source_payload
    )
    select
      b->>'source_uid', b->>'name', b->>'description', b->>'logo_url',
      (b->>'longitude')::double precision, (b->>'latitude')::double precision,
      (b->>'recommended_score')::integer,
      coalesce((b->>'has_coupon')::boolean, false),
      coalesce((b->>'is_certified')::boolean, false),
      b->>'source_content_hash',
      true,                                   -- new rows: flag for first profile fetch
      coalesce(b->'raw_source_payload', '{}'::jsonb)
    from jsonb_array_elements(p_records) r
    cross join lateral (select r->'business' as b) j
    on conflict (source_uid) do update set
      name=excluded.name, description=excluded.description, logo_url=excluded.logo_url,
      longitude=excluded.longitude, latitude=excluded.latitude,
      recommended_score=excluded.recommended_score, has_coupon=excluded.has_coupon,
      is_certified=excluded.is_certified,
      source_content_hash=excluded.source_content_hash,
      raw_source_payload=excluded.raw_source_payload,
      needs_profile_refetch=true              -- only reached when the row actually changes ↓
    where directory_businesses.source_content_hash is distinct from excluded.source_content_hash
    returning source_uid, (xmax = 0) as inserted
  )
  select array_agg(source_uid),
         count(*) filter (where inserted),
         count(*) filter (where not inserted)
  into   v_touched, v_added, v_changed
  from up;

  v_touched   := coalesce(v_touched, '{}');
  v_unchanged := v_valid - v_added - v_changed;

  -- MIRROR-DELETE unchanged (still over the whole feed).

  -- PHONES: replace ONLY for touched (new+changed) rows — phones are in the hash,
  -- so unchanged members keep their existing phone rows (no churn).
  delete from directory_business_phone_numbers p using directory_businesses b
   where p.business_id=b.id and b.source_uid = any(v_touched);
  insert into directory_business_phone_numbers (...) select ... where b.source_uid = any(v_touched) ...;

  -- baseline + audit row now also records `unchanged => v_unchanged`.
```

**Why this is correct & idempotent**
- Re-running an identical feed → every hash matches → `WHERE` false → 0 rows returned → `v_added=v_changed=0`, no phone churn, no flags set, no profile re-fetch. (NFR-2, AC-5.)
- Editing one member's feed field → its hash differs → exactly that row returned, flagged, phones replaced. (AC-4.)
- `needs_profile_refetch=true` on insert AND on changed-update; new rows are also due via `p.source_uid is null`.

---

## 3. Profile-refetch flag lifecycle (OQ-3 resolved → trigger-cleared boolean)

Chosen over epoch-resetting `fetched_at` (which lies about last-fetch) and over a hash-on-profile compare (which threads the hash through `due → edge → upsert`). The flag is a **one-shot "refetch now" signal, cleared by any profile write**:

```
sync_apply ─ sets needs_profile_refetch=true on new/changed business
                       │
directory_profiles_due ── returns row (… OR b.needs_profile_refetch)
                       │
sync-profiles fetches profile
        ├─ success → upsert directory_business_profiles ─┐
        └─ failure → directory_record_profile_failure ───┤ (both WRITE the profile row)
                                                          ▼
        AFTER INSERT|UPDATE trigger clear_profile_refetch_flag()
                       └─ set directory_businesses.needs_profile_refetch=false
```

```sql
create or replace function public.clear_profile_refetch_flag()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  update public.directory_businesses
     set needs_profile_refetch = false
   where source_uid = new.source_uid and needs_profile_refetch;  -- guard: skip no-op writes
  return null;
end; $$;
```

**Why it can't re-introduce retry-starvation (the bug 0012 fixed):** a *failed* fetch writes a stub row via `directory_record_profile_failure` → trigger fires → flag cleared. The business then falls under the existing error-backoff (`fetch_error is not null and fetched_at < now() - 1 day`), exactly as today. The flag adds urgency once, never a permanent loop.

`directory_profiles_due` gains one clause:
```sql
  where p.source_uid is null
     or b.needs_profile_refetch                                   -- NEW: changed → refetch now
     or (p.fetch_error is null     and p.fetched_at < now() - make_interval(days => greatest(0,p_stale_days)))
     or (p.fetch_error is not null and p.fetched_at < now() - interval '1 day')
```
(`b` is already the FROM table; flagged rows sort after missing ones via `order by p.fetched_at asc nulls first` — acceptable.)

**Zero edge-function changes for Epic C** — the trigger does the clearing.

---

## 4. Content hash (shared transform, zero-dep, Deno+Bun)

Add to `_shared/directory-transform.ts`:

```ts
/** Stable 53-bit FNV-1a hex of a member's persisted projection (NOT the raw payload). */
export function contentHash(b: BusinessRow, phones: PhoneRow[]): string {
  const canonical = JSON.stringify([
    b.name, b.description, b.logo_url, b.longitude, b.latitude,
    b.recommended_score, b.has_coupon, b.is_certified,
    phones.map((p) => p.normalized_phone_number),
  ]);
  // FNV-1a 32-bit ×2 (offset/prime variant) → 16-hex chars; sync, no crypto import.
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < canonical.length; i++) {
    const c = canonical.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x85ebca6b);
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}
```
- **Inputs = persisted projection** (FR-C1): cosmetic feed reordering / unrelated raw-payload keys don't perturb the hash.
- **Includes `logo_url`** (OQ-2 = yes): the logo cache-buster changes on real logo swaps → counts as a change. Documented, intentional.
- Attach in `prepareRecords` immutably: `prepared.push({ business: { ...business, source_content_hash: contentHash(business, phones) }, phones })`.
- `BusinessRow` gains `source_content_hash: string`. `transformRecord` renames `has_google_marker → is_certified` (still `toBooleanFlag(record.xgm)`).

> Alternative considered: `crypto.subtle.digest('SHA-256')` — available in both runtimes but async, rippling through `prepareRecords`/callers. FNV-1a is sync and collision-safe for ~200 rows. Use SHA-256 only if the corpus grows orders of magnitude.

---

## 5. App data layer

| File | Change |
|---|---|
| `src/lib/database.ts` | `DirectoryBusinessRow.has_google_marker` → `is_certified` (+ any detail/search Row types) |
| `src/features/providers/providerTypes.ts` | `hasGoogleMarker` → `isCertified`; `toBusiness` reads `row.is_certified`; fix the doc-comment (this field is the **certified star**, not a "reviews chip") |
| `src/features/providers/providerRepository.ts` | `fetchMore`: prepend `.order("is_certified", { ascending: false })` before `recommended_score`, then `name`. `fetchPinned` unchanged (pinned stay on top — FR-B3) |
| `BusinessCard.tsx` (consumer) | Reads renamed field; **badge re-skin (star vs chip) is deferred to the Figma round** — note only |

---

## 6. Deploy & data sequencing
1. Apply `0013` then `0014` (Supabase migrations).
2. Redeploy **`sync-directory`** (shared transform now emits `is_certified` + `source_content_hash`; RPC reads them — must ship together). **`sync-profiles` needs no redeploy** (trigger handles flagging).
3. **First run after 0014:** all 182 stored hashes are null → every row's hash `is distinct from` null → all classified "changed" → all flagged → one-time full profile refresh (bounded: batch 25/run ≈ 8 cron ticks ≈ 40 min). Expected and benign (refreshes the search corpus once). Subsequent runs are idempotent.

---

## 7. Acceptance-criteria → design trace
- **AC-1** certified value — `transformRecord` `is_certified: toBooleanFlag(xgm)` (unchanged logic, renamed).
- **AC-2** no `has_google_marker` left — §1 rename + §5 + test sweep (NFR-4 grep check).
- **AC-3** certified-first both paths — `directory_search` ORDER BY (§1.5) + `providerRepository.fetchMore` (§5).
- **AC-4 / AC-5** precise + idempotent reconciliation — conditional `DO UPDATE … WHERE hash is distinct` (§2).

## 8. Test plan (≥80% on changed logic)
- **Unit (transform):** `contentHash` stable for identical input, differs on each field incl. phones/logo; `transformRecord` emits `is_certified` from `xgm`/absent.
- **Unit (app):** `toBusiness` maps `is_certified`; `providerRepository` order args assert `is_certified` first.
- **SQL/integration:** identical feed → 0 added/0 changed/0 flagged (AC-5); one-field edit → 1 changed + 1 flagged + that uid in `directory_profiles_due` (AC-4); trigger clears flag on both success upsert and failure stub.
- **Sweep:** repo-wide `has_google_marker` returns nothing (AC-2).

## 9. Open items carried forward
- **OQ-1** pinned-vs-certified: design assumes pinned 3 stay on top. Confirm at implement time.
- **OQ-4** `ir5`-as-`recommended_score` mislabel: out of scope, separate round.
