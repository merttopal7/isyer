import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateSlots } from "@/lib/slots";
import type { Appointment, Business, Service, WorkingHour, ClosedDate } from "@/types";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = await params;
  const appointment = await db<Appointment>("appointments").where({ id: Number(id) }).first();
  if (!appointment) return NextResponse.json({ error: "Randevu bulunamadı." }, { status: 404 });

  if (session.role !== "platform_admin" && session.businessId !== appointment.business_id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const body = await req.json();
  const { status, reject_reason, checked_in } = body;

  // checked_in güncelleme (status bağımsız)
  if ("checked_in" in body) {
    if (appointment.status !== "approved") {
      return NextResponse.json({ error: "Yalnızca onaylanmış randevular için geçerlidir." }, { status: 400 });
    }
    await db<Appointment>("appointments")
      .where({ id: Number(id) })
      .update({ checked_in: checked_in === null ? null : !!checked_in });
    const updated = await db<Appointment>("appointments").where({ id: Number(id) }).first();
    return NextResponse.json(updated);
  }

  if (!["approved", "rejected", "cancelled", "cancel_requested"].includes(status)) {
    return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
  }

  // İptal yalnızca ileri tarihli randevulara uygulanabilir
  if (status === "cancelled") {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const isPast =
      appointment.appointment_date < today ||
      (appointment.appointment_date === today &&
        (() => {
          const [h, m] = appointment.start_time.split(":").map(Number);
          return h * 60 + m <= now.getHours() * 60 + now.getMinutes();
        })());
    if (isPast) {
      return NextResponse.json({ error: "Geçmiş randevular iptal edilemez." }, { status: 400 });
    }
  }

  // Onaylama — çakışma kontrolü
  if (status === "approved") {
    const service = await db<Service>("services").where({ id: appointment.service_id }).first();
    if (!service) return NextResponse.json({ error: "Hizmet bulunamadı." }, { status: 404 });

    const [workingHours, closedDates, otherApproved, business] = await Promise.all([
      db<WorkingHour>("working_hours").where({ business_id: appointment.business_id }),
      db<ClosedDate>("closed_dates").where({ business_id: appointment.business_id }),
      db<Appointment>("appointments")
        .where({
          business_id: appointment.business_id,
          appointment_date: appointment.appointment_date,
          status: "approved",
        })
        .whereNot({ id: appointment.id }),
      db<Business>("businesses").where({ id: appointment.business_id }).first(),
    ]);

    const slots = generateSlots({
      date: appointment.appointment_date,
      durationMinutes: service.duration_minutes,
      slotIntervalMinutes: business?.slot_interval_minutes ?? null,
      workingHours,
      closedDates,
      existingAppointments: otherApproved,
      staffId: appointment.staff_id,
    });

    const slot = slots.find((s) => s.start === appointment.start_time);
    if (!slot || !slot.available) {
      return NextResponse.json(
        { error: "Bu saat diliminde zaten onaylanmış bir randevu var. Çakışma nedeniyle onaylanamaz." },
        { status: 409 }
      );
    }
  }

  await db<Appointment>("appointments")
    .where({ id: Number(id) })
    .update({
      status,
      reject_reason: status === "rejected" ? (reject_reason ?? null) : null,
    });

  const updated = await db<Appointment>("appointments").where({ id: Number(id) }).first();
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = await params;
  const appointment = await db<Appointment>("appointments").where({ id: Number(id) }).first();
  if (!appointment) return NextResponse.json({ error: "Randevu bulunamadı." }, { status: 404 });

  if (session.role !== "platform_admin" && session.businessId !== appointment.business_id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  if (appointment.status !== "cancelled") {
    return NextResponse.json({ error: "Yalnızca iptal edilmiş randevular silinebilir." }, { status: 400 });
  }

  await db<Appointment>("appointments").where({ id: Number(id) }).delete();
  return NextResponse.json({ success: true });
}
