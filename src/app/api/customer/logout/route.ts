import { NextResponse } from "next/server";
import { clearCustomerCookieOptions } from "@/lib/customer-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(clearCustomerCookieOptions());
  return res;
}
