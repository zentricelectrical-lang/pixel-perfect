import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
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

export const Route = createFileRoute("/book")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Book an Electrician | Zentric Electrical Services" },
      {
        name: "description",
        content:
          "Book a site visit or electrical service with Zentric Electrical Services. Choose your service, date and time and we confirm your appointment.",
      },
      { property: "og:title", content: "Book a Visit | Zentric Electrical Services" },
      { property: "og:description", content: "Choose your service, date and time and we confirm." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookPage,
});

const TIME_SLOTS = ["08:00", "10:00", "12:00", "14:00", "16:00"];

function BookPage() {
  const search = Route.useSearch();
  const { data: services } = useQuery(servicesQuery);
  const preselected = (services ?? []).find((s) => s.slug === search.service);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [serviceId, setServiceId] = useState<string | undefined>();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const chosenService = serviceId ?? preselected?.id;
  const today = new Date().toISOString().slice(0, 10);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!fullName.trim() || !phone.trim() || !location.trim() || !date || !time) {
      toast.error("Name, phone, location, date and time are required.");
      return;
    }
    setSubmitting(true);
    try {
       const { data, error } = await supabase.rpc("submit_booking", { p_details: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          whatsapp: whatsapp.trim() || null,
          email: email.trim() || null,
          location: location.trim(),
          service_id: chosenService ?? null,
          scheduled_date: date,
          scheduled_time: time,
          description: description.trim() || null,
         } });
      if (error) throw error;
       setReference(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create the booking.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Booking"
        title="Book a visit"
        description="Choose a date and time that suits you. We confirm the appointment before we come out."
      />
      <section className="section">
        <div className="mx-auto max-w-2xl px-4">
          {reference ? (
            <div className="space-y-4 rounded-md border border-border bg-card p-6 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
              <h2 className="text-xl font-semibold uppercase">Booking request received</h2>
              <p className="text-sm text-muted-foreground">
                Your booking reference is <span className="font-semibold text-gold">{reference}</span>.
                The slot is confirmed by our office before it becomes final.
              </p>
              <Button asChild>
                <Link to="/">Back to home</Link>
              </Button>
            </div>
          ) : (
            <p className="mb-3 rounded-md border border-gold/40 bg-gold/10 px-3 py-2 text-sm">No account needed — book with just your contact details.</p>
            <form onSubmit={submit} className="space-y-4 rounded-md border border-border bg-card p-5 sm:p-6">
              <div className="space-y-2">
                <Label htmlFor="b-name">Full name *</Label>
                <Input id="b-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="b-phone">Phone *</Label>
                  <Input id="b-phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b-whatsapp">WhatsApp</Label>
                  <Input id="b-whatsapp" inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-email">Email</Label>
                <Input id="b-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-location">Location *</Label>
                <Input id="b-location" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Service</Label>
                <Select value={chosenService ?? ""} onValueChange={setServiceId}>
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="b-date">Preferred date *</Label>
                  <Input
                    id="b-date"
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preferred time *</Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-description">What should we look at?</Label>
                <Textarea
                  id="b-description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Sending…" : "Request booking"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
