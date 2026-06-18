import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-auth";
import db from "@/lib/db";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const rows = await db("appointments")
    .join("businesses", "appointments.business_id", "businesses.id")
    .join("services",   "appointments.service_id",  "services.id")
    .leftJoin("staff_or_resources", "appointments.staff_id", "staff_or_resources.id")
    .where("appointments.customer_id", session.customerId)
    .orderBy("appointments.appointment_date", "desc")
    .orderBy("appointments.start_time", "desc")
    .select(
      "appointments.id",
      "appointments.appointment_date",
      "appointments.start_time",
      "appointments.end_time",
      "appointments.status",
      "appointments.reject_reason",
      "appointments.booking_code",
      "appointments.created_at",
      "businesses.name as business_name",
      "businesses.slug as business_slug",
      "services.name as service_name",
      "staff_or_resources.name as staff_name"
    );

  return NextResponse.json(rows);
}
