import { z } from "zod";
import type { BudgetValue } from "@/lib/database";

/** Budget options — values mirror the DB enum (`leads.budget`), labels match the live site. */
export const BUDGET_OPTIONS: ReadonlyArray<{
  value: BudgetValue;
  label: string;
}> = [
  { value: "lt_1000", label: "< $1,000" },
  { value: "1000_5000", label: "$1,000 – $5,000" },
  { value: "gt_5000", label: "> $5,000" },
];

const budgetEnum = z.enum(["lt_1000", "1000_5000", "gt_5000"]);

// Plain regex avoids zod-version churn around `.email()`.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** A file chosen via the document/image picker. */
export const pickedFileSchema = z.object({
  uri: z.string().min(1),
  name: z.string().min(1),
  mimeType: z.string().optional(),
  size: z.number().optional(),
});
export type PickedFile = z.infer<typeof pickedFileSchema>;

/**
 * Lead form schema — mirrors the live "Let's Plan Something Awesome" form.
 * Required: first/last name, email, phone, address, project details.
 * Optional: budget (multi-select), project start date, file.
 * `company` is a hidden honeypot that must stay empty.
 */
export const leadSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .refine((v) => EMAIL_RE.test(v), "Enter a valid email"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  address: z.string().trim().min(1, "Address is required"),
  // Single-select per Figma (dropdown). Stored in the DB's array column as [budget].
  budget: budgetEnum.optional(),
  projectStartDate: z.date().optional(),
  projectDetails: z.string().trim().min(1, "Please add a few project details"),
  file: pickedFileSchema.optional(),
  company: z.string().max(0).optional(),
});

export type LeadFormValues = z.infer<typeof leadSchema>;

/** Empty form state for React Hook Form defaults. */
export const emptyLeadForm: LeadFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  budget: undefined,
  projectDetails: "",
  company: "",
};
