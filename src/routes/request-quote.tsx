import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, Upload, MessageCircle, Phone, Mail, Clock, Zap } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { servicesQuery, settingsQuery, whatsappLink, telLink, DEFAULT_WHATSAPP_MESSAGE } from "@/lib/site-data";

const searchSchema = z.object({ service: z.string().optional() });

export const Route = createFileRoute("/request-quote")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Request a Quote | Zentric Electrical Services" },
      {
        name: "description",
        content:
          "Send Zentric Electrical Services your job details and photos to receive a written quotation for electrical work in Nairobi and surrounding areas.",
      },
      { property: "og:title", content: "Request a Quote | Zentric" },
      {
        property: "og:description",
        content: "Tell us about the job and receive a written quotation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RequestQuotePage,
});

const PROPERTY_TYPES = ["Residential house", "Apartment", "Commercial premises", "Industrial", "Other"];
const URGENCY = [
  { value: "emergency", label: "Emergency — today" },
  { value: "urgent", label: "Urgent — within 48 hours" },
  { value: "normal", label: "Normal — this week" },
  { value: "planned", label: "Planned — flexible" },
];
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ALLOWED_TYPES = ["image/", "video/", "application/pdf"];

type FormState = {
  full_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  location: string;
  service_id: string;
  service_other: string;
  description: string;
  property_type: string;
  preferred_date: string;
  preferred_time: string;
  urgency: string;
};

const EMPTY: FormState = {
  full_name: "",
  phone: "",
  whatsapp: "",
  email: "",
  location: "",
  service_id: "",
  service_other: "",
  description: "",
  property_type: "",
  preferred_date: "",
  preferred_time: "",
  urgency: "normal",
};

