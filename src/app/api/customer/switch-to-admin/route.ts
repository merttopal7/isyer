import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-auth";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  if (!session.businessId) return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 403 });

  const adminToken = signToken({
    userId: session.customerId,
    email: session.phone ?? "",
    role: "business_admin",
    businessId: session.businessId,
  });

  const res = NextResponse.json({ businessId: session.businessId });
  res.cookies.set(setAuthCookie(adminToken));
  return res;
}
