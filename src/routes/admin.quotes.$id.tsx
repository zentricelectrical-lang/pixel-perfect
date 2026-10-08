import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Archive, Check, Copy, FileText, Send, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell, useDashboardAccess, money } from "@/components/dashboard/DashboardShell";
import { Box, Chip, Field, PageTitle, DemoTag } from "@/components/dashboard/ui";
import { ItemsEditor } from "@/components/dashboard/ItemsEditor";
import { DocActions, DocView } from "@/components/docs/DocView";
import { SignaturePad } from "@/components/docs/SignaturePad";
import { kes, dmy, type DocModel } from "@/components/docs/model";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createInvoiceFromQuote } from "@/lib/job-actions";
import { fail, must, getSettings, label } from "@/lib/zec";

export const Route = createFileRoute("/admin/quotes/$id")({
  head: () => ({ meta: [{ title: "Quotation | Zentric Admin" }, { name: "description", content: "Quotation builder." }, { property: "og:title", content: "Quotation | Zentric Admin" }, { property: "og:description", content: "Quotation builder." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: QuotePage,
});

const NUM = ["labour_cost", "transport_cost", "other_charges", "discount", "tax_rate", "deposit"] as const;
const TXT = ["title", "description", "scope", "valid_until", "terms", "exclusions", "assumptions", "notes"] as const;

function QuotePage() {
  const { id } = Route.useParams();
  const access = useDashboardAccess("admin");
  const nav = useNavigate();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["quote", id], enabled: !!access.data?.allowed, queryFn: async () => must(await supabase.from("quotes").select("*, quote_items(*), customers(*), jobs(reference,title,site_address)").eq("id", id).single()) });
  const biz = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const [f, setF] = useState<Record<string, string>>({});
  const [approve, setApprove] = useState(false);
  const [sig, setSig] = useState<{ name: string; image: string | null }>({ name: "", image: null });
  useEffect(() => { if (q.data) setF(Object.fromEntries([...NUM, ...TXT].map((k) => [k, String(q.data[k] ?? "")]))); }, [q.data]);
  if (!q.data) return <DashboardShell area="admin" active="quotes">{q.isError ? <p className="text-destructive">This quotation could not be loaded.</p> : <p>Loading quotation…</p>}</DashboardShell>;
  const d = q.data, c = d.customers, locked = d.status !== "DRAFT";
  const refresh = () => { void q.refetch(); void qc.invalidateQueries({ queryKey: ["job"] }); };
  const act = async (fn: () => PromiseLike<{ error: unknown }>, ok: string) => { const r = await fn(); if (r.error) return fail(r.error); toast.success(ok); refresh(); };

  async function saveHeader() {
    const row: Record<string, unknown> = {};
    for (const k of NUM) { const n = Number(f[k] || 0); if (!(n >= 0)) return fail({ message: "Amounts cannot be negative." }); row[k] = n; }
    for (const k of TXT) row[k] = f[k]?.trim() || null;
    if (!row.title) return fail({ message: "The quotation needs a title." });
    await act(() => supabase.from("quotes").update(row as never).eq("id", id), "Quotation saved");
  }
  async function revise() {
    // Issued quotations are never overwritten: snapshot, then copy into a new draft version.
    try {
      must(await supabase.from("document_versions").insert({ entity: "quotes", entity_id: d.id, version: d.version, snapshot: d as never }));
      const { id: _i, reference: _r, created_at: _c, updated_at: _u, customers: _cu, jobs: _j, quote_items, status: _s, responded_at: _ra, approved_by_name: _a, approval_signature: _as, subtotal: _st, tax_amount: _t, total: _to, ...rest } = d;
      const n = must(await supabase.from("quotes").insert({ ...rest, parent_quote_id: d.id, version: d.version + 1, status: "DRAFT" }).select("id").single());
      if (quote_items.length) must(await supabase.from("quote_items").insert(quote_items.map(({ id: _x, quote_id: _q, ...it }) => ({ ...it, quote_id: n.id }))));
      toast.success("New draft version created");
      void nav({ to: "/admin/quotes/$id", params: { id: n.id } });
    } catch (e) { fail(e); }
  }
  async function accept() {
    if (sig.name.trim().length < 2) return fail({ message: "Enter the name of the person approving." });
    await act(() => supabase.from("quotes").update({ status: "ACCEPTED", approved_by_name: sig.name.trim(), approval_signature: sig.image }).eq("id", id), "Quotation approved");
    setApprove(false);
  }
  const doc: DocModel = {
    title: "Quotation", number: d.reference, date: dmy(d.created_at), status: label(d.status), demo: d.is_demo,
    meta: [["Valid until", dmy(d.valid_until)], ...(d.jobs ? [["Job", d.jobs.reference] as [string, string]] : []), ...(d.version > 1 ? [["Version", String(d.version)] as [string, string]] : [])],
    parties: [{ label: "Customer", lines: [c.full_name, c.company_name ?? "", c.phone ?? "", c.email ?? "", c.site_address ?? c.location ?? ""] }, { label: "Project", lines: [d.title, d.jobs?.site_address ?? ""] }],
    table: { head: ["Description", "Qty", "Unit", "Unit price", "Amount"], numeric: [1, 3, 4], rows: [...d.quote_items].sort((a, b) => a.sort_order - b.sort_order).map((i) => [i.description, String(Number(i.quantity)), i.unit ?? "", kes(i.unit_price), kes(Number(i.quantity) * Number(i.unit_price))]) },
    totals: [["Materials & items", kes(d.quote_items.reduce((n, i) => n + Number(i.quantity) * Number(i.unit_price), 0))], ...(Number(d.labour_cost) ? [["Labour", kes(d.labour_cost)] as [string, string]] : []), ...(Number(d.transport_cost) ? [["Transport", kes(d.transport_cost)] as [string, string]] : []), ...(Number(d.other_charges) ? [["Other charges", kes(d.other_charges)] as [string, string]] : []), ["Subtotal", kes(d.subtotal)], ...(Number(d.discount) ? [["Discount", `- ${kes(d.discount)}`] as [string, string]] : []), ...(Number(d.tax_rate) ? [[`Tax (${Number(d.tax_rate)}%)`, kes(d.tax_amount)] as [string, string]] : []), ["Total", kes(d.total), true], ...(Number(d.deposit) ? [["Deposit required", kes(d.deposit)], ["Balance on completion", kes(Number(d.total) - Number(d.deposit))]] as [string, string][] : [])],
    sections: [{ heading: "Description", body: d.description ?? "" }, { heading: "Scope of work", body: d.scope ?? "" }, { heading: "Exclusions", body: d.exclusions ?? "" }, { heading: "Assumptions", body: d.assumptions ?? "" }, { heading: "Payment terms", body: d.terms ?? "" }, { heading: "Notes", body: d.notes ?? "" }],
    signatures: [{ label: "Customer approval", name: d.approved_by_name, image: d.approval_signature, date: d.status === "ACCEPTED" ? dmy(d.responded_at) : "" }, { label: `For ${biz.data?.company_name ?? "Zentric"}`, name: "", date: "" }],
  };
  const set = (k: string) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  return <DashboardShell area="admin" active="quotes">
    <PageTitle eyebrow={`Quotation · ${c.full_name}`} title={d.reference} action={<div className="flex items-center gap-2"><DemoTag show={d.is_demo} /><Chip s={d.status} /></div>} />
    {d.jobs ? <p className="-mt-4 mb-4 text-sm"><Link to="/admin/jobs/$id" params={{ id: d.job_id! }} className="text-primary underline">← Job {d.jobs.reference}</Link></p> : null}
    <div className="mb-4 flex flex-wrap gap-2">
      {d.status === "DRAFT" ? <Button variant="gold" onClick={() => d.total > 0 ? void act(() => supabase.from("quotes").update({ status: "SENT" }).eq("id", id), "Marked as sent") : fail({ message: "Add items or charges before sending." })}><Send />Mark as sent</Button> : null}
      {["SENT", "DRAFT"].includes(d.status) && d.total > 0 ? <Button variant="whatsapp" onClick={() => setApprove(true)}><Check />Record approval</Button> : null}
      {d.status === "SENT" ? <><Button variant="outline" onClick={() => void act(() => supabase.from("quotes").update({ status: "REJECTED" }).eq("id", id), "Marked declined")}><X />Declined</Button><Button variant="outline" onClick={() => void act(() => supabase.from("quotes").update({ status: "EXPIRED" }).eq("id", id), "Marked expired")}>Expired</Button></> : null}
      {d.status === "ACCEPTED" ? <Button variant="gold" onClick={() => createInvoiceFromQuote(id).then((iid) => nav({ to: "/admin/invoices/$id", params: { id: iid } })).catch(fail)}><FileText />Create invoice</Button> : null}
      <Button variant="outline" onClick={() => void revise()}><Copy />{locked ? "Revise (new version)" : "Duplicate"}</Button>
      {!d.archived_at ? <Button variant="ghost" onClick={() => void act(() => supabase.from("quotes").update({ archived_at: new Date().toISOString() }).eq("id", id), "Archived")}><Archive />Archive</Button> : null}
    </div>
    <Dialog open={approve} onOpenChange={setApprove}><DialogContent><DialogHeader><DialogTitle>Customer approval</DialogTitle></DialogHeader><div className="space-y-3"><Field label="Approved by (name) *"><Input value={sig.name} onChange={(e) => setSig({ ...sig, name: e.target.value })} /></Field><Field label="Signature"><SignaturePad onChange={(image) => setSig((s) => ({ ...s, image }))} /></Field><Button variant="gold" className="h-11 w-full" onClick={() => void accept()}>Confirm approval · {money(d.total)}</Button></div></DialogContent></Dialog>
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="space-y-4">
        <Box title="Line items"><ItemsEditor table="quote_items" parentKey="quote_id" parentId={id} items={d.quote_items} locked={locked} onChange={refresh} withType /></Box>
        <Box title={locked ? "Details (locked — revise to change)" : "Details & charges"}>
          <fieldset disabled={locked} className="grid gap-3 sm:grid-cols-2">
            <Field label="Title" className="sm:col-span-2"><Input value={f.title ?? ""} onChange={set("title")} /></Field>
            <Field label="Labour (KSh)"><Input type="number" min="0" inputMode="decimal" value={f.labour_cost ?? ""} onChange={set("labour_cost")} /></Field>
            <Field label="Transport (KSh)"><Input type="number" min="0" inputMode="decimal" value={f.transport_cost ?? ""} onChange={set("transport_cost")} /></Field>
            <Field label="Other charges (KSh)"><Input type="number" min="0" inputMode="decimal" value={f.other_charges ?? ""} onChange={set("other_charges")} /></Field>
            <Field label="Discount (KSh)"><Input type="number" min="0" inputMode="decimal" value={f.discount ?? ""} onChange={set("discount")} /></Field>
            <Field label="Tax %"><Input type="number" min="0" max="100" inputMode="decimal" value={f.tax_rate ?? ""} onChange={set("tax_rate")} /></Field>
            <Field label="Deposit required (KSh)"><Input type="number" min="0" inputMode="decimal" value={f.deposit ?? ""} onChange={set("deposit")} /></Field>
            <Field label="Valid until"><Input type="date" value={f.valid_until ?? ""} onChange={set("valid_until")} /></Field>
            <Field label="Description" className="sm:col-span-2"><Textarea rows={2} value={f.description ?? ""} onChange={set("description")} /></Field>
            <Field label="Scope of work" className="sm:col-span-2"><Textarea rows={3} value={f.scope ?? ""} onChange={set("scope")} /></Field>
            <Field label="Exclusions"><Textarea rows={2} value={f.exclusions ?? ""} onChange={set("exclusions")} /></Field>
            <Field label="Assumptions"><Textarea rows={2} value={f.assumptions ?? ""} onChange={set("assumptions")} /></Field>
            <Field label="Payment terms" className="sm:col-span-2"><Textarea rows={2} value={f.terms ?? ""} onChange={set("terms")} /></Field>
            <Field label="Additional notes" className="sm:col-span-2"><Textarea rows={2} value={f.notes ?? ""} onChange={set("notes")} /></Field>
            {!locked ? <Button variant="gold" className="h-11 sm:col-span-2" onClick={(e) => { e.preventDefault(); void saveHeader(); }}>Save & recalculate</Button> : null}
          </fieldset>
        </Box>
      </div>
      <div className="space-y-3"><DocActions doc={doc} biz={biz.data} phone={c.whatsapp || c.phone} /><DocView doc={doc} biz={biz.data} /></div>
    </div>
  </DashboardShell>;
}
