-- 0019_concierge_two_step.sql
-- Two-step concierge capture (site-reconciliation round, design.md §E3,
-- FR-4.1/FR-4.2): step 1 (trade + zip + notes) is persisted as a PARTIAL lead
-- even if the user abandons the flow; completing step 2 inserts a NEW complete
-- row that references the partial via `partial_id` — INSERT-only RLS stays
-- intact (no anon UPDATE policy needed). Old app versions keep inserting
-- complete rows with the legacy shape (stage defaults to 'complete').

alter table public.leads
  add column if not exists trade text,
  add column if not exists zip text,
  add column if not exists newsletter_opt_in boolean not null default false,
  add column if not exists stage text not null default 'complete',
  add column if not exists partial_id uuid references public.leads(id) on delete set null;

-- Partial rows carry only step-1 data, so contact columns become nullable;
-- completeness is enforced conditionally below.
alter table public.leads
  alter column first_name drop not null,
  alter column last_name drop not null,
  alter column email drop not null,
  alter column phone drop not null,
  alter column address drop not null,
  alter column project_details drop not null;

alter table public.leads
  drop constraint if exists leads_stage_values,
  drop constraint if exists leads_complete_contact,
  drop constraint if exists leads_zip_format;

alter table public.leads
  add constraint leads_stage_values
    check (stage in ('partial', 'complete')),
  -- A complete lead must carry contact info. (project_details/address are now
  -- optional even when complete — the concierge flow collects trade+zip+notes
  -- instead; the legacy form still sends them.)
  add constraint leads_complete_contact
    check (
      stage = 'partial'
      or (
        first_name is not null
        and last_name is not null
        and email is not null
        and phone is not null
      )
    ),
  add constraint leads_zip_format
    check (zip is null or zip ~ '^[0-9]{5}$');

-- Owner-side triage of abandoned step-1 captures.
create index if not exists leads_stage_partial_idx
  on public.leads (created_at desc)
  where stage = 'partial';

-- Notify only on COMPLETE leads: partial captures must not email the owner.
-- (Function body unchanged from 0015; only the trigger gains a WHEN gate.)
drop trigger if exists trg_notify_lead_on_insert on public.leads;
create trigger trg_notify_lead_on_insert
  after insert on public.leads
  for each row
  when (new.stage = 'complete')
  execute function public.notify_lead_on_insert();
