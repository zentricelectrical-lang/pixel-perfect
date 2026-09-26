import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import {
  settingsQuery,
  serviceAreasQuery,
  whatsappLink,
  telLink,
  DEFAULT_WHATSAPP_MESSAGE,
} from "@/lib/site-data";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Zentric Electrical Services | Call or WhatsApp" },
      {
        name: "description",
        content:
          "Call, WhatsApp or email Zentric Electrical Services for electrical installation, repairs, solar and automation work in Nairobi and surrounding areas.",
      },
      { property: "og:title", content: "Contact Zentric Electrical Services" },
      { property: "og:description", content: "Call, WhatsApp or email our team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: areas } = useQuery(serviceAreasQuery);
  const wa = whatsappLink(settings?.whatsapp ?? settings?.phone, DEFAULT_WHATSAPP_MESSAGE);
  const tel = telLink(settings?.phone);
  const missingContacts = !settings?.phone && !settings?.email;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Contact"
        title="Talk to Zentric"
        description="The fastest way to reach us is WhatsApp or a phone call. For a written quotation, use the quote request form."
      />
      <section className="section">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2">
          <div className="space-y-4">
            {missingContacts ? (
              <div className="rounded-md border border-gold/40 bg-card p-5 text-sm text-muted-foreground">
                Phone and email are not yet set. An administrator can add them under Settings in the
                admin dashboard, and they will appear here automatically.
              </div>
            ) : null}
            <ul className="space-y-4 text-sm">
              {settings?.phone ? (
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 text-primary" />
                  <span>{settings.phone}</span>
                </li>
              ) : null}
              {settings?.whatsapp ? (
                <li className="flex items-start gap-3">
                  <MessageCircle className="mt-0.5 h-5 w-5 text-primary" />
                  <span>{settings.whatsapp}</span>
                </li>
              ) : null}
              {settings?.email ? (
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-primary" />
                  <span>{settings.email}</span>
                </li>
              ) : null}
              {settings?.address ? (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                  <span>{settings.address}</span>
                </li>
              ) : null}
              {settings?.working_hours ? (
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-primary" />
                  <span>{settings.working_hours}</span>
                </li>
              ) : null}
            </ul>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              {tel ? (
                <Button asChild>
                  <a href={tel}>
                    <Phone /> Call now
                  </a>
                </Button>
              ) : null}
              {wa ? (
                <Button asChild variant="gold">
                  <a href={wa} target="_blank" rel="noreferrer">
                    <MessageCircle /> WhatsApp
                  </a>
                </Button>
              ) : null}
            </div>

            {areas && areas.length > 0 ? (
              <div className="pt-4">
                <h2 className="text-lg font-semibold uppercase">Service areas</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {areas.map((a) => a.name).join(", ")}
                </p>
              </div>
            ) : null}
          </div>

          <div className="h-fit rounded-md border border-border bg-card p-6">
            <h2 className="text-lg font-semibold uppercase">Send a request instead</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use the quote request form to send job details and photos, or book a site visit for a
              specific date.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button asChild>
                <Link to="/request-quote">Request a quote</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/book">Book a visit</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
