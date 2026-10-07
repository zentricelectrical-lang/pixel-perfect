import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const JOB_STATUSES = [
  ["NEW_ENQUIRY", "New Enquiry"], ["SITE_SURVEY", "Site Survey"], ["QUOTATION_SENT", "Quotation Sent"], ["AWAITING_APPROVAL", "Awaiting Approval"],
  ["APPROVED", "Approved"], ["SCHEDULED", "Scheduled"], ["IN_PROGRESS", "In Progress"], ["TESTING", "Testing"], ["COMPLETED", "Completed"],
  ["INVOICED", "Invoiced"], ["PARTIALLY_PAID", "Partially Paid"], ["PAID", "Paid"], ["CLOSED", "Closed"], ["ON_HOLD", "On Hold"], ["CANCELLED", "Cancelled"],
] as const;
export const label = (s?: string | null) => (s ?? "").replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
export const METHODS = [["mpesa", "M-Pesa"], ["cash", "Cash"], ["bank", "Bank"], ["other", "Other"]] as const;
export const methodLabel = (m?: string | null) => METHODS.find(([k]) => k === m)?.[1] ?? m ?? "";

/** Show a readable error from the database (trigger messages are written for people). */
export function fail(e: unknown) {
  const msg = e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Something went wrong";
  toast.error(msg);
}
/** Throw on Supabase error so React Query / handlers can surface it. */
export function must<T>(r: { data: T; error: unknown }): T {
  if (r.error) throw r.error;
  return r.data;
}

export async function getSettings() {
  return must(await supabase.from("business_settings").select("*").limit(1).maybeSingle());
}

export const toneFor = (s: string) =>
  ["COMPLETED", "CONFIRMED", "PAID", "APPROVED", "ACCEPTED", "CLOSED"].includes(s) ? "bg-whatsapp/15 text-whatsapp"
  : ["CANCELLED", "REJECTED", "FAILED", "OVERDUE", "EXPIRED"].includes(s) ? "bg-destructive/15 text-destructive"
  : ["NEW", "NEW_ENQUIRY", "PENDING", "DRAFT", "SENT", "AWAITING_APPROVAL", "PARTIALLY_PAID"].includes(s) ? "bg-gold/20 text-gold"
  : "bg-primary/15 text-primary";
