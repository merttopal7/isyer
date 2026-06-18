import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCustomerSession } from "@/lib/customer-auth";
import type { Appointment } from "@/types";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const { id } = await params;
  const appointment = await db<Appointment>("appointments").where({ id: Number(id) }).first();
  if (!appointment) return NextResponse.json({ error: "Randevu bulunamadı." }, { status: 404 });
  if (appointment.customer_id !== session.customerId) {
    return NextResponse.json({ error: "Bu randevu size ait değil." }, { status: 403 });
  }

  // Geçmiş randevu kontrolü (tarih + saat)
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const [h, m] = appointment.start_time.split(":").map(Number);
  const isPast =
    appointment.appointment_date < today ||
    (appointment.appointment_date === today && h * 60 + m <= now.getHours() * 60 + now.getMinutes());
  if (isPast) {
    return NextResponse.json({ error: "Geçmiş randevular için işlem yapılamaz." }, { status: 400 });
  }

  if (appointment.status === "pending") {
    await db<Appointment>("appointments").where({ id: Number(id) }).update({ status: "cancelled" });
    const updated = await db<Appointment>("appointments").where({ id: Number(id) }).first();
    return NextResponse.json(updated);
  }

  if (appointment.status === "approved") {
    await db<Appointment>("appointments").where({ id: Number(id) }).update({ status: "cancel_requested" });
    const updated = await db<Appointment>("appointments").where({ id: Number(id) }).first();
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Bu randevu için iptal işlemi yapılamaz." }, { status: 400 });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const { id } = await params;
  const appointment = await db<Appointment>("appointments").where({ id: Number(id) }).first();
  if (!appointment) return NextResponse.json({ error: "Randevu bulunamadı." }, { status: 404 });
  if (appointment.customer_id !== session.customerId) {
    return NextResponse.json({ error: "Bu randevu size ait değil." }, { status: 403 });
  }
  if (appointment.status !== "cancel_requested") {
    return NextResponse.json({ error: "Geri alınacak bir iptal talebi yok." }, { status: 400 });
  }

  await db<Appointment>("appointments").where({ id: Number(id) }).update({ status: "approved" });
  const updated = await db<Appointment>("appointments").where({ id: Number(id) }).first();
  return NextResponse.json(updated);
}
