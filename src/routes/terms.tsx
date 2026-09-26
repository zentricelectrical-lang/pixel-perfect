import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { settingsQuery } from "@/lib/site-data";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | Zentric Electrical Services" },
      {
        name: "description",
        content:
          "Terms covering quotations, scheduling, payment and workmanship for electrical work carried out by Zentric Electrical Services.",
      },
      { property: "og:title", content: "Terms of Service | Zentric" },
      { property: "og:description", content: "Quotation, scheduling, payment and workmanship terms." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

const FALLBACK = `Quotations are based on the scope agreed at the time of assessment. Additional work discovered on site is quoted separately before it is carried out.

Quotations are valid until the date stated on the quotation. Prices may change if material costs change after that date.

Appointments are confirmed by our office. If we cannot keep a slot we will contact you to reschedule.

Invoices are payable as stated on the invoice. A payment is only treated as settled once it is confirmed by our office and a receipt is issued.

Workmanship is warranted for the period stated on the job handover document. Warranty does not cover faults caused by third-party work, misuse or damage after handover.`;

function TermsPage() {
  const { data: settings } = useQuery(settingsQuery);
  return (
    <SiteLayout>
      <PageHeader eyebrow="Legal" title="Terms of service" />
      <section className="section">
        <div className="mx-auto max-w-3xl whitespace-pre-line px-4 text-sm leading-relaxed text-muted-foreground">
          {settings?.terms_text?.trim() ? settings.terms_text : FALLBACK}
        </div>
      </section>
    </SiteLayout>
  );
}
