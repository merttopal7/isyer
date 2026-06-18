import { notFound } from "next/navigation";
import { getBusinessBySlug } from "@/lib/get-business";
import { MapPin, Navigation } from "lucide-react";

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

  // Extract lat/lng from the embed pb parameter (!2d=lng, !3d=lat)
  const lngMatch = mapSrc.match(/!2d(-?\d+\.\d+)/);
  const latMatch = mapSrc.match(/!3d(-?\d+\.\d+)/);
  const directionsUrl =
    latMatch && lngMatch
      ? `https://www.google.com/maps/dir/?api=1&destination=${latMatch[1]},${lngMatch[1]}`
      : business.address
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.address)}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.name)}`;

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
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <Navigation className="h-4 w-4" />
          Yol Tarifi Al
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
