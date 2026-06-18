import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { ClosedDate } from "@/types";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId gerekli." }, { status: 400 });

  const dates = await db<ClosedDate>("closed_dates")
    .where({ business_id: Number(businessId) })
    .orderBy("date");

  return NextResponse.json(dates);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const body = await req.json();
  const { business_id, date, reason } = body;

  if (!business_id || !date) {
    return NextResponse.json({ error: "İşletme ve tarih zorunludur." }, { status: 400 });
  }

  if (session.role !== "platform_admin" && session.businessId !== Number(business_id)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const existing = await db<ClosedDate>("closed_dates")
    .where({ business_id: Number(business_id), date })
    .first();

  if (existing) {
    return NextResponse.json({ error: "Bu tarih zaten kapalı." }, { status: 409 });
  }

  const [created] = await db<ClosedDate>("closed_dates")
    .insert({
      business_id: Number(business_id),
      date,
      reason: reason ?? null,
    })
    .returning("*");
  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id gerekli." }, { status: 400 });

  const cd = await db<ClosedDate>("closed_dates").where({ id: Number(id) }).first();
  if (!cd) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  if (session.role !== "platform_admin" && session.businessId !== cd.business_id) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  await db("closed_dates").where({ id: Number(id) }).delete();
  return NextResponse.json({ ok: true });
}
