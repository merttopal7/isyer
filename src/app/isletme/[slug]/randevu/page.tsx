import { notFound, redirect } from "next/navigation";
import { getBusinessBySlug } from "@/lib/get-business";
import { getCustomerSession } from "@/lib/customer-auth";
import { BookingFlow } from "@/components/booking/booking-flow";
import db from "@/lib/db";
import type { Service, StaffOrResource } from "@/types";
import { bizPath } from "@/lib/url";

export default async function RandevuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  const [services, staff, customer] = await Promise.all([
    db<Service>("services").where({ business_id: business.id, is_active: true }).orderBy("id"),
    db<StaffOrResource>("staff_or_resources").where({ business_id: business.id, is_active: true }).orderBy("id"),
    getCustomerSession(),
  ]);

  if (!customer) {
    redirect(`${bizPath(slug, "/giris")}?redirect=${encodeURIComponent(bizPath(slug, "/randevu"))}`);
  }

  return (
    <BookingFlow
      business={business}
      services={services}
      staff={staff}
      initialCustomer={customer}
    />
  );
}
