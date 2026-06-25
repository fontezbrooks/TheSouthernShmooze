/**
 * Result envelope for operations that can fail at a system boundary (network, storage).
 * Callers branch on `ok` instead of try/catch, keeping error handling explicit and
 * user-facing messages separate from logged detail.
 */
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });

export const err = (error: string): Result<never> => ({ ok: false, error });