function RequestQuotePage() {
  const search = Route.useSearch();
  const { data: services } = useQuery(servicesQuery);
  const { data: settings } = useQuery(settingsQuery);
  const preselected = (services ?? []).find((s) => s.slug === search.service);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const serviceId = form.service_id || preselected?.id || "";
  const set = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }));

  function addFiles(list: FileList | null) {
    if (!list) return;
    const accepted: File[] = [];
    for (const file of Array.from(list)) {
      if (file.size > MAX_FILE_BYTES) {
        toast.error(`${file.name} is larger than 20MB.`);
        continue;
      }
      if (!ALLOWED_TYPES.some((prefix) => file.type.startsWith(prefix))) {
        toast.error(`${file.name} is not a photo, video or PDF.`);
        continue;
      }
      accepted.push(file);
    }
    setFiles((prev) => [...prev, ...accepted].slice(0, 8));
  }

  async function submit() {
    if (!form.full_name.trim() || !form.phone.trim() || !form.location.trim() || !form.description.trim() || (!serviceId && !form.service_other.trim())) {
      toast.error("Please complete your name, phone, location, service and job description.");
      return;
    }
    setSubmitting(true);
    try {
      const uploadId = crypto.randomUUID();
      const attachments: Array<{ path: string; name: string; type: string; size: number }> = [];
      for (const file of files) {
        const path = `enquiries/${uploadId}/${file.name.replace(/[^\w.\-]/g, "_")}`;
        const { error } = await supabase.storage.from("customer-uploads").upload(path, file, {
          upsert: false,
          contentType: file.type,
        });
        if (error) throw error;
        attachments.push({ path, name: file.name, type: file.type, size: file.size });
      }

       const { data, error } = await supabase.rpc("submit_enquiry", { p_details: {
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          whatsapp: form.whatsapp.trim() || null,
          email: form.email.trim() || null,
          location: form.location.trim(),
          service_id: serviceId || null,
          service_other: form.service_other.trim() || null,
          description: form.description.trim(),
          property_type: form.property_type || null,
          preferred_date: form.preferred_date || null,
          preferred_time: form.preferred_time || null,
          urgency: form.urgency,
          attachments,
         } });
      if (error) throw error;
       setReference(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send your request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:pt-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.8fr)_minmax(290px,1fr)]">
          <div>
            <h1 className="text-4xl font-bold">Request a Quote</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">Tell us about your electrical needs and we’ll get back to you with a clear quotation.</p>
            {reference ? (
              <div className="mt-10 rounded-md border border-border bg-surface p-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
                <h2 className="mt-4 text-2xl font-semibold">Request received</h2>
                <p className="mt-3 text-muted-foreground">Your reference is <strong className="text-foreground">{reference}</strong>. We’ll contact you using the number you provided.</p>
                <Button asChild className="mt-6"><Link to="/">Back to home</Link></Button>
              </div>
            ) : (
              <p className="mt-4 rounded-md border border-gold/40 bg-gold/10 px-3 py-2 text-sm">No account needed — just fill in the form and we'll contact you.</p>
              <form className="mt-6 space-y-5" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="full_name">Full name *</Label><Input id="full_name" required value={form.full_name} onChange={(e) => set({ full_name: e.target.value })} placeholder="Your full name" /></div>
                  <div className="space-y-2"><Label htmlFor="phone">Phone number *</Label><Input id="phone" required inputMode="tel" value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+254 …" /></div>
                  <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@example.com" /></div>
                  <div className="space-y-2"><Label htmlFor="location">Location *</Label><Input id="location" required value={form.location} onChange={(e) => set({ location: e.target.value })} placeholder="Estate, building or landmark" /></div>
                  <div className="space-y-2"><Label>Property type</Label><Select value={form.property_type} onValueChange={(v) => set({ property_type: v })}><SelectTrigger><SelectValue placeholder="Select property type" /></SelectTrigger><SelectContent>{PROPERTY_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Service required *</Label><Select value={serviceId} onValueChange={(v) => set({ service_id: v })}><SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger><SelectContent>{(services ?? []).map((service) => <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="space-y-2"><Label htmlFor="service_other">Other service / additional detail</Label><Input id="service_other" value={form.service_other} onChange={(e) => set({ service_other: e.target.value })} placeholder="If your service is not listed, tell us here" /></div>
                <div className="space-y-2"><Label htmlFor="description">Description of work *</Label><Textarea id="description" required rows={5} value={form.description} onChange={(e) => set({ description: e.target.value })} placeholder="Describe your project or the issue you are facing…" /></div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="preferred_date">Preferred date</Label><Input id="preferred_date" type="date" value={form.preferred_date} onChange={(e) => set({ preferred_date: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="preferred_time">Preferred time</Label><Input id="preferred_time" type="time" value={form.preferred_time} onChange={(e) => set({ preferred_time: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Urgency</Label><Select value={form.urgency} onValueChange={(v) => set({ urgency: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{URGENCY.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="whatsapp">WhatsApp number (optional)</Label><Input id="whatsapp" inputMode="tel" value={form.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} placeholder="If different from your phone" /></div>
                <div className="space-y-2"><Label htmlFor="attachments">Upload photos, videos or documents</Label><label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-border bg-surface px-4 py-5 text-sm text-muted-foreground hover:border-primary"><Upload className="h-5 w-5" /> Choose files (up to 8, 20MB each)<input id="attachments" type="file" multiple accept="image/*,video/*,application/pdf" className="sr-only" onChange={(e) => addFiles(e.target.files)} /></label>{files.length > 0 && <ul className="space-y-1 text-sm">{files.map((file, index) => <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-2"><span className="truncate">{file.name}</span><Button type="button" variant="ghost" size="sm" onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}>Remove</Button></li>)}</ul>}</div>
                <Button type="submit" variant="gold" size="lg" disabled={submitting}>{submitting ? "Sending…" : "Submit Request"}</Button>
              </form>
            )}
          </div>
          <aside className="site-dark h-fit rounded-md bg-background p-7 text-foreground lg:sticky lg:top-24">
            <Zap className="h-12 w-12 fill-gold text-gold" />
            <h2 className="mt-5 text-2xl font-bold">Need urgent help?</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Electrical emergency? Get in touch directly and tell us what’s happening.</p>
            <div className="mt-6 flex flex-col gap-3">
              {whatsappLink(settings?.whatsapp ?? settings?.phone, DEFAULT_WHATSAPP_MESSAGE) && <Button asChild variant="whatsapp" size="lg"><a href={whatsappLink(settings?.whatsapp ?? settings?.phone, DEFAULT_WHATSAPP_MESSAGE) ?? "#"} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp us</a></Button>}
              {telLink(settings?.phone) && <Button asChild variant="heroOutline" size="lg"><a href={telLink(settings?.phone) ?? "#"}><Phone /> Call Zentric</a></Button>}
            </div>
            <div className="mt-10 border-t border-border pt-6"><h3 className="font-semibold">Contact options</h3><ul className="mt-4 space-y-4 text-sm text-muted-foreground">{settings?.phone && <li className="flex gap-3"><Phone className="h-4 w-4 shrink-0 text-gold" />{settings.phone}</li>}{settings?.email && <li className="flex gap-3"><Mail className="h-4 w-4 shrink-0 text-gold" />{settings.email}</li>}{settings?.working_hours && <li className="flex gap-3"><Clock className="h-4 w-4 shrink-0 text-gold" />{settings.working_hours}</li>}</ul></div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
