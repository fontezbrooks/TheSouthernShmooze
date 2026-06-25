import { getServiceClient } from './client';

/**
 * Checkpoint CD1 — confirm the directory schema exists (run after applying
 * migrations 0003-0005).
 *   bun --env-file=.env run scripts/directory-import/check-schema.ts
 */
const supabase = getServiceClient();

const targets = [
  'directory_import_batches',
  'directory_businesses',
  'directory_business_phone_numbers',
  'directory_businesses_app_view',
];

let allOk = true;
for (const t of targets) {
  const { error } = await supabase.from(t).select('*', { head: true, count: 'exact' });
  if (error) {
    console.log(`  ${t}: MISSING — ${error.code ?? ''} ${error.message}`);
    allOk = false;
  } else {
    console.log(`  ${t}: OK`);
  }
}

console.log(allOk ? 'SCHEMA OK' : 'SCHEMA INCOMPLETE — apply migrations 0003-0005');
process.exit(allOk ? 0 : 1);
