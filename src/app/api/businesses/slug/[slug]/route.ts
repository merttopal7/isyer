import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import type { Business, Service, StaffOrResource } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const business = await db<Business>("businesses")
    .where({ slug, status: "active" })
    .first();

  if (!business) {
    return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 });
  }

  const [services, staff] = await Promise.all([
    db<Service>("services")
      .where({ business_id: business.id, is_active: true })
      .orderBy("id"),
    db<StaffOrResource>("staff_or_resources")
      .where({ business_id: business.id, is_active: true })
      .orderBy("id"),
  ]);

  return NextResponse.json({ business, services, staff });
}
