import Link from "next/link";
import { getBusinessBySlug } from "@/lib/get-business";
import { notFound } from "next/navigation";
import db from "@/lib/db";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MenuCategory, MenuItem } from "@/types";
import { bizPath } from "@/lib/url";

export default async function KategoriPage({
  params,
}: {
  params: Promise<{ slug: string; categorySlug: string }>;
}) {
  const { slug, categorySlug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  const category = await db<MenuCategory>("menu_categories")
    .where({ business_id: business.id, slug: categorySlug, is_published: true })
    .first();
  if (!category) notFound();

  const items = await db<MenuItem>("menu_items")
    .where({ category_id: category.id })
    .orderBy("created_at", "asc");

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link
          href={bizPath(slug, "/kategoriler")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-card text-muted-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="truncate text-sm text-muted-foreground">{category.description}</p>
          )}
        </div>
      </div>

      {/* Category hero image */}
      {category.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={category.image_url}
          alt={category.name}
          className="mb-5 h-40 w-full rounded-xl object-cover"
        />
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <UtensilsCrossed className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">Bu kategoride henüz ürün yok</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`overflow-hidden rounded-xl border bg-card shadow-sm${!item.is_available ? " opacity-60" : ""}`}
            >
              {/* Square image area */}
              <div className="aspect-square w-full overflow-hidden bg-muted">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <UtensilsCrossed className="h-8 w-8 text-muted-foreground/20" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-1">
                  <h3 className="flex-1 text-sm font-semibold leading-snug line-clamp-2">
                    {item.name}
                  </h3>
                  {!item.is_available && (
                    <Badge variant="secondary" className="shrink-0 text-xs">Tükendi</Badge>
                  )}
                </div>

                {item.description && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}

                {item.price != null && (
                  <p className="mt-2 text-sm font-bold text-primary">
                    {Number(item.price).toLocaleString("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
