import { readFile } from 'node:fs/promises';
import { getServiceClient } from './client';
import {
  transformRecord,
  extractPhones,
  buildBatchPayload,
  type BusinessRow,
  type PhoneRow,
  type DirectoryRecord,
  type TopLevelResponse,
} from './transform';

/**
 * Seed the business directory from a MembershipWorks JSON export.
 *
 *   bun --env-file=.env run scripts/directory-import/import.ts <file.json> [--dry-run]
 *
 * Idempotent: businesses upsert by `source_uid`; phone rows are replaced per business.
 * Re-running with the same file leaves row counts unchanged.
 */

interface Args {
  filePath: string;
  dryRun: boolean;
}

function parseArgs(argv: string[]): Args {
  const args = argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const filePath = args.find((a) => !a.startsWith('--'));
  if (!filePath) {
    throw new Error('Usage: bun --env-file=.env run scripts/directory-import/import.ts <file.json> [--dry-run]');
  }
  return { filePath, dryRun };
}

async function loadJson(filePath: string): Promise<TopLevelResponse & { usr: DirectoryRecord[] }> {
  const raw = await readFile(filePath, 'utf8');
  const json = JSON.parse(raw) as TopLevelResponse;
  if (!Array.isArray(json.usr)) {
    throw new Error('Expected `usr` to be an array in the source JSON');
  }
  return json as TopLevelResponse & { usr: DirectoryRecord[] };
}

interface Prepared {
  business: BusinessRow;
  phones: PhoneRow[];
}

function prepareRecords(records: DirectoryRecord[]): { prepared: Prepared[]; skipped: number } {
  const prepared: Prepared[] = [];
  let skipped = 0;
  for (const record of records) {
    const business = transformRecord(record);
    if (!business) {
      skipped += 1;
      console.warn(`  skip: invalid record (missing uid/nam) — uid=${record.uid ?? '(none)'}`);
      continue;
    }
    prepared.push({ business, phones: extractPhones(record.phn) });
  }
  return { prepared, skipped };
}

async function main(): Promise<void> {
  const { filePath, dryRun } = parseArgs(process.argv);
  const json = await loadJson(filePath);
  const batchPayload = buildBatchPayload(json);
  const { prepared, skipped } = prepareRecords(json.usr);

  console.log(`Source: ${filePath}`);
  console.log(`Records: ${json.usr.length} | valid: ${prepared.length} | skipped: ${skipped}`);

  if (dryRun) {
    console.log('--- DRY RUN (no database writes) ---');
    console.log(`Batch: source_type=${batchPayload.source_type} count=${batchPayload.source_record_count}`);
    console.log('Sample business:', JSON.stringify(prepared[0]?.business, null, 2));
    console.log('Sample phones:', JSON.stringify(prepared[0]?.phones));
    return;
  }

  const supabase = getServiceClient();

  // 1) Record the import batch.
  const { data: batch, error: batchError } = await supabase
    .from('directory_import_batches')
    .insert(batchPayload)
    .select('id')
    .single();
  if (batchError) throw batchError;
  const importBatchId = batch.id as string;

  // 2) Bulk upsert businesses, keyed by source_uid; get back ids to attach phones.
  const businessRows = prepared.map((p) => ({ ...p.business, import_batch_id: importBatchId }));
  const { data: upserted, error: bizError } = await supabase
    .from('directory_businesses')
    .upsert(businessRows, { onConflict: 'source_uid' })
    .select('id, source_uid');
  if (bizError) throw bizError;

  const idBySourceUid = new Map<string, string>(
    (upserted ?? []).map((r) => [r.source_uid as string, r.id as string]),
  );
  const businessIds = [...idBySourceUid.values()];

  // 3) Replace phone rows: delete existing for these businesses, then bulk insert.
  if (businessIds.length > 0) {
    const { error: delError } = await supabase
      .from('directory_business_phone_numbers')
      .delete()
      .in('business_id', businessIds);
    if (delError) throw delError;
  }

  const phoneRows = prepared.flatMap((p) => {
    const businessId = idBySourceUid.get(p.business.source_uid);
    if (!businessId) return [];
    return p.phones.map((phone) => ({ ...phone, business_id: businessId }));
  });

  if (phoneRows.length > 0) {
    const { error: phoneError } = await supabase
      .from('directory_business_phone_numbers')
      .insert(phoneRows);
    if (phoneError) throw phoneError;
  }

  console.log(
    `Done. businesses upserted: ${idBySourceUid.size} | phone rows: ${phoneRows.length} | ` +
      `skipped: ${skipped} | batch: ${importBatchId}`,
  );
}

main().catch((error) => {
  console.error('Import failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
