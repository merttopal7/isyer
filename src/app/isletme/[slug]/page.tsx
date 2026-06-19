import { redirect, notFound } from "next/navigation";
import { getBusinessBySlug } from "@/lib/get-business";
import { bizPath } from "@/lib/url";

export default async function IsletmePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  const tab = business.default_tab ?? "duyurular";

  if (tab === "duyurular" && !(business.announcements_enabled ?? true)) {
    // Find first enabled tab
    if (!!(business.menu_enabled ?? true)) redirect(bizPath(slug, "/kategoriler"));
    if (!!(business.booking_enabled ?? true)) redirect(bizPath(slug, "/randevu"));
    redirect(bizPath(slug, "/duyurular")); // last resort
  }

  if (tab === "kategoriler" && !(business.menu_enabled ?? true)) {
    redirect(bizPath(slug, "/duyurular"));
  }

  if ((tab === "randevu" || tab === "randevularim") && !(business.booking_enabled ?? true)) {
    redirect(bizPath(slug, "/duyurular"));
  }

  redirect(bizPath(slug, `/${tab}`));
}
