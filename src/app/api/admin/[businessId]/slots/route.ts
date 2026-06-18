import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateSlots } from "@/lib/slots";
import type { Appointment, Business, Service, StaffOrResource, WorkingHour, ClosedDate } from "@/types";

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
  const service_id = searchParams.get("service_id");
  const date = searchParams.get("date");
  const staff_id = searchParams.get("staff_id");

  if (!service_id || !date) {
    return NextResponse.json({ error: "service_id ve date zorunludur." }, { status: 400 });
  }

  const [business, service, workingHours, closedDates, existingAppts, allStaff] = await Promise.all([
    db<Business>("businesses").where({ id: bId }).first(),
    db<Service>("services").where({ id: Number(service_id), business_id: bId }).first(),
    db<WorkingHour>("working_hours").where({ business_id: bId }),
    db<ClosedDate>("closed_dates").where({ business_id: bId }),
    db<Appointment>("appointments")
      .where({ business_id: bId, appointment_date: date })
      .whereIn("status", ["approved"]),
    !staff_id
      ? db<StaffOrResource>("staff_or_resources").where({ business_id: bId, is_active: true })
      : Promise.resolve([] as StaffOrResource[]),
  ]);

  if (!business || !service) {
    return NextResponse.json({ error: "İşletme veya hizmet bulunamadı." }, { status: 404 });
  }

  const slots = generateSlots({
    date,
    durationMinutes: service.duration_minutes,
    slotIntervalMinutes: business.slot_interval_minutes ?? null,
    workingHours,
    closedDates,
    existingAppointments: existingAppts,
    staffId: staff_id ? Number(staff_id) : null,
    allStaffIds: allStaff.length > 0 ? allStaff.map((s) => s.id) : null,
  });

  return NextResponse.json(slots);
}
