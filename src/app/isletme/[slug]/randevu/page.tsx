import { notFound, redirect } from "next/navigation";
import { getBusinessBySlug } from "@/lib/get-business";
import { getCustomerSession } from "@/lib/customer-auth";
import { BookingFlow } from "@/components/booking/booking-flow";
import db from "@/lib/db";
import type { Service, StaffOrResource, Customer, CustomerJwtPayload } from "@/types";
import { bizPath } from "@/lib/url";

export default async function RandevuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  const [services, staff, session] = await Promise.all([
    db<Service>("services").where({ business_id: business.id, is_active: true }).orderBy("id"),
    db<StaffOrResource>("staff_or_resources").where({ business_id: business.id, is_active: true }).orderBy("id"),
    getCustomerSession(),
  ]);

  if (!session) {
    redirect(`${bizPath(slug, "/giris")}?redirect=${encodeURIComponent(bizPath(slug, "/randevu"))}`);
  }

  // Fetch the latest customer details from database to avoid cookie desyncs
  const dbCustomer = await db<Customer>("customers").where({ id: session.customerId }).first();
  if (!dbCustomer) {
    redirect(`${bizPath(slug, "/giris")}?redirect=${encodeURIComponent(bizPath(slug, "/randevu"))}`);
  }

  const customer: CustomerJwtPayload = {
    customerId: dbCustomer.id,
    name: dbCustomer.name,
    phone: dbCustomer.phone,
    businessId: dbCustomer.business_id,
  };

  return (
    <BookingFlow
      business={business}
      services={services}
      staff={staff}
      initialCustomer={customer}
    />
  );
}
