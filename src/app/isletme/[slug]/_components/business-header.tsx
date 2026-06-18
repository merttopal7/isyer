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
    <section className="border-b bg-muted/30 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 overflow-hidden">
            {logoUrl ? (
              <LogoLightbox src={logoUrl} alt={name} />
            ) : (
              <Building2 className="h-7 w-7 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{name}</h1>
              <Badge variant="secondary" className="capitalize">{category}</Badge>
            </div>
            {description && (
              <p className="mb-2 text-muted-foreground">{description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {phone}
                </span>
              )}
              {address && (
                hasMap ? (
                  <Link
                    href={bizPath(slug, "/konum")}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5" /> {address}
                  </Link>
                ) : (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {address}
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
