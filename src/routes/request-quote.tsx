import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, Upload } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
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
import { servicesQuery } from "@/lib/site-data";

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
  const preselected = (services ?? []).find((s) => s.slug === search.service);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const serviceId = form.service_id || preselected?.id || "";
  const set = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }));

  function validateStep(current: number) {
    if (current === 1) {
      if (!form.full_name.trim() || !form.phone.trim() || !form.location.trim()) {
        toast.error("Name, phone and location are required.");
        return false;
      }
    }
    if (current === 2 && !serviceId && !form.service_other.trim()) {
      toast.error("Please choose a service or describe it.");
      return false;
    }
    if (current === 3 && !form.description.trim()) {
      toast.error("Please describe the job.");
      return false;
    }
    return true;
  }

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

      const { data: session } = await supabase.auth.getSession();
      const { data, error } = await supabase
        .from("enquiries")
        .insert({
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
          created_by: session.session?.user.id ?? null,
        })
        .select("reference")
        .single();
      if (error) throw error;

      await supabase.from("notifications").insert({
        audience: "staff",
        title: "New quote request",
        body: `${form.full_name} — ${form.location} (${data.reference})`,
        link: "/admin/enquiries",
      });

      setReference(data.reference);
      setStep(5);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send your request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Request a quote"
        title="Tell us about the job"
        description="Five short steps. We reply with next steps and a written quotation once the scope is clear."
      />
      <section className="section">
        <div className="mx-auto max-w-2xl px-4">
          <ol className="mb-8 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            {["You", "Service", "Details", "Files", "Done"].map((label, index) => (
              <li
                key={label}
                className={`flex-1 border-b-2 pb-2 ${
                  step >= index + 1 ? "border-primary text-primary" : "border-border"
                }`}
              >
                {label}
              </li>
            ))}
          </ol>

          <div className="rounded-md border border-border bg-card p-5 sm:p-6">
            {step === 1 ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold uppercase">Your details</h2>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full name *</Label>
                  <Input id="full_name" value={form.full_name} onChange={(e) => set({ full_name: e.target.value })} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" inputMode="tel" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input id="whatsapp" inputMode="tel" value={form.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location (estate, building, landmark) *</Label>
                  <Input id="location" value={form.location} onChange={(e) => set({ location: e.target.value })} />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold uppercase">What do you need?</h2>
                <div className="space-y-2">
                  <Label>Service</Label>
                  <Select
                    value={serviceId || undefined}
                    onValueChange={(value) => set({ service_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {(services ?? []).map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service_other">Other / not listed</Label>
                  <Input
                    id="service_other"
                    value={form.service_other}
                    onChange={(e) => set({ service_other: e.target.value })}
                    placeholder="Describe the service you need"
                  />
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold uppercase">Job details</h2>
                <div className="space-y-2">
                  <Label htmlFor="description">Describe the work *</Label>
                  <Textarea
                    id="description"
                    rows={5}
                    value={form.description}
                    onChange={(e) => set({ description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Property type</Label>
                  <Select value={form.property_type || undefined} onValueChange={(v) => set({ property_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="preferred_date">Preferred date</Label>
                    <Input
                      id="preferred_date"
                      type="date"
                      value={form.preferred_date}
                      onChange={(e) => set({ preferred_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred_time">Preferred time</Label>
                    <Input
                      id="preferred_time"
                      type="time"
                      value={form.preferred_time}
                      onChange={(e) => set({ preferred_time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Urgency</Label>
                  <Select value={form.urgency} onValueChange={(v) => set({ urgency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {URGENCY.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold uppercase">Photos, videos or documents</h2>
                <p className="text-sm text-muted-foreground">
                  Optional, but photos of the fault or the site help us quote accurately. Max 20MB per
                  file.
                </p>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background p-6 text-sm text-muted-foreground hover:border-primary">
                  <Upload className="h-4 w-4" /> Choose files
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,application/pdf"
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                </label>
                {files.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {files.map((file, index) => (
                      <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3">
                        <span className="truncate text-muted-foreground">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {step === 5 && reference ? (
              <div className="space-y-4 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
                <h2 className="text-xl font-semibold uppercase">Your quote request has been received.</h2>
                <p className="text-sm text-muted-foreground">
                  Your reference number is{" "}
                  <span className="font-semibold text-gold">{reference}</span>. Keep it for follow-up —
                  our office will contact you on the number you provided.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Button asChild>
                    <Link to="/">Back to home</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/auth">Create an account to track it</Link>
                  </Button>
                </div>
              </div>
            ) : null}

            {step < 5 ? (
              <div className="mt-6 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={step === 1 || submitting}
                  onClick={() => setStep((s) => s - 1)}
                >
                  Back
                </Button>
                {step < 4 ? (
                  <Button
                    type="button"
                    onClick={() => {
                      if (validateStep(step)) setStep((s) => s + 1);
                    }}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button type="button" disabled={submitting} onClick={submit}>
                    {submitting ? "Sending…" : "Submit request"}
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
