import "react-native-url-polyfill/auto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

interface SupabaseExtra {
	supabaseAnonKey?: string;
	supabaseUrl?: string;
}

function readSupabaseConfig(): { url: string; anonKey: string } {
	const extra = (Constants.expoConfig?.extra ?? {}) as SupabaseExtra;
	const url = extra.supabaseUrl?.trim() ?? "";
	const anonKey = extra.supabaseAnonKey?.trim() ?? "";

	if (!(url && anonKey)) {
		throw new Error(
			"Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in your .env (see .env.example)."
		);
	}
	return { anonKey, url };
}

let client: SupabaseClient | null = null;

/**
 * Lazily-created Supabase singleton. Uses the public anon key with no session
 * persistence — the app only performs insert-only writes (no auth), so we avoid
 * the AsyncStorage/session machinery entirely.
 */
export function getSupabase(): SupabaseClient {
	if (!client) {
		const { url, anonKey } = readSupabaseConfig();
		client = createClient(url, anonKey, {
			auth: {
				autoRefreshToken: false,
				detectSessionInUrl: false,
				persistSession: false,
			},
		});
	}
	return client;
}
