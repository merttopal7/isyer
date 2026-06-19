import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { generateBookingCode, validatePhone, generateSlots } from "@/lib/slots";
import { getCustomerSession } from "@/lib/customer-auth";
import type { Appointment, Business, Service, StaffOrResource, WorkingHour, ClosedDate } from "@/types";

export async function POST(req: NextRequest) {
  const [body, customerSession] = await Promise.all([req.json(), getCustomerSession()]);
  const { business_id, service_id, staff_id, customer_name, customer_phone, appointment_date, start_time } = body;

  if (!business_id || !service_id || !customer_name || !customer_phone || !appointment_date || !start_time) {
    return NextResponse.json({ error: "Tüm zorunlu alanlar doldurulmalıdır." }, { status: 400 });
  }

  if (!validatePhone(customer_phone)) {
    return NextResponse.json({ error: "Geçerli bir telefon numarası girin (05XXXXXXXXX)." }, { status: 400 });
  }

  const business = await db<Business>("businesses").where({ id: Number(business_id) }).first();
  if (!business) {
    return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 });
  }

  // Maksimum ileri tarih kontrolü
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const maxDate = new Date(todayDate);
  maxDate.setDate(todayDate.getDate() + (business.booking_advance_days ?? 7));
  const apptDate = new Date(appointment_date + "T00:00:00");
  if (apptDate < todayDate || apptDate > maxDate) {
    return NextResponse.json(
      { error: `Randevu en fazla ${business.booking_advance_days ?? 7} gün ilerisine alınabilir.` },
      { status: 400 }
    );
  }

  const service = await db<Service>("services")
    .where({ id: Number(service_id), business_id: Number(business_id), is_active: true })
    .first();

  if (!service) {
    return NextResponse.json({ error: "Hizmet bulunamadı." }, { status: 404 });
  }

  // Slot geçerliliğini doğrula
  const [workingHours, closedDates, appointments, allStaff] = await Promise.all([
    db<WorkingHour>("working_hours").where({ business_id: Number(business_id) }),
    db<ClosedDate>("closed_dates").where({ business_id: Number(business_id) }),
    db<Appointment>("appointments")
      .where({ business_id: Number(business_id), appointment_date })
      .whereIn("status", ["approved", "pending"]),
    !staff_id
      ? db<StaffOrResource>("staff_or_resources").where({ business_id: Number(business_id), is_active: true })
      : Promise.resolve([] as StaffOrResource[]),
  ]);

  // Geçmiş saat kontrolü: aynı gün ise start_time şu andan önce olmamalı
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (appointment_date === todayStr) {
    const [sh, sm] = start_time.split(":").map(Number);
    const slotMinutes = sh * 60 + sm;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    if (slotMinutes < nowMinutes) {
      return NextResponse.json({ error: "Geçmiş bir saate randevu alınamaz." }, { status: 400 });
    }
  }

  const slots = generateSlots({
    date: appointment_date,
    durationMinutes: service.duration_minutes,
    slotIntervalMinutes: business.slot_interval_minutes ?? null,
    workingHours,
    closedDates,
    existingAppointments: appointments,
    staffId: staff_id ? Number(staff_id) : null,
    allStaffIds: allStaff.length > 0 ? allStaff.map((s) => s.id) : null,
  });

  const slot = slots.find((s) => s.start === start_time);
  if (!slot) {
    return NextResponse.json({ error: "Seçilen saat geçerli değil." }, { status: 400 });
  }
  if (!slot.available) {
    return NextResponse.json({ error: "Bu saat dilimi dolu." }, { status: 409 });
  }

  // Personel otomatik ataması: "fark etmez" seçilmişse müsait ilk personeli ata
  let assignedStaffId: number | null = staff_id ? Number(staff_id) : null;
  if (!assignedStaffId) {
    const allStaff = await db<StaffOrResource>("staff_or_resources")
      .where({ business_id: Number(business_id), is_active: true })
      .orderBy("id");
    if (allStaff.length > 0) {
      const free = allStaff.find(
        (s) => !appointments.some(
          (a) => a.staff_id === s.id && a.start_time < slot.end && a.end_time > slot.start
        )
      );
      assignedStaffId = (free ?? allStaff[0]).id;
    }
  }

  // Unique booking kodu
  let booking_code: string;
  do {
    booking_code = generateBookingCode();
  } while (await db<Appointment>("appointments").where({ booking_code }).first());

  const [created] = await db<Appointment>("appointments")
    .insert({
      business_id: Number(business_id),
      service_id: Number(service_id),
      staff_id: assignedStaffId,
      customer_id: customerSession?.customerId ?? null,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      appointment_date,
      start_time: slot.start,
      end_time: slot.end,
      status: "pending",
      booking_code,
    })
    .returning("*");
  return NextResponse.json(created, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const phone = searchParams.get("phone");
  const code  = searchParams.get("code");

  if (!phone && !code) {
    return NextResponse.json({ error: "Telefon veya randevu kodu gereklidir." }, { status: 400 });
  }

  const query = db<Appointment>("appointments");

  if (code) {
    query.where({ booking_code: code.toUpperCase() });
  } else if (phone) {
    const digits = phone.replace(/\D/g, "");
    query.where("customer_phone", "like", `%${digits.slice(-10)}`);
  }

  const appointments = await query.orderBy("created_at", "desc").limit(20);

  // Hizmet adlarını ekle
  const serviceIds = [...new Set(appointments.map((a) => a.service_id))];
  const services = serviceIds.length
    ? await db<Service>("services").whereIn("id", serviceIds)
    : [];

  const businessIds = [...new Set(appointments.map((a) => a.business_id))];
  const businesses = businessIds.length
    ? await db("businesses").whereIn("id", businessIds)
    : [];

  const enriched = appointments.map((a) => ({
    ...a,
    service_name: services.find((s) => s.id === a.service_id)?.name ?? "—",
    business_name: businesses.find((b: { id: number }) => b.id === a.business_id)?.name ?? "—",
  }));

  return NextResponse.json(enriched);
}
