import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqsQuery } from "@/lib/site-data";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions | Zentric Electrical Services" },
      {
        name: "description",
        content:
          "Answers about site assessments, response times, materials, documentation and service areas for Zentric Electrical Services.",
      },
      { property: "og:title", content: "FAQ | Zentric Electrical Services" },
      {
        property: "og:description",
        content: "Common questions about our electrical services, quotes and documentation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { data: faqs } = useQuery(faqsQuery);
  const general = (faqs ?? []).filter((f) => !f.service_id);

  return (
    <SiteLayout>
      <PageHeader eyebrow="Support" title="Frequently asked questions" />
      <section className="section">
        <div className="mx-auto max-w-3xl px-4">
          <Accordion type="single" collapsible>
            {general.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/request-quote">Request a quote</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contact">Ask a question</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
