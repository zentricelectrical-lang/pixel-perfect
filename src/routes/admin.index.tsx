import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ClipboardList, FileText, BriefcaseBusiness, Receipt, Users, ArrowRight, CheckCircle2, Star, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell, useDashboardAccess, Stat, Empty, money, day } from "@/components/dashboard/DashboardShell";
import { AccessAssistant } from "@/components/dashboard/AccessAssistant";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/")({ head: () => ({ meta: [{ title: "Business Dashboard | Zentric Electrical Services" }, { name: "description", content: "Manage Zentric customer requests, bookings, jobs, quotes and invoices." }, { property: "og:title", content: "Business Dashboard | Zentric" }, { property: "og:description", content: "Zentric business operations." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: AdminDashboard });

const PIE = ["var(--primary)", "var(--gold)", "var(--whatsapp)", "var(--navy)", "var(--muted-foreground)", "var(--destructive)", "var(--accent-foreground)"];

function Card({ title, id, action, children, className = "" }: { title: string; id?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section id={id} className={`scroll-mt-20 rounded-xl border border-border bg-card p-5 shadow-sm ${className}`}><div className="mb-4 flex items-center justify-between gap-2"><h2 className="font-semibold">{title}</h2>{action}</div>{children}</section>;
}
function Rows<T extends { id: string }>({ rows, label, detail, empty }: { rows: T[]; label: (r: T) => string; detail: (r: T) => ReactNode; empty: string }) {
  return rows.length ? <ul className="divide-y divide-border">{rows.map((r) => <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"><span className="min-w-0 truncate font-medium">{label(r)}</span><span className="text-muted-foreground">{detail(r)}</span></li>)}</ul> : <Empty text={empty} />;
}
function Chip({ s }: { s: string }) {
  const tone = ["COMPLETED", "CONFIRMED", "PAID", "APPROVED", "ACCEPTED", "CLOSED"].includes(s) ? "bg-whatsapp/15 text-whatsapp" : ["NEW", "PENDING", "PENDING_APPROVAL", "DRAFT", "SENT"].includes(s) ? "bg-gold/20 text-gold-foreground" : "bg-primary/15 text-primary";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{s.replaceAll("_", " ")}</span>;
}

function AdminDashboard() {
  const access = useDashboardAccess("admin");
  const isOwner = useQuery({ queryKey: ["is-owner", access.data?.user?.id], enabled: !!access.data?.user, queryFn: async () => { const { data } = await supabase.from("user_roles").select("role").eq("user_id", access.data!.user!.id).eq("role", "owner"); return !!data?.length; } });
  const data = useQuery({ queryKey: ["admin-overview"], enabled: !!access.data?.allowed, queryFn: async () => {
    const r = await Promise.all([
      supabase.from("enquiries").select("id,reference,full_name,status,created_at").order("created_at", { ascending: false }),
      supabase.from("bookings").select("id,reference,full_name,status,scheduled_date,scheduled_time").order("scheduled_date", { ascending: true }),
      supabase.from("quotes").select("id,reference,title,status,total,created_at").order("created_at", { ascending: false }),
      supabase.from("jobs").select("id,reference,title,status,start_date,service_id").order("start_date", { ascending: false }),
      supabase.from("invoices").select("id,reference,status,total,amount_paid,created_at").order("created_at", { ascending: false }),
      supabase.from("customers").select("id,customer_number,full_name,created_at").order("created_at", { ascending: false }),
      supabase.from("payments").select("id,reference,amount,status,created_at").order("created_at", { ascending: false }),
      supabase.from("reviews").select("id,author_name,rating,status,created_at").order("created_at", { ascending: false }),
      supabase.from("documents").select("id,title,doc_type,created_at").order("created_at", { ascending: false }),
      supabase.from("services").select("id,name"),
    ]);
    const f = r.find((x) => x.error); if (f?.error) throw f.error;
    return { enquiries: r[0].data!, bookings: r[1].data!, quotes: r[2].data!, jobs: r[3].data!, invoices: r[4].data!, customers: r[5].data!, payments: r[6].data!, reviews: r[7].data!, documents: r[8].data!, services: r[9].data! };
  } });
  const d = data.data;
  const today = new Date().toISOString().slice(0, 10);

  const months = Array.from({ length: 6 }, (_, i) => { const dt = new Date(); dt.setDate(1); dt.setMonth(dt.getMonth() - 5 + i); return { key: dt.toISOString().slice(0, 7), label: dt.toLocaleDateString("en-KE", { month: "short" }) }; });
  const revenue = d ? months.map((m) => ({ month: m.label, Collected: d.payments.filter((p) => p.status === "CONFIRMED" && p.created_at.startsWith(m.key)).reduce((n, p) => n + Number(p.amount), 0), Invoiced: d.invoices.filter((i) => i.created_at.startsWith(m.key)).reduce((n, i) => n + Number(i.total), 0) })) : [];
  const byService = d ? Object.entries(d.jobs.reduce<Record<string, number>>((acc, j) => { const n = d.services.find((s) => s.id === j.service_id)?.name ?? "Other"; acc[n] = (acc[n] ?? 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value })) : [];
  const hasRevenue = revenue.some((m) => m.Collected || m.Invoiced);

  return <DashboardShell area="admin" active="overview">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Operations</p><h1 className="mt-1 text-3xl font-bold">Dashboard</h1><p className="mt-1 text-sm text-muted-foreground">{new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p></div><Button asChild variant="gold"><Link to="/request-quote">New enquiry</Link></Button></div>
    {data.isLoading || !d ? (data.isError ? <p className="text-destructive">Business activity could not be loaded. Please refresh the page.</p> : <p>Loading business activity…</p>) : <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Today’s jobs" value={d.jobs.filter((j) => j.start_date === today).length} icon={CalendarDays} />
        <Stat label="Pending requests" value={d.enquiries.filter((e) => e.status === "NEW").length} icon={ClipboardList} tone="gold" />
        <Stat label="Pending quotes" value={d.quotes.filter((q) => ["DRAFT", "SENT"].includes(q.status)).length} icon={FileText} />
        <Stat label="Active jobs" value={d.jobs.filter((j) => !["COMPLETED", "CLOSED", "CANCELLED"].includes(j.status)).length} icon={BriefcaseBusiness} />
        <Stat label="Completed jobs" value={d.jobs.filter((j) => ["COMPLETED", "CLOSED"].includes(j.status)).length} icon={CheckCircle2} tone="whatsapp" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Confirmed revenue" value={money(d.payments.filter((p) => p.status === "CONFIRMED").reduce((n, p) => n + Number(p.amount), 0))} icon={Wallet} tone="gold" />
        <Stat label="Outstanding invoices" value={money(d.invoices.reduce((n, i) => n + (i.status === "PAID" ? 0 : Math.max(0, Number(i.total) - Number(i.amount_paid))), 0))} icon={Receipt} />
        <Stat label="Customers" value={d.customers.length} icon={Users} />
        <Stat label="Reviews waiting" value={d.reviews.filter((r) => r.status === "PENDING_APPROVAL").length} icon={Star} tone="gold" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Revenue — last 6 months" className="lg:col-span-2">{hasRevenue ? <div className="h-64"><ResponsiveContainer><BarChart data={revenue}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} /><YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${Number(v) / 1000}k`} /><Tooltip formatter={(v) => money(Number(v))} /><Legend /><Bar dataKey="Invoiced" fill="var(--primary)" radius={[4, 4, 0, 0]} /><Bar dataKey="Collected" fill="var(--gold)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div> : <Empty text="Revenue appears here once invoices are issued and payments confirmed." />}</Card>
        <Card title="Jobs by service">{byService.length ? <div className="h-64"><ResponsiveContainer><PieChart><Pie data={byService} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>{byService.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}</Pie><Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer></div> : <Empty text="No jobs yet." />}</Card>
      </div>

      {isOwner.data ? <AccessAssistant /> : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card id="enquiries" title="Recent enquiries"><Rows rows={d.enquiries.slice(0, 6)} label={(r) => `${r.reference} · ${r.full_name}`} detail={(r) => <Chip s={r.status} />} empty="No enquiries yet." /></Card>
        <Card id="bookings" title="Upcoming site visits"><Rows rows={d.bookings.filter((b) => b.scheduled_date >= today && !["CANCELLED", "COMPLETED"].includes(b.status)).slice(0, 6)} label={(r) => r.full_name} detail={(r) => `${day(r.scheduled_date)} · ${r.scheduled_time}`} empty="No upcoming visits." /></Card>
        <Card id="customers" title="Recent customers"><Rows rows={d.customers.slice(0, 6)} label={(r) => r.full_name} detail={(r) => r.customer_number} empty="No customers yet." /></Card>
        <Card id="payments" title="Recent payments"><Rows rows={d.payments.slice(0, 6)} label={(r) => `${r.reference} · ${money(r.amount)}`} detail={(r) => <Chip s={r.status} />} empty="No payments recorded." /></Card>
        <Card id="reviews" title="Recent reviews"><Rows rows={d.reviews.slice(0, 6)} label={(r) => `${r.author_name} · ${"★".repeat(r.rating)}`} detail={(r) => <Chip s={r.status} />} empty="No reviews yet." /></Card>
        <Card id="quotes" title="Quotations"><Rows rows={d.quotes.slice(0, 6)} label={(r) => `${r.reference} · ${r.title}`} detail={(r) => money(r.total)} empty="No quotations issued." /></Card>
        <Card id="jobs" title="Jobs"><Rows rows={d.jobs.slice(0, 6)} label={(r) => `${r.reference} · ${r.title}`} detail={(r) => <Chip s={r.status} />} empty="No jobs yet." /></Card>
        <Card id="invoices" title="Invoices"><Rows rows={d.invoices.slice(0, 6)} label={(r) => r.reference} detail={(r) => <Chip s={r.status} />} empty="No invoices issued." /></Card>
        <Card id="documents" title="Document center"><Rows rows={d.documents.slice(0, 6)} label={(r) => r.title} detail={(r) => `${r.doc_type} · ${day(r.created_at)}`} empty="No documents generated yet." /></Card>
        <Card id="projects" title="Projects & services"><div className="flex flex-wrap gap-2"><Button asChild variant="outline" size="sm"><Link to="/projects">Projects <ArrowRight /></Link></Button><Button asChild variant="outline" size="sm"><Link to="/services">Services <ArrowRight /></Link></Button></div></Card>
      </div>
    </div>}
  </DashboardShell>;
}
