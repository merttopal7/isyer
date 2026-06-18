import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { StaffOrResource } from "@/types";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId gerekli." }, { status: 400 });

  const staff = await db<StaffOrResource>("staff_or_resources")
    .where({ business_id: Number(businessId) })
    .orderBy("id");

  return NextResponse.json(staff);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const body = await req.json();
  const { business_id, name } = body;

  if (!business_id || !name) {
    return NextResponse.json({ error: "İşletme ve isim zorunludur." }, { status: 400 });
  }

  if (session.role !== "platform_admin" && session.businessId !== Number(business_id)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const [staff] = await db<StaffOrResource>("staff_or_resources")
    .insert({
      business_id: Number(business_id),
      name,
      is_active: true,
    })
    .returning("*");
  return NextResponse.json(staff, { status: 201 });
}
