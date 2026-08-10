import { z } from "zod";

// Plain regex avoids zod-version churn around `.email()`.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^[\d\s()+.-]{7,}$/;

/**
 * Check My Fit wizard (design.md §E5, site parity: /contractors form).
 * Field names and option VALUES mirror the site's wizard exactly — the
 * Worker payload (`submit-application`) is shared with the web form, so a
 * renamed field here would fork the application data shape.
 */

export const YEARS_OPTIONS = [
  { value: "lt1", label: "Less than 1 year" },
  { value: "1-3", label: "1 to 3 years" },
  { value: "4-9", label: "4 to 9 years" },
  { value: "10plus", label: "10+ years" },
] as const;

export const LICENSED_OPTIONS = [
  { value: "yes", label: "Yes, both" },
  { value: "license-only", label: "Licensed, not insured" },
  { value: "insured-only", label: "Insured, not licensed" },
  { value: "no", label: "Neither yet" },
  { value: "na", label: "Not applicable to my trade" },
] as const;

// These four use the display text AS the value — the site's <option> tags
// carry no value attribute, so the label is what the Worker receives.
export const LEAD_SOURCE_OPTIONS = [
  "Word of mouth / referrals",
  "Google search",
  "Paid ads",
  "Social media",
  "It's inconsistent / not sure",
] as const;

export const CHALLENGE_OPTIONS = [
  "Not enough leads",
  "Inconsistent work",
  "Weak online presence",
  "Standing out from competitors",
  "Something else",
] as const;

export const REVIEWS_RANGE_OPTIONS = [
  "None yet",
  "1 to 10",
  "11 to 50",
  "50+",
] as const;

export const WANT_HELP_OPTIONS = [
  "More leads",
  "A better website",
  "Photos & video",
  "More reviews",
  "Showing up on Google & AI",
  "Not sure yet",
] as const;

/** Pain points map 1:1 to the site's ids + Growth Studio service mapping. */
export const PAIN_POINTS = [
  {
    id: "nogoogle",
    label:
      "I don't show up on Google or in AI answers when people search my trade",
    svc: "GBP Optimization + Reviews",
  },
  {
    id: "reviews",
    label: "I don't have enough reviews, or they're stale",
    svc: "GBP Optimization + Reviews",
  },
  {
    id: "website",
    label: "My website is old, slow, or I don't have one",
    svc: "Website & Local SEO",
  },
  {
    id: "leads",
    label: "Leads are inconsistent, some weeks are dead",
    svc: "Google & Meta Ads",
  },
  {
    id: "followup",
    label: "Leads slip through the cracks before I call back",
    svc: "CRM Buildout",
  },
  {
    id: "photos",
    label: "I have no good photos or video of my work",
    svc: "Photo & Video Shoot Days",
  },
  {
    id: "social",
    label: "I never get around to posting anything",
    svc: "Social Media Management",
  },
  {
    id: "pricing",
    label: "I'm competing on price and losing jobs to cheap bids",
    svc: "Authority Building",
  },
  {
    id: "unknown",
    label: "Nobody in my area knows who I am yet",
    svc: "Authority Building",
  },
] as const;

const values = <T extends readonly { value: string }[]>(opts: T) =>
  opts.map((o) => o.value) as [string, ...string[]];

export const wizardSchema = z.object({
  // Step 1 — contact
  contact: z.string().trim().min(1, "Please enter your name."),
  email: z
    .string()
    .trim()
    .regex(EMAIL_RE, "Please enter a valid email address."),
  phone: z
    .string()
    .trim()
    .regex(PHONE_RE, "Please enter a valid phone number."),
  // Step 2 — business lookup (picking a Google listing is optional; the
  // typed name still submits and lands as "unverified", same as the site)
  business: z.string().trim().min(1, "Please enter your business name."),
  // No .default() anywhere: defaults make the schema's input type differ
  // from its output, which breaks zodResolver's Control typing. Defaults
  // live in emptyWizard instead.
  placeId: z.string(),
  placeAddress: z.string(),
  placeSession: z.string(),
  // Step 3 — trade basics
  trade: z.string().trim().min(1, "Please enter your primary trade."),
  yearsInBusiness: z.enum(values(YEARS_OPTIONS), {
    message: "Please select one.",
  }),
  licensedInsured: z.enum(values(LICENSED_OPTIONS), {
    message: "Please select one.",
  }),
  // Step 4 — service area + web presence
  serviceArea: z.string().trim().min(1, "Please enter your service area."),
  webLink: z.string().trim(),
  noWebsite: z.boolean(),
  // Step 5 — marketing diagnostics
  leadSource: z.enum(LEAD_SOURCE_OPTIONS, { message: "Please select one." }),
  biggestChallenge: z.enum(CHALLENGE_OPTIONS, {
    message: "Please select one.",
  }),
  // Step 6 — reviews + help
  reviewsRange: z.enum(REVIEWS_RANGE_OPTIONS, {
    message: "Please select one.",
  }),
  wantHelp: z.enum(WANT_HELP_OPTIONS, { message: "Please select one." }),
  // Step 7 — pain points (optional multi-select)
  painPoints: z.array(z.string()),
});

export type WizardValues = z.infer<typeof wizardSchema>;

/** Fields validated when advancing FROM each step (1-based, 7 steps). */
export const STEP_FIELDS: readonly (readonly (keyof WizardValues)[])[] = [
  ["contact", "email", "phone"],
  ["business"],
  ["trade", "yearsInBusiness", "licensedInsured"],
  ["serviceArea", "webLink"],
  ["leadSource", "biggestChallenge"],
  ["reviewsRange", "wantHelp"],
  ["painPoints"],
];

export const STEP_COUNT = STEP_FIELDS.length;

/**
 * Website is required unless "I don't have a website yet" is checked —
 * cross-field, so it lives outside the zod schema (RHF validates per field).
 */
export const webLinkMissing = (
  v: Pick<WizardValues, "webLink" | "noWebsite">,
) => !v.noWebsite && v.webLink.trim().length === 0;

export const emptyWizard: WizardValues = {
  contact: "",
  email: "",
  phone: "",
  business: "",
  placeId: "",
  placeAddress: "",
  placeSession: "",
  trade: "",
  yearsInBusiness: "" as WizardValues["yearsInBusiness"],
  licensedInsured: "" as WizardValues["licensedInsured"],
  serviceArea: "",
  webLink: "",
  noWebsite: false,
  leadSource: "" as WizardValues["leadSource"],
  biggestChallenge: "" as WizardValues["biggestChallenge"],
  reviewsRange: "" as WizardValues["reviewsRange"],
  wantHelp: "" as WizardValues["wantHelp"],
  painPoints: [],
};
