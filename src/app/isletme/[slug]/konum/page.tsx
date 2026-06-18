import { notFound } from "next/navigation";
import { getBusinessBySlug } from "@/lib/get-business";
import { MapPin, ExternalLink } from "lucide-react";

const ALLOWED_MAP_ORIGIN = "https://www.google.com/maps/embed";

export default async function KonumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  const mapSrc = business.map_embed?.trim() ?? "";
  const isValidMap = mapSrc.startsWith(ALLOWED_MAP_ORIGIN);

  if (!mapSrc || !isValidMap) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <MapPin className="mb-3 h-10 w-10 text-muted-foreground/30" />
        <p className="font-medium text-muted-foreground">Konum bilgisi eklenmemiş</p>
      </div>
    );
  }

  // Embed URL'inden /embed kaldırarak aynı konumu Google Maps'te aç
  const mapsUrl = mapSrc.replace("https://www.google.com/maps/embed", "https://www.google.com/maps");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {business.address ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{business.address}</span>
          </div>
        ) : (
          <div />
        )}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <ExternalLink className="h-4 w-4" />
          Haritada Aç
        </a>
      </div>
      <div className="overflow-hidden rounded-xl border shadow-sm">
        <iframe
          src={mapSrc}
          width="100%"
          height="480"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`${business.name} konumu`}
        />
      </div>
    </div>
  );
}
