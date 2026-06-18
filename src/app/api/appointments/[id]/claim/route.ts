import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCustomerSession } from "@/lib/customer-auth";
import type { Appointment } from "@/types";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Giriş yapmanız gerekiyor." }, { status: 401 });

  const { id } = await params;
  const appointment = await db<Appointment>("appointments").where({ id: Number(id) }).first();
  if (!appointment) return NextResponse.json({ error: "Randevu bulunamadı." }, { status: 404 });

  if (appointment.customer_id !== null) {
    if (appointment.customer_id === session.customerId) {
      return NextResponse.json({ error: "Bu randevu zaten hesabınızda kayıtlı." }, { status: 400 });
    }
    return NextResponse.json({ error: "Bu randevu başka bir hesaba bağlı." }, { status: 409 });
  }

  await db<Appointment>("appointments")
    .where({ id: Number(id) })
    .update({ customer_id: session.customerId });

  const updated = await db<Appointment>("appointments").where({ id: Number(id) }).first();
  return NextResponse.json(updated);
}
