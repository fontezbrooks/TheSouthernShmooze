import type { DirectoryBusinessRow } from '@/lib/database';

/** Certified-provider view-model rendered by BusinessCard. */
export interface DirectoryBusiness {
  id: string;
  name: string;
  /** From `description`. */
  tagline: string;
  logoUrl: string | null;
  /** Raw normalized phone (tel: target), e.g. "6787904781". */
  phone: string | null;
  /** Display phone, e.g. "678-790-4781". */
  phoneDisplay: string | null;
}

/** Format a 10-digit US number as XXX-XXX-XXXX; otherwise return as-is. */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw;
}

/** Map a directory view row to the BusinessCard view-model. */
export function toBusiness(row: DirectoryBusinessRow): DirectoryBusiness {
  const first = row.phone_numbers?.[0]?.normalized_phone_number ?? null;
  return {
    id: row.id,
    name: row.name,
    tagline: row.description ?? '',
    logoUrl: row.logo_url,
    phone: first,
    phoneDisplay: first ? formatPhone(first) : null,
  };
}
