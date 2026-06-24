import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database';

interface SupabaseExtra {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

function readSupabaseConfig(): { url: string; anonKey: string } {
  const extra = (Constants.expoConfig?.extra ?? {}) as SupabaseExtra;
  const url = extra.supabaseUrl?.trim() ?? '';
  const anonKey = extra.supabaseAnonKey?.trim() ?? '';

  if (!url || !anonKey) {
    throw new Error(
      'Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in your .env (see .env.example).',
    );
  }
  return { url, anonKey };
}

let client: SupabaseClient<Database> | null = null;

/**
 * Lazily-created Supabase singleton. Uses the public anon key with no session
 * persistence — the app only performs insert-only writes (no auth), so we avoid
 * the AsyncStorage/session machinery entirely.
 */
export function getSupabase(): SupabaseClient<Database> {
  if (!client) {
    const { url, anonKey } = readSupabaseConfig();
    client = createClient<Database>(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
