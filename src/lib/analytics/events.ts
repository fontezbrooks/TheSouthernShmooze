/**
 * Analytics event taxonomy — single source of truth.
 *
 * Names/properties mirror the owner's schema
 * (claudedocs/analytics/southern-shmooze-posthog-schema.csv). PII guard is
 * enforced BY TYPE: no email/name/phone/free-text fields exist in this map,
 * and zip codes only appear as a 3-digit `zip_prefix` (see zipPrefix()).
 * PII belongs in person properties via identify() — never in event props.
 */
export interface AnalyticsEvent {
	contractor_portal_started: {
		entry_point: "home_banner" | "registry_footer";
	};
	contractor_qualification_submitted: {
		applicant_trade: string;
		instant_qualification_response: "approved" | "flagged" | "review";
	};
	external_google_reviews_opened: {
		pro_business_id: string;
	};
	find_my_pro_initiated: Record<string, never>;
	find_my_pro_step_1_completed: {
		requested_category: string;
		partial_lead_recorded: boolean;
		zip_prefix: string;
	};
	find_my_pro_submitted: {
		matched_pro_id?: string;
	};
	partner_call_button_clicked: {
		pro_business_id: string;
		call_placement_source:
			| "find_my_pro_completion"
			| "profile_view"
			| "swiper_match_popup";
	};
	profile_rendered_gracefully: {
		pro_business_id: string;
		has_photos: boolean;
		has_editorial_story: boolean;
		has_active_deal: boolean;
	};
	registry_search_performed: {
		filter_category?: string;
		filter_tier?: string;
		filter_badges?: string[];
		results_count: number;
		empty_state_rendered: boolean;
	};
	shmoozer_card_rendered: {
		card_index: number;
		/** Paid placement (provider_promotions) — NOT the certified tier. */
		is_promoted: boolean;
		pro_business_id: string;
		pro_business_name: string;
		pro_rating?: number;
		/** Certified level (e.g. "Market Leader") — absent until L1 lands tier data. */
		pro_tier?: string;
	};
	shmoozer_card_swiped: {
		/** Paid placement (provider_promotions) — NOT the certified tier. */
		is_promoted: boolean;
		pro_business_id: string;
		/** Certified level — absent until L1 lands tier data. */
		pro_tier?: string;
		session_swipe_count: number;
		swipe_direction: "left" | "right";
	};
	shmoozer_match_triggered: {
		pro_business_id: string;
		concierge_request_id: string;
	};
}

export type AnalyticsEventName = keyof AnalyticsEvent;

/** Person properties allowed on identify() (B-D11). */
export interface IdentifyProperties {
	applicant_trade?: string;
	user_type: "homeowner" | "contractor";
}

const NON_DIGITS = /\D/g;
const ZIP_PREFIX_LENGTH = 3;

/**
 * Reduce a zip code to its 3-digit prefix — the only form a zip may take in
 * event properties (B-FR6).
 */
export function zipPrefix(zip: string): string {
	return zip.replace(NON_DIGITS, "").slice(0, ZIP_PREFIX_LENGTH);
}
