import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  FileCheck2,
  MessagesSquare,
  Wrench,
  PackageCheck,
  LifeBuoy,
  BadgeCheck,
  MessageCircle,
  Phone,
  ArrowRight,
  Star,
  Zap,
  Sun,
  House,
  Droplets,
  Building2,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import {
  settingsQuery,
  servicesQuery,
  approvedReviewsQuery,
  whatsappLink,
  telLink,
  DEFAULT_WHATSAPP_MESSAGE,
} from "@/lib/site-data";
import heroImage from "@/assets/hero-reference.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zentric Electrical Services | Electricians in Nairobi & Kiambu" },
      {
        name: "description",
        content:
          "Zentric Electrical Services provides professional electrical installation, repairs, fault finding, solar, automation and commercial electrical work in Nairobi and surrounding areas.",
      },
      { property: "og:title", content: "Zentric Electrical Services" },
      {
        property: "og:description",
        content:
          "Professional Electrical Solutions. Done Right. Installation, repairs, solar and automation across Nairobi, Kiambu, Thika and Ruiru.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const WHY = [
  { icon: BadgeCheck, title: "Professional workmanship", text: "Work carried out to a standard we are willing to put our name on." },
  { icon: ShieldCheck, title: "Safety-focused installations", text: "Correct ratings, proper earthing and testing before handover." },
  { icon: FileCheck2, title: "Transparent quotations", text: "Itemised quotes so you can see materials, labour and transport." },
  { icon: MessagesSquare, title: "Reliable communication", text: "You know who is coming, when, and what happens next." },
  { icon: PackageCheck, title: "Quality materials", text: "We specify materials that will not become tomorrow's fault." },
  { icon: LifeBuoy, title: "After-service support", text: "Job reports, documentation and follow-up after completion." },
];

const STEPS = [
  { n: "01", title: "Tell us what you need", text: "Send your request by form, call or WhatsApp with your location and the problem." },
  { n: "02", title: "Site assessment / diagnosis", text: "We assess the site or diagnose the fault so the scope is accurate." },
  { n: "03", title: "Receive your quote", text: "An itemised quotation with materials, labour and transport, valid for a set period." },
  { n: "04", title: "We complete the job", text: "Scheduled, executed, tested and handed over with proper documentation." },
];

const serviceIcons = [Zap, Wrench, Sun, House, Droplets, Building2];

function Home() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: services } = useQuery(servicesQuery);
  const { data: reviews } = useQuery(approvedReviewsQuery);
  const wa = whatsappLink(settings?.whatsapp ?? settings?.phone, DEFAULT_WHATSAPP_MESSAGE);
  const tel = telLink(settings?.phone);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="site-dark relative min-h-[560px] overflow-hidden bg-background text-foreground sm:min-h-[600px]">
        <img
          src={heroImage}
          alt="Zentric electrician working on a distribution board"
          width={1600}
          height={1104}
          className="absolute inset-0 h-full w-full object-cover object-[64%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/95 to-navy/5" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <h1 className="max-w-2xl text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
            Zentric<br />Electrical Services
          </h1>
          <p className="mt-4 text-lg font-medium sm:text-2xl">Professional Electrical Solutions. <span className="font-bold text-gold">Done Right.</span></p>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-navy-foreground/85 sm:text-lg">
            Reliable electrical installation, repairs, fault finding, solar, automation, water pump
            control and commercial electrical work — carried out safely, documented properly and
            quoted transparently.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="gold" size="lg">
              <Link to="/request-quote">Request a quote</Link>
            </Button>
            {wa ? (
               <Button asChild variant="whatsapp" size="lg">
                <a href={wa} target="_blank" rel="noreferrer">
                   <MessageCircle /> WhatsApp us
                </a>
              </Button>
            ) : null}
            {tel ? (
               <Button asChild variant="heroOutline" size="lg">
                <a href={tel}>
                   <Phone /> Call Zentric
                </a>
              </Button>
            ) : (
              <Button asChild variant="heroOutline" size="lg">
                <Link to="/contact">Contact us</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="border-b border-border bg-background py-8 sm:py-10">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="sr-only">Our electrical services</h2>
          <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
            {(services ?? []).slice(0, 6).map((service, index) => {
              const Icon = ({ "electrical-installation": Zap, "electrical-repairs": Wrench, "solar-solutions": Sun, "smart-home-automation": House, "water-pump-automation": Droplets, "security-systems": ShieldCheck, "commercial-electrical": Building2 } as Record<string, typeof Zap>)[service.slug] ?? serviceIcons[index] ?? Zap;
              return (
              <Link
                key={service.id}
                to="/services/$slug"
                params={{ slug: service.slug }}
                className="group flex min-h-32 flex-col items-center justify-center border-r border-border px-3 text-center last:border-r-0 hover:text-primary"
              >
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface text-primary"><Icon className="h-7 w-7" /></span>
                <h3 className="text-base font-semibold leading-tight">{service.name}</h3>
              </Link>
            )})}
            {services && services.length === 0 ? (
              <p className="text-sm text-muted-foreground">Services are being updated.</p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Why Zentric */}
      <section className="section border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4">
          <p className="eyebrow mb-2">Why Zentric</p>
          <h2 className="text-2xl font-semibold uppercase sm:text-3xl">
            Work you can rely on, documented properly
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY.map((item) => (
              <div key={item.title} className="flex gap-3">
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="mx-auto max-w-6xl px-4">
          <p className="eyebrow mb-2">How it works</p>
          <h2 className="text-2xl font-semibold uppercase sm:text-3xl">Four clear steps</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.n} className="rounded-md border border-border bg-card p-5">
                <span className="font-display text-2xl text-primary">{step.n}</span>
                <h3 className="mt-2 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/request-quote">Start your request</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/book">Book a site visit</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews && reviews.length > 0 ? (
        <section className="section border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4">
            <p className="eyebrow mb-2">Customer feedback</p>
            <h2 className="text-2xl font-semibold uppercase sm:text-3xl">What customers say</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.slice(0, 3).map((review) => (
                <figure key={review.id} className="rounded-md border border-border bg-card p-5">
                  <div className="flex gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <blockquote className="mt-3 text-sm text-muted-foreground">{review.body}</blockquote>
                  <figcaption className="mt-3 text-sm font-medium">
                    {review.author_name}
                    {review.is_demo ? (
                      <span className="ml-2 rounded-sm bg-secondary px-1.5 py-0.5 text-[0.65rem] uppercase text-muted-foreground">
                        Demo data
                      </span>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>
            <Button asChild variant="link" className="mt-4 px-0">
              <Link to="/reviews">Read all reviews</Link>
            </Button>
          </div>
        </section>
      ) : null}

      {/* Emergency CTA */}
      <section className="section">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-md border border-gold/40 bg-card p-6 sm:p-8">
            <h2 className="text-xl font-semibold uppercase sm:text-2xl">
              {settings?.emergency_message ?? "Electrical emergency? Get in touch now."}
            </h2>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {tel ? (
                <Button asChild size="lg">
                  <a href={tel}>
                    <Phone /> Call Zentric
                  </a>
                </Button>
              ) : null}
              {wa ? (
                <Button asChild variant="gold" size="lg">
                  <a href={wa} target="_blank" rel="noreferrer">
                    <MessageCircle /> WhatsApp
                  </a>
                </Button>
              ) : null}
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">Contact options</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
