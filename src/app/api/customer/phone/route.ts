import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCustomerSession } from "@/lib/customer-auth";
import { validatePhone } from "@/lib/slots";
import type { Customer } from "@/types";

export async function PUT(req: NextRequest) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { phone } = await req.json();
  if (!phone || !validatePhone(phone)) {
    return NextResponse.json({ error: "Geçersiz telefon numarası (05XXXXXXXXX)." }, { status: 400 });
  }

  const existing = await db<Customer>("customers")
    .where({ phone })
    .whereNot({ id: session.customerId })
    .first();
  if (existing) {
    return NextResponse.json({ error: "Bu telefon numarası zaten kayıtlı." }, { status: 409 });
  }

  await db<Customer>("customers").where({ id: session.customerId }).update({ phone });
  return NextResponse.json({ ok: true });
}
