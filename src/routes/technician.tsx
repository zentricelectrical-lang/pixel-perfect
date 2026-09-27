import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, BriefcaseBusiness } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell, useDashboardAccess, Panel, Stat, Empty, day } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/technician")({ head: () => ({ meta: [{ title: "My Jobs | Zentric Electrical Services" }, { name: "description", content: "Technician assignments and site visits for Zentric Electrical Services." }, { property: "og:title", content: "My Jobs | Zentric" }, { property: "og:description", content: "Your assigned jobs and site visits." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: TechnicianDashboard });
function TechnicianDashboard() {
  const access = useDashboardAccess("technician");
  const data = useQuery({ queryKey: ["technician-work", access.data?.user?.id], enabled: !!access.data?.allowed, queryFn: async () => {
    const [tech, jobs, visits] = await Promise.all([
      supabase.from("technicians").select("full_name").eq("profile_id", access.data?.user?.id ?? "").maybeSingle(),
      supabase.from("jobs").select("id,reference,title,status,start_date,location").order("start_date", { ascending: true }),
      supabase.from("bookings").select("id,reference,scheduled_date,scheduled_time,status,location").order("scheduled_date", { ascending: true }),
    ]);
    if (tech.error || jobs.error || visits.error) throw tech.error ?? jobs.error ?? visits.error;
    return { name: tech.data?.full_name, jobs: jobs.data ?? [], visits: visits.data ?? [] };
  } });
  const today = new Date().toISOString().slice(0, 10);
  const jobs = data.data?.jobs ?? [];
  return <DashboardShell area="technician" active="jobs"><p className="eyebrow">Technician workspace</p><h1 className="mt-1 text-3xl font-bold">My Jobs{data.data?.name ? ` · ${data.data.name}` : ""}</h1>{data.isLoading ? <p className="mt-8">Loading your assignments…</p> : data.isError ? <p className="mt-8 text-destructive">Assignments could not be loaded.</p> : <><div className="mt-8 grid gap-4 sm:grid-cols-3"><Stat label="Today’s jobs" value={jobs.filter((j) => j.start_date === today).length} icon={CalendarDays} /><Stat label="In progress" value={jobs.filter((j) => j.status === "IN_PROGRESS").length} icon={BriefcaseBusiness} tone="gold" /><Stat label="Scheduled" value={jobs.filter((j) => ["SCHEDULED", "ASSIGNED"].includes(j.status)).length} icon={BriefcaseBusiness} /></div><Panel id="jobs" title="Assigned Jobs">{jobs.length ? <div className="space-y-3">{jobs.map((j) => <article key={j.id} className="rounded-md border border-border bg-card p-5"><div className="flex flex-wrap justify-between gap-2"><strong>{j.title}</strong><span className="text-sm font-medium text-primary">{j.status.replaceAll("_", " ")}</span></div><p className="mt-2 text-sm text-muted-foreground">{j.reference}{j.start_date ? ` · ${day(j.start_date)}` : ""}{j.location ? ` · ${j.location}` : ""}</p></article>)}</div> : <Empty text="No jobs assigned to you yet." />}</Panel><Panel id="visits" title="Site Visits">{data.data?.visits.length ? <div className="space-y-3">{data.data.visits.map((b) => <div key={b.id} className="rounded-md border border-border bg-card p-4 text-sm">{b.reference} · {day(b.scheduled_date)} at {b.scheduled_time} · {b.status}</div>)}</div> : <Empty text="No site visits assigned to you." />}</Panel></>}</DashboardShell>;
}
