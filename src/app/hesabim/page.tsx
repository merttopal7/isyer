import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-auth";
import db from "@/lib/db";
import { Navbar } from "@/components/shared/navbar";
import { HesabimClient } from "./hesabim-client";
import type { BusinessApplication, Business, Customer } from "@/types";

export default async function HesabimPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/giris?redirect=/hesabim");

  const customer = await db<Customer>("customers")
    .where({ id: session.customerId })
    .first();
  if (!customer) redirect("/giris");

  const application = await db<BusinessApplication>("business_applications")
    .where({ customer_id: session.customerId })
    .orderBy("created_at", "desc")
    .first() ?? null;

  const business = customer.business_id
    ? await db<Business>("businesses").where({ id: customer.business_id }).select("id", "slug", "name").first() ?? null
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container mx-auto max-w-2xl px-4">
          <HesabimClient
            customer={{ id: customer.id, name: customer.name, phone: customer.phone, businessId: session.businessId ?? null }}
            application={application}
            business={business ? { id: business.id, slug: business.slug, name: business.name } : null}
          />
        </div>
      </main>
    </div>
  );
}
