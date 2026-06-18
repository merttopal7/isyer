import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { hashCustomerPassword, signCustomerToken, setCustomerCookieOptions } from "@/lib/customer-auth";
import { validatePhone } from "@/lib/slots";
import type { Customer } from "@/types";

export async function POST(req: NextRequest) {
  const { phone, name, password } = await req.json();

  if (!phone || !name || !password) {
    return NextResponse.json({ error: "Tüm alanlar zorunludur." }, { status: 400 });
  }
  if (!validatePhone(phone)) {
    return NextResponse.json({ error: "Geçersiz telefon numarası (05XXXXXXXXX)." }, { status: 400 });
  }
  if (name.trim().length < 2) {
    return NextResponse.json({ error: "Ad en az 2 karakter olmalıdır." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Şifre en az 6 karakter olmalıdır." }, { status: 400 });
  }

  const existing = await db<Customer>("customers").where({ phone }).first();
  if (existing) {
    return NextResponse.json({ error: "Bu telefon numarası zaten kayıtlı." }, { status: 409 });
  }

  const password_hash = await hashCustomerPassword(password);
  const trimmedName = name.trim();

  const [{ id }] = await db<Customer>("customers")
    .insert({ phone, name: trimmedName, password_hash })
    .returning("id");

  const token = signCustomerToken({ customerId: id, phone, name: trimmedName });
  const res = NextResponse.json({ customerId: id, phone, name: trimmedName });
  res.cookies.set(setCustomerCookieOptions(token));
  return res;
}
