import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field } from "./ui";
import { fail, must } from "@/lib/zec";

export function JobForm({ customerId, enquiry, onSaved }: { customerId?: string; enquiry?: { id: string; description?: string | null; location?: string | null; service_id?: string | null }; onSaved: (id: string) => void }) {
  const qc = useQueryClient();
  const opts = useQuery({ queryKey: ["job-form-options"], queryFn: async () => ({
    customers: must(await supabase.from("customers").select("id,full_name,site_address,location").order("full_name")),
    services: must(await supabase.from("services").select("id,name").order("sort_order")),
  }) });
  const [v, setV] = useState({ customer_id: customerId ?? "", title: "", description: enquiry?.description ?? "", site_address: enquiry?.location ?? "", service_id: enquiry?.service_id ?? "", start_date: "", expected_completion: "" });
  const [busy, setBusy] = useState(false);
  const cust = opts.data?.customers.find((c) => c.id === v.customer_id);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!v.customer_id) return toast.error("Choose a customer");
    if (v.title.trim().length < 3) return toast.error("Give the job a short title");
    if (v.start_date && v.expected_completion && v.expected_completion < v.start_date) return toast.error("Expected completion cannot be before the start date");
    setBusy(true);
    const r = await supabase.from("jobs").insert({
      customer_id: v.customer_id, title: v.title.trim(), description: v.description || null, site_address: v.site_address || cust?.site_address || cust?.location || null,
      location: v.site_address || cust?.site_address || null, service_id: v.service_id || null, enquiry_id: enquiry?.id ?? null,
      start_date: v.start_date || null, expected_completion: v.expected_completion || null, status: "NEW_ENQUIRY",
    }).select("id").single();
    if (!r.error && enquiry) await supabase.from("enquiries").update({ status: "CONVERTED", customer_id: v.customer_id }).eq("id", enquiry.id);
    setBusy(false);
    if (r.error) return fail(r.error);
    toast.success("Job created");
    void qc.invalidateQueries();
    onSaved(r.data.id);
  }
  return <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
    {!customerId ? <Field label="Customer *" className="sm:col-span-2"><Select value={v.customer_id} onValueChange={(x) => setV({ ...v, customer_id: x })}><SelectTrigger className="h-11"><SelectValue placeholder="Choose a customer" /></SelectTrigger><SelectContent>{opts.data?.customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}</SelectContent></Select></Field> : null}
    <Field label="Job title *" className="sm:col-span-2"><Input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} placeholder="e.g. Full house rewiring" /></Field>
    <Field label="Service"><Select value={v.service_id} onValueChange={(x) => setV({ ...v, service_id: x })}><SelectTrigger className="h-11"><SelectValue placeholder="Choose" /></SelectTrigger><SelectContent>{opts.data?.services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></Field>
    <Field label="Site address"><Input value={v.site_address} onChange={(e) => setV({ ...v, site_address: e.target.value })} placeholder={cust?.site_address ?? "Uses customer address if empty"} /></Field>
    <Field label="Start date"><Input type="date" value={v.start_date} onChange={(e) => setV({ ...v, start_date: e.target.value })} /></Field>
    <Field label="Expected completion"><Input type="date" value={v.expected_completion} onChange={(e) => setV({ ...v, expected_completion: e.target.value })} /></Field>
    <Field label="Description" className="sm:col-span-2"><Textarea rows={3} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} /></Field>
    <Button type="submit" variant="gold" className="h-11 sm:col-span-2" disabled={busy}>{busy ? "Creating…" : "Create job"}</Button>
  </form>;
}
