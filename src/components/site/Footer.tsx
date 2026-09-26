import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { settingsQuery, serviceAreasQuery, servicesQuery } from "@/lib/site-data";
import { Logo } from "./Header";

export function Footer() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: areas } = useQuery(serviceAreasQuery);
  const { data: services } = useQuery(servicesQuery);

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm text-muted-foreground">
            {settings?.footer_text ?? "Professional Electrical Solutions. Done Right."}
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest">Services</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {(services ?? []).slice(0, 6).map((s) => (
              <li key={s.id}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="hover:text-foreground"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest">Company</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-foreground">
                About
              </Link>
            </li>
            <li>
              <Link to="/projects" className="hover:text-foreground">
                Projects
              </Link>
            </li>
            <li>
              <Link to="/reviews" className="hover:text-foreground">
                Reviews
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-foreground">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-foreground">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-foreground">
                Terms
              </Link>
            </li>
            <li>
              <Link to="/auth" className="hover:text-foreground">
                Customer login
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest">Contact</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {settings?.phone ? (
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-primary" /> {settings.phone}
              </li>
            ) : null}
            {settings?.email ? (
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 text-primary" /> {settings.email}
              </li>
            ) : null}
            {settings?.address ? (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" /> {settings.address}
              </li>
            ) : null}
            {settings?.working_hours ? (
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-primary" /> {settings.working_hours}
              </li>
            ) : null}
          </ul>
          {areas && areas.length > 0 ? (
            <p className="mt-4 text-xs text-muted-foreground">
              Service areas: {areas.map((a) => a.name).join(", ")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {settings?.company_name ?? "Zentric Electrical Services"}.
          All rights reserved.
        </div>
      </div>
    </footer>
  );
}
