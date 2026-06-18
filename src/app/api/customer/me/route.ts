import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCustomerSession, signCustomerToken, setCustomerCookieOptions } from "@/lib/customer-auth";
import type { Customer } from "@/types";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json(null);

  // Başvuru onaylandıktan sonra business_id token'a otomatik yansıtsın
  const customer = await db<Customer>("customers")
    .where({ id: session.customerId })
    .select("business_id")
    .first();

  if (!customer) return NextResponse.json(null);

  const dbBusinessId = customer.business_id ?? null;
  const tokenBusinessId = session.businessId ?? null;

  if (dbBusinessId !== tokenBusinessId) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { iat, exp, ...clean } = session as typeof session & { iat?: number; exp?: number };
    const newPayload = { ...clean, businessId: dbBusinessId };
    const newToken = signCustomerToken(newPayload);
    const res = NextResponse.json(newPayload);
    res.cookies.set(setCustomerCookieOptions(newToken));
    return res;
  }

  return NextResponse.json(session);
}
