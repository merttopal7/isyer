import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { DuyurularClient } from "./duyurular-client";
import type { Announcement } from "@/types";

export default async function DuyurularPage({ params }: { params: Promise<{ businessId: string }> }) {
  const session = await getSession();
  const { businessId } = await params;
  const bId = Number(businessId);

  if (!session) redirect("/admin/login");
  if (session.role !== "platform_admin" && session.businessId !== bId) redirect("/admin");

  const announcements = await db<Announcement>("announcements")
    .where({ business_id: bId })
    .orderByRaw("is_pinned DESC, created_at DESC");

  return (
    <div className="p-6">
      <DuyurularClient businessId={bId} initialAnnouncements={announcements} />
    </div>
  );
}
