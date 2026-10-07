import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { LayoutDashboard, FileText, CalendarDays, BriefcaseBusiness, Receipt, CreditCard, FolderOpen, Star, UserRound, Users, ClipboardList, Wrench, Settings, LogOut, Menu, Bell, FolderKanban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/site/Header";

const ADMIN_ROUTES: Record<string, string> = { overview: "/admin", customers: "/admin/customers", jobs: "/admin/jobs", quotes: "/admin/quotes", invoices: "/admin/invoices", payments: "/admin/payments", receipts: "/admin/payments", documents: "/admin/documents", settings: "/admin/settings" };
const BOTTOM = [["Home", "overview", LayoutDashboard], ["Jobs", "jobs", BriefcaseBusiness], ["Customers", "customers", Users], ["Quotes", "quotes", FileText], ["Invoices", "invoices", Receipt]] as const;
type Area = "customer" | "admin" | "technician";
const items = {
  customer: [
    ["My Requests", "requests", ClipboardList], ["My Site Visits", "visits", CalendarDays], ["My Quotations", "quotations", FileText], ["My Jobs", "jobs", BriefcaseBusiness], ["My Invoices", "invoices", Receipt], ["My Payments", "payments", CreditCard], ["My Receipts", "receipts", FileText], ["My Documents", "documents", FolderOpen], ["My Reviews", "reviews", Star], ["Profile", "profile", UserRound],
  ],
  admin: [
    ["Dashboard", "overview", LayoutDashboard], ["Customers", "customers", Users], ["Enquiries", "enquiries", ClipboardList], ["Bookings", "bookings", CalendarDays], ["Quotes", "quotes", FileText], ["Jobs", "jobs", BriefcaseBusiness], ["Invoices", "invoices", Receipt], ["Payments", "payments", CreditCard], ["Receipts", "receipts", FileText], ["Technicians", "technicians", Wrench], ["Projects", "projects", FolderKanban], ["Services", "services", Wrench], ["Reviews", "reviews", Star], ["Documents", "documents", FolderOpen], ["Notifications", "notifications", Bell], ["Website Content", "content", FileText], ["Settings", "settings", Settings],
  ],
  technician: [["My Jobs", "jobs", BriefcaseBusiness], ["Site Visits", "visits", CalendarDays], ["Profile", "profile", UserRound]],
} as const;

export function useDashboardAccess(area: Area) {
  return useQuery({ queryKey: ["dashboard-access", area], queryFn: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return { allowed: false, signedIn: false, user: null };
    const { data: roles, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    if (roleError) throw roleError;
    const roleNames = roles?.map((r) => r.role) ?? [];
    const allowed = area === "admin" ? roleNames.some((r) => r === "owner" || r === "admin") : area === "technician" ? roleNames.includes("technician") : roleNames.includes("customer") || roleNames.some((r) => r === "owner" || r === "admin");
    return { allowed, signedIn: true, user };
  }, staleTime: 30_000 });
}

export function DashboardShell({ area, active, children }: { area: Area; active: string; children: ReactNode }) {
  const navigate = useNavigate();
  const access = useDashboardAccess(area);
  const [open, setOpen] = useState(false);
  useEffect(() => { if (access.data && !access.data.signedIn) void navigate({ to: "/auth" }); }, [access.data, navigate]);
  if (access.isLoading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading your account…</div>;
  if (access.isError) return <div className="mx-auto max-w-xl p-10 text-destructive">Your account could not be loaded. Please try again.</div>;
  if (!access.data?.signedIn) return null;
  if (!access.data.allowed) return <div className="mx-auto max-w-xl space-y-4 p-10"><h1 className="text-2xl font-semibold">Access unavailable</h1><p className="text-muted-foreground">This account does not have access to this workspace.</p><Button asChild><Link to="/">Return home</Link></Button></div>;
  const cls = (key: string) => `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-secondary ${active === key ? "bg-secondary font-semibold text-primary" : "text-muted-foreground"}`;
  const menu = <nav className="flex flex-col gap-0.5">{items[area].map(([label, key, Icon]) => { const to = area === "admin" ? ADMIN_ROUTES[key] : undefined; return to ? <a key={key} href={to} onClick={(e) => { e.preventDefault(); setOpen(false); void navigate({ to }); }} className={cls(key)}><Icon className="h-4 w-4 shrink-0" />{label}</a> : <a key={key} href={area === "admin" ? `/admin#${key}` : `#${key}`} onClick={() => setOpen(false)} className={cls(key)}><Icon className="h-4 w-4 shrink-0" />{label}</a>; })}</nav>;
  return <div className="min-h-screen bg-background text-foreground">
    <header className="site-dark sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:hidden"><Logo /><Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button variant="outline" size="icon" aria-label="Open dashboard menu"><Menu /></Button></SheetTrigger><SheetContent side="left" className="site-dark w-72 overflow-y-auto bg-background pt-10 text-foreground"><Logo /><div className="mt-6">{menu}</div><div className="mt-6 border-t border-border pt-4"><Button variant="ghost" className="w-full justify-start gap-3" onClick={async () => { await supabase.auth.signOut(); void navigate({ to: "/auth" }); }}><LogOut className="h-4 w-4" />Sign out</Button><Button asChild variant="ghost" className="w-full justify-start"><Link to="/">Back to website</Link></Button></div></SheetContent></Sheet></header>
    <div className="mx-auto flex max-w-[1600px]"><aside className="site-dark sticky top-0 hidden h-screen w-60 shrink-0 overflow-y-auto border-r border-border bg-background px-4 py-5 text-foreground lg:block"><Logo /><div className="mt-8">{menu}</div><div className="mt-6 border-t border-border pt-4"><Button variant="ghost" className="w-full justify-start gap-3" onClick={async () => { await supabase.auth.signOut(); void navigate({ to: "/auth" }); }}><LogOut className="h-4 w-4" /> Sign out</Button><Button asChild variant="ghost" className="w-full justify-start"><Link to="/">Back to website</Link></Button></div></aside><main className={`min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8 lg:px-10 ${area === "admin" ? "pb-24 lg:pb-8" : ""}`}>{children}</main></div>
    {area === "admin" ? <nav className="site-dark fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background lg:hidden">{BOTTOM.map(([label, key, Icon]) => <a key={key} href={ADMIN_ROUTES[key]} onClick={(e) => { e.preventDefault(); void navigate({ to: ADMIN_ROUTES[key] }); }} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${active === key ? "text-primary" : "text-muted-foreground"}`}><Icon className="h-5 w-5" />{label}</a>)}</nav> : null}
  </div>;
}

export function Stat({ label, value, icon: Icon, tone = "primary" }: { label: string; value: string | number; icon: typeof LayoutDashboard; tone?: "primary" | "gold" | "whatsapp" }) { return <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-2"><span className="text-sm text-muted-foreground">{label}</span><Icon className={`h-5 w-5 ${tone === "gold" ? "text-gold" : tone === "whatsapp" ? "text-whatsapp" : "text-primary"}`} /></div><p className="mt-3 break-words text-2xl font-bold sm:text-3xl">{value}</p></div>; }
export function Panel({ title, children, id }: { title: string; children: ReactNode; id?: string }) { return <section id={id} className="scroll-mt-20 border-t border-border py-7"><h2 className="mb-4 text-xl font-bold">{title}</h2>{children}</section>; }
export function Empty({ text }: { text: string }) { return <p className="rounded-md border border-dashed border-border p-5 text-sm text-muted-foreground">{text}</p>; }
export const money = (value: number | string | null) => `KSh ${Number(value ?? 0).toLocaleString("en-KE")}`;
export const day = (value: string) => new Date(value).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
