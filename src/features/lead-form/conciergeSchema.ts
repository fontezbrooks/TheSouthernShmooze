import { z } from "zod";

// Plain regex avoids zod-version churn around `.email()`.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Two-step "Find My Pro" concierge schemas (design.md §E3, FR-4.1).
 * Step 1 — the job: trade + zip + optional notes. Persisted as a PARTIAL
 * lead the moment the user advances (FR-4.2), even if they abandon step 2.
 * Step 2 — contact: name/email/phone + newsletter opt-in. `company` is the
 * same hidden honeypot the legacy form uses.
 */
export const conciergeStepOneSchema = z.object({
	notes: z.string().trim().optional(),
	trade: z.string().trim().min(1, "Select a trade"),
	zip: z
		.string()
		.trim()
		.regex(/^\d{5}$/, "Enter a 5-digit zip code"),
});

export const conciergeStepTwoSchema = z.object({
	company: z.string().max(0).optional(),
	email: z
		.string()
		.trim()
		.min(1, "Email is required")
		.refine((v) => EMAIL_RE.test(v), "Enter a valid email"),
	firstName: z.string().trim().min(1, "First name is required"),
	lastName: z.string().trim().min(1, "Last name is required"),
	newsletterOptIn: z.boolean(),
	phone: z.string().trim().min(7, "Enter a valid phone number"),
});

export type ConciergeStepOneValues = z.infer<typeof conciergeStepOneSchema>;
export type ConciergeStepTwoValues = z.infer<typeof conciergeStepTwoSchema>;

export const emptyStepOne: ConciergeStepOneValues = {
	notes: "",
	trade: "",
	zip: "",
};

export const emptyStepTwo: ConciergeStepTwoValues = {
	company: "",
	email: "",
	firstName: "",
	lastName: "",
	newsletterOptIn: false,
	phone: "",
};
