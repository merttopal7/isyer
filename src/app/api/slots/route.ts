import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { generateSlots } from "@/lib/slots";
import type { WorkingHour, ClosedDate, Appointment, Business, Service, StaffOrResource } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const businessId = searchParams.get("businessId");
  const serviceId  = searchParams.get("serviceId");
  const date       = searchParams.get("date");
  const staffId    = searchParams.get("staffId");

  if (!businessId || !serviceId || !date) {
    return NextResponse.json({ error: "businessId, serviceId ve date zorunludur." }, { status: 400 });
  }

  const [service, business] = await Promise.all([
    db<Service>("services")
      .where({ id: Number(serviceId), business_id: Number(businessId), is_active: true })
      .first(),
    db<Business>("businesses").where({ id: Number(businessId) }).first(),
  ]);

  if (!service) {
    return NextResponse.json({ error: "Hizmet bulunamadı." }, { status: 404 });
  }

  const [workingHours, closedDates, appointments, allStaff] = await Promise.all([
    db<WorkingHour>("working_hours").where({ business_id: Number(businessId) }),
    db<ClosedDate>("closed_dates").where({ business_id: Number(businessId) }),
    db<Appointment>("appointments")
      .where({ business_id: Number(businessId), appointment_date: date })
      .whereIn("status", ["approved"]),
    !staffId
      ? db<StaffOrResource>("staff_or_resources").where({ business_id: Number(businessId), is_active: true })
      : Promise.resolve([] as StaffOrResource[]),
  ]);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const nowMinutes = date === todayStr ? now.getHours() * 60 + now.getMinutes() : undefined;

  const slots = generateSlots({
    date,
    durationMinutes: service.duration_minutes,
    slotIntervalMinutes: business?.slot_interval_minutes ?? null,
    nowMinutes,
    workingHours,
    closedDates,
    existingAppointments: appointments,
    staffId: staffId ? Number(staffId) : null,
    allStaffIds: allStaff.length > 0 ? allStaff.map((s) => s.id) : null,
  });

  return NextResponse.json(slots);
}
