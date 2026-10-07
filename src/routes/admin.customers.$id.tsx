import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Phone, Plus, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell, useDashboardAccess, Empty, money, day } from "@/components/dashboard/DashboardShell";
import { Box, Chip, PageTitle, DemoTag } from "@/components/dashboard/ui";
import { CustomerForm } from "@/components/dashboard/CustomerForm";
import { JobForm } from "@/components/dashboard/JobForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { must, label } from "@/lib/zec";

export const Route = createFileRoute("/admin/customers/$id")({
  head: () => ({ meta: [{ title: "Customer | Zentric Admin" }, { name: "description", content: "Customer profile and history." }, { property: "og:title", content: "Customer | Zentric Admin" }, { property: "og:description", content: "Customer profile." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: CustomerPage,
});

function CustomerPage() {
  const { id } = Route.useParams();
  const access = useDashboardAccess("admin");
  const nav = useNavigate();
  const [edit, setEdit] = useState(false);
  const [newJob, setNewJob] = useState(false);
  const q = useQuery({ queryKey: ["customer", id], enabled: !!access.data?.allowed, queryFn: async () => {
    const [c, jobs, quotes, invoices, payments, receipts, docs] = await Promise.all([
      supabase.from("customers").select("*").eq("id", id).maybeSingle(),
      supabase.from("jobs").select("id,reference,title,status,start_date").eq("customer_id", id).order("created_at", { ascending: false }),
      supabase.from("quotes").select("id,reference,title,status,total").eq("customer_id", id).order("created_at", { ascending: false }),
      supabase.from("invoices").select("id,reference,status,total,amount_paid").eq("customer_id", id).order("created_at", { ascending: false }),
      supabase.from("payments").select("id,reference,status,amount,method,paid_at,created_at").eq("customer_id", id).order("created_at", { ascending: false }),
      supabase.from("receipts").select("id,reference,amount,issued_at").eq("customer_id", id).order("issued_at", { ascending: false }),
      supabase.from("field_documents").select("id,reference,doc_type,status,created_at").eq("customer_id", id).is("archived_at", null).order("created_at", { ascending: false }),
    ]);
    return { c: must(c), jobs: must(jobs), quotes: must(quotes), invoices: must(invoices), payments: must(payments), receipts: must(receipts), docs: must(docs) };
  } });
  const d = q.data;
  if (q.isLoading || !access.data?.allowed) return <DashboardShell area="admin" active="customers"><p>Loading customer…</p></DashboardShell>;
  if (q.isError || !d?.c) return <DashboardShell area="admin" active="customers"><p className="text-destructive">This customer could not be found.</p><Button asChild variant="outline" className="mt-4"><Link to="/admin/customers">Back to customers</Link></Button></DashboardShell>;
  const c = d.c;
  const active = d.jobs.filter((j) => !["CLOSED", "CANCELLED", "PAID", "COMPLETED"].includes(j.status));
  const wa = (c.whatsapp || c.phone || "").replace(/\D/g, "").replace(/^0/, "254");
  const outstanding = d.invoices.filter((i) => !["CANCELLED", "DRAFT"].includes(i.status)).reduce((n, i) => n + Number(i.total) - Number(i.amount_paid), 0);
  const list = <T extends { id: string }>(rows: T[], render: (r: T) => React.ReactNode, empty: string) => rows.length ? <ul className="divide-y divide-border">{rows.map((r) => <li key={r.id} className="py-2.5 text-sm">{render(r)}</li>)}</ul> : <Empty text={empty} />;
  return <DashboardShell area="admin" active="customers">
    <PageTitle eyebrow={c.customer_number} title={c.full_name} action={<div className="flex flex-wrap gap-2">
      <Dialog open={newJob} onOpenChange={setNewJob}><DialogTrigger asChild><Button variant="gold"><Plus />New job</Button></DialogTrigger><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>New job for {c.full_name}</DialogTitle></DialogHeader><JobForm customerId={id} onSaved={(jid) => void nav({ to: "/admin/jobs/$id", params: { id: jid } })} /></DialogContent></Dialog>
      <Dialog open={edit} onOpenChange={setEdit}><DialogTrigger asChild><Button variant="outline"><Pencil />Edit</Button></DialogTrigger><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Edit customer</DialogTitle></DialogHeader><CustomerForm id={id} initial={{ full_name: c.full_name, company_name: c.company_name ?? "", phone: c.phone ?? "", whatsapp: c.whatsapp ?? "", email: c.email ?? "", site_address: c.site_address ?? c.location ?? "", notes: c.notes ?? "" }} onSaved={() => { setEdit(false); void q.refetch(); }} /></DialogContent></Dialog>
    </div>} />
    <div className="grid gap-4 lg:grid-cols-3">
      <Box title="Details" className="lg:col-span-1">
        <div className="space-y-1 text-sm"><DemoTag show={c.is_demo} />{c.company_name ? <p>{c.company_name}</p> : null}<p>{c.phone}</p><p>{c.email}</p><p className="text-muted-foreground">{c.site_address ?? c.location}</p>{c.notes ? <p className="pt-2 text-muted-foreground">{c.notes}</p> : null}<p className="pt-2 text-xs text-muted-foreground">Added {day(c.created_at)}</p></div>
        <div className="mt-4 flex gap-2">{c.phone ? <Button asChild size="sm" variant="outline"><a href={`tel:${c.phone}`}><Phone />Call</a></Button> : null}{wa ? <Button asChild size="sm" variant="whatsapp"><a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer"><MessageCircle />WhatsApp</a></Button> : null}</div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded bg-secondary p-2"><p className="text-lg font-bold">{active.length}</p>Active</div><div className="rounded bg-secondary p-2"><p className="text-lg font-bold">{d.jobs.length - active.length}</p>Past</div><div className="rounded bg-secondary p-2"><p className="text-sm font-bold">{money(outstanding)}</p>Owing</div></div>
      </Box>
      <Box title="Jobs" className="lg:col-span-2">{list(d.jobs, (j) => <Link to="/admin/jobs/$id" params={{ id: j.id }} className="flex flex-wrap justify-between gap-2 hover:text-primary"><span><strong>{j.reference}</strong> · {j.title}</span><Chip s={j.status} /></Link>, "No jobs yet.")}</Box>
      <Box title="Quotations">{list(d.quotes, (r) => <Link to="/admin/quotes/$id" params={{ id: r.id }} className="flex justify-between gap-2 hover:text-primary"><span>{r.reference}</span><span className="flex gap-2">{money(r.total)} <Chip s={r.status} /></span></Link>, "No quotations.")}</Box>
      <Box title="Invoices">{list(d.invoices, (r) => <Link to="/admin/invoices/$id" params={{ id: r.id }} className="flex justify-between gap-2 hover:text-primary"><span>{r.reference}</span><span className="flex gap-2">{money(r.total)} <Chip s={r.status} /></span></Link>, "No invoices.")}</Box>
      <Box title="Payments & receipts">{list(d.payments, (r) => <div className="flex justify-between gap-2"><span>{r.reference} · {money(r.amount)}</span><Chip s={r.status} /></div>, "No payments.")}{d.receipts.length ? <div className="mt-2 border-t border-border pt-2 text-sm">{d.receipts.map((r) => <Link key={r.id} to="/admin/receipts/$id" params={{ id: r.id }} className="block py-1 hover:text-primary">{r.reference} · {money(r.amount)}</Link>)}</div> : null}</Box>
      <Box title="Documents, warranties & agreements" className="lg:col-span-3">{list(d.docs, (r) => <Link to="/admin/docs/$id" params={{ id: r.id }} className="flex justify-between gap-2 hover:text-primary"><span>{r.reference} · {label(r.doc_type)}</span><Chip s={r.status} /></Link>, "No documents yet.")}</Box>
    </div>
  </DashboardShell>;
}
