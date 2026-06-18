import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "platform_admin") {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

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

  return NextResponse.json(applications);
}
