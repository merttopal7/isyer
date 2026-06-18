import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { BasvurularClient } from "./basvurular-client";

export default async function BasvurularPage() {
  const session = await getSession();
  if (!session || session.role !== "platform_admin") redirect("/admin");

  const applications = await db("business_applications as a")
    .join("customers as c", "a.customer_id", "c.id")
    .select(
      "a.id",
      "a.customer_id",
      "c.name as customer_name",
      "c.phone as customer_phone",
      "a.business_name",
      "a.category",
      "a.phone",
      "a.address",
      "a.description",
      "a.status",
      "a.reject_reason",
      "a.business_id",
      "a.created_at"
    )
    .orderBy("a.created_at", "desc");

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 py-4 sm:px-6 sm:py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold">İşletme Başvuruları</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Müşterilerden gelen işletme kayıt başvuruları
          </p>
        </div>
        <BasvurularClient applications={applications} />
      </div>
    </div>
  );
}
