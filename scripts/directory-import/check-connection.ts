import { getServiceClient } from "./client";

/**
 * Checkpoint CD0 — confirm the service-role client reaches the project.
 * Uses an admin-only endpoint, which specifically validates the service-role key.
 *   bun --env-file=.env run scripts/directory-import/check-connection.ts
 */
const supabase = getServiceClient();
const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

if (error) {
	console.error("CONNECT FAIL —", error.message);
	process.exit(1);
}
console.log("CONNECT OK — service-role client reached the project.");
