import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { OzellestirClient } from "./ozellestir-client";
import type { Business } from "@/types";

export default async function OzellestirPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const session = await getSession();
  const { businessId } = await params;
  const bId = Number(businessId);

  if (!session) redirect("/admin/login");
  if (session.role !== "platform_admin" && session.businessId !== bId) redirect("/admin");

  const business = await db<Business>("businesses").where({ id: bId }).first();
  if (!business) redirect("/admin");

  return (
    <div className="p-6">
      <OzellestirClient business={business} />
    </div>
  );
}
