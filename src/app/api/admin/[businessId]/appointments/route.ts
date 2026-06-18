import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateBookingCode, generateSlots } from "@/lib/slots";
import type { Appointment, Business, Service, StaffOrResource, WorkingHour, ClosedDate } from "@/types";

export async function POST(
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

  const body = await req.json();
  const { service_id, staff_id, customer_name, customer_phone, appointment_date, start_time } = body;

  if (!service_id || !customer_name || !customer_phone || !appointment_date || !start_time) {
    return NextResponse.json({ error: "Tüm zorunlu alanlar doldurulmalıdır." }, { status: 400 });
  }

  const [business, service] = await Promise.all([
    db<Business>("businesses").where({ id: bId }).first(),
    db<Service>("services").where({ id: Number(service_id), business_id: bId, is_active: true }).first(),
  ]);

  if (!business) return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 });
  if (!service) return NextResponse.json({ error: "Hizmet bulunamadı." }, { status: 404 });

  const [workingHours, closedDates, existingAppts, allStaff] = await Promise.all([
    db<WorkingHour>("working_hours").where({ business_id: bId }),
    db<ClosedDate>("closed_dates").where({ business_id: bId }),
    db<Appointment>("appointments")
      .where({ business_id: bId, appointment_date })
      .whereIn("status", ["approved"]),
    !staff_id
      ? db<StaffOrResource>("staff_or_resources").where({ business_id: bId, is_active: true })
      : Promise.resolve([] as StaffOrResource[]),
  ]);

  const slots = generateSlots({
    date: appointment_date,
    durationMinutes: service.duration_minutes,
    slotIntervalMinutes: business.slot_interval_minutes ?? null,
    workingHours,
    closedDates,
    existingAppointments: existingAppts,
    staffId: staff_id ? Number(staff_id) : null,
    allStaffIds: allStaff.length > 0 ? allStaff.map((s) => s.id) : null,
  });

  const slot = slots.find((s) => s.start === start_time);
  if (!slot) return NextResponse.json({ error: "Seçilen saat geçerli değil." }, { status: 400 });
  if (!slot.available) return NextResponse.json({ error: "Bu saat dilimi dolu." }, { status: 409 });

  let assignedStaffId: number | null = staff_id ? Number(staff_id) : null;
  if (!assignedStaffId && allStaff.length > 0) {
    const free = allStaff.find(
      (s) => !existingAppts.some(
        (a) => a.staff_id === s.id && a.start_time < slot.end && a.end_time > slot.start
      )
    );
    assignedStaffId = (free ?? allStaff[0]).id;
  }

  let booking_code: string;
  do {
    booking_code = generateBookingCode();
  } while (await db<Appointment>("appointments").where({ booking_code }).first());

  const [created] = await db<Appointment>("appointments")
    .insert({
      business_id: bId,
      service_id: Number(service_id),
      staff_id: assignedStaffId,
      customer_id: null,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      appointment_date,
      start_time: slot.start,
      end_time: slot.end,
      status: "approved",
      reject_reason: null,
      booking_code,
    })
    .returning("*");
  return NextResponse.json(created, { status: 201 });
}
