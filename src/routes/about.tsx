import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { settingsQuery, serviceAreasQuery } from "@/lib/site-data";
import installationImage from "@/assets/service-installation.jpg";
import { BadgeCheck, ClipboardCheck, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Zentric Electrical Services | Kenyan electrical contractor" },
      {
        name: "description",
        content:
          "Zentric Electrical Services is a Kenyan electrical contracting and service company focused on safe installations, clear quotations and proper documentation.",
      },
      { property: "og:title", content: "About Zentric Electrical Services" },
      {
        property: "og:description",
        content: "Safe installations, clear quotations and proper documentation for homes and businesses in Kenya.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: areas } = useQuery(serviceAreasQuery);

  return (
    <SiteLayout>
      <PageHeader eyebrow="About" title="About Zentric Electrical Services" description={settings?.tagline} />
      <section className="pb-16 pt-5">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2">
          <div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
              {settings?.about_text}
            </p>
            <h2 className="mt-8 text-2xl font-semibold">How we work</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• We assess or diagnose before quoting, so the scope is real.</li>
              <li>• We quote in writing with materials, labour and transport separated.</li>
              <li>• We test installations and hand over documentation on completion.</li>
              <li>• Your quotes, invoices, receipts and job reports stay in your account.</li>
            </ul>
            {areas && areas.length > 0 ? (
              <>
                <h2 className="mt-8 text-xl font-semibold uppercase">Where we work</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {areas.map((a) => a.name).join(", ")}. Outside these areas, contact us and we will
                  advise.
                </p>
              </>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link to="/request-quote">Request a quote</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
          <img
            src={installationImage}
            alt="Neatly wired consumer unit installed by Zentric"
            loading="lazy"
            width={1200}
            height={800}
            className="h-fit w-full rounded-md border border-border object-cover"
          />
        </div>
        <div className="mx-auto mt-16 grid max-w-6xl gap-5 px-4 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Safety first", text: "Safe working practices, proper ratings and thorough testing guide every installation." },
            { icon: ClipboardCheck, title: "Clear communication", text: "Written scopes and itemised quotations help you make informed decisions." },
            { icon: BadgeCheck, title: "Accountable workmanship", text: "We document completed work and stand behind the quality of our service." },
          ].map((value) => (
            <div key={value.title} className="rounded-md border border-border bg-card p-6 shadow-sm">
              <value.icon className="mb-4 h-8 w-8 text-gold" />
              <h3 className="text-xl font-semibold">{value.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{value.text}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
