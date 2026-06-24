/**
 * Hand-authored Supabase schema types for the `leads` table. Mirrors
 * `supabase/migrations/0001_leads.sql`. Keep in sync if the migration changes.
 */

export type BudgetValue = 'lt_1000' | '1000_5000' | 'gt_5000';

export type LeadStatus = 'new' | 'contacted' | 'closed';

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
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
