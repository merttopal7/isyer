import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Appointment, Service, StaffOrResource } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { businessId } = await params;
  const bId = Number(businessId);

  if (session.role !== "platform_admin" && session.businessId !== bId) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const date   = searchParams.get("date");
  const month  = searchParams.get("month"); // "YYYY-MM"

  const query = db<Appointment>("appointments").where({ business_id: bId });

  if (status && status !== "all") query.where({ status });
  if (date) query.where({ appointment_date: date });
  if (month) query.where("appointment_date", "like", `${month}%`);

  const appointments = await query.orderBy("appointment_date").orderBy("start_time");

  const serviceIds = [...new Set(appointments.map((a) => a.service_id))];
  const staffIds   = [...new Set(appointments.map((a) => a.staff_id).filter(Boolean))] as number[];

  const [services, staff] = await Promise.all([
    serviceIds.length ? db<Service>("services").whereIn("id", serviceIds) : Promise.resolve([]),
    staffIds.length   ? db<StaffOrResource>("staff_or_resources").whereIn("id", staffIds) : Promise.resolve([]),
  ]);

  const enriched = appointments.map((a) => ({
    ...a,
    service_name: services.find((s) => s.id === a.service_id)?.name ?? "—",
    staff_name:   a.staff_id ? (staff.find((s) => s.id === a.staff_id)?.name ?? "—") : null,
  }));

  return NextResponse.json(enriched);
}
