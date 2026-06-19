import Link from "next/link";
import { getBusinessBySlug } from "@/lib/get-business";
import { notFound } from "next/navigation";
import db from "@/lib/db";
import { UtensilsCrossed } from "lucide-react";
import type { MenuCategory } from "@/types";
import { bizPath } from "@/lib/url";

export default async function KategorilerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  const categories = await db<MenuCategory>("menu_categories")
    .where({ business_id: business.id, is_published: true })
    .orderBy("created_at", "asc");

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <UtensilsCrossed className="mb-3 h-10 w-10 text-muted-foreground/30" />
        <p className="font-medium text-muted-foreground">Henüz menü eklenmemiş</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-5 text-xl font-bold">Menü</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={bizPath(slug, `/kategori/${cat.slug}`)}
            className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Square image area */}
            <div className="aspect-square w-full overflow-hidden bg-muted">
              {cat.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UtensilsCrossed className="h-10 w-10 text-muted-foreground/25" />
                </div>
              )}
            </div>

            {/* Name */}
            <div className="p-3">
              <h2 className="truncate text-sm font-semibold leading-snug group-hover:text-primary transition-colors">
                {cat.name}
              </h2>
              {cat.description && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{cat.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
