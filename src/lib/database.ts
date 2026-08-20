/**
 * Hand-authored Supabase schema types for the `leads` table. Mirrors
 * `supabase/migrations/0001_leads.sql`. Keep in sync if the migration changes.
 */

export type BudgetValue = "lt_1000" | "1000_5000" | "gt_5000";

export type LeadStatus = "new" | "contacted" | "closed";

export interface LeadRow {
	address: string | null;
	budget: BudgetValue[];
	created_at: string;
	email: string | null;
	file_path: string | null;
	// Contact/detail columns nullable since 0019 (two-step concierge):
	// required only when stage='complete' (DB `leads_complete_contact` check).
	first_name: string | null;
	id: string;
	last_name: string | null;
	newsletter_opt_in: boolean;
	partial_id: string | null;
	phone: string | null;
	project_details: string | null;
	project_start_date: string | null;
	stage: "partial" | "complete";
	status: LeadStatus;
	// Two-step concierge columns (0019).
	trade: string | null;
	zip: string | null;
}

/** Columns the client supplies on insert. `status` is forced to 'new' by RLS/default. */
export interface LeadInsert {
	address?: string | null;
	budget?: BudgetValue[];
	email?: string | null;
	file_path?: string | null;
	// Contact columns are nullable since 0019 (two-step concierge): the DB's
	// `leads_complete_contact` check requires them whenever stage='complete';
	// zod guards each submit path client-side.
	first_name?: string | null;
	id?: string;
	last_name?: string | null;
	newsletter_opt_in?: boolean;
	partial_id?: string | null;
	phone?: string | null;
	project_details?: string | null;
	project_start_date?: string | null;
	stage?: "partial" | "complete";
	// Two-step concierge columns (0019).
	trade?: string | null;
	zip?: string | null;
}

/** A phone entry aggregated into the directory app view. */
export interface DirectoryPhone {
	normalized_phone_number: string;
	phone_number: string;
}

/**
 * Row of `directory_businesses_app_view` — clean columns + aggregated phone
 * numbers. The app queries THIS view, never the raw tables. See migrations
 * 0003-0005 and the `directory-backend` memory.
 */
export interface DirectoryBusinessRow {
	created_at: string;
	description: string | null;
	has_coupon: boolean;
	id: string;
	/** Source `xgm` flag — the MembershipWorks certified-star badge. */
	is_certified: boolean;
	latitude: number | null;
	logo_url: string | null;
	longitude: number | null;
	name: string;
	phone_numbers: DirectoryPhone[] | null;
	recommended_score: number | null;
	source_uid: string;
	updated_at: string;
}

/**
 * Row of `directory_business_detail_view` (migration 0010, renamed in 0013) — a
 * business joined with its ingested MembershipWorks profile + phones, for the
 * in-app business-detail screen.
 */
export interface DirectoryBusinessDetailRow {
	about_html: string | null;
	about_text: string | null;
	address: Record<string, unknown> | null;
	contact_name: string | null;
	deal: Record<string, unknown> | null;
	description: string | null;
	gallery: Array<{ small: string | null; large: string | null }> | null;
	has_coupon: boolean;
	is_certified: boolean;
	latitude: number | null;
	logo_url: string | null;
	longitude: number | null;
	name: string;
	phone_numbers: DirectoryPhone[] | null;
	recommended_score: number | null;
	socials: Record<string, unknown> | null;
	source_uid: string;
	website: string | null;
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
