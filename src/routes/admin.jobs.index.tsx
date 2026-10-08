import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell, useDashboardAccess, Empty, day } from "@/components/dashboard/DashboardShell";
import { Chip, PageTitle, DemoTag } from "@/components/dashboard/ui";
import { JobForm } from "@/components/dashboard/JobForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { JOB_STATUSES, must } from "@/lib/zec";

export const Route = createFileRoute("/admin/jobs/")({
  validateSearch: z.object({ enquiry: z.string().uuid().optional() }),
  head: () => ({ meta: [{ title: "Jobs | Zentric Admin" }, { name: "description", content: "All Zentric jobs." }, { property: "og:title", content: "Jobs | Zentric Admin" }, { property: "og:description", content: "Job management." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: Jobs,
});

function Jobs() {
  const access = useDashboardAccess("admin");
  const nav = useNavigate();
  const { enquiry } = Route.useSearch();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [open, setOpen] = useState(!!enquiry);
  const list = useQuery({ queryKey: ["jobs"], enabled: !!access.data?.allowed, queryFn: async () => must(await supabase.from("jobs").select("id,reference,title,status,start_date,site_address,is_demo,archived_at,customers(full_name,phone)").is("archived_at", null).order("created_at", { ascending: false })) });
  const enq = useQuery({ queryKey: ["enquiry", enquiry], enabled: !!enquiry && !!access.data?.allowed, queryFn: async () => must(await supabase.from("enquiries").select("*").eq("id", enquiry!).maybeSingle()) });
  const term = q.toLowerCase();
  const rows = (list.data ?? []).filter((j) => (status === "ALL" || j.status === status) && (!term || [j.reference, j.title, j.site_address, j.customers?.full_name, j.customers?.phone].some((v) => v?.toLowerCase().includes(term))));

  async function convertCustomer() {
    // An enquiry needs a customer record first; reuse an existing one with the same phone.
    const e = enq.data!;
    const existing = must(await supabase.from("customers").select("id").eq("phone", e.phone).maybeSingle());
    if (existing) return existing.id;
    return must(await supabase.from("customers").insert({ full_name: e.full_name, phone: e.phone, whatsapp: e.whatsapp, email: e.email, site_address: e.location, location: e.location }).select("id").single()).id;
  }
  return <DashboardShell area="admin" active="jobs">
    <PageTitle eyebrow="Operations" title="Jobs" action={<Button variant="gold" onClick={() => setOpen(true)}><Plus />New job</Button>} />
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{enq.data ? `Convert enquiry ${enq.data.reference}` : "New job"}</DialogTitle></DialogHeader>
      {enq.data ? <ConvertEnquiry name={enq.data.full_name} onGo={convertCustomer} enquiry={enq.data} onSaved={(id) => void nav({ to: "/admin/jobs/$id", params: { id } })} /> : <JobForm onSaved={(id) => void nav({ to: "/admin/jobs/$id", params: { id } })} />}
    </DialogContent></Dialog>
    <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_220px]">
      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="h-11 pl-9" placeholder="Search job, customer, phone, site" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <Select value={status} onValueChange={setStatus}><SelectTrigger className="h-11"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All statuses</SelectItem>{JOB_STATUSES.map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
    </div>
    {list.isLoading ? <p>Loading jobs…</p> : list.isError ? <p className="text-destructive">Jobs could not be loaded.</p> : rows.length ? <ul className="space-y-2">{rows.map((j) => <li key={j.id}><Link to="/admin/jobs/$id" params={{ id: j.id }} className="block rounded-lg border border-border bg-card p-4 hover:border-primary"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{j.title} <DemoTag show={j.is_demo} /></p><Chip s={j.status} /></div><p className="mt-1 text-sm text-muted-foreground">{j.reference} · {j.customers?.full_name}{j.site_address ? ` · ${j.site_address}` : ""}{j.start_date ? ` · ${day(j.start_date)}` : ""}</p></Link></li>)}</ul> : <Empty text={q || status !== "ALL" ? "No jobs match." : "No jobs yet. Create one from a customer or enquiry."} />}
  </DashboardShell>;
}

function ConvertEnquiry({ name, onGo, enquiry, onSaved }: { name: string; onGo: () => Promise<string>; enquiry: { id: string; description: string | null; location: string | null; service_id: string | null }; onSaved: (id: string) => void }) {
  const [cid, setCid] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  if (!cid) return <div className="space-y-3 text-sm"><p>This creates (or reuses) a customer record for <strong>{name}</strong>, then the job.</p>{err ? <p className="text-destructive">{err}</p> : null}<Button variant="gold" onClick={() => onGo().then(setCid).catch((e) => setErr(e.message))}>Continue</Button></div>;
  return <JobForm customerId={cid} enquiry={enquiry} onSaved={onSaved} />;
}
