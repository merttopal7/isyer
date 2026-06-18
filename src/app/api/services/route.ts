import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Service } from "@/types";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId gerekli." }, { status: 400 });

  const services = await db<Service>("services")
    .where({ business_id: Number(businessId) })
    .orderBy("id");

  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const body = await req.json();
  const { business_id, name, duration_minutes, price } = body;

  if (!business_id || !name || !duration_minutes) {
    return NextResponse.json({ error: "İşletme, isim ve süre zorunludur." }, { status: 400 });
  }

  if (session.role !== "platform_admin" && session.businessId !== Number(business_id)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const [service] = await db<Service>("services")
    .insert({
      business_id: Number(business_id),
      name,
      duration_minutes: Number(duration_minutes),
      price: price ? Number(price) : null,
      is_active: true,
    })
    .returning("*");
  return NextResponse.json(service, { status: 201 });
}
