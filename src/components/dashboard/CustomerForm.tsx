import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Field } from "./ui";
import { fail } from "@/lib/zec";

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter the customer's name").max(120),
  company_name: z.string().trim().max(120).optional(),
  phone: z.string().trim().min(9, "Enter a valid phone number").max(20),
  whatsapp: z.string().trim().max(20).optional(),
  email: z.string().trim().email("Enter a valid email").max(160).or(z.literal("")).optional(),
  site_address: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(2000).optional(),
});
export type CustomerValues = z.infer<typeof schema>;

export function CustomerForm({ initial, id, onSaved }: { initial?: Partial<CustomerValues>; id?: string; onSaved: (id: string) => void }) {
  const qc = useQueryClient();
  const [v, setV] = useState<Partial<CustomerValues>>(initial ?? {});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof CustomerValues) => (e: { target: { value: string } }) => setV({ ...v, [k]: e.target.value });
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const p = schema.safeParse(v);
    if (!p.success) return toast.error(p.error.issues[0].message);
    setBusy(true);
    const row = { ...p.data, email: p.data.email || null, location: p.data.site_address ?? null };
    const r = id ? await supabase.from("customers").update(row).eq("id", id).select("id").single() : await supabase.from("customers").insert(row).select("id").single();
    setBusy(false);
    if (r.error) return fail(r.error);
    toast.success(id ? "Customer updated" : "Customer added");
    void qc.invalidateQueries();
    onSaved(r.data.id);
  }
  return <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
    <Field label="Full name *"><Input value={v.full_name ?? ""} onChange={set("full_name")} /></Field>
    <Field label="Company (optional)"><Input value={v.company_name ?? ""} onChange={set("company_name")} /></Field>
    <Field label="Phone *"><Input type="tel" inputMode="tel" value={v.phone ?? ""} onChange={set("phone")} placeholder="07xx xxx xxx" /></Field>
    <Field label="WhatsApp"><Input type="tel" inputMode="tel" value={v.whatsapp ?? ""} onChange={set("whatsapp")} placeholder="Same as phone if empty" /></Field>
    <Field label="Email" className="sm:col-span-2"><Input type="email" value={v.email ?? ""} onChange={set("email")} /></Field>
    <Field label="Site / physical address" className="sm:col-span-2"><Input value={v.site_address ?? ""} onChange={set("site_address")} placeholder="Estate, building, landmark" /></Field>
    <Field label="Notes" className="sm:col-span-2"><Textarea value={v.notes ?? ""} onChange={set("notes")} rows={3} /></Field>
    <Button type="submit" variant="gold" disabled={busy} className="h-11 sm:col-span-2">{busy ? "Saving…" : "Save customer"}</Button>
  </form>;
}
