import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Building2 } from "lucide-react";
import { LogoLightbox } from "./logo-lightbox";
import { bizPath } from "@/lib/url";

interface Props {
  slug: string;
  name: string;
  category: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  logoUrl?: string | null;
  hasMap: boolean;
}

export function BusinessHeader({ slug, name, category, description, phone, address, logoUrl, hasMap }: Props) {
  return (
    <section className="relative overflow-hidden border-b bg-muted/20 py-10 dark:bg-zinc-950/20">
      {/* Subtle backdrop glows */}
      <div className="pointer-events-none absolute -left-10 top-0 -z-10 h-40 w-40 rounded-full bg-indigo-500/5 blur-[50px]" />
      <div className="pointer-events-none absolute right-10 bottom-0 -z-10 h-40 w-40 rounded-full bg-purple-500/5 blur-[50px]" />

      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Logo Frame */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border bg-card p-1 shadow-md overflow-hidden ring-4 ring-indigo-500/5 transition-transform hover:scale-105 duration-300">
            {logoUrl ? (
              <LogoLightbox src={logoUrl} alt={name} />
            ) : (
              <Building2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title & Badge */}
            <div className="mb-2 flex flex-col sm:flex-row items-center sm:items-baseline gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{name}</h1>
              <Badge 
                variant="secondary" 
                className="capitalize bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold rounded-full"
              >
                {category}
              </Badge>
            </div>

            {/* Description */}
            {description && (
              <p className="mb-3.5 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">{description}</p>
            )}

            {/* Contact Details */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {phone && (
                <span className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Phone className="h-4 w-4 text-indigo-600 dark:text-indigo-400/80 shrink-0" /> 
                  <span className="font-medium">{phone}</span>
                </span>
              )}
              {address && (
                hasMap ? (
                  <Link
                    href={bizPath(slug, "/konum")}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400/80 shrink-0" /> 
                    <span className="font-medium">{address}</span>
                  </Link>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400/80 shrink-0" /> 
                    <span className="font-medium">{address}</span>
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
