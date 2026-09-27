import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { servicesQuery } from "@/lib/site-data";
import installationImage from "@/assets/service-installation.jpg";
import repairsImage from "@/assets/service-repairs.jpg";
import solarImage from "@/assets/service-solar.jpg";
import automationImage from "@/assets/service-automation.jpg";
import commercialImage from "@/assets/service-commercial.jpg";

const serviceImages: Record<string, string> = {
  "electrical-installation": installationImage,
  "electrical-repairs": repairsImage,
  "solar-solutions": solarImage,
  "smart-home-automation": automationImage,
  "commercial-electrical": commercialImage,
};

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Electrical Services in Nairobi | Zentric Electrical Services" },
      {
        name: "description",
        content:
          "Electrical installation, repairs and fault finding, solar, smart home automation, water pump automation, security systems and commercial electrical services.",
      },
      { property: "og:title", content: "Electrical Services | Zentric" },
      {
        property: "og:description",
        content: "Installation, repairs, solar, automation and commercial electrical services in Kenya.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services, isLoading } = useQuery(servicesQuery);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Services"
        title="Our Electrical Services"
        description="Professional, reliable and carefully documented electrical solutions for homes and businesses."
      />
      <section className="pb-20 pt-5">
        <div className="mx-auto max-w-6xl px-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading services…</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(services ?? []).map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col overflow-hidden rounded-md border border-border bg-card shadow-sm"
                >
                  {serviceImages[service.slug] ? (
                    <img src={serviceImages[service.slug]} alt={service.name} loading="lazy" width={1200} height={800} className="aspect-[1.8] w-full object-cover" />
                  ) : <div className="flex aspect-[1.8] items-center justify-center bg-surface"><span className="text-sm font-medium text-muted-foreground">{service.name}</span></div>}
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-xl font-semibold">{service.name}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{service.short_description}</p>
                    <p className="mt-3 text-sm font-semibold text-primary">
                      {service.price_public && service.starting_price
                        ? `From KSh ${Number(service.starting_price).toLocaleString()}`
                        : "Request quote"}
                    </p>
                    <Button asChild variant="default" className="mt-5 self-start">
                    <Link to="/services/$slug" params={{ slug: service.slug }}>
                      View service <ArrowRight />
                    </Link>
                  </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
