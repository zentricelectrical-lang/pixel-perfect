import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Menu, Phone, MessageCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  settingsQuery,
  whatsappLink,
  telLink,
  DEFAULT_WHATSAPP_MESSAGE,
} from "@/lib/site-data";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
  { to: "/reviews", label: "Reviews" },
  { to: "/contact", label: "Contact" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center text-gold">
        <Zap className="h-8 w-8 fill-gold" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-2xl font-semibold">
          Zentric
        </span>
        <span className="block text-[0.58rem] font-semibold text-foreground">
          Electrical Services
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const { data: settings } = useQuery(settingsQuery);
  const [open, setOpen] = useState(false);
  const wa = whatsappLink(settings?.whatsapp ?? settings?.phone, DEFAULT_WHATSAPP_MESSAGE);
  const tel = telLink(settings?.phone);

  return (
    <header className="site-dark sticky top-0 z-50 border-b border-border bg-background text-foreground">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {wa ? (
            <Button asChild variant="outline" size="sm">
              <a href={wa} target="_blank" rel="noreferrer">
                <MessageCircle /> WhatsApp
              </a>
            </Button>
          ) : null}
           <Button asChild variant="gold" size="sm">
            <Link to="/request-quote">Get a Quote</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {tel ? (
            <Button asChild variant="outline" size="icon" aria-label="Call Zentric">
              <a href={tel}>
                <Phone />
              </a>
            </Button>
          ) : null}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="site-dark w-[85vw] max-w-sm overflow-y-auto bg-background text-foreground">
              <Logo />
              <div className="mt-6 flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: item.to === "/" }}
                    activeProps={{ className: "text-primary" }}
                    className="rounded-sm px-3 py-3 text-base font-medium text-foreground hover:bg-secondary"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-2 px-3">
                <Button asChild onClick={() => setOpen(false)}>
                  <Link to="/request-quote">Get a Quote</Link>
                </Button>
                <Button asChild variant="outline" onClick={() => setOpen(false)}>
                  <Link to="/book">Book a Visit</Link>
                </Button>
                {wa ? (
                  <Button asChild variant="gold">
                    <a href={wa} target="_blank" rel="noreferrer">
                      <MessageCircle /> WhatsApp
                    </a>
                  </Button>
                ) : null}
                {tel ? (
                  <Button asChild variant="outline">
                    <a href={tel}>
                      <Phone /> Call now
                    </a>
                  </Button>
                ) : null}
                <Button asChild variant="ghost" onClick={() => setOpen(false)}>
                   <Link to="/auth">Customer login</Link>
                </Button>
                 <Button asChild variant="ghost" onClick={() => setOpen(false)}>
                   <Link to="/dashboard">My dashboard</Link>
                 </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
