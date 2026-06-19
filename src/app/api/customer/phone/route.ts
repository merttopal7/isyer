import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCustomerSession, signCustomerToken, setCustomerCookieOptions } from "@/lib/customer-auth";
import { validatePhone } from "@/lib/slots";
import type { Customer } from "@/types";

export async function PUT(req: NextRequest) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { phone: rawPhone } = await req.json();
  const phone = (rawPhone ?? "").replace(/\D/g, "").slice(0, 11);
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

  // Issue new token with the updated phone number (strip JWT reserved claims)
  const { exp: _exp, iat: _iat, ...sessionData } = session as typeof session & { exp?: number; iat?: number };
  const newPayload = {
    ...sessionData,
    phone: phone,
  };
  const newToken = signCustomerToken(newPayload);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(setCustomerCookieOptions(newToken));
  return res;
}
