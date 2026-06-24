import { randomUUID } from "expo-crypto";
import { File } from "expo-file-system";
import { getSupabase } from "@/lib/supabase";
import { ok, err, type Result } from "@/lib/result";
import type { LeadInsert } from "@/lib/database";
import type { LeadFormValues } from "./leadSchema";

const BUCKET = "lead-uploads";

/** Format a Date as a `YYYY-MM-DD` calendar date (Postgres `date`), local time. */
function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Submit a lead: generate a client-side id, upload the optional file first (so the row
 * carries a stable path), then insert the row. Returns a Result — no exceptions escape.
 */
export async function submitLead(
  values: LeadFormValues,
): Promise<Result<{ id: string }>> {
  try {
    const supabase = getSupabase();
    const id = randomUUID();
    let filePath: string | null = null;

    if (values.file) {
      const path = `${id}/${values.file.name}`;
      const data = await new File(values.file.uri).arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, data, {
          contentType: values.file.mimeType ?? "application/octet-stream",
          upsert: false,
        });
      if (uploadError) {
        return err("We could not upload your file. Please try again.");
      }
      filePath = path;
    }

    const row: LeadInsert = {
      id,
      first_name: values.firstName,
      last_name: values.lastName,
      email: values.email,
      phone: values.phone,
      address: values.address,
      budget: values.budget,
      project_start_date: values.projectStartDate
        ? toISODate(values.projectStartDate)
        : null,
      project_details: values.projectDetails,
      file_path: filePath,
    };

    const { error: insertError } = await supabase.from("leads").insert(row);
    if (insertError) {
      return err(
        "Something went wrong submitting your request. Please try again.",
      );
    }

    return ok({ id });
  } catch {
    return err("Network error. Please check your connection and try again.");
  }
}
