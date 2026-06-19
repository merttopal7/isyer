import type { Metadata } from "next";
import { bizUrl } from "@/lib/url";
import { notFound } from "next/navigation";
import { getBusinessBySlug } from "@/lib/get-business";
import { BusinessNavbar } from "@/components/isletme/business-navbar";
import { BusinessHeader } from "./_components/business-header";

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) return {};
  return {
    title: business.meta_title || business.name,
    description: business.meta_description || business.description || undefined,
    keywords: business.meta_keywords || undefined,
    icons: business.favicon_url ? { icon: business.favicon_url } : undefined,
    openGraph: {
      title: business.meta_title || business.name,
      description: business.meta_description || business.description || undefined,
      url: bizUrl(slug, "/"),
      type: "website",
      images: business.logo_url
        ? [{ url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}${business.logo_url}` }]
        : undefined,
    },
  };
}

export default async function IsletmeLayout({ children, params }: Props) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <BusinessNavbar slug={slug} businessName={business.name} hasMap={!!business.map_embed} announcementsEnabled={!!(business.announcements_enabled ?? true)} menuEnabled={!!(business.menu_enabled ?? true)} bookingEnabled={!!(business.booking_enabled ?? true)} logoUrl={business.logo_url ?? null} />

      {!!(business.navbar_enabled ?? true) && (
        <BusinessHeader
          slug={slug}
          name={business.name}
          category={business.category}
          description={business.description ?? null}
          phone={business.phone ?? null}
          address={business.address ?? null}
          logoUrl={business.logo_url ?? null}
          hasMap={!!business.map_embed}
        />
      )}

      {/* Page content */}
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          {children}
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {business.name}
      </footer>
    </div>
  );
}
