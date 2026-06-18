import { notFound } from "next/navigation";
import { getBusinessBySlug } from "@/lib/get-business";
import { MapPin } from "lucide-react";

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

  return (
    <div className="space-y-4">
      {business.address && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>{business.address}</span>
        </div>
      )}
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
