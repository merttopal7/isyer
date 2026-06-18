import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyCustomerPassword, signCustomerToken, setCustomerCookieOptions } from "@/lib/customer-auth";
import type { Customer } from "@/types";

export async function POST(req: NextRequest) {
  const { phone: rawPhone, password } = await req.json();

  if (!rawPhone || !password) {
    return NextResponse.json({ error: "Telefon ve şifre gereklidir." }, { status: 400 });
  }
  const phone = rawPhone.replace(/\D/g, "").slice(0, 11);

  const customer = await db<Customer>("customers").where({ phone }).first();
  if (!customer || !customer.password_hash) {
    // No account or account registered via Google (no password set)
    return NextResponse.json({ error: "Telefon numarası veya şifre hatalı." }, { status: 401 });
  }

  const valid = await verifyCustomerPassword(password, customer.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Telefon numarası veya şifre hatalı." }, { status: 401 });
  }

  const token = signCustomerToken({ customerId: customer.id, phone: customer.phone, name: customer.name });
  const res = NextResponse.json({ customerId: customer.id, phone: customer.phone, name: customer.name });
  res.cookies.set(setCustomerCookieOptions(token));
  return res;
}
