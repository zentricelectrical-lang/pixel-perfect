import { supabase } from "@/integrations/supabase/client";
import { must } from "./zec";

export const FIELD_DOCS = [
  ["site_survey", "Site Survey"], ["job_card", "Job Card"], ["material_list", "Material List"], ["testing", "Installation & Testing Checklist"],
  ["handover", "Handover Certificate"], ["warranty", "Warranty Certificate"], ["maintenance", "Maintenance Agreement"],
] as const;
export type FieldDocType = (typeof FIELD_DOCS)[number][0];
export const docTitle = (t: string) => FIELD_DOCS.find(([k]) => k === t)?.[1] ?? t;

export const DEFAULT_TESTS = ["Visual inspection", "Continuity of protective conductors", "Polarity", "Insulation resistance", "Earth continuity", "Earth electrode resistance", "RCD / RCBO trip test", "Supply voltage", "Functional testing", "Final inspection"];

export async function createQuote(job: { id: string; customer_id: string; title: string; description?: string | null }) {
  const s = must(await supabase.from("business_settings").select("terms_text").limit(1).maybeSingle());
  const valid = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
  return must(await supabase.from("quotes").insert({ customer_id: job.customer_id, job_id: job.id, title: job.title, description: job.description ?? null, valid_until: valid, terms: s?.terms_text ? null : "Quotation valid for 30 days. 50% deposit required before work starts; balance on completion." }).select("id").single()).id;
}

/** Builds a draft invoice from an accepted quotation: items, labour, transport and other charges carry over. */
export async function createInvoiceFromQuote(quoteId: string) {
  const q = must(await supabase.from("quotes").select("*, quote_items(*)").eq("id", quoteId).single());
  if (q.status !== "ACCEPTED") throw new Error("Only an accepted quotation can be invoiced.");
  const s = must(await supabase.from("business_settings").select("payment_instructions").limit(1).maybeSingle());
  const due = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
  const inv = must(await supabase.from("invoices").insert({ customer_id: q.customer_id, job_id: q.job_id, quote_id: q.id, description: q.title, discount: q.discount, tax_rate: q.tax_rate, due_date: due, payment_instructions: s?.payment_instructions ?? null, terms: q.terms, is_demo: q.is_demo }).select("id").single());
  const items = [...q.quote_items.sort((a, b) => a.sort_order - b.sort_order).map((i) => ({ description: i.description, quantity: i.quantity, unit: i.unit, unit_price: i.unit_price }))];
  if (Number(q.labour_cost)) items.push({ description: "Labour", quantity: 1, unit: "lot", unit_price: q.labour_cost });
  if (Number(q.transport_cost)) items.push({ description: "Transport", quantity: 1, unit: "lot", unit_price: q.transport_cost });
  if (Number(q.other_charges)) items.push({ description: "Other charges", quantity: 1, unit: "lot", unit_price: q.other_charges });
  if (items.length) must(await supabase.from("invoice_items").insert(items.map((i, n) => ({ ...i, invoice_id: inv.id, sort_order: n }))));
  // Re-save so the database recalculates with the discount now applicable to the full subtotal.
  must(await supabase.from("invoices").update({ discount: q.discount }).eq("id", inv.id));
  return inv.id;
}

export async function createBlankInvoice(job: { id: string; customer_id: string; title: string }) {
  const s = must(await supabase.from("business_settings").select("payment_instructions").limit(1).maybeSingle());
  const due = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
  return must(await supabase.from("invoices").insert({ customer_id: job.customer_id, job_id: job.id, description: job.title, due_date: due, payment_instructions: s?.payment_instructions ?? null }).select("id").single()).id;
}

/** New field document, pre-filled from the job and its approved quotation. Never pre-fills test results. */
export async function createFieldDoc(job: { id: string; title: string; description?: string | null }, type: FieldDocType) {
  const data: Record<string, unknown> = {};
  if (type === "job_card") {
    const q = must(await supabase.from("quotes").select("reference,scope,description").eq("job_id", job.id).eq("status", "ACCEPTED").order("created_at", { ascending: false }).limit(1).maybeSingle());
    data.work_assigned = q?.scope || q?.description || job.description || job.title;
    data.approved_quote = q?.reference ?? "";
  }
  if (type === "testing") data.tests = DEFAULT_TESTS.map((name) => ({ name, instrument: "", result: "", measurement: "", unit: "", outcome: "", notes: "" }));
  if (type === "handover") data.work_completed = job.description ?? job.title;
  if (type === "warranty") { data.start_date = new Date().toISOString().slice(0, 10); data.months = 12; data.covered = job.title; }
  if (type === "maintenance") { data.start_date = new Date().toISOString().slice(0, 10); data.months = 12; data.frequency = "Quarterly"; }
  return must(await supabase.from("field_documents").insert({ job_id: job.id, doc_type: type, data: data as never }).select("id").single()).id;
}

export async function signedUrl(path: string) {
  const r = await supabase.storage.from("customer-uploads").createSignedUrl(path, 3600);
  return r.data?.signedUrl ?? null;
}
