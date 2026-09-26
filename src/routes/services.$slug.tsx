import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import {
  settingsQuery,
  whatsappLink,
  DEFAULT_WHATSAPP_MESSAGE,
  type Service,
} from "@/lib/site-data";

export const Route = createFileRoute("/services/$slug")({
  head: ({ params }) => {
    const readable = params.slug.replace(/-/g, " ");
    const title = `${readable.replace(/\b\w/g, (c) => c.toUpperCase())} | Zentric Electrical Services`;
    const description = `Zentric Electrical Services provides ${readable} in Nairobi and surrounding areas. Request a quote or book a site assessment.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ServiceDetail,
});

function serviceQuery(slug: string) {
  return queryOptions({
    queryKey: ["service", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data as Service | null;
    },
  });
}

function serviceFaqsQuery(serviceId: string | undefined) {
  return queryOptions({
    queryKey: ["faqs", "service", serviceId],
    enabled: Boolean(serviceId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select("id,question,answer")
        .eq("service_id", serviceId!)
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

function ServiceDetail() {
  const { slug } = Route.useParams();
  const { data: service, isLoading } = useQuery(serviceQuery(slug));
  const { data: faqs } = useQuery(serviceFaqsQuery(service?.id));
  const { data: settings } = useQuery(settingsQuery);
  const wa = whatsappLink(
    settings?.whatsapp ?? settings?.phone,
    `${DEFAULT_WHATSAPP_MESSAGE}${service?.name ?? ""}`,
  );

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-6xl px-4 py-20 text-sm text-muted-foreground">Loading…</div>
      </SiteLayout>
    );
  }

  if (!service) {
    return (
      <SiteLayout>
        <PageHeader title="Service not found" description="This service is no longer listed." />
        <div className="mx-auto max-w-6xl px-4 py-12">
          <Button asChild>
            <Link to="/services">Back to services</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeader eyebrow="Service" title={service.name} description={service.short_description ?? undefined} />
      <section className="section">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {service.image_url ? (
              <img
                src={service.image_url}
                alt={service.name}
                loading="lazy"
                className="mb-6 w-full rounded-md border border-border object-cover"
              />
            ) : null}
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
              {service.description}
            </p>

            {faqs && faqs.length > 0 ? (
              <div className="mt-10">
                <h2 className="mb-4 text-xl font-semibold uppercase">Questions about this service</h2>
                <Accordion type="single" collapsible>
                  {faqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ) : null}
          </div>

          <aside className="h-fit rounded-md border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Pricing</p>
            <p className="mt-1 text-xl font-semibold text-gold">
              {service.price_public && service.starting_price
                ? `From KSh ${Number(service.starting_price).toLocaleString()}`
                : "Quoted after assessment"}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button asChild>
                <Link to="/request-quote" search={{ service: service.slug }}>
                  Request a quote
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/book" search={{ service: service.slug }}>
                  Book a site visit
                </Link>
              </Button>
              {wa ? (
                <Button asChild variant="gold">
                  <a href={wa} target="_blank" rel="noreferrer">
                    <MessageCircle /> WhatsApp us
                  </a>
                </Button>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
