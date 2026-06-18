import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { HizmetlerClient } from "./hizmetler-client";
import type { Service } from "@/types";

export default async function HizmetlerPage({ params }: { params: Promise<{ businessId: string }> }) {
  const session = await getSession();
  const { businessId } = await params;
  const bId = Number(businessId);

  if (!session) redirect("/admin/login");
  if (session.role !== "platform_admin" && session.businessId !== bId) redirect("/admin");

  const services = await db<Service>("services").where({ business_id: bId }).orderBy("id");

  return (
    <div className="p-6">
      <HizmetlerClient businessId={bId} initialServices={services} />
    </div>
  );
}
