/**
 * Hand-authored Supabase schema types for the `leads` table. Mirrors
 * `supabase/migrations/0001_leads.sql`. Keep in sync if the migration changes.
 */

export type BudgetValue = "lt_1000" | "1000_5000" | "gt_5000";

export type LeadStatus = "new" | "contacted" | "closed";

export interface LeadRow {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  budget: BudgetValue[];
  project_start_date: string | null;
  project_details: string;
  file_path: string | null;
  status: LeadStatus;
}

/** Columns the client supplies on insert. `status` is forced to 'new' by RLS/default. */
export interface LeadInsert {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  budget?: BudgetValue[];
  project_start_date?: string | null;
  project_details: string;
  file_path?: string | null;
}

/** A phone entry aggregated into the directory app view. */
export interface DirectoryPhone {
  phone_number: string;
  normalized_phone_number: string;
}

/**
 * Row of `directory_businesses_app_view` — clean columns + aggregated phone
 * numbers. The app queries THIS view, never the raw tables. See migrations
 * 0003-0005 and the `directory-backend` memory.
 */
export interface DirectoryBusinessRow {
  id: string;
  source_uid: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  longitude: number | null;
  latitude: number | null;
  recommended_score: number | null;
  has_coupon: boolean;
  /** Source `xgm` flag — the MembershipWorks certified-star badge. */
  is_certified: boolean;
  phone_numbers: DirectoryPhone[] | null;
  created_at: string;
  updated_at: string;
}

/**
 * Row of `directory_business_detail_view` (migration 0010, renamed in 0013) — a
 * business joined with its ingested MembershipWorks profile + phones, for the
 * in-app business-detail screen.
 */
export interface DirectoryBusinessDetailRow {
  source_uid: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  longitude: number | null;
  latitude: number | null;
  recommended_score: number | null;
  has_coupon: boolean;
  is_certified: boolean;
  about_text: string | null;
  about_html: string | null;
  website: string | null;
  contact_name: string | null;
  address: Record<string, unknown> | null;
  socials: Record<string, unknown> | null;
  deal: Record<string, unknown> | null;
  gallery: Array<{ small: string | null; large: string | null }> | null;
  phone_numbers: DirectoryPhone[] | null;
}

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: LeadRow;
        Insert: LeadInsert;
        Update: Partial<LeadRow>;
        Relationships: [];
      };
    };
    Views: {
      directory_businesses_app_view: {
        Row: DirectoryBusinessRow;
        Relationships: [];
      };
      directory_business_detail_view: {
        Row: DirectoryBusinessDetailRow;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
