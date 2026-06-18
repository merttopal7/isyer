import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { PersonelClient } from "./personel-client";
import type { StaffOrResource } from "@/types";

export default async function PersonelPage({ params }: { params: Promise<{ businessId: string }> }) {
  const session = await getSession();
  const { businessId } = await params;
  const bId = Number(businessId);

  if (!session) redirect("/admin/login");
  if (session.role !== "platform_admin" && session.businessId !== bId) redirect("/admin");

  const staff = await db<StaffOrResource>("staff_or_resources").where({ business_id: bId }).orderBy("id");

  return (
    <div className="p-6">
      <PersonelClient businessId={bId} initialStaff={staff} />
    </div>
  );
}
