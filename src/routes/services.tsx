import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { servicesQuery } from "@/lib/site-data";

export const Route = createFileRoute("/services")({
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
        title="Electrical services"
        description="Every job starts with a proper assessment. Where a fixed price is not possible, we quote after seeing the work."
      />
      <section className="section">
        <div className="mx-auto max-w-6xl px-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading services…</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(services ?? []).map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col justify-between rounded-md border border-border bg-card p-5"
                >
                  <div>
                    <h2 className="text-lg font-semibold">{service.name}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{service.short_description}</p>
                    <p className="mt-3 text-sm font-medium text-gold">
                      {service.price_public && service.starting_price
                        ? `From KSh ${Number(service.starting_price).toLocaleString()}`
                        : "Request quote"}
                    </p>
                  </div>
                  <Button asChild variant="link" className="mt-4 justify-start px-0">
                    <Link to="/services/$slug" params={{ slug: service.slug }}>
                      View details <ArrowRight />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
