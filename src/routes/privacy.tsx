import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { settingsQuery } from "@/lib/site-data";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Zentric Electrical Services" },
      {
        name: "description",
        content:
          "How Zentric Electrical Services collects, uses and protects customer information submitted through quote requests, bookings and customer accounts.",
      },
      { property: "og:title", content: "Privacy Policy | Zentric" },
      { property: "og:description", content: "How we handle your information." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

const FALLBACK = `We collect only the information needed to quote and carry out electrical work: your name, contact details, location and the job details or files you send us.

We use this information to respond to your enquiry, schedule work, issue quotations, invoices and receipts, and keep records of work carried out.

We do not sell your information. Customer information is visible only to Zentric staff who need it to serve you, and to the technician assigned to your job.

You can ask us to correct or delete your information by contacting our office.`;

function PrivacyPage() {
  const { data: settings } = useQuery(settingsQuery);
  return (
    <SiteLayout>
      <PageHeader eyebrow="Legal" title="Privacy policy" />
      <section className="section">
        <div className="mx-auto max-w-3xl whitespace-pre-line px-4 text-sm leading-relaxed text-muted-foreground">
          {settings?.privacy_text?.trim() ? settings.privacy_text : FALLBACK}
        </div>
      </section>
    </SiteLayout>
  );
}
