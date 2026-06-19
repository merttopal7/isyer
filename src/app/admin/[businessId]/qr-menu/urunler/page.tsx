import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { UrunlerClient } from "./urunler-client";
import type { MenuCategory, MenuItem } from "@/types";

export default async function MenuUrunlerPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const session = await getSession();
  const { businessId } = await params;
  const bId = Number(businessId);

  if (!session) redirect("/admin/login");
  if (session.role !== "platform_admin" && session.businessId !== bId) redirect("/admin");

  const [categories, items] = await Promise.all([
    db<MenuCategory>("menu_categories").where({ business_id: bId }).orderBy("created_at", "asc"),
    db<MenuItem>("menu_items").where({ business_id: bId }).orderBy("created_at", "asc"),
  ]);

  return (
    <div className="p-6">
      <UrunlerClient businessId={bId} initialCategories={categories} initialItems={items} />
    </div>
  );
}
