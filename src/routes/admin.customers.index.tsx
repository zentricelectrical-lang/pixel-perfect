import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell, useDashboardAccess, Empty } from "@/components/dashboard/DashboardShell";
import { PageTitle, DemoTag } from "@/components/dashboard/ui";
import { CustomerForm } from "@/components/dashboard/CustomerForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { must } from "@/lib/zec";

export const Route = createFileRoute("/admin/customers/")({
  head: () => ({ meta: [{ title: "Customers | Zentric Admin" }, { name: "description", content: "Zentric customer records." }, { property: "og:title", content: "Customers | Zentric Admin" }, { property: "og:description", content: "Customer management." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: Customers,
});

function Customers() {
  const access = useDashboardAccess("admin");
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const list = useQuery({ queryKey: ["customers"], enabled: !!access.data?.allowed, queryFn: async () => must(await supabase.from("customers").select("id,customer_number,full_name,company_name,phone,location,site_address,is_demo,created_at").order("created_at", { ascending: false })) });
  const term = q.toLowerCase();
  const rows = (list.data ?? []).filter((c) => !term || [c.full_name, c.company_name, c.phone, c.customer_number, c.site_address, c.location].some((v) => v?.toLowerCase().includes(term)));
  return <DashboardShell area="admin" active="customers">
    <PageTitle eyebrow="CRM" title="Customers" action={<Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="gold"><Plus />New customer</Button></DialogTrigger><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>New customer</DialogTitle></DialogHeader><CustomerForm onSaved={(id) => { setOpen(false); void nav({ to: "/admin/customers/$id", params: { id } }); }} /></DialogContent></Dialog>} />
    <div className="relative mb-4"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="h-11 pl-9" placeholder="Search name, phone, area or number" value={q} onChange={(e) => setQ(e.target.value)} /></div>
    {list.isLoading ? <p>Loading customers…</p> : list.isError ? <p className="text-destructive">Customers could not be loaded.</p> : rows.length ? <ul className="space-y-2">{rows.map((c) => <li key={c.id}><Link to="/admin/customers/$id" params={{ id: c.id }} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-4 hover:border-primary"><div className="min-w-0"><p className="font-semibold">{c.full_name} {c.company_name ? <span className="font-normal text-muted-foreground">· {c.company_name}</span> : null} <DemoTag show={c.is_demo} /></p><p className="text-sm text-muted-foreground">{c.customer_number} · {c.phone ?? "No phone"} · {c.site_address ?? c.location ?? "No address"}</p></div></Link></li>)}</ul> : <Empty text={q ? "No customers match your search." : "No customers yet. Add your first customer."} />}
  </DashboardShell>;
}
