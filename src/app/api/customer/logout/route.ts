import { NextResponse } from "next/server";
import { clearCustomerCookieOptions, clearCustomerCookieNoDomain } from "@/lib/customer-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Clear cookie with domain (subdomain-compatible cookies)
  res.cookies.set(clearCustomerCookieOptions());
  // Also clear cookie without domain (cookies set before domain was configured)
  const noDomain = clearCustomerCookieNoDomain();
  res.headers.append(
    "Set-Cookie",
    `${noDomain.name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${noDomain.secure ? "; Secure" : ""}`
  );
  return res;
}
