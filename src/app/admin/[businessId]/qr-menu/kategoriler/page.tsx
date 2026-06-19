import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { KategorilerClient } from "./kategoriler-client";
import type { MenuCategory } from "@/types";

export default async function MenuKategorilerPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const session = await getSession();
  const { businessId } = await params;
  const bId = Number(businessId);

  if (!session) redirect("/admin/login");
  if (session.role !== "platform_admin" && session.businessId !== bId) redirect("/admin");

  const categories = await db<MenuCategory>("menu_categories")
    .where({ business_id: bId })
    .orderBy("created_at", "asc");

  return (
    <div className="p-6">
      <KategorilerClient businessId={bId} initialCategories={categories} />
    </div>
  );
}
