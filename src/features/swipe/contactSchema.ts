import { z } from "zod";
import type { SeekerContact, SwipeTask } from "./swipeTypes";

// Plain regex mirrors the Concierge schema (avoids zod-version churn around `.email()`).
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * The trimmed Concierge-style form shown on the first Match: contact + budget + details.
 * Address / start-date / file are intentionally dropped so the swipe stays a quick step.
 */
export const swipeContactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .refine((v) => EMAIL_RE.test(v), "Enter a valid email"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  budget: z.enum(["lt_1000", "1000_5000", "gt_5000"]).optional(),
  projectDetails: z.string().trim().min(1, "Please add a few details"),
});

export type SwipeContactValues = z.infer<typeof swipeContactSchema>;

/**
 * Prefill contact-form defaults: budget/details from the onboarding task, and the
 * name/email/phone from a remembered contact (so a returning Seeker just re-confirms).
 */
export function prefillFromTask(
  task: SwipeTask | null,
  contact?: SeekerContact | null,
): SwipeContactValues {
  const parts = (contact?.name ?? "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
    email: contact?.email ?? "",
    phone: contact?.phone ?? "",
    budget: task?.budget ?? undefined,
    projectDetails: task?.keyword ? `Looking for ${task.keyword}.` : "",
  };
}
