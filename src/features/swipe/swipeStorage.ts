/**
 * Best-effort on-device persistence for the Seeker's anonymous session token + verified
 * contact, so Matches (keyed by session_token) survive an app restart with no account.
 * Backed by a single JSON file in the document directory. Every call fails safe — a
 * storage error degrades to in-memory only and never throws.
 */
import { File, Paths } from "expo-file-system";
import type { SeekerContact } from "./swipeTypes";

const FILE_NAME = "shmoozer-session.json";

export interface StoredSession {
  sessionToken: string;
  contact: SeekerContact | null;
}

function sessionFile(): File {
  return new File(Paths.document, FILE_NAME);
}

export async function loadSession(): Promise<StoredSession | null> {
  try {
    const file = sessionFile();
    if (!file.exists) return null;
    const text = await file.text();
    const parsed = JSON.parse(text) as StoredSession;
    if (!parsed?.sessionToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveSession(session: StoredSession): Promise<void> {
  try {
    const file = sessionFile();
    if (!file.exists) file.create();
    file.write(JSON.stringify(session));
  } catch {
    // best-effort: persistence is a nicety, not a requirement for the flow
  }
}
